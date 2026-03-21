<script>
  import { onMount, onDestroy } from 'svelte'

  export let lecturas = []
  export let tipo = 'temperature' // temperature | humidity | co2

  const config = {
    temperature: { label: 'Temperatura (°C)', color: '#E85D24', fill: 'rgba(232,93,36,0.08)', unit: '°C', umbral: 30 },
    humidity:    { label: 'Humedad (%)',       color: '#3B8BD4', fill: 'rgba(59,139,212,0.08)', unit: '%', umbral: 18 },
    co2:         { label: 'CO₂ (ppm)',         color: '#5B8C3E', fill: 'rgba(91,140,62,0.08)',  unit: ' ppm', umbral: 800 },
  }

  let canvas
  let chart
  let Chart

  $: cfg = config[tipo] ?? config.temperature
  $: if (chart && lecturas.length) updateChart()

  function labels() {
    return lecturas.map(l => {
      const d = new Date(l.timestamp)
      return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
    })
  }

  function data() {
    return lecturas.map(l => l[tipo])
  }

  function buildChart() {
    if (!canvas || !Chart) return
    if (chart) chart.destroy()

    const ctx = canvas.getContext('2d')
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels(),
        datasets: [{
          label: cfg.label,
          data: data(),
          borderColor: cfg.color,
          backgroundColor: cfg.fill,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A2E0E',
            titleColor: '#A8C97A',
            bodyColor: '#E0EFC8',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` ${ctx.parsed.y.toFixed(1)}${cfg.unit}`
            }
          },
          annotation: {
            annotations: {
              umbral: {
                type: 'line',
                yMin: cfg.umbral,
                yMax: cfg.umbral,
                borderColor: 'rgba(220,38,38,0.4)',
                borderWidth: 1,
                borderDash: [5, 5],
                label: { content: 'Umbral', display: true, position: 'end', font: { size: 10 }, color: 'rgba(220,38,38,0.7)', backgroundColor: 'transparent' }
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11, family: "'DM Sans', sans-serif" },
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            border: { display: false }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
            ticks: {
              color: '#6B7280',
              font: { size: 11, family: "'DM Sans', sans-serif" },
              callback: v => v + cfg.unit,
              maxTicksLimit: 6,
            },
            border: { display: false }
          }
        }
      }
    })
  }

  function updateChart() {
    if (!chart) return
    chart.data.labels = labels()
    chart.data.datasets[0].data = data()
    chart.data.datasets[0].borderColor = cfg.color
    chart.data.datasets[0].backgroundColor = cfg.fill
    chart.update()
  }

  onMount(async () => {
    const ChartModule = await import('chart.js/auto')
    Chart = ChartModule.default
    // intentionally skip annotation plugin to keep deps minimal
    buildChart()
  })

  onDestroy(() => { if (chart) chart.destroy() })

  $: if (Chart && canvas) buildChart()
</script>

<div class="chart-wrap">
  <div class="chart-header">
    <span class="chart-label" style="color: {cfg.color}">{cfg.label}</span>
    {#if lecturas.length}
      {@const last = lecturas[lecturas.length - 1]}
      <span class="chart-current" style="color: {cfg.color}">
        {last[tipo].toFixed(1)}{cfg.unit}
      </span>
    {/if}
  </div>
  <div class="chart-body">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>

<style>
  .chart-wrap {
    background: var(--white);
    border: 0.5px solid var(--gray-300);
    border-radius: var(--radius-lg);
    padding: 16px 18px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .chart-label { font-size: 13px; font-weight: 600; }
  .chart-current { font-size: 22px; font-weight: 600; }
  .chart-body { height: 160px; position: relative; }
</style>
