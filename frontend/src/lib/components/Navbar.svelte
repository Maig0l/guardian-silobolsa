<script>
  import { currentUser, logout } from '../stores/app.js'
  import { navigate } from '../router.js'
</script>

<nav class="navbar">
  <div class="navbar-inner">
    <button class="navbar-brand" on:click={() => navigate('/dashboard')}>
      <span class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="8" width="16" height="9" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
          <path d="M2 11 Q10 6 18 11" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <circle cx="10" cy="11" r="2" fill="currentColor"/>
        </svg>
      </span>
      <span class="brand-text">Guardián <em>Silobolsa</em></span>
    </button>

    <div class="navbar-right">
      {#if $currentUser}
        <span class="navbar-user">{$currentUser.nombre} {$currentUser.apellido}</span>
        <button class="btn-logout" on:click={() => { logout(); navigate('/') }}>Salir</button>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar { background: var(--green-800); border-bottom: 1px solid var(--green-700); position: sticky; top: 0; z-index: 100; }
  .navbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
  .navbar-brand { display: flex; align-items: center; gap: 10px; background: none; border: none; color: var(--green-50); cursor: pointer; padding: 0; }
  .brand-icon { width: 34px; height: 34px; background: rgba(255,255,255,0.12); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--green-200); }
  .brand-text { font-family: var(--font-serif); font-size: 18px; color: var(--green-50); letter-spacing: 0.01em; }
  .brand-text em { font-style: italic; color: var(--green-200); }
  .navbar-right { display: flex; align-items: center; gap: 16px; }
  .navbar-user { font-size: 13px; color: var(--green-200); }
  .btn-logout { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: var(--green-100); padding: 5px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; transition: background 0.15s; }
  .btn-logout:hover { background: rgba(255,255,255,0.18); }
</style>
