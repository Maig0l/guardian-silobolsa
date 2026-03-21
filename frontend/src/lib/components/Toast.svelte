<script>
  import { toasts } from '../stores/app.js'
</script>

<div class="toast-container">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast--{toast.type}" role="alert">
      <span class="toast-icon">
        {#if toast.type === 'success'}✓{:else if toast.type === 'error'}✕{:else}i{/if}
      </span>
      <span class="toast-msg">{toast.message}</span>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.25s ease;
    pointer-events: all;
    min-width: 240px;
    max-width: 360px;
  }
  .toast--success { background: var(--green-800); color: var(--green-50); }
  .toast--error   { background: var(--red-600);   color: #fff; }
  .toast--info    { background: var(--gray-900);   color: #fff; }
  .toast-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
</style>
