"use server";

import { redirect } from "next/navigation";

/**
 * Server action to send the contact form.
 * - Safe for builds without RESEND_API_KEY (doesn't throw at import time)
 * - Uses dynamic import so 'resend' isn't loaded during build
 */
export async function sendMessage(formData: FormData) {
  // Honeypot: ignore bots quietly
  if (formData.get("bot-field")) {
    return redirect("/contact?sent=1");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return redirect("/contact?error=missing");
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // No key in the build/host environment: fail gracefully instead of throwing
    console.warn("[contact] RESEND_API_KEY is not set; skipping email send");
    return redirect("/contact?error=send");
  }

  // Lazy-load the SDK only when we actually need it (runtime)
  const { Resend } = await import("resend");
  const resend = new Resend(key);

  try {
    await resend.emails.send({
      from: "Portfolio Contact agarasia.io", // <- change to your domain/sender
      to: ["aumgarasia@gmail.com"],                               // <- change to your inbox
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    return redirect("/contact?sent=1");
  } catch (err) {
    console.error("[contact] Resend send failed:", err);
    return redirect("/contact?error=send");
  }
}
