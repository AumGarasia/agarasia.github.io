"use server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendMessage(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");
  await resend.emails.send({
    from: "Portfolio <hello@yourdomain.com>",
    to: ["you@you.com"],
    subject: `Message from ${name}`,
    reply_to: email,
    text: message,
  });
}
