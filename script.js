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

const certToggles = Array.from(document.querySelectorAll('.cert-toggle'));
const aporteToggles = Array.from(document.querySelectorAll('.aportes-toggle'));

certToggles.forEach((toggleButton) => {
  toggleButton.addEventListener('click', () => {
    const contentId = toggleButton.getAttribute('aria-controls');
    const contentNode = contentId ? document.getElementById(contentId) : null;
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

    certToggles.forEach((button) => {
      const targetId = button.getAttribute('aria-controls');
      const targetContent = targetId ? document.getElementById(targetId) : null;
      button.setAttribute('aria-expanded', 'false');
      if (targetContent) {
        targetContent.hidden = true;
      }
    });

    if (!isExpanded) {
      toggleButton.setAttribute('aria-expanded', 'true');
      if (contentNode) {
        contentNode.hidden = false;
      }
    }
  });
});

aporteToggles.forEach((toggleButton) => {
  toggleButton.addEventListener('click', () => {
    const contentId = toggleButton.getAttribute('aria-controls');
    const contentNode = contentId ? document.getElementById(contentId) : null;
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

    aporteToggles.forEach((button) => {
      const targetId = button.getAttribute('aria-controls');
      const targetContent = targetId ? document.getElementById(targetId) : null;
      button.setAttribute('aria-expanded', 'false');
      if (targetContent) {
        targetContent.hidden = true;
      }
    });

    if (!isExpanded) {
      toggleButton.setAttribute('aria-expanded', 'true');
      if (contentNode) {
        contentNode.hidden = false;
      }
    }
  });
});

function initializeCarousel(config) {
  const slides = Array.from(document.querySelectorAll(config.slideSelector));
  const prevButton = document.getElementById(config.prevButtonId);
  const nextButton = document.getElementById(config.nextButtonId);
  const statusNode = document.getElementById(config.statusId);

  if (slides.length === 0) {
    return;
  }

  let activeSlideIndex = 0;

  function renderCarousel() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeSlideIndex);
    });

    if (statusNode) {
      statusNode.textContent = `${activeSlideIndex + 1} / ${slides.length}`;
    }
  }

  prevButton?.addEventListener('click', () => {
    activeSlideIndex = (activeSlideIndex - 1 + slides.length) % slides.length;
    renderCarousel();
  });

  nextButton?.addEventListener('click', () => {
    activeSlideIndex = (activeSlideIndex + 1) % slides.length;
    renderCarousel();
  });

  renderCarousel();
}

initializeCarousel({
  slideSelector: '[data-carousel-slide="feeders"]',
  prevButtonId: 'feedersPrev',
  nextButtonId: 'feedersNext',
  statusId: 'feedersStatus',
});

initializeCarousel({
  slideSelector: '[data-carousel-slide="maps"]',
  prevButtonId: 'mapsPrev',
  nextButtonId: 'mapsNext',
  statusId: 'mapsStatus',
});
