<script>
  export let estado = 'activo' // activo | alerta | inactivo | sin-sensor
  const map = {
    'activo':     { label: 'Activo',      color: 'green'  },
    'alerta':     { label: 'Alerta',      color: 'amber'  },
    'inactivo':   { label: 'Inactivo',    color: 'gray'   },
    'sin-sensor': { label: 'Sin sensor',  color: 'gray'   },
    'critica':    { label: 'Crítica',     color: 'red'    },
    'advertencia':{ label: 'Advertencia', color: 'amber'  },
  }
  $: info = map[estado] ?? { label: estado, color: 'gray' }
</script>

<span class="badge badge--{info.color}">
  <span class="dot"></span>
  {info.label}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .badge--green  { background: var(--green-50);  color: var(--green-700); }
  .badge--green .dot  { background: var(--green-500); }
  .badge--amber  { background: var(--amber-100); color: #92400E; }
  .badge--amber .dot  { background: var(--amber-600); }
  .badge--red    { background: var(--red-50);    color: var(--red-600); }
  .badge--red .dot    { background: var(--red-600); }
  .badge--gray   { background: var(--gray-100);  color: var(--gray-500); }
  .badge--gray .dot   { background: var(--gray-300); }
</style>
