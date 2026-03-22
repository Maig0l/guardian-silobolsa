import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { getEM } from '../config/database.js';
import { Field, Sensor, SilobagSensorLink, User } from '../entities/index.js';

// ─── Nodemailer ───────────────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('⚠️  SMTP no configurado, se omite email');
    return;
  }
  const transporter = getTransporter();
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
}

// ─── Telegram Bot API (fetch nativo, sin dependencias extra) ──────────────────
async function sendTelegram(mensaje: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn('⚠️  Telegram no configurado, se omite notificación');
    return;
  }

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: mensaje,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('❌  Error Telegram:', err);
  } else {
    console.log(`📨  Mensaje Telegram enviado al chat ${env.TELEGRAM_CHAT_ID}`);
  }
}

// ─── Dispatcher principal ─────────────────────────────────────────────────────
export async function sendAlertNotifications(
  sensor: Sensor,
  hum: number,
  temp: number,
  co2: number
): Promise<void> {
  const em = getEM();

  const field = await em.findOneOrFail(
    Field,
    { id: (sensor.campo as Field).id },
    { populate: ['usuario'] }
  );
  const user = field.usuario as User;

  const link = await em.findOne(
    SilobagSensorLink,
    { sensor: sensor.id, estado: 'ACTIVO' },
    { populate: ['silobolsa'] }
  );
  const siloNombre = link
    ? `${(link.silobolsa as any).grano ?? 'Silobolsa'} — ${(link.silobolsa as any).ubicacion ?? ''}`
    : 'Sin silobolsa vinculada';

  const alertLines: string[] = [];
  if (temp > env.ALERT_TEMP_MAX)
    alertLines.push(`🌡 *Temperatura:* ${temp}°C (máx: ${env.ALERT_TEMP_MAX}°C)`);
  if (hum > env.ALERT_HUM_MAX)
    alertLines.push(`💧 *Humedad:* ${hum}% (máx: ${env.ALERT_HUM_MAX}%)`);
  if (co2 > env.ALERT_CO2_MAX)
    alertLines.push(`☁ *CO₂:* ${co2} ppm (máx: ${env.ALERT_CO2_MAX} ppm)`);

  const fecha = new Date().toLocaleString('es-AR');

  // ── Mensaje Telegram (Markdown) ───────────────────────────────────────────
  const telegramMensaje = [
    `⚠️ *ALERTA — Guardián Silobolsa*`,
    ``,
    `📍 *Campo:* ${field.nombre}`,
    `🌾 *Silobolsa:* ${siloNombre}`,
    `📡 *Sensor:* ${sensor.modelo} \`(${sensor.mac_address})\``,
    `🕐 *Fecha:* ${fecha}`,
    ``,
    `*Parámetros fuera de rango:*`,
    ...alertLines,
    ``,
    `_Revisá tu cosecha a la brevedad para evitar pérdidas._`,
  ].join('\n');

  // ── Email HTML ────────────────────────────────────────────────────────────
  const htmlBody = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#2D4A1E;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="color:#EAF3DE;margin:0;font-size:18px;">⚠️ Alerta — Guardián Silobolsa</h2>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Campo</td>
              <td style="padding:6px 0;font-weight:600;color:#111827;">${field.nombre}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Silobolsa</td>
              <td style="padding:6px 0;font-weight:600;color:#111827;">${siloNombre}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Sensor</td>
              <td style="padding:6px 0;font-family:monospace;font-size:13px;">${sensor.modelo} (${sensor.mac_address})</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Fecha</td>
              <td style="padding:6px 0;font-size:13px;">${fecha}</td></tr>
        </table>
        <div style="background:#FEF3E2;border-left:4px solid #D97706;padding:14px 18px;border-radius:4px;">
          <p style="margin:0 0 8px;font-weight:600;color:#92400E;">Parámetros fuera de rango:</p>
          ${alertLines
            .map(l => `<p style="margin:4px 0;color:#374151;">${l.replace(/\*/g, '')}</p>`)
            .join('')}
        </div>
        <p style="font-size:13px;color:#6b7280;margin-top:20px;border-top:1px solid #f3f4f6;padding-top:16px;">
          Revisá tu cosecha a la brevedad para evitar pérdidas.<br>
          — Guardián Silobolsa
        </p>
      </div>
    </div>
  `;

  // ── Envíos ────────────────────────────────────────────────────────────────
  await Promise.all([
    sendEmail(
      user.email,
      `⚠️ Alerta en campo "${field.nombre}" — Guardián Silobolsa`,
      htmlBody
    ),
    sendTelegram(telegramMensaje),
  ]);

  console.log(`📣  Notificaciones enviadas al usuario ${user.email}`);
}
