<script>
  import { navigate } from '../lib/router.js'
  import { campos, silobolsas, sensores, alertas, crearSilobolsa, crearSensor, loadCampoDetalle, addToast } from '../lib/stores/app.js'
  import StatusBadge from '../lib/components/StatusBadge.svelte'

  export let params = {}
  $: campoId = Number(params.id)
  $: campo = $campos.find(c => c.id === campoId)
  $: campoSilos    = $silobolsas.filter(s => s.campoId === campoId)
  $: campoSensores = $sensores.filter(s => s.campoId === campoId)
  $: campoAlertas  = $alertas.filter(a => a.campoId === campoId)

  let pageLoading = true
  let pageError = ''

  // Carga el detalle del campo al entrar a la página
  $: if (campoId) {
    pageLoading = true
    loadCampoDetalle(campoId)
      .then(() => { pageLoading = false })
      .catch(e => { pageError = e.message; pageLoading = false })
  }

  function getSensorDeSilo(siloId) {
    return $sensores.find(s => s.silobolsaId === siloId) || null
  }
  function estadoSilo(siloId) {
    const sensor = getSensorDeSilo(siloId)
    if (!sensor) return 'sin-sensor'
    return sensor.estado
  }

  // Modal Silobolsa
  let showSiloModal = false
  let siloForm = { capacidad: '', ubicacion: '', marca: '', grano: '', observaciones: '' }
  let siloError = '', siloLoading = false
  const granos = ['Soja','Maíz','Trigo','Girasol','Sorgo','Cebada','Lino','Maní']
  const marcas = ['Ipesa','Richiger','Akron','Plastar','Storti','Otra']

  async function submitSilo() {
    siloError = ''
    if (!siloForm.capacidad || !siloForm.ubicacion || !siloForm.marca || !siloForm.grano) {
      siloError = 'Completá todos los campos requeridos.'; return
    }
    siloLoading = true
    try {
      const id = await crearSilobolsa(campoId, { ...siloForm, capacidad: Number(siloForm.capacidad) })
      addToast('Silobolsa creado correctamente.')
      showSiloModal = false
      siloForm = { capacidad: '', ubicacion: '', marca: '', grano: '', observaciones: '' }
      navigate('/silobolsa/' + id)
    } catch (e) {
      siloError = e.message ?? 'Error al crear el silobolsa.'
    } finally {
      siloLoading = false
    }
  }

  // Modal Sensor
  let showSensorModal = false
  let sensorForm = { modelo: '', mac: '' }
  let sensorError = '', sensorLoading = false

  async function submitSensor() {
    sensorError = ''
    if (!sensorForm.modelo.trim() || !sensorForm.mac.trim()) {
      sensorError = 'Completá modelo y MAC address.'; return
    }
    sensorLoading = true
    try {
      await crearSensor(campoId, { ...sensorForm })
      addToast('Sensor registrado correctamente.')
      showSensorModal = false
      sensorForm = { modelo: '', mac: '' }
    } catch (e) {
      sensorError = e.message ?? 'Error al crear el sensor.'
    } finally {
      sensorLoading = false
    }
  }
</script>

<div class="page">
  {#if pageLoading}
    <div class="loading">Cargando campo...</div>
  {:else if pageError}
    <div class="error-state">{pageError} <button on:click={() => navigate('/dashboard')}>Volver</button></div>
  {:else if !campo}
    <div class="not-found">Campo no encontrado. <button on:click={() => navigate('/dashboard')}>Volver</button></div>
  {:else}
    <div class="breadcrumb">
      <button on:click={() => navigate('/dashboard')}>Dashboard</button>
      <span>/</span>
      <span>{campo.nombre}</span>
    </div>

    <div class="campo-header">
      <div class="campo-header-left">
        <div class="campo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 21h18M6 21V10M18 21V10M3 10l9-7 9 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 class="campo-nombre">{campo.nombre}</h1>
          <p class="campo-ubicacion">📍 {campo.ubicacion}</p>
        </div>
      </div>
      <div class="campo-stats-row">
        <div class="stat-chip">
          <span class="stat-chip-val">{campoSilos.length}</span>
          <span class="stat-chip-lbl">Silobolsas</span>
        </div>
        <div class="stat-chip">
          <span class="stat-chip-val">{campoSensores.length}</span>
          <span class="stat-chip-lbl">Sensores</span>
        </div>
        {#if campoAlertas.length}
          <div class="stat-chip stat-chip--alert">
            <span class="stat-chip-val">{campoAlertas.length}</span>
            <span class="stat-chip-lbl">Alertas</span>
          </div>
        {/if}
      </div>
    </div>

    {#if campoAlertas.length}
      <div class="campo-alertas">
        {#each campoAlertas as alerta}
          <div class="alerta-row alerta-row--{alerta.nivel}">
            <span class="alerta-dot"></span>
            <span class="alerta-txt">{alerta.mensaje}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Silobolsas -->
    <div class="section">
      <div class="section-bar">
        <div class="section-bar-left">
          <h2 class="section-title">Silobolsas</h2>
          <span class="section-count">{campoSilos.length}</span>
        </div>
        <button class="btn-primary" on:click={() => showSiloModal = true}>+ Nuevo silobolsa</button>
      </div>

      {#if campoSilos.length === 0}
        <div class="empty-list">🌾 Todavía no hay silobolsas en este campo.</div>
      {:else}
        <div class="items-grid">
          {#each campoSilos as silo}
            <div class="item-card" role="button" tabindex="0"
              on:keydown={(e) => e.key==="Enter" && push("/silobolsa/" + silo.id)}
              on:click={() => navigate('/silobolsa/' + silo.id)}>
              <div class="item-card-head">
                <div>
                  <div class="item-grano">{silo.grano}</div>
                  <div class="item-marca">{silo.marca} · {silo.capacidad}t</div>
                </div>
                <StatusBadge estado={estadoSilo(silo.id)} />
              </div>
              <div class="item-ubicacion">📍 {silo.ubicacion}</div>
              <div class="item-footer">Ver detalle →</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Sensores -->
    <div class="section">
      <div class="section-bar">
        <div class="section-bar-left">
          <h2 class="section-title">Sensores</h2>
          <span class="section-count">{campoSensores.length}</span>
        </div>
        <button class="btn-primary" on:click={() => showSensorModal = true}>+ Nuevo sensor</button>
      </div>

      {#if campoSensores.length === 0}
        <div class="empty-list">📡 Todavía no hay sensores en este campo.</div>
      {:else}
        <div class="sensores-table">
          <div class="table-head">
            <span>Modelo</span>
            <span>MAC Address</span>
            <span>Estado</span>
            <span>Vinculado a</span>
            <span></span>
          </div>
          {#each campoSensores as sensor}
            {@const siloVinculado = campoSilos.find(s => s.id === sensor.silobolsaId)}
            <div class="table-row" role="button" tabindex="0"
              on:keydown={(e) => e.key==="Enter" && push("/sensor/" + sensor.id)}
              on:click={() => navigate('/sensor/' + sensor.id)}>
              <span class="table-modelo">{sensor.modelo}</span>
              <span class="table-mac">{sensor.mac}</span>
              <span><StatusBadge estado={sensor.estado} /></span>
              <span class="table-silo">
                {#if siloVinculado}
                  <span class="silo-link">{siloVinculado.grano} · {siloVinculado.ubicacion.split('—')[0].trim()}</span>
                {:else}
                  <span class="sin-silo">Sin asignar</span>
                {/if}
              </span>
              <span class="table-arrow">→</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Modal Nuevo Silobolsa -->
{#if showSiloModal}
  <div class="modal-overlay" role="presentation" on:click|self={() => showSiloModal = false}>
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Nuevo silobolsa</h3>
        <button class="modal-close" on:click={() => showSiloModal = false}>✕</button>
      </div>
      <form on:submit|preventDefault={submitSilo} class="modal-body">
        {#if siloError}<div class="form-error">{siloError}</div>{/if}
        <div class="form-row">
          <div class="field">
            <label class="label">Capacidad (toneladas) *</label>
            <input class="input" type="number" bind:value={siloForm.capacidad} placeholder="200" min="1" />
          </div>
          <div class="field">
            <label class="label">Marca *</label>
            <select class="input" bind:value={siloForm.marca}>
              <option value="">Seleccionar...</option>
              {#each marcas as m}<option value={m}>{m}</option>{/each}
            </select>
          </div>
        </div>
        <div class="field">
          <label class="label">Grano *</label>
          <select class="input" bind:value={siloForm.grano}>
            <option value="">Seleccionar...</option>
            {#each granos as g}<option value={g}>{g}</option>{/each}
          </select>
        </div>
        <div class="field">
          <label class="label">Ubicación dentro del campo *</label>
          <input class="input" type="text" bind:value={siloForm.ubicacion} placeholder="Ej: Lote Norte — parcela A" />
        </div>
        <div class="field">
          <label class="label">Observaciones</label>
          <textarea class="input" bind:value={siloForm.observaciones} rows="2" placeholder="Estado general, fecha de instalación, etc."></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" on:click={() => showSiloModal = false}>Cancelar</button>
          <button type="submit" class="btn-primary" disabled={siloLoading}>{siloLoading ? 'Creando...' : 'Crear silobolsa'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Modal Nuevo Sensor -->
{#if showSensorModal}
  <div class="modal-overlay" role="presentation" on:click|self={() => showSensorModal = false}>
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Nuevo sensor</h3>
        <button class="modal-close" on:click={() => showSensorModal = false}>✕</button>
      </div>
      <form on:submit|preventDefault={submitSensor} class="modal-body">
        {#if sensorError}<div class="form-error">{sensorError}</div>{/if}
        <div class="field">
          <label class="label">Modelo</label>
          <input class="input" type="text" bind:value={sensorForm.modelo} placeholder="Ej: LoRa-T100" />
        </div>
        <div class="field">
          <label class="label">MAC Address</label>
          <input class="input" type="text" bind:value={sensorForm.mac} placeholder="Ej: A4:C3:F0:12:7B:01" style="font-family: monospace;" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" on:click={() => showSensorModal = false}>Cancelar</button>
          <button type="submit" class="btn-primary" disabled={sensorLoading}>{sensorLoading ? 'Registrando...' : 'Registrar sensor'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 28px; }
  .loading { text-align: center; padding: 48px; color: var(--gray-400); }
  .not-found, .error-state { text-align: center; padding: 48px; color: var(--gray-500); }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-400); }
  .breadcrumb button { background: none; border: none; color: var(--green-600); font-size: 13px; }
  .breadcrumb button:hover { text-decoration: underline; }
  .campo-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); padding: 20px 24px; }
  .campo-header-left { display: flex; align-items: center; gap: 14px; }
  .campo-icon { width: 44px; height: 44px; background: var(--green-50); border: 1px solid var(--green-200); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--green-700); flex-shrink: 0; }
  .campo-nombre { font-family: var(--font-serif); font-size: 24px; color: var(--green-800); }
  .campo-ubicacion { font-size: 13px; color: var(--gray-500); margin-top: 3px; }
  .campo-stats-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .stat-chip { display: flex; flex-direction: column; align-items: center; background: var(--green-50); border-radius: var(--radius-md); padding: 10px 16px; min-width: 64px; }
  .stat-chip--alert { background: var(--amber-100); }
  .stat-chip-val { font-size: 20px; font-weight: 700; color: var(--green-700); line-height: 1; }
  .stat-chip--alert .stat-chip-val { color: var(--amber-600); }
  .stat-chip-lbl { font-size: 11px; color: var(--gray-500); margin-top: 3px; }
  .campo-alertas { display: flex; flex-direction: column; gap: 6px; }
  .alerta-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--radius-md); border-left: 3px solid transparent; }
  .alerta-row--critica { background: var(--red-50); border-color: var(--red-600); }
  .alerta-row--advertencia { background: var(--amber-100); border-color: var(--amber-600); }
  .alerta-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .alerta-row--critica .alerta-dot { color: var(--red-600); }
  .alerta-row--advertencia .alerta-dot { color: var(--amber-600); }
  .alerta-txt { font-size: 13px; font-weight: 500; color: var(--gray-800); }
  .section { display: flex; flex-direction: column; gap: 14px; }
  .section-bar { display: flex; align-items: center; justify-content: space-between; }
  .section-bar-left { display: flex; align-items: center; gap: 10px; }
  .section-title { font-size: 18px; font-weight: 600; color: var(--gray-900); }
  .section-count { background: var(--green-50); color: var(--green-700); font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .empty-list { background: var(--white); border: 0.5px dashed var(--gray-300); border-radius: var(--radius-lg); padding: 32px; text-align: center; font-size: 14px; color: var(--gray-400); }
  .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  .item-card { background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s; }
  .item-card:hover { box-shadow: var(--shadow-md); border-color: var(--green-300); transform: translateY(-1px); }
  .item-card-head { display: flex; justify-content: space-between; align-items: flex-start; }
  .item-grano { font-size: 16px; font-weight: 600; color: var(--green-800); }
  .item-marca { font-size: 12px; color: var(--gray-500); margin-top: 2px; }
  .item-ubicacion { font-size: 12px; color: var(--gray-500); }
  .item-footer { font-size: 12px; font-weight: 600; color: var(--green-600); border-top: 0.5px solid var(--gray-100); padding-top: 8px; }
  .sensores-table { background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); overflow: hidden; }
  .table-head { display: grid; grid-template-columns: 120px 180px 110px 1fr 30px; gap: 12px; padding: 10px 16px; background: var(--gray-50); border-bottom: 0.5px solid var(--gray-200); font-size: 11px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
  .table-row { display: grid; grid-template-columns: 120px 180px 110px 1fr 30px; gap: 12px; padding: 12px 16px; border-bottom: 0.5px solid var(--gray-100); cursor: pointer; align-items: center; transition: background 0.15s; }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: var(--green-50); }
  .table-modelo { font-size: 13px; font-weight: 500; color: var(--gray-900); }
  .table-mac { font-size: 11px; font-family: monospace; color: var(--gray-500); }
  .silo-link { font-size: 12px; color: var(--green-700); font-weight: 500; }
  .sin-silo { font-size: 12px; color: var(--gray-400); font-style: italic; }
  .table-arrow { color: var(--gray-400); font-size: 14px; }
  .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--green-800); color: var(--green-50); border: none; padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; transition: background 0.15s; white-space: nowrap; }
  .btn-primary:hover:not(:disabled) { background: var(--green-700); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-300); padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; }
  .btn-secondary:hover { background: var(--gray-50); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
  .modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); overflow: hidden; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 0.5px solid var(--gray-300); }
  .modal-title { font-size: 17px; font-weight: 600; color: var(--gray-900); }
  .modal-close { background: none; border: none; font-size: 16px; color: var(--gray-400); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .modal-close:hover { background: var(--gray-100); color: var(--gray-700); }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .input { padding: 10px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 14px; color: var(--gray-900); outline: none; background: var(--white); transition: border-color 0.15s, box-shadow 0.15s; }
  .input:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(91,140,62,0.12); }
  .form-error { background: var(--red-50); border: 1px solid #FCA5A5; color: var(--red-600); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; }
</style>
