<script>
  import { navigate } from '../lib/router.js'
  import { register } from '../lib/stores/app.js'

  let nombre = '', apellido = '', email = '', password = '', confirmPassword = '', telefono = ''
  let error = '', loading = false

  async function handleRegister() {
    error = ''
    if (!nombre || !apellido || !email || !password) { error = 'Completá todos los campos.'; return }
    if (password.length < 8) { error = 'La contraseña debe tener al menos 8 caracteres.'; return }
    if (password !== confirmPassword) { error = 'Las contraseñas no coinciden.'; return }
    loading = true
    try {
      await register({ nombre, apellido, email, password, telefono: telefono || undefined })
      navigate('/dashboard')
    } catch (e) {
      error = e.message ?? 'Error al crear la cuenta.'
    } finally {
      loading = false
    }
  }
</script>

<div class="register-page">
  <div class="register-card">
    <button class="back-link" on:click={() => navigate('/')}>← Volver al inicio</button>
    <h2 class="form-title">Crear cuenta</h2>
    <p class="form-subtitle">Empezá a monitorear tus silobolsas hoy</p>

    {#if error}
      <div class="form-error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleRegister} class="form">
      <div class="row">
        <div class="field">
          <label class="label" for="nombre">Nombre</label>
          <input id="nombre" class="input" type="text" bind:value={nombre} placeholder="Juan" />
        </div>
        <div class="field">
          <label class="label" for="apellido">Apellido</label>
          <input id="apellido" class="input" type="text" bind:value={apellido} placeholder="Pérez" />
        </div>
      </div>
      <div class="field">
        <label class="label" for="email">Email</label>
        <input id="email" class="input" type="email" bind:value={email} placeholder="tu@email.com.ar" />
      </div>
      <div class="field">
        <label class="label" for="telefono">Teléfono (opcional, para alertas WhatsApp)</label>
        <input id="telefono" class="input" type="tel" bind:value={telefono} placeholder="+5493412345678" />
      </div>
      <div class="field">
        <label class="label" for="password">Contraseña</label>
        <input id="password" class="input" type="password" bind:value={password} placeholder="Mínimo 8 caracteres" />
      </div>
      <div class="field">
        <label class="label" for="confirm">Confirmar contraseña</label>
        <input id="confirm" class="input" type="password" bind:value={confirmPassword} placeholder="Repetí tu contraseña" />
      </div>
      <button class="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>

    <p class="form-footer">
      ¿Ya tenés cuenta?
      <button class="link" on:click={() => navigate('/')}>Ingresar</button>
    </p>
  </div>
</div>

<style>
  .register-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: linear-gradient(135deg, var(--green-50) 0%, var(--white) 60%); }
  .register-card { background: var(--white); border: 0.5px solid var(--gray-300); border-radius: var(--radius-xl); padding: 40px; width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); }
  .back-link { background: none; border: none; color: var(--green-700); font-size: 13px; padding: 0; margin-bottom: 24px; display: block; }
  .back-link:hover { color: var(--green-800); }
  .form-title { font-family: var(--font-serif); font-size: 28px; color: var(--green-800); }
  .form-subtitle { font-size: 14px; color: var(--gray-500); margin-top: 6px; margin-bottom: 24px; }
  .form-error { background: var(--red-50); border: 1px solid #FCA5A5; color: var(--red-600); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
  .form { display: flex; flex-direction: column; gap: 16px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--gray-700); }
  .input { padding: 10px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 14px; color: var(--gray-900); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .input:focus { border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(91,140,62,0.12); }
  .btn-primary { background: var(--green-800); color: var(--green-50); border: none; padding: 11px 20px; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; margin-top: 4px; transition: background 0.15s; }
  .btn-primary:hover:not(:disabled) { background: var(--green-700); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .form-footer { margin-top: 20px; font-size: 13px; color: var(--gray-500); text-align: center; }
  .link { background: none; border: none; color: var(--green-700); font-weight: 500; font-size: 13px; text-decoration: underline; padding: 0; }
</style>
