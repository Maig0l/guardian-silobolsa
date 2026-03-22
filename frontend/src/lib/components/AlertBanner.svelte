<script>
  export let alertas = []
  export let onVerSilo = () => {}
  export let onDismiss = () => {}
  export let onDismissAll = () => {}

  const iconos = { humedad: '💧', co2: '☁', temperatura: '🌡', sensor: '📡' }

  function timeAgo(ts) {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs} h`
    return `hace ${Math.floor(hrs / 24)} días`
  }
</script>

{#if alertas.length > 0}
  <div class="alert-panel">
    <div class="alert-header">
      <div class="alert-header-left">
        <span class="alert-indicator"></span>
        <span class="alert-title">Alertas activas</span>
        <span class="alert-count">{alertas.length}</span>
      </div>
      <button class="btn-dismiss-all" on:click={onDismissAll} title="Limpiar todas">
        Limpiar todas ✕
      </button>
    </div>
    <div class="alert-list">
      {#each alertas as alerta (alerta.id)}
        <div class="alert-item alert-item--{alerta.nivel}">
          <div class="alert-icon">{iconos[alerta.tipo] ?? '⚠'}</div>
          <div class="alert-body"
            role="button" tabindex="0"
            on:keydown={(e) => e.key==="Enter" && onVerSilo(alerta.silobolsaId)}
            on:click={() => onVerSilo(alerta.silobolsaId)}>
            <p class="alert-msg">{alerta.mensaje}</p>
            <p class="alert-time">{timeAgo(alerta.timestamp)}</p>
          </div>
          <button class="btn-dismiss" on:click|stopPropagation={() => onDismiss(alerta.id)} title="Descartar">✕</button>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .alert-panel {
    background: var(--white);
    border: 1px solid #F0B84B;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(217,119,6,0.1);
  }
  .alert-header {
    background: linear-gradient(135deg, #FFFBEB, #FEF3E2);
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #FDE68A;
  }
  .alert-header-left { display: flex; align-items: center; gap: 8px; }
  .alert-indicator {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--amber-600);
    box-shadow: 0 0 0 3px rgba(217,119,6,0.2);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(217,119,6,0.2); }
    50%       { box-shadow: 0 0 0 6px rgba(217,119,6,0.05); }
  }
  .alert-title { font-size: 14px; font-weight: 600; color: #92400E; }
  .alert-count {
    background: var(--amber-600);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 20px;
  }
  .btn-dismiss-all {
    background: none;
    border: 1px solid #F0B84B;
    color: #92400E;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-dismiss-all:hover { background: rgba(217,119,6,0.1); }

  /* ── Lista con altura fija y scroll ── */
  .alert-list {
    display: flex;
    flex-direction: column;
    max-height: 240px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #F0B84B transparent;
  }
  .alert-list::-webkit-scrollbar { width: 4px; }
  .alert-list::-webkit-scrollbar-track { background: transparent; }
  .alert-list::-webkit-scrollbar-thumb { background: #F0B84B; border-radius: 2px; }

  .alert-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 18px;
    border-bottom: 1px solid var(--gray-100);
    transition: background 0.15s;
  }
  .alert-item:last-child { border-bottom: none; }
  .alert-item--critica     { border-left: 3px solid var(--red-600); }
  .alert-item--advertencia { border-left: 3px solid var(--amber-600); }
  .alert-icon { font-size: 18px; flex-shrink: 0; }
  .alert-body {
    flex: 1;
    min-width: 0;
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 4px;
    transition: background 0.15s;
  }
  .alert-body:hover { background: var(--gray-100); }
  .alert-msg { font-size: 13px; font-weight: 500; color: var(--gray-900); }
  .alert-time { font-size: 11px; color: var(--gray-500); margin-top: 2px; }

  .btn-dismiss {
    background: none;
    border: none;
    color: var(--gray-300);
    font-size: 14px;
    width: 24px; height: 24px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-dismiss:hover { background: var(--gray-100); color: var(--gray-600); }
</style>
