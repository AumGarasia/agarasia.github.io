"use server";
import { Resend } from "resend";
import { redirect } from "next/navigation";


const resend = new Resend(process.env.RESEND_API_KEY!);


export async function sendMessage(formData: FormData) {
const bot = String(formData.get("bot-field") || "");
if (bot) redirect("/contact?sent=1"); // honeypot


const name = String(formData.get("name") || "");
const email = String(formData.get("email") || "");
const message = String(formData.get("message") || "");


// basic validation
if (!name || !email || !message) {
redirect("/contact?error=missing");
}


try {
await resend.emails.send({
from: process.env.CONTACT_FROM || "Portfolio garasia.io",
to: [process.env.CONTACT_TO || "aumgarasia@gmail.com.com"],
subject: `Portfolio message from ${name}`,
reply_to: email,
text: message,
});
} catch (e) {
console.error("Resend error", e);
redirect("/contact?error=send");
}


redirect("/contact?sent=1");
}