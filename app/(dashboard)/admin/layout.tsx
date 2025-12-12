import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { PanelShell, NotificationMenuItem } from "@/components/dashboard/PanelShell";
import { authOptions } from "@/lib/auth";
import { getNotificationUnreadCount, getNotificationsForRecipient } from "@/lib/notificationService";

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Landings", href: "/admin/landings" },
  { label: "Tours", href: "/admin/tours" },
  { label: "Suplidores", href: "/admin/suppliers" },
  { label: "Agencias", href: "/admin/agencies" },
  { label: "Reservas", href: "/admin/bookings" },
  { label: "Finanzas", href: "/admin/finance" },
  { label: "Reportes", href: "/admin/reports" },
  { label: "Solicitudes", href: "/admin/partner-applications" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Países", href: "/admin/countries" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Ajustes", href: "/admin/settings" },
  { label: "Notificaciones", href: "/admin/notifications" }
];

export const metadata = {
  title: "Admin Space Proactivitis"
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  let notifications: NotificationMenuItem[] = [];
  let unreadCount = 0;

  if (isAdmin) {
    const [fetched, count] = await Promise.all([
      getNotificationsForRecipient({ role: "ADMIN", limit: 5 }),
      getNotificationUnreadCount({ role: "ADMIN" })
    ]);
    notifications = fetched;
    unreadCount = count;
  }

  return (
    <PanelShell
      roleLabel="Administración"
      title="Dashboard"
      navItems={adminNav}
      notifications={notifications}
      unreadCount={unreadCount}
      notificationLink={isAdmin ? "/admin/notifications" : undefined}
      accountId={session?.user?.id ?? null}
    >
      {children}
    </PanelShell>
  );
}
