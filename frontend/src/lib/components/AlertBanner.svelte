<script>
  import { timeAgo } from '../mockData.js'
  export let alertas = []
  export let onVerSilo = () => {}

  const iconos = { humedad: '💧', co2: '☁', temperatura: '🌡' }
</script>

{#if alertas.length > 0}
  <div class="alert-panel">
    <div class="alert-header">
      <div class="alert-header-left">
        <span class="alert-indicator"></span>
        <span class="alert-title">Alertas activas</span>
        <span class="alert-count">{alertas.length}</span>
      </div>
    </div>
    <div class="alert-list">
      {#each alertas as alerta}
        <div class="alert-item alert-item--{alerta.nivel}" role="button" tabindex="0" on:keydown={(e) => e.key==="Enter" && onVerSilo(alerta.silobolsaId)} on:click={() => onVerSilo(alerta.silobolsaId)}>
          <div class="alert-icon">{iconos[alerta.tipo] ?? '⚠'}</div>
          <div class="alert-body">
            <p class="alert-msg">{alerta.mensaje}</p>
            <p class="alert-time">{timeAgo(alerta.timestamp)}</p>
          </div>
          <div class="alert-arrow">→</div>
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
  .alert-list { display: flex; flex-direction: column; }
  .alert-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid var(--gray-100);
  }
  .alert-item:last-child { border-bottom: none; }
  .alert-item:hover { background: var(--gray-50); }
  .alert-item--critica { border-left: 3px solid var(--red-600); }
  .alert-item--advertencia { border-left: 3px solid var(--amber-600); }
  .alert-icon { font-size: 18px; flex-shrink: 0; }
  .alert-body { flex: 1; min-width: 0; }
  .alert-msg { font-size: 13px; font-weight: 500; color: var(--gray-900); }
  .alert-time { font-size: 11px; color: var(--gray-500); margin-top: 2px; }
  .alert-arrow { color: var(--gray-400); font-size: 16px; flex-shrink: 0; }
</style>
