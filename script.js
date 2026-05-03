const copyButton = document.getElementById('copyLink');
const statusNode = document.getElementById('status');

function showMessage(message) {
  statusNode.textContent = message;
  window.setTimeout(() => {
    if (statusNode.textContent === message) {
      statusNode.textContent = '';
    }
  }, 2500);
}

copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showMessage('Enlace copiado.');
  } catch {
    showMessage('No se pudo copiar automáticamente.');
  }
});
