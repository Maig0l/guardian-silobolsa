<script>
  import { push } from 'svelte-spa-router'
  import { currentUser, campos, alertas, silobolsas, sensores, crearCampo, addToast } from '../lib/stores/app.js'
  import AlertBanner from '../lib/components/AlertBanner.svelte'
  import StatusBadge from '../lib/components/StatusBadge.svelte'

  let showModal = false
  let nuevoCampoNombre = ''
  let nuevoCampoUbicacion = ''
  let formError = ''

  function verCampo(id) { push('/campo/' + id) }

  function verSilo(id) { push('/silobolsa/' + id) }

  function getCampoAlertas(campoId) {
    return $alertas.filter(a => a.campoId === campoId)
  }

  function getSilobolsasCount(campo) { return campo.silobolsas.length }
  function getSensoresCount(campo) { return campo.sensores.length }

  function estadoCampo(campo) {
    const tieneAlerta = $alertas.some(a => a.campoId === campo.id && a.nivel === 'critica')
    const tieneAdvertencia = $alertas.some(a => a.campoId === campo.id)
    if (tieneAlerta) return 'alerta'
    if (tieneAdvertencia) return 'advertencia'
    return 'activo'
  }

  function submitNuevoCampo() {
    formError = ''
    if (!nuevoCampoNombre.trim()) { formError = 'El nombre es requerido.'; return }
    if (!nuevoCampoUbicacion.trim()) { formError = 'La ubicación es requerida.'; return }
    const id = crearCampo(nuevoCampoNombre.trim(), nuevoCampoUbicacion.trim())
    addToast(`Campo "${nuevoCampoNombre}" creado exitosamente.`)
    showModal = false
    nuevoCampoNombre = ''
    nuevoCampoUbicacion = ''
    push('/campo/' + id)
  }
</script>

<div class="dashboard">
  <div class="page-header">
    <div>
      <h1 class="page-title">Bienvenido, {$currentUser?.nombre} 👋</h1>
      <p class="page-sub">Supervisá el estado de todos tus campos y silobolsas</p>
    </div>
    <button class="btn-primary" on:click={() => showModal = true}>
      <span>+</span> Nuevo campo
    </button>
  </div>

  {#if $alertas.length}
    <AlertBanner alertas={$alertas} onVerSilo={verSilo} />
  {/if}

  <div class="section-header">
    <h2 class="section-title">Mis campos</h2>
    <span class="section-count">{$campos.length} campos</span>
  </div>

  {#if $campos.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🌾</div>
      <h3>Todavía no tenés campos registrados</h3>
      <p>Creá tu primer campo para empezar a monitorear tus silobolsas.</p>
      <button class="btn-primary" on:click={() => showModal = true}>+ Crear primer campo</button>
    </div>
  {:else}
    <div class="campos-grid">
      {#each $campos as campo}
        {@const alertasCampo = getCampoAlertas(campo.id)}
        <div class="campo-card" role="button" tabindex="0" on:keydown={(e) => e.key==="Enter" && verCampo(campo.id)} on:click={() => verCampo(campo.id)}>
          <div class="campo-card-header">
            <div>
              <h3 class="campo-nombre">{campo.nombre}</h3>
              <p class="campo-ubicacion">📍 {campo.ubicacion}</p>
            </div>
            <StatusBadge estado={estadoCampo(campo)} />
          </div>

          <div class="campo-stats">
            <div class="stat">
              <span class="stat-val">{getSilobolsasCount(campo)}</span>
              <span class="stat-lbl">Silobolsas</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">{getSensoresCount(campo)}</span>
              <span class="stat-lbl">Sensores</span>
            </div>
            {#if alertasCampo.length > 0}
              <div class="stat-divider"></div>
              <div class="stat">
                <span class="stat-val stat-val--alert">{alertasCampo.length}</span>
                <span class="stat-lbl">Alertas</span>
              </div>
            {/if}
          </div>

          {#if alertasCampo.length > 0}
            <div class="campo-alert-preview">
              <span class="alert-dot-sm"></span>
              <span class="alert-preview-txt">{alertasCampo[0].mensaje}</span>
            </div>
          {/if}

          <div class="campo-footer">
            <span class="ver-mas">Ver campo →</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal Nuevo Campo -->
{#if showModal}
  <div class="modal-overlay" role="presentation" on:click|self={() => showModal = false}>
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Nuevo campo</h3>
        <button class="modal-close" on:click={() => showModal = false}>✕</button>
      </div>
      <form on:submit|preventDefault={submitNuevoCampo} class="modal-body">
        {#if formError}
          <div class="form-error">{formError}</div>
        {/if}
        <div class="field">
          <label class="label" for="cnombre">Nombre del campo</label>
          <input id="cnombre" class="input" type="text" bind:value={nuevoCampoNombre} placeholder="Ej: Las Margaritas" />
        </div>
        <div class="field">
          <label class="label" for="cubicacion">Ubicación</label>
          <input id="cubicacion" class="input" type="text" bind:value={nuevoCampoUbicacion} placeholder="Ej: Cañada de Gómez, Santa Fe" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" on:click={() => showModal = false}>Cancelar</button>
          <button type="submit" class="btn-primary">Crear campo</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .page-title { font-family: var(--font-serif); font-size: 28px; color: var(--green-800); }
  .page-sub { font-size: 14px; color: var(--gray-500); margin-top: 4px; }

  .section-header { display: flex; align-items: center; gap: 12px; }
  .section-title { font-size: 18px; font-weight: 600; color: var(--gray-900); }
  .section-count {
    background: var(--green-50); color: var(--green-700);
    font-size: 12px; font-weight: 600; padding: 3px 10px;
    border-radius: 20px;
  }

  .campos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
  .campo-card {
    background: var(--white);
    border: 0.5px solid var(--gray-300);
    border-radius: var(--radius-lg);
    padding: 20px;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.15s, border-color 0.2s;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .campo-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--green-300);
    transform: translateY(-1px);
  }
  .campo-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .campo-nombre { font-size: 17px; font-weight: 600; color: var(--green-800); }
  .campo-ubicacion { font-size: 13px; color: var(--gray-500); margin-top: 3px; }

  .campo-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--green-50);
    border-radius: var(--radius-md);
    padding: 12px 16px;
  }
  .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .stat-val { font-size: 22px; font-weight: 700; color: var(--green-700); line-height: 1; }
  .stat-val--alert { color: var(--amber-600); }
  .stat-lbl { font-size: 11px; color: var(--gray-500); font-weight: 500; }
  .stat-divider { width: 1px; height: 28px; background: var(--green-200); }

  .campo-alert-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--amber-100);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
  }
  .alert-dot-sm {
    width: 6px; height: 6px;
    border-radius: 50%; background: var(--amber-600);
    flex-shrink: 0;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
  }
  .alert-preview-txt { font-size: 12px; color: #92400E; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .campo-footer { border-top: 0.5px solid var(--gray-100); padding-top: 10px; }
  .ver-mas { font-size: 13px; font-weight: 600; color: var(--green-600); }

  .empty-state {
    text-align: center;
    padding: 64px 24px;
    background: var(--white);
    border: 0.5px dashed var(--gray-300);
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .empty-icon { font-size: 48px; }
  .empty-state h3 { font-size: 18px; font-weight: 600; color: var(--gray-700); }
  .empty-state p { font-size: 14px; color: var(--gray-500); }

  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    background: var(--green-800); color: var(--green-50);
    border: none; padding: 10px 20px;
    border-radius: var(--radius-md); font-size: 14px; font-weight: 600;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: var(--green-700); }
  .btn-primary:active { transform: scale(0.98); }
  .btn-secondary {
    background: var(--white); color: var(--gray-700);
    border: 1px solid var(--gray-300); padding: 10px 20px;
    border-radius: var(--radius-md); font-size: 14px; font-weight: 500;
  }
  .btn-secondary:hover { background: var(--gray-50); }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 24px;
  }
  .modal {
    background: var(--white);
    border-radius: var(--radius-xl);
    width: 100%; max-width: 440px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 0.5px solid var(--gray-300);
  }
  .modal-title { font-size: 17px; font-weight: 600; color: var(--gray-900); }
  .modal-close {
    background: none; border: none; font-size: 16px;
    color: var(--gray-400); width: 28px; height: 28px;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
  }
  .modal-close:hover { background: var(--gray-100); color: var(--gray-700); }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .input {
    padding: 10px 14px; border: 1px solid var(--gray-300);
    border-radius: var(--radius-md); font-size: 14px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .input:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(91,140,62,0.12); }
  .form-error {
    background: var(--red-50); border: 1px solid #FCA5A5;
    color: var(--red-600); padding: 10px 14px;
    border-radius: var(--radius-md); font-size: 13px;
  }
</style>
