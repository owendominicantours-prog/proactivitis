import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

let client: Resend | null = null;
if (apiKey) {
  client = new Resend(apiKey);
}

export async function sendResendEmail({
  subject,
  to,
  html
}: {
  subject: string;
  to: string;
  html: string;
}) {
  if (!client) {
    console.warn("Resend API key missing; email not sent:", to, subject);
    return null;
  }
  const sender = process.env.RESEND_SENDER ?? "no-reply@proactivitis.com";
  return client.emails.send({
    from: `Proactivitis <${sender}>`,
    to,
    subject,
    html
  });
}
