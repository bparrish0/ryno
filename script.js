const revealItems = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
const yearEl = document.getElementById('year');
const form = document.getElementById('quote-form');
const feedback = document.getElementById('form-feedback');

if (yearEl) yearEl.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const parallaxItems = document.querySelectorAll('[data-speed]');
let rafPending = false;
let latestScroll = window.scrollY;

const runParallax = () => {
  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.speed || 0.1);
    item.style.transform = `translate3d(0, ${latestScroll * speed}px, 0)`;
  });
  rafPending = false;
};

const debouncedScroll = () => {
  latestScroll = window.scrollY;
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(runParallax);
};

window.addEventListener('scroll', debouncedScroll, { passive: true });

const selectRoot = document.querySelector('[data-select]');
if (selectRoot) {
  const trigger = selectRoot.querySelector('.select-trigger');
  const menu = selectRoot.querySelector('.select-menu');
  const options = [...menu.querySelectorAll('[role="option"]')];
  const input = document.getElementById('size');
  let activeIndex = 0;

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) options[activeIndex]?.focus();
  };

  const commitOption = (option) => {
    options.forEach((opt) => opt.setAttribute('aria-selected', 'false'));
    option.setAttribute('aria-selected', 'true');
    trigger.textContent = option.dataset.value;
    input.value = option.dataset.value;
    setOpen(false);
    trigger.focus();
  };

  trigger.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  });

  options.forEach((option, index) => {
    option.addEventListener('click', () => {
      activeIndex = index;
      commitOption(option);
    });

    option.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex = (index + 1) % options.length;
        options[activeIndex].focus();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = (index - 1 + options.length) % options.length;
        options[activeIndex].focus();
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        commitOption(option);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!selectRoot.contains(event.target)) setOpen(false);
  });
}

const galleryScroll = document.getElementById('gallery-scroll');
if (galleryScroll) {
  let scrollSpeed = 1;
  let paused = false;
  let resumeTimer;

  const autoScroll = () => {
    if (!paused) {
      galleryScroll.scrollLeft += scrollSpeed;
      if (galleryScroll.scrollLeft >= galleryScroll.scrollWidth - galleryScroll.clientWidth) {
        galleryScroll.scrollLeft = 0;
      }
    }
    requestAnimationFrame(autoScroll);
  };

  const pauseAndResume = () => {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { paused = false; }, 2000);
  };

  galleryScroll.addEventListener('pointerdown', pauseAndResume);
  galleryScroll.addEventListener('wheel', pauseAndResume, { passive: true });

  requestAnimationFrame(autoScroll);
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) {
    feedback.textContent = 'Please fill out all required fields.';
    feedback.className = 'min-h-6 text-sm text-red-400';
    return;
  }

  const data = new FormData(form);
  const subject = encodeURIComponent(`Quote Request - ${data.get('size') || 'Dumpster Rental'}`);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nSize: ${data.get('size')}\n\nProject Details:\n${data.get('message')}`
  );
  const emailHref = `mailto:info@rynodumpsters.com?subject=${subject}&body=${body}`;

  feedback.textContent = 'Opening your email app with your quote request...';
  feedback.className = 'min-h-6 text-sm text-emerald-400';

  setTimeout(() => {
    window.location.href = emailHref;
  }, 380);
});
