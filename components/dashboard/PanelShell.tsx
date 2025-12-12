import Link from "next/link";
import Image from "next/image";
import { Notification } from "@prisma/client";
import { ReactNode } from "react";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { NavMenu } from "@/components/dashboard/NavMenu";

export type PanelNavItem = {
  label: string;
  href: string;
};

export type NotificationMenuItem = Pick<
  Notification,
  "id" | "title" | "message" | "body" | "metadata" | "caseNumber" | "createdAt" | "isRead" | "type"
>;

const formatNotificationDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(value);

type PanelShellProps = {
  title: string;
  roleLabel: string;
  navItems: PanelNavItem[];
  children: ReactNode;
  notifications?: NotificationMenuItem[];
  unreadCount?: number;
  notificationLink?: string;
  accountId?: string | null;
};

export const PanelShell = ({
  title,
  roleLabel,
  navItems,
  children,
  notifications,
  unreadCount = 0,
  notificationLink,
  accountId
}: PanelShellProps) => {
  const hasNotifications = Boolean(notifications && notifications.length);
  const fallbackLink = notificationLink ?? "#";

const formatAccount = () => {
  if (!accountId) return null;
    const clean = accountId.replace(/[^a-zA-Z0-9]/g, "");
    const short = clean.slice(0, 5) || clean;
    const label = roleLabel.toLowerCase();
    let prefix = "ID-";
    if (label.includes("proveedor") || label.includes("supplier")) prefix = "S-";
    else if (label.includes("agency") || label.includes("agencia")) prefix = "A-";
    else if (label.includes("customer") || label.includes("cliente")) prefix = "C-";
    else if (label.includes("afiliador") || label.includes("affiliate")) prefix = "AF-";
  return `${prefix}${short}`;
};

const displayAccount = formatAccount();

const buildBookingDetailRoute = (bookingId: string | undefined, metadataRole: string | undefined, fallback: string) => {
  if (!bookingId) return fallback;
  const role = (metadataRole ?? "").toString().toUpperCase();
  if (role.includes("ADMIN")) return `/admin/bookings?bookingId=${bookingId}`;
  if (role.includes("SUPPLIER")) return `/supplier/bookings?bookingId=${bookingId}`;
  if (role.includes("AGENCY")) return `/agency/bookings?bookingId=${bookingId}`;
  if (role.includes("CUSTOMER")) return `/booking/confirmed?bookingId=${bookingId}`;
  return `/booking/confirmed?bookingId=${bookingId}`;
};

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Proactivitis" width={128} height={28} className="object-contain" />
            </Link>
            <NavMenu navItems={navItems} />
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            {notificationLink ? (
              <div className="relative group focus-within:outline-none" tabIndex={0}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition hover:border-slate-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-slate-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.084-1.795-5-4.5-5S9 7.916 9 11v3.159c0 .538-.214 1.055-.595 1.436L7 17h5m0 0a3 3 0 1 0 6 0h-6z"
                    />
                  </svg>
                  {unreadCount ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[0.65rem] font-semibold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                <div className="pointer-events-auto invisible absolute right-0 z-50 mt-2 w-80 min-w-[20rem] rounded-lg border border-slate-200 bg-white opacity-0 shadow-lg transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="space-y-2 p-4">
                    {hasNotifications ? (
                      notifications!.map((notification) => {
                        const metadata = parseNotificationMetadata(notification.metadata);
                        const redirectUrl = metadata.referenceUrl ?? fallbackLink;
                        const display = getNotificationDisplayProps(notification.type ?? undefined);
                        const message = notification.message ?? notification.body ?? "";
                        return (
                          <form
                            key={notification.id}
                            action={markNotificationReadAction}
                            className="rounded-lg border border-slate-100 bg-slate-50 transition hover:border-slate-300 hover:bg-white"
                          >
                            <input type="hidden" name="notificationId" value={notification.id} />
                            <input type="hidden" name="redirectTo" value={redirectUrl} />
                            <button type="submit" className="w-full text-left p-4 text-sm text-slate-700">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{display.icon}</span>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                                      {display.label}
                                    </p>
                                    <p className="text-base font-semibold text-slate-900">{notification.title}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-slate-500">{formatNotificationDate(notification.createdAt)}</span>
                              </div>
                              <p className="mt-2 text-sm text-slate-700">{message}</p>
                              <div className="mt-3 flex items-center justify-between text-xs">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.3em] ${display.badgeClass}`}
                                >
                                  {display.label}
                                </span>
                                {!notification.isRead ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                    Nuevo
                                  </span>
                                ) : (
                                  <span className="text-emerald-500">Leída</span>
                                )}
                              </div>
                            </button>
                          </form>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">ℹ</span>
                          <p>No tienes notificaciones nuevas.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3 text-right text-xs">
                    <Link href={fallbackLink} className="font-semibold text-sky-600 hover:underline">
                      Ver todas
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <button className="rounded-md border border-slate-200 px-4 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300">
                Notificaciones
              </button>
            )}
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                {roleLabel}
              </div>
              {displayAccount && <div className="text-[0.65rem] text-slate-500">{displayAccount}</div>}
            </div>
            <DashboardUserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
};
