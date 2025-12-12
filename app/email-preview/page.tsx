"use client";

import Link from "next/link";

const sampleTours = [
  { title: "Safari Proactivitis en Punta Cana", location: "Punta Cana, RD", price: 140, slug: "safari-punta-cana" },
  { title: "Adrenalina urban trail", location: "Santo Domingo, RD", price: 95, slug: "urban-trail" },
  { title: "Catamarán y snorkel", location: "Cancún, MX", price: 210, slug: "catamaran-snorkel" }
];

const benefitGrid = [
  { icon: "🔒", label: "Proveedores verificados" },
  { icon: "⚡", label: "Confirmación instantánea" },
  { icon: "🎧", label: "Soporte 24/7 en tu idioma" },
  { icon: "💰", label: "Mejor precio garantizado" }
];

const EmailPreview = () => {
  const tourRows = sampleTours
    .map(
      (tour) => `
      <tr>
        <td style="padding: 8px 0;">
          <a href="https://proactivitis.com/tours/${tour.slug}" style="font-weight:600;color:#0ea5e9;text-decoration:none;">
            ${tour.title}
          </a>
          <p style="margin:4px 0 0;font-size:13px;color:#475569;">${tour.location} · USD ${tour.price}</p>
        </td>
      </tr>
    `
    )
    .join("");

  const benefitsHtml = benefitGrid
    .map(
      (item) => `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">${item.icon}</span>
        <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${item.label}</p>
      </div>
    `
    )
    .join("");

  const emailBody = `
    <div style="font-family:'Inter',system-ui,sans-serif;color:#0f172a;background:#ecf2ff;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:30px;overflow:hidden;box-shadow:0 30px 90px rgba(2,6,23,0.15);">
        <div style="background:linear-gradient(135deg,#0096ff,#0074d9);padding:32px 28px 34px;display:flex;flex-direction:column;align-items:center;gap:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:28px;">🐬</span>
            <div style="color:#f8fbff;font-weight:600;letter-spacing:0.08em;font-size:12px;text-transform:uppercase;">
              Nuevas experiencias
            </div>
          </div>
          <div style="display:flex;align-items:center;">
            <img src="http://localhost:3000/_next/image?url=%2Flogo.png&w=128&q=75" alt="Proactivitis" width="320" height="120" style="object-fit:contain;filter:brightness(0) invert(1);" />
          </div>
        </div>
        <div style="padding:40px 44px 32px;line-height:1.7;">
          <p style="margin:0;font-size:16px;">Hola viajero,</p>
          <h1 style="font-size:26px;margin:8px 0 16px;font-weight:600;color:#0f172a;">
            Gracias por unirte a Proactivitis.
          </h1>
          <p style="margin:0;font-size:16px;color:#475569;">
            Desde hoy tienes acceso a experiencias auténticas, seguras y verificadas, con confirmación instantánea y atención 24/7 en tu idioma.
          </p>
          <p style="margin:12px 0 24px;font-size:15px;color:#475569;">
            🎯 Vemos que estás en Punta Cana. Muy pronto recibirás recomendaciones diseñadas especialmente para ti.
          </p>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:32px;padding:20px;background:#f8fafc;border-radius:20px;">
            ${benefitsHtml}
          </div>
          <div style="background:#f0f9ff;padding:24px;border-radius:20px;margin-bottom:32px;">
            <p style="margin:0 0 8px;font-weight:600;color:#0f172a;">Recomendaciones para ti</p>
            <p style="margin:0 0 12px;font-size:14px;color:#475569;">
              Estamos preparando experiencias increíbles. Muy pronto verás sugerencias personalizadas en tu cuenta.
            </p>
            <table style="width:100%;border-collapse:collapse;">
              ${tourRows}
            </table>
          </div>
          <a
            href="https://proactivitis.com/tours"
            style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#006bff;color:#fff;border-radius:16px;font-weight:600;font-size:15px;text-decoration:none;box-shadow:0 10px 30px rgba(0,107,255,0.25);"
          >
            Descubre tu próxima aventura
          </a>
        </div>
        <div style="padding:24px 44px 32px;font-size:12px;color:#94a3b8;background:#f8fafc;text-align:center;">
          <p style="margin:0 0 6px;">Proactivitis LLC · Miami, FL · support@proactivitis.com</p>
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">
            Gestión de privacidad · Cancelar notificaciones
          </p>
          <p style="margin:8px 0 0;">ID de cuenta: <strong>ac_1234xyz</strong></p>
        </div>
      </div>
    </div>
  `;

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl space-y-4 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Vista previa del correo</h1>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
            Volver al sitio
          </Link>
        </div>
        <iframe
          title="Previsualización del correo"
          srcDoc={emailBody}
          className="h-[80vh] w-full rounded-3xl border border-slate-200 shadow-xl"
        />
      </div>
    </main>
  );
};

export default EmailPreview;
