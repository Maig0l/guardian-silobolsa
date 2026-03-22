import { env } from '../config/env.js';
import { getEM } from '../config/database.js';
import { Field, Sensor, SilobagSensorLink, User } from '../entities/index.js';

async function sendTelegram(mensaje: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn('⚠️  Telegram no configurado');
    return;
  }

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: mensaje,
      parse_mode: 'HTML',
    }),
  });

  const json = await res.json() as any;
  if (!res.ok || !json.ok) {
    console.error('❌  Error Telegram:', JSON.stringify(json));
  } else {
    console.log(`📨  Telegram enviado al chat ${env.TELEGRAM_CHAT_ID}`);
  }
}

export async function sendAlertNotifications(
  sensor: Sensor,
  hum: number,
  temp: number,
  co2: number
): Promise<void> {
  try {
    console.log(`🔔  Preparando notificación para sensor ${sensor.id} (${sensor.mac_address})`);

    const em = getEM();

    // Obtener campo_id de manera segura — puede ser objeto populado o ID crudo
    let campoId: number;
    if (typeof sensor.campo === 'object' && sensor.campo !== null && 'id' in sensor.campo) {
      campoId = (sensor.campo as Field).id;
    } else {
      campoId = sensor.campo as unknown as number;
    }

    console.log(`🔔  Campo ID: ${campoId}`);

    const [field, link] = await Promise.all([
      em.findOneOrFail(Field, { id: campoId }, { populate: ['usuario'] }),
      em.findOne(SilobagSensorLink, { sensor: sensor.id, estado: 'ACTIVO' }, { populate: ['silobolsa'] }),
    ]);

    const user = field.usuario as User;
    console.log(`🔔  Usuario: ${user.email}`);

    const siloNombre = link
      ? `${(link.silobolsa as any).grano ?? 'Silobolsa'} — ${(link.silobolsa as any).ubicacion ?? ''}`
      : 'Sin silobolsa vinculada';

    const alertLines: string[] = [];
    if (temp > env.ALERT_TEMP_MAX)
      alertLines.push(`🌡 <b>Temperatura:</b> ${temp}°C (máx: ${env.ALERT_TEMP_MAX}°C)`);
    if (hum > env.ALERT_HUM_MAX)
      alertLines.push(`💧 <b>Humedad:</b> ${hum}% (máx: ${env.ALERT_HUM_MAX}%)`);
    if (co2 > env.ALERT_CO2_MAX)
      alertLines.push(`☁ <b>CO₂:</b> ${co2} ppm (máx: ${env.ALERT_CO2_MAX} ppm)`);

    const fecha = new Date().toLocaleString('es-AR');

    const telegramMensaje = [
      `⚠️ <b>ALERTA — Guardián Silobolsa</b>`,
      ``,
      `📍 <b>Campo:</b> ${field.nombre}`,
      `🌾 <b>Silobolsa:</b> ${siloNombre}`,
      `📡 <b>Sensor:</b> ${sensor.modelo} (${sensor.mac_address})`,
      `🕐 <b>Fecha:</b> ${fecha}`,
      ``,
      `<b>Parámetros fuera de rango:</b>`,
      ...alertLines,
      ``,
      `<i>Revisá tu cosecha a la brevedad para evitar pérdidas.</i>`,
    ].join('\n');

    await sendTelegram(telegramMensaje);
    console.log(`📣  Notificación enviada — sensor ${sensor.id}, campo: ${field.nombre}`);

  } catch (err) {
    console.error(`❌  Error en sendAlertNotifications para sensor ${sensor.id}:`, err);
  }
}