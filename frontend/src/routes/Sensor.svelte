<script>
  import { push } from 'svelte-spa-router'
  import { sensores, silobolsas, campos } from '../lib/stores/app.js'
  import SensorChart from '../lib/components/SensorChart.svelte'
  import StatusBadge from '../lib/components/StatusBadge.svelte'
  import { ultimaLectura, formatTimestamp } from '../lib/mockData.js'

  export let params = {}
  $: sensorId = params.id
  $: sensor = $sensores.find(s => s.id === sensorId)
  $: campo = sensor ? $campos.find(c => c.id === sensor.campoId) : null
  $: silo = sensor?.silobolsaId ? $silobolsas.find(s => s.id === sensor.silobolsaId) : null
  $: ultima = ultimaLectura(sensor)
</script>

<div class="page">
  {#if !sensor}
    <div class="not-found">Sensor no encontrado. <button on:click={() => push('/dashboard')}>Volver</button></div>
  {:else}
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <button on:click={() => push('/dashboard')}>Dashboard</button>
      <span>/</span>
      <button on:click={() => push('/campo/' + sensor.campoId)}>{campo?.nombre}</button>
      <span>/</span>
      <span>{sensor.modelo} · {sensor.mac}</span>
    </div>

    <!-- Header -->
    <div class="sensor-header">
      <div class="sensor-header-left">
        <div class="sensor-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
            <circle cx="11" cy="11" r="3" fill="currentColor"/>
            <path d="M11 3V1M11 21v-2M3 11H1M21 11h-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="sensor-modelo">{sensor.modelo}</div>
          <div class="sensor-mac">{sensor.mac}</div>
        </div>
      </div>
      <StatusBadge estado={sensor.estado} />
    </div>

    <!-- Info grid -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Campo</div>
        <div class="info-val">{campo?.nombre ?? '—'}</div>
        <div class="info-sub">{campo?.ubicacion ?? ''}</div>
      </div>
      <div class="info-card {silo ? 'info-card--linked' : ''}">
        <div class="info-label">Silobolsa asignado</div>
        {#if silo}
          <div class="info-val">{silo.grano} · {silo.capacidad}t</div>
          <button class="info-link" on:click={() => push('/silobolsa/' + silo.id)}>Ver silobolsa →</button>
        {:else}
          <div class="info-val info-val--empty">Sin asignar</div>
        {/if}
      </div>
      <div class="info-card">
        <div class="info-label">Última transmisión</div>
        <div class="info-val">{ultima ? formatTimestamp(ultima.timestamp) : '—'}</div>
        <div class="info-sub">Lecturas disponibles: {sensor.lecturas?.length ?? 0}</div>
      </div>
    </div>

    {#if ultima && sensor.lecturas?.length}
      <!-- Lecturas actuales -->
      <div class="section">
        <h2 class="section-title">Lectura más reciente</h2>
        <div class="readings-row">
          {#each [
            { label: 'Temperatura', val: ultima.temperature, unit: '°C', icon: '🌡', color: '#E85D24' },
            { label: 'Humedad',     val: ultima.humidity,    unit: '%',  icon: '💧', color: '#3B8BD4' },
            { label: 'CO₂',        val: ultima.co2,         unit: ' ppm', icon: '☁', color: '#5B8C3E' },
          ] as r}
            <div class="reading-chip">
              <span class="reading-icon">{r.icon}</span>
              <span class="reading-val" style="color: {r.color}">{r.val.toFixed(1)}{r.unit}</span>
              <span class="reading-lbl">{r.label}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Gráficos -->
      <div class="section">
        <h2 class="section-title">Historial últimas 24 horas</h2>
        <div class="charts-col">
          <SensorChart lecturas={sensor.lecturas} tipo="temperature" />
          <SensorChart lecturas={sensor.lecturas} tipo="humidity" />
          <SensorChart lecturas={sensor.lecturas} tipo="co2" />
        </div>
      </div>
    {:else}
      <div class="no-data">
        <div class="no-data-icon">📡</div>
        <p>Este sensor todavía no tiene datos disponibles.</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .page { max-width: 900px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 28px; }
  .not-found { text-align: center; padding: 48px; color: var(--gray-500); }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-400); }
  .breadcrumb button { background: none; border: none; color: var(--green-600); font-size: 13px; }
  .breadcrumb button:hover { text-decoration: underline; }

  .sensor-header {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--white); border: 0.5px solid var(--gray-300);
    border-radius: var(--radius-lg); padding: 20px 24px;
    gap: 16px;
  }
  .sensor-header-left { display: flex; align-items: center; gap: 14px; }
  .sensor-icon {
    width: 44px; height: 44px;
    background: var(--green-50); border: 1px solid var(--green-200);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    color: var(--green-700); flex-shrink: 0;
  }
  .sensor-modelo { font-size: 20px; font-weight: 600; color: var(--green-800); }
  .sensor-mac { font-size: 13px; font-family: monospace; color: var(--gray-400); margin-top: 3px; }

  .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  .info-card {
    background: var(--white); border: 0.5px solid var(--gray-300);
    border-radius: var(--radius-md); padding: 14px 16px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .info-card--linked { border-color: var(--green-300); background: var(--green-50); }
  .info-label { font-size: 11px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; }
  .info-val { font-size: 15px; font-weight: 600; color: var(--gray-900); margin-top: 4px; }
  .info-val--empty { color: var(--gray-400); font-weight: 400; font-style: italic; }
  .info-sub { font-size: 12px; color: var(--gray-400); }
  .info-link { background: none; border: none; color: var(--green-700); font-size: 12px; font-weight: 600; padding: 0; margin-top: 4px; text-align: left; }

  .section { display: flex; flex-direction: column; gap: 14px; }
  .section-title { font-size: 18px; font-weight: 600; color: var(--gray-900); }

  .readings-row {
    display: flex; gap: 12px; flex-wrap: wrap;
  }
  .reading-chip {
    background: var(--white); border: 0.5px solid var(--gray-300);
    border-radius: var(--radius-lg); padding: 16px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    flex: 1; min-width: 120px;
  }
  .reading-icon { font-size: 22px; }
  .reading-val { font-size: 26px; font-weight: 700; line-height: 1; }
  .reading-lbl { font-size: 12px; color: var(--gray-500); }

  .charts-col { display: flex; flex-direction: column; gap: 14px; }

  .no-data {
    text-align: center; padding: 64px 24px;
    background: var(--white); border: 0.5px dashed var(--gray-300);
    border-radius: var(--radius-xl);
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .no-data-icon { font-size: 48px; }
  .no-data p { font-size: 14px; color: var(--gray-400); }
</style>
