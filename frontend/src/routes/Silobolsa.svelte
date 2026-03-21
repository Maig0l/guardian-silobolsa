<script>
  import { navigate } from '../lib/router.js'
  import { silobolsas, sensores, campos, vincularSensor, desvincularSensor, addToast } from '../lib/stores/app.js'
  import { api, normalizeReading } from '../lib/api.js'
  import SensorChart from '../lib/components/SensorChart.svelte'
  import StatusBadge from '../lib/components/StatusBadge.svelte'

  export let params = {}
  $: siloId = Number(params.id)
  $: silo   = $silobolsas.find(s => s.id === siloId)
  $: campo  = silo ? $campos.find(c => c.id === silo.campoId) : null
  $: sensorVinculado = silo ? $sensores.find(s => s.silobolsaId === siloId) : null
  $: sensoresLibres  = campo ? $sensores.filter(s => s.campoId === campo.id && !s.silobolsaId) : []

  let lecturas = []
  let lectLoading = false

  // Recarga las lecturas cuando cambia el silo o el sensor vinculado
  $: if (siloId) cargarLecturas()

  async function cargarLecturas() {
    if (!siloId) return
    lectLoading = true
    try {
      const raw = await api.getReadingsBySilobag(siloId, 24)
      lecturas = raw.map(normalizeReading)
    } catch {
      lecturas = []
    } finally {
      lectLoading = false
    }
  }

  $: ultima = lecturas.length ? lecturas[lecturas.length - 1] : null

  let showVincularModal = false
  let sensorSeleccionado = ''
  let vincLoading = false
  let vincError = ''

  async function handleVincular() {
    if (!sensorSeleccionado) return
    vincLoading = true
    vincError = ''
    try {
      await vincularSensor(campo.id, siloId, Number(sensorSeleccionado))
      addToast('Sensor vinculado correctamente.')
      showVincularModal = false
      sensorSeleccionado = ''
      await cargarLecturas()
    } catch (e) {
      vincError = e.message ?? 'Error al vincular el sensor.'
    } finally {
      vincLoading = false
    }
  }

  async function handleDesvincular() {
    try {
      await desvincularSensor(campo.id, siloId)
      addToast('Sensor desvinculado.')
      lecturas = []
    } catch (e) {
      addToast(e.message ?? 'Error al desvincular.', 'error')
    }
  }

  function estadoSilo() {
    if (!sensorVinculado) return 'sin-sensor'
    return sensorVinculado.estado
  }

  function getAlertColor(tipo, val) {
    if (val == null) return 'ok'
    if (tipo === 'temperature' && val > 35) return 'critical'
    if (tipo === 'temperature' && val > 28) return 'warning'
    if (tipo === 'humidity'    && val > 14) return 'critical'
    if (tipo === 'humidity'    && val > 12) return 'warning'
    if (tipo === 'co2'         && val > 5000) return 'critical'
    if (tipo === 'co2'         && val > 3000) return 'warning'
    return 'ok'
  }
</script>

<div class="page">
  {#if !silo}
    <div class="not-found">Silobolsa no encontrado. <button on:click={() => navigate('/dashboard')}>Volver</button></div>
  {:else}
    <div class="breadcrumb">
      <button on:click={() => navigate('/dashboard')}>Dashboard</button>
      <span>/</span>
      <button on:click={() => navigate('/campo/' + silo.campoId)}>{campo?.nombre}</button>
      <span>/</span>
      <span>Silo {silo.grano}</span>
    </div>

    <div class="silo-header">
      <div class="silo-header-main">
        <div class="silo-icon">🌾</div>
        <div>
          <div class="silo-grano">{silo.grano}</div>
          <div class="silo-meta">{silo.marca} · {silo.capacidad} toneladas</div>
          <div class="silo-ubicacion">📍 {silo.ubicacion}</div>
        </div>
      </div>
      <StatusBadge estado={estadoSilo()} />
    </div>

    {#if silo.observaciones}
      <div class="silo-obs">
        <span class="obs-label">Observaciones:</span> {silo.observaciones}
      </div>
    {/if}

    <!-- Sensor vinculado -->
    <div class="sensor-section">
      <div class="sensor-section-bar">
        <h2 class="section-title">Sensor vinculado</h2>
        <div class="sensor-actions">
          {#if !sensorVinculado}
            <button class="btn-primary" on:click={() => showVincularModal = true}>Vincular sensor</button>
          {:else}
            <button class="btn-outline" on:click={handleDesvincular}>Desvincular</button>
          {/if}
        </div>
      </div>

      {#if !sensorVinculado}
        <div class="no-sensor-card">
          <div class="no-sensor-icon">📡</div>
          <h3>Sin sensor asignado</h3>
          <p>Vinculá un sensor para comenzar a monitorear este silobolsa en tiempo real.</p>
          {#if sensoresLibres.length > 0}
            <button class="btn-primary" on:click={() => showVincularModal = true}>Vincular sensor disponible</button>
          {:else}
            <p class="hint">No hay sensores disponibles. Registrá uno desde la vista del campo.</p>
          {/if}
        </div>
      {:else}
        <div class="sensor-card">
          <div class="sensor-info">
            <div class="sensor-dot sensor-dot--{sensorVinculado.estado}"></div>
            <div>
              <div class="sensor-modelo">{sensorVinculado.modelo}</div>
              <div class="sensor-mac">{sensorVinculado.mac}</div>
            </div>
          </div>
          <button class="sensor-detail-link" on:click={() => navigate('/sensor/' + sensorVinculado.id)}>
            Ver detalle →
          </button>
        </div>
      {/if}
    </div>

    <!-- Lecturas actuales -->
    {#if lectLoading}
      <div class="loading">Cargando lecturas...</div>
    {:else if ultima}
      <div class="readings-section">
        <h2 class="section-title">Lecturas actuales</h2>
        <div class="readings-grid">
          {#each [
            { label: 'Temperatura', val: ultima.temperature, unit: '°C',   tipo: 'temperature', icon: '🌡' },
            { label: 'Humedad',     val: ultima.humidity,    unit: '%',    tipo: 'humidity',    icon: '💧' },
            { label: 'CO₂',        val: ultima.co2,         unit: ' ppm', tipo: 'co2',         icon: '☁' },
          ] as r}
            {@const status = getAlertColor(r.tipo, r.val)}
            <div class="reading-card reading-card--{status}">
              <div class="reading-icon">{r.icon}</div>
              <div class="reading-val">{r.val?.toFixed(1)}{r.unit}</div>
              <div class="reading-label">{r.label}</div>
              {#if status === 'critical'}
                <div class="reading-badge reading-badge--critical">⚠ Crítico</div>
              {:else if status === 'warning'}
                <div class="reading-badge reading-badge--warning">⚡ Atención</div>
              {:else}
                <div class="reading-badge reading-badge--ok">✓ Normal</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="charts-section">
        <h2 class="section-title">Historial últimas 24 horas</h2>
        <div class="charts-grid">
          <SensorChart {lecturas} tipo="temperature" />
          <SensorChart {lecturas} tipo="humidity" />
          <SensorChart {lecturas} tipo="co2" />
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Modal vincular sensor -->
{#if showVincularModal}
  <div class="modal-overlay" role="presentation" on:click|self={() => showVincularModal = false}>
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Vincular sensor</h3>
        <button class="modal-close" on:click={() => showVincularModal = false}>✕</button>
      </div>
      <div class="modal-body">
        {#if vincError}<div class="form-error">{vincError}</div>{/if}
        {#if sensoresLibres.length === 0}
          <p class="no-sensors-msg">No hay sensores disponibles en este campo. Registrá uno desde la vista del campo.</p>
        {:else}
          <div class="field">
            <label class="label">Seleccioná un sensor disponible</label>
            <div class="sensor-list">
              {#each sensoresLibres as s}
                <label class="sensor-option {sensorSeleccionado == s.id ? 'selected' : ''}">
                  <input type="radio" name="sensor" value={s.id} bind:group={sensorSeleccionado} style="display:none" />
                  <div class="sensor-opt-info">
                    <span class="sensor-opt-modelo">{s.modelo}</span>
                    <span class="sensor-opt-mac">{s.mac}</span>
                  </div>
                  <StatusBadge estado={s.estado} />
                </label>
              {/each}
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" on:click={() => showVincularModal = false}>Cancelar</button>
            <button class="btn-primary" on:click={handleVincular}
              disabled={!sensorSeleccionado || vincLoading}>
              {vincLoading ? 'Vinculando...' : 'Vincular'}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .page { max-width: 1000px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 28px; }
  .not-found { text-align: center; padding: 48px; color: var(--gray-500); }
  .loading { text-align: center; padding: 32px; color: var(--gray-400); }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-400); }
  .breadcrumb button { background: none; border: none; color: var(--green-600); font-size: 13px; }
  .breadcrumb button:hover { text-decoration: underline; }
  .silo-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); padding: 20px 24px; flex-wrap: wrap; }
  .silo-header-main { display: flex; align-items: center; gap: 16px; }
  .silo-icon { font-size: 36px; }
  .silo-grano { font-family: var(--font-serif); font-size: 24px; color: var(--green-800); }
  .silo-meta { font-size: 14px; color: var(--gray-500); margin-top: 3px; }
  .silo-ubicacion { font-size: 13px; color: var(--gray-400); margin-top: 3px; }
  .silo-obs { background: var(--green-50); border-left: 3px solid var(--green-300); padding: 12px 16px; border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: 13px; color: var(--gray-600); }
  .obs-label { font-weight: 600; color: var(--green-700); }
  .sensor-section { display: flex; flex-direction: column; gap: 12px; }
  .sensor-section-bar { display: flex; align-items: center; justify-content: space-between; }
  .sensor-actions { display: flex; gap: 8px; }
  .section-title { font-size: 18px; font-weight: 600; color: var(--gray-900); }
  .no-sensor-card { background: var(--white); border: 0.5px dashed var(--gray-300); border-radius: var(--radius-lg); padding: 40px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .no-sensor-icon { font-size: 40px; }
  .no-sensor-card h3 { font-size: 16px; font-weight: 600; color: var(--gray-700); }
  .no-sensor-card p { font-size: 13px; color: var(--gray-500); max-width: 320px; }
  .hint { color: var(--gray-400) !important; font-size: 12px !important; }
  .sensor-card { background: var(--green-50); border: 0.5px solid var(--green-300); border-radius: var(--radius-md); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
  .sensor-info { display: flex; align-items: center; gap: 12px; }
  .sensor-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .sensor-dot--activo   { background: var(--green-500); box-shadow: 0 0 0 3px rgba(91,140,62,0.2); }
  .sensor-dot--alerta   { background: var(--amber-600); box-shadow: 0 0 0 3px rgba(217,119,6,0.2); }
  .sensor-dot--inactivo { background: var(--gray-300); }
  .sensor-modelo { font-size: 14px; font-weight: 600; color: var(--green-800); }
  .sensor-mac { font-size: 12px; font-family: monospace; color: var(--gray-500); margin-top: 2px; }
  .sensor-detail-link { background: none; border: none; color: var(--green-700); font-weight: 600; font-size: 13px; }
  .readings-section, .charts-section { display: flex; flex-direction: column; gap: 14px; }
  .readings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  @media (max-width: 600px) { .readings-grid { grid-template-columns: 1fr; } }
  .reading-card { background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); padding: 20px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: border-color 0.2s; }
  .reading-card--warning  { border-color: #F0B84B; background: #FFFBEB; }
  .reading-card--critical { border-color: #FCA5A5; background: var(--red-50); }
  .reading-icon { font-size: 24px; }
  .reading-val { font-size: 28px; font-weight: 700; color: var(--gray-900); line-height: 1; }
  .reading-label { font-size: 13px; color: var(--gray-500); }
  .reading-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-top: 4px; }
  .reading-badge--ok       { background: var(--green-50);  color: var(--green-700); }
  .reading-badge--warning  { background: var(--amber-100); color: #92400E; }
  .reading-badge--critical { background: var(--red-50);    color: var(--red-600); }
  .charts-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
  .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--green-800); color: var(--green-50); border: none; padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; transition: background 0.15s; }
  .btn-primary:hover:not(:disabled) { background: var(--green-700); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--green-700); border: 1px solid var(--green-300); padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; }
  .btn-outline:hover { background: var(--green-50); }
  .btn-secondary { background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-300); padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
  .modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); overflow: hidden; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 0.5px solid var(--gray-300); }
  .modal-title { font-size: 17px; font-weight: 600; color: var(--gray-900); }
  .modal-close { background: none; border: none; font-size: 16px; color: var(--gray-400); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .modal-close:hover { background: var(--gray-100); color: var(--gray-700); }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
  .field { display: flex; flex-direction: column; gap: 10px; }
  .label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .sensor-list { display: flex; flex-direction: column; gap: 8px; }
  .sensor-option { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-md); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
  .sensor-option:hover { border-color: var(--green-300); background: var(--green-50); }
  .sensor-option.selected { border-color: var(--green-500); background: var(--green-50); }
  .sensor-opt-info { display: flex; flex-direction: column; gap: 2px; }
  .sensor-opt-modelo { font-size: 14px; font-weight: 500; color: var(--gray-900); }
  .sensor-opt-mac { font-size: 11px; font-family: monospace; color: var(--gray-400); }
  .no-sensors-msg { font-size: 13px; color: var(--gray-500); text-align: center; padding: 16px; }
  .form-error { background: var(--red-50); border: 1px solid #FCA5A5; color: var(--red-600); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; }
</style>
