<script>
  import { navigate } from '../lib/router.js'
  import { campos, silobolsas, sensores, alertas, crearSilobolsa, crearSensor, eliminarSilobolsa, eliminarSensor, loadCampoDetalle, dismissAlerta, dismissTodasAlertas, addToast } from '../lib/stores/app.js'
  import StatusBadge from '../lib/components/StatusBadge.svelte'

  export let params = {}
  $: campoId = Number(params.id)
  $: campo = $campos.find(c => c.id === campoId)
  $: campoSilos    = $silobolsas.filter(s => s.campoId === campoId)
  $: campoSensores = $sensores.filter(s => s.campoId === campoId)
  $: campoAlertas  = $alertas.filter(a => a.campoId === campoId)

  let pageLoading = true
  let pageError = ''
  $: if (campoId) {
    pageLoading = true
    loadCampoDetalle(campoId)
      .then(() => { pageLoading = false })
      .catch(e => { pageError = e.message; pageLoading = false })
  }

  function getSensorDeSilo(siloId) { return $sensores.find(s => s.silobolsaId === siloId) || null }
  function estadoSilo(siloId) {
    const sensor = getSensorDeSilo(siloId)
    return sensor ? sensor.estado : 'sin-sensor'
  }

  // Confirm delete state
  let confirmSiloId   = null
  let confirmSensorId = null

  async function handleEliminarSilo(id) {
    confirmSiloId = null
    try {
      await eliminarSilobolsa(campoId, id)
      addToast('Silobolsa eliminado.')
    } catch (e) { addToast(e.message ?? 'Error al eliminar.', 'error') }
  }

  async function handleEliminarSensor(id) {
    confirmSensorId = null
    try {
      await eliminarSensor(campoId, id)
      addToast('Sensor eliminado.')
    } catch (e) { addToast(e.message ?? 'Error al eliminar.', 'error') }
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
    } finally { siloLoading = false }
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
    } finally { sensorLoading = false }
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
        <div class="stat-chip"><span class="stat-chip-val">{campoSilos.length}</span><span class="stat-chip-lbl">Silobolsas</span></div>
        <div class="stat-chip"><span class="stat-chip-val">{campoSensores.length}</span><span class="stat-chip-lbl">Sensores</span></div>
        {#if campoAlertas.length}
          <div class="stat-chip stat-chip--alert"><span class="stat-chip-val">{campoAlertas.length}</span><span class="stat-chip-lbl">Alertas</span></div>
        {/if}
      </div>
    </div>

    {#if campoAlertas.length}
      <div class="campo-alertas-panel">
        <div class="campo-alertas-header">
          <div class="campo-alertas-title">
            <span class="alerta-indicator"></span>
            <span>Alertas activas</span>
            <span class="alerta-count">{campoAlertas.length}</span>
          </div>
          <button class="btn-dismiss-all" on:click={() => campoAlertas.forEach(a => dismissAlerta(a.id))}>
            Limpiar todas ✕
          </button>
        </div>
        <div class="campo-alertas-list">
          {#each campoAlertas as alerta (alerta.id)}
            <div class="alerta-row alerta-row--{alerta.nivel}">
              <span class="alerta-dot"></span>
              <span class="alerta-txt">{alerta.mensaje}</span>
              <button class="btn-dismiss-one" on:click|stopPropagation={() => dismissAlerta(alerta.id)} title="Descartar">✕</button>
            </div>
          {/each}
        </div>
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
            <div class="item-card">
              <div class="item-card-body" role="button" tabindex="0"
                on:keydown={(e) => e.key==="Enter" && navigate("/silobolsa/" + silo.id)}
                on:click={() => navigate('/silobolsa/' + silo.id)}>
                <div class="item-card-head">
                  <div>
                    <div class="item-grano">{silo.grano}</div>
                    <div class="item-marca">{silo.marca} · {silo.capacidad}t</div>
                  </div>
                  <StatusBadge estado={estadoSilo(silo.id)} />
                </div>
                <div class="item-ubicacion">📍 {silo.ubicacion}</div>
              </div>
              <div class="item-footer">
                <span class="ver-mas" role="button" tabindex="0"
                  on:click={() => navigate('/silobolsa/' + silo.id)}
                  on:keydown={(e) => e.key==="Enter" && navigate('/silobolsa/' + silo.id)}>
                  Ver detalle →
                </span>
                {#if confirmSiloId === silo.id}
                  <div class="confirm-delete">
                    <span class="confirm-txt">¿Eliminar?</span>
                    <button class="btn-confirm-yes" on:click={() => handleEliminarSilo(silo.id)}>Sí</button>
                    <button class="btn-confirm-no"  on:click={() => confirmSiloId = null}>No</button>
                  </div>
                {:else}
                  <button class="btn-delete" on:click|stopPropagation={() => confirmSiloId = silo.id} title="Eliminar">🗑</button>
                {/if}
              </div>
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
            <span>Modelo</span><span>MAC Address</span><span>Estado</span><span>Vinculado a</span><span></span>
          </div>
          {#each campoSensores as sensor}
            {@const siloVinculado = campoSilos.find(s => s.id === sensor.silobolsaId)}
            <div class="table-row">
              <span class="table-modelo" role="button" tabindex="0"
                on:click={() => navigate('/sensor/' + sensor.id)}
                on:keydown={(e) => e.key==="Enter" && navigate('/sensor/' + sensor.id)}>
                {sensor.modelo}
              </span>
              <span class="table-mac">{sensor.mac}</span>
              <span><StatusBadge estado={sensor.estado} /></span>
              <span class="table-silo">
                {#if siloVinculado}
                  <span class="silo-link">{siloVinculado.grano} · {siloVinculado.ubicacion.split('—')[0].trim()}</span>
                {:else}
                  <span class="sin-silo">Sin asignar</span>
                {/if}
              </span>
              <span class="table-actions">
                {#if confirmSensorId === sensor.id}
                  <div class="confirm-delete">
                    <span class="confirm-txt">¿Eliminar?</span>
                    <button class="btn-confirm-yes" on:click={() => handleEliminarSensor(sensor.id)}>Sí</button>
                    <button class="btn-confirm-no"  on:click={() => confirmSensorId = null}>No</button>
                  </div>
                {:else}
                  <button class="btn-delete" on:click|stopPropagation={() => confirmSensorId = sensor.id} title="Eliminar">🗑</button>
                {/if}
              </span>
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
            <label class="label" for="scap">Capacidad (t) *</label>
            <input id="scap" class="input" type="number" bind:value={siloForm.capacidad} placeholder="200" min="1" />
          </div>
          <div class="field">
            <label class="label" for="smarca">Marca *</label>
            <select id="smarca" class="input" bind:value={siloForm.marca}>
              <option value="">Seleccionar...</option>
              {#each marcas as m}<option value={m}>{m}</option>{/each}
            </select>
          </div>
        </div>
        <div class="field">
          <label class="label" for="sgrano">Grano *</label>
          <select id="sgrano" class="input" bind:value={siloForm.grano}>
            <option value="">Seleccionar...</option>
            {#each granos as g}<option value={g}>{g}</option>{/each}
          </select>
        </div>
        <div class="field">
          <label class="label" for="subic">Ubicación *</label>
          <input id="subic" class="input" type="text" bind:value={siloForm.ubicacion} placeholder="Ej: Lote Norte — parcela A" />
        </div>
        <div class="field">
          <label class="label" for="sobs">Observaciones</label>
          <textarea id="sobs" class="input" bind:value={siloForm.observaciones} rows="2" placeholder="Estado general, etc."></textarea>
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
          <label class="label" for="smod">Modelo</label>
          <input id="smod" class="input" type="text" bind:value={sensorForm.modelo} placeholder="Ej: LoRa-T100" />
        </div>
        <div class="field">
          <label class="label" for="smac">MAC Address</label>
          <input id="smac" class="input" type="text" bind:value={sensorForm.mac} placeholder="Ej: A4:C3:F0:12:7B:01" style="font-family: monospace;" />
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
  .loading, .not-found, .error-state { text-align: center; padding: 48px; color: var(--gray-400); }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-400); }
  .breadcrumb button { background: none; border: none; color: var(--green-600); font-size: 13px; cursor: pointer; }
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
  .campo-alertas-panel { background: var(--white); border: 1px solid #F0B84B; border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 2px 12px rgba(217,119,6,0.08); }
  .campo-alertas-header { background: linear-gradient(135deg, #FFFBEB, #FEF3E2); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #FDE68A; }
  .campo-alertas-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #92400E; }
  .alerta-indicator { width: 7px; height: 7px; border-radius: 50%; background: var(--amber-600); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
  .alerta-count { background: var(--amber-600); color: #fff; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 20px; }
  .btn-dismiss-all { background: none; border: 1px solid #F0B84B; color: #92400E; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; cursor: pointer; }
  .btn-dismiss-all:hover { background: rgba(217,119,6,0.1); }
  .campo-alertas-list { display: flex; flex-direction: column; max-height: 200px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #F0B84B transparent; }
  .campo-alertas-list::-webkit-scrollbar { width: 4px; }
  .campo-alertas-list::-webkit-scrollbar-thumb { background: #F0B84B; border-radius: 2px; }
  .alerta-row { display: flex; align-items: center; gap: 10px; padding: 9px 16px; border-left: 3px solid transparent; border-bottom: 1px solid var(--gray-100); }
  .alerta-row:last-child { border-bottom: none; }
  .alerta-row--critica { background: var(--red-50); border-color: var(--red-600); }
  .alerta-row--advertencia { background: var(--amber-100); border-color: var(--amber-600); }
  .alerta-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .alerta-row--critica .alerta-dot { color: var(--red-600); }
  .alerta-row--advertencia .alerta-dot { color: var(--amber-600); }
  .alerta-txt { font-size: 13px; font-weight: 500; color: var(--gray-800); flex: 1; min-width: 0; }
  .btn-dismiss-one { background: none; border: none; color: var(--gray-300); font-size: 13px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
  .btn-dismiss-one:hover { background: var(--gray-100); color: var(--gray-600); }
  .section { display: flex; flex-direction: column; gap: 14px; }
  .section-bar { display: flex; align-items: center; justify-content: space-between; }
  .section-bar-left { display: flex; align-items: center; gap: 10px; }
  .section-title { font-size: 18px; font-weight: 600; color: var(--gray-900); }
  .section-count { background: var(--green-50); color: var(--green-700); font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .empty-list { background: var(--white); border: 0.5px dashed var(--gray-300); border-radius: var(--radius-lg); padding: 32px; text-align: center; font-size: 14px; color: var(--gray-400); }

  .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  .item-card { background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); display: flex; flex-direction: column; transition: box-shadow 0.2s, border-color 0.2s; }
  .item-card:hover { box-shadow: var(--shadow-md); border-color: var(--green-300); }
  .item-card-body { padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .item-card-body:hover { background: var(--gray-50); border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .item-card-head { display: flex; justify-content: space-between; align-items: flex-start; }
  .item-grano { font-size: 16px; font-weight: 600; color: var(--green-800); }
  .item-marca { font-size: 12px; color: var(--gray-500); margin-top: 2px; }
  .item-ubicacion { font-size: 12px; color: var(--gray-500); }
  .item-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; border-top: 0.5px solid var(--gray-100); }
  .ver-mas { font-size: 12px; font-weight: 600; color: var(--green-600); cursor: pointer; }
  .ver-mas:hover { text-decoration: underline; }

  .sensores-table { background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-lg); overflow: hidden; }
  .table-head { display: grid; grid-template-columns: 120px 180px 110px 1fr 160px; gap: 12px; padding: 10px 16px; background: var(--gray-50); border-bottom: 0.5px solid var(--gray-200); font-size: 11px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
  .table-row { display: grid; grid-template-columns: 120px 180px 110px 1fr 160px; gap: 12px; padding: 12px 16px; border-bottom: 0.5px solid var(--gray-100); align-items: center; }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: var(--green-50); }
  .table-modelo { font-size: 13px; font-weight: 500; color: var(--green-700); cursor: pointer; }
  .table-modelo:hover { text-decoration: underline; }
  .table-mac { font-size: 11px; font-family: monospace; color: var(--gray-500); }
  .silo-link { font-size: 12px; color: var(--green-700); font-weight: 500; }
  .sin-silo { font-size: 12px; color: var(--gray-400); font-style: italic; }
  .table-actions { display: flex; align-items: center; justify-content: flex-end; }

  /* Botones eliminar y confirmar — reutilizables */
  .btn-delete { background: none; border: none; font-size: 15px; cursor: pointer; opacity: 0.4; padding: 2px 6px; border-radius: var(--radius-sm); transition: opacity 0.15s, background 0.15s; }
  .btn-delete:hover { opacity: 1; background: var(--red-50); }
  .confirm-delete { display: flex; align-items: center; gap: 6px; }
  .confirm-txt { font-size: 12px; color: var(--red-600); font-weight: 500; }
  .btn-confirm-yes { background: var(--red-600); color: #fff; border: none; padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; cursor: pointer; }
  .btn-confirm-yes:hover { background: #b91c1c; }
  .btn-confirm-no { background: var(--gray-100); color: var(--gray-700); border: none; padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px; cursor: pointer; }
  .btn-confirm-no:hover { background: var(--gray-200); }

  .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--green-800); color: var(--green-50); border: none; padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; transition: background 0.15s; white-space: nowrap; }
  .btn-primary:hover:not(:disabled) { background: var(--green-700); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-300); padding: 9px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; }
  .btn-secondary:hover { background: var(--gray-50); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
  .modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); overflow: hidden; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 0.5px solid var(--gray-300); }
  .modal-title { font-size: 17px; font-weight: 600; color: var(--gray-900); }
  .modal-close { background: none; border: none; font-size: 16px; color: var(--gray-400); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .modal-close:hover { background: var(--gray-100); color: var(--gray-700); }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .input { padding: 10px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 14px; color: var(--gray-900); outline: none; background: var(--white); transition: border-color 0.15s; }
  .input:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(91,140,62,0.12); }
  .form-error { background: var(--red-50); border: 1px solid #FCA5A5; color: var(--red-600); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; }
</style>
