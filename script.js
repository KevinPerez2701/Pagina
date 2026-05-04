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
    showMessage('No se pudo copiar automaticamente.');
  }
});

const certToggles = Array.from(document.querySelectorAll('.cert-toggle'));
const aporteToggles = Array.from(document.querySelectorAll('.aportes-toggle'));
const pendingImages = Array.from(document.querySelectorAll('[data-pending-image]'));

function markImageShell(imageNode, isReady) {
  const shell = imageNode.closest('[data-image-shell]');
  shell?.classList.toggle('is-ready', isReady);
}

function bindPendingImage(imageNode) {
  imageNode.addEventListener('load', () => {
    markImageShell(imageNode, imageNode.naturalWidth > 0);
  });

  imageNode.addEventListener('error', () => {
    markImageShell(imageNode, false);
  });

  if (imageNode.complete) {
    markImageShell(imageNode, imageNode.naturalWidth > 0);
  }
}

function forceLoadImage(imageNode) {
  imageNode.loading = 'eager';

  if (imageNode.complete) {
    markImageShell(imageNode, imageNode.naturalWidth > 0);
    return;
  }

  if (typeof imageNode.decode === 'function') {
    imageNode
      .decode()
      .then(() => {
        markImageShell(imageNode, imageNode.naturalWidth > 0);
      })
      .catch(() => {
        markImageShell(imageNode, false);
      });
  }
}

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

        const contentCarousels = Array.from(contentNode.querySelectorAll('.carousel'));
        contentCarousels.forEach((carouselNode) => {
          if (typeof carouselNode.refreshCarousel === 'function') {
            carouselNode.refreshCarousel();
          }
        });

        const contentImages = Array.from(contentNode.querySelectorAll('[data-pending-image]'));
        contentImages.forEach((imageNode) => {
          forceLoadImage(imageNode);
        });
      }
    }
  });
});

pendingImages.forEach((imageNode) => {
  bindPendingImage(imageNode);
});

function initializeCarousel(config) {
  const carouselRoot = document.getElementById(config.carouselId);
  if (!carouselRoot) {
    return;
  }

  const slides = Array.from(carouselRoot.querySelectorAll(config.slideSelector));
  const prevButton = document.getElementById(config.prevButtonId);
  const nextButton = document.getElementById(config.nextButtonId);
  const carouselStatusNode = document.getElementById(config.statusId);

  if (slides.length === 0) {
    return;
  }

  let activeSlideIndex = 0;
  let touchStartX = null;
  let allLazyMediaLoaded = false;

  carouselRoot.tabIndex = 0;

  const dotsNode = document.createElement('div');
  dotsNode.className = 'carousel-dots';
  dotsNode.setAttribute('aria-label', 'Navegacion de diapositivas');

  const dots = slides.map((_, index) => {
    const dotButton = document.createElement('button');
    dotButton.className = 'carousel-dot';
    dotButton.type = 'button';
    dotButton.setAttribute('aria-label', `Ir a elemento ${index + 1}`);
    dotButton.addEventListener('click', () => {
      activeSlideIndex = index;
      renderCarousel();
    });
    dotsNode.append(dotButton);
    return dotButton;
  });

  carouselStatusNode?.insertAdjacentElement('beforebegin', dotsNode);

  function canLoadMediaNow() {
    return !carouselRoot.closest('[hidden]');
  }

  function ensureLazyMediaLoaded(slideNode) {
    const iframes = Array.from(slideNode.querySelectorAll('iframe[data-src]'));
    iframes.forEach((frame) => {
      if (!frame.getAttribute('src')) {
        frame.setAttribute('src', frame.dataset.src || '');
      }
    });
  }

  function ensureAllLazyMediaLoaded() {
    const iframes = Array.from(carouselRoot.querySelectorAll('iframe[data-src]'));
    iframes.forEach((frame) => {
      if (!frame.getAttribute('src')) {
        frame.setAttribute('src', frame.dataset.src || '');
      }
    });
    allLazyMediaLoaded = true;
  }

  function renderCarousel() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeSlideIndex);
      slide.setAttribute('aria-hidden', String(index !== activeSlideIndex));

      if (index === activeSlideIndex && canLoadMediaNow()) {
        ensureLazyMediaLoaded(slide);
      }
    });

    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === activeSlideIndex));
    });

    if (carouselStatusNode) {
      carouselStatusNode.textContent = `${activeSlideIndex + 1} / ${slides.length}`;
    }

    if (config.preloadAllMediaOnOpen && canLoadMediaNow() && !allLazyMediaLoaded) {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => {
          ensureAllLazyMediaLoaded();
        });
      } else {
        window.setTimeout(() => {
          ensureAllLazyMediaLoaded();
        }, 80);
      }
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

  carouselRoot.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      activeSlideIndex = (activeSlideIndex - 1 + slides.length) % slides.length;
      renderCarousel();
    }

    if (event.key === 'ArrowRight') {
      activeSlideIndex = (activeSlideIndex + 1) % slides.length;
      renderCarousel();
    }
  });

  carouselRoot.addEventListener('pointerdown', (event) => {
    touchStartX = event.clientX;
  });

  carouselRoot.addEventListener('pointerup', (event) => {
    if (touchStartX === null) {
      return;
    }

    const deltaX = event.clientX - touchStartX;
    touchStartX = null;

    if (Math.abs(deltaX) < 40) {
      return;
    }

    if (deltaX > 0) {
      activeSlideIndex = (activeSlideIndex - 1 + slides.length) % slides.length;
    } else {
      activeSlideIndex = (activeSlideIndex + 1) % slides.length;
    }

    renderCarousel();
  });

  carouselRoot.refreshCarousel = renderCarousel;
  renderCarousel();
}

initializeCarousel({
  carouselId: 'feedersCarousel',
  slideSelector: '[data-carousel-slide="feeders"]',
  prevButtonId: 'feedersPrev',
  nextButtonId: 'feedersNext',
  statusId: 'feedersStatus',
});

initializeCarousel({
  carouselId: 'mapsCarousel',
  slideSelector: '[data-carousel-slide="maps"]',
  prevButtonId: 'mapsPrev',
  nextButtonId: 'mapsNext',
  statusId: 'mapsStatus',
  preloadAllMediaOnOpen: true,
});
