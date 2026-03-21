<script>
  import { push } from 'svelte-spa-router'
  import { currentUser } from '../lib/stores/app.js'
  import { mockUser } from '../lib/mockData.js'

  let email = ''
  let password = ''
  let error = ''
  let loading = false

  async function handleLogin() {
    error = ''
    if (!email || !password) { error = 'Completá todos los campos.'; return }
    loading = true
    await new Promise(r => setTimeout(r, 600))
    if (email === mockUser.email && password === '12345678') {
      currentUser.set(mockUser)
      push('/dashboard')
    } else {
      error = 'Email o contraseña incorrectos. (Demo: carlos@losombues.com.ar / 12345678)'
    }
    loading = false
  }
</script>

<div class="login-page">
  <div class="login-left">
    <div class="brand">
      <div class="brand-icon-lg">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="13" width="26" height="14" rx="5" fill="white" opacity="0.2" stroke="white" stroke-width="2"/>
          <path d="M3 18 Q16 10 29 18" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="16" cy="18" r="3" fill="white"/>
        </svg>
      </div>
      <div>
        <h1 class="brand-name">Guardián <em>Silobolsa</em></h1>
        <p class="brand-tagline">Monitoreo inteligente de granos</p>
      </div>
    </div>
    <div class="features">
      {#each ['Temperatura y humedad en tiempo real', 'Alertas por CO₂ y rotura de silobolsa', 'Notificaciones vía WhatsApp y Telegram', 'Tecnología LoRaWAN de largo alcance'] as feature}
        <div class="feature-item">
          <span class="feature-dot"></span>
          <span>{feature}</span>
        </div>
      {/each}
    </div>
    <p class="login-tagline">"La tranquilidad de saber que tu cosecha está segura."</p>
  </div>

  <div class="login-right">
    <div class="login-card">
      <h2 class="form-title">Ingresar</h2>
      <p class="form-subtitle">Accedé al monitoreo de tus campos</p>

      {#if error}
        <div class="form-error">{error}</div>
      {/if}

      <form on:submit|preventDefault={handleLogin} class="form">
        <div class="field">
          <label class="label" for="email">Email</label>
          <input id="email" class="input" type="email" bind:value={email} placeholder="tu@email.com.ar" autocomplete="email" />
        </div>
        <div class="field">
          <label class="label" for="password">Contraseña</label>
          <input id="password" class="input" type="password" bind:value={password} placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button class="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>

      <p class="form-footer">
        ¿No tenés cuenta?
        <button class="link" on:click={() => push('/register')}>Registrarse</button>
      </p>

      <div class="demo-hint">
        <span class="demo-label">Demo</span>
        <span>carlos@losombues.com.ar / 12345678</span>
      </div>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 768px) { .login-page { grid-template-columns: 1fr; } .login-left { display: none; } }

  .login-left {
    background: linear-gradient(160deg, var(--green-800) 0%, var(--green-900) 100%);
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 40px;
    position: relative;
    overflow: hidden;
  }
  .login-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand-icon-lg {
    width: 56px; height: 56px;
    background: rgba(255,255,255,0.12);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .brand-name {
    font-family: var(--font-serif);
    font-size: 26px;
    color: var(--green-50);
    line-height: 1.2;
  }
  .brand-name em { font-style: italic; color: var(--green-300); }
  .brand-tagline { font-size: 13px; color: var(--green-300); margin-top: 4px; }

  .features { display: flex; flex-direction: column; gap: 14px; }
  .feature-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--green-100); }
  .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-300); flex-shrink: 0; }
  .login-tagline {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 16px;
    color: var(--green-300);
    line-height: 1.5;
  }

  .login-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    background: var(--white);
  }
  .login-card { width: 100%; max-width: 380px; }
  .form-title { font-family: var(--font-serif); font-size: 28px; color: var(--green-800); }
  .form-subtitle { font-size: 14px; color: var(--gray-500); margin-top: 6px; margin-bottom: 24px; }

  .form-error {
    background: var(--red-50);
    border: 1px solid #FCA5A5;
    color: var(--red-600);
    padding: 10px 14px;
    border-radius: var(--radius-md);
    font-size: 13px;
    margin-bottom: 16px;
  }

  .form { display: flex; flex-direction: column; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .input {
    padding: 10px 14px;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--gray-900);
    background: var(--white);
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  .input:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(91,140,62,0.12); }

  .btn-primary {
    background: var(--green-800);
    color: var(--green-50);
    border: none;
    padding: 11px 20px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    margin-top: 4px;
    transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--green-700); }
  .btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .form-footer { margin-top: 20px; font-size: 13px; color: var(--gray-500); text-align: center; }
  .link { background: none; border: none; color: var(--green-700); font-weight: 500; font-size: 13px; text-decoration: underline; padding: 0; }

  .demo-hint {
    margin-top: 16px;
    background: var(--green-50);
    border: 1px dashed var(--green-300);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    font-size: 12px;
    color: var(--green-700);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .demo-label {
    background: var(--green-800);
    color: var(--green-50);
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 20px;
    white-space: nowrap;
  }
</style>
