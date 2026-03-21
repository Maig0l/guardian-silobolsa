import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { getEM } from '../config/database.js';
import { Field, Sensor, User } from '../entities/index.js';

// ─── Nodemailer transporter ───────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

// ─── WhatsApp via Twilio REST (sin SDK, fetch nativo) ─────────────────────────
async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
    console.warn('⚠️  Twilio no configurado, se omite WhatsApp');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams({
    From: env.TWILIO_WHATSAPP_FROM,
    To: `whatsapp:${to}`,
    Body: body,
  });

  const credentials = Buffer.from(
    `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
  ).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('❌  Error Twilio WhatsApp:', error);
  }
}

// ─── Email ────────────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('⚠️  SMTP no configurado, se omite email');
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

// ─── Dispatcher principal ─────────────────────────────────────────────────────
export async function sendAlertNotifications(
  sensor: Sensor,
  hum: number,
  temp: number,
  co2: number
): Promise<void> {
  const em = getEM();

  // Carga el campo y el usuario dueño
  const field = await em.findOneOrFail(
    Field,
    { id: (sensor.campo as Field).id },
    { populate: ['usuario'] }
  );
  const user = field.usuario as User;

  const alertLines: string[] = [];
  if (temp > env.ALERT_TEMP_MAX)
    alertLines.push(`🌡️  Temperatura: ${temp}°C (máx permitida: ${env.ALERT_TEMP_MAX}°C)`);
  if (hum > env.ALERT_HUM_MAX)
    alertLines.push(`💧 Humedad: ${hum}% (máx permitida: ${env.ALERT_HUM_MAX}%)`);
  if (co2 > env.ALERT_CO2_MAX)
    alertLines.push(`☁️  CO₂: ${co2} ppm (máx permitida: ${env.ALERT_CO2_MAX} ppm)`);

  const bodyText = [
    `⚠️  ALERTA — Guardián Silobolsa`,
    ``,
    `Campo: ${field.nombre}`,
    `Sensor: ${sensor.modelo} (MAC: ${sensor.mac_address})`,
    `Fecha: ${new Date().toLocaleString('es-AR')}`,
    ``,
    `Parámetros fuera de rango:`,
    ...alertLines,
    ``,
    `Revisá tu silobolsa a la brevedad para evitar pérdidas.`,
  ].join('\n');

  const htmlBody = bodyText.replace(/\n/g, '<br>');

  // Enviar email
  await sendEmail(
    user.email,
    `⚠️ Alerta en campo "${field.nombre}" — Guardián Silobolsa`,
    htmlBody
  );

  // Enviar WhatsApp si el usuario tiene teléfono
  if (user.telefono) {
    await sendWhatsApp(user.telefono, bodyText);
  }

  console.log(`📣  Notificaciones enviadas al usuario ${user.email}`);
}
