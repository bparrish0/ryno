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

const galleryPhotos = [
  'Ryno Photos/image0.jpeg','Ryno Photos/image1.jpeg','Ryno Photos/image2.jpeg',
  'Ryno Photos/image3.jpeg','Ryno Photos/image4.jpeg','Ryno Photos/image5.jpeg',
  'Ryno Photos/image7.jpeg','Ryno Photos/image8.jpeg','Ryno Photos/image9.jpeg',
  'Ryno Photos/image10.jpeg','Ryno Photos/image11.jpeg','Ryno Photos/image12.jpeg',
  'Ryno Photos/image13.jpeg','Ryno Photos/image14.jpeg','Ryno Photos/image16.jpeg',
  'Ryno Photos/image17.jpeg','Ryno Photos/image18.jpeg','Ryno Photos/image19.jpeg',
  'Ryno Photos/image20.jpeg','Ryno Photos/image22.jpeg','Ryno Photos/image23.jpeg',
  'Ryno Photos/image24.jpeg','Ryno Photos/image25.jpeg','Ryno Photos/image27.jpeg',
  'Ryno Photos/image28.jpeg','Ryno Photos/image29.jpeg','Ryno Photos/image30.jpeg',
  'Ryno Photos/image31.jpeg'
];

const cells = document.querySelectorAll('.gallery-cell');
if (cells.length) {
  const counters = Array.from({ length: cells.length }, (_, i) => i);

  const swapCell = (cellIndex) => {
    const cell = cells[cellIndex];
    const currentImg = cell.querySelector('img:last-child');
    counters[cellIndex] = (counters[cellIndex] + cells.length) % galleryPhotos.length;
    const nextImg = document.createElement('img');
    nextImg.src = galleryPhotos[counters[cellIndex]];
    nextImg.alt = 'RYNO dumpster';
    nextImg.className = 'absolute inset-0 h-full w-full object-cover';
    nextImg.style.cssText = 'opacity:0; transform:scale(1.04); transition: opacity 3s ease, transform 3s ease;';
    cell.appendChild(nextImg);
    // double-rAF ensures browser paints the initial state before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextImg.style.opacity = '1';
        nextImg.style.transform = 'scale(1)';
        currentImg.style.transition = 'opacity 3s ease';
        currentImg.style.opacity = '0';
      });
    });
    setTimeout(() => currentImg.remove(), 3200);
  };

  const scheduleNext = (cellIndex) => {
    const delay = 6000 + Math.random() * 4000;
    setTimeout(() => {
      swapCell(cellIndex);
      scheduleNext(cellIndex);
    }, delay);
  };

  cells.forEach((cell, i) => {
    const initialDelay = 4000 + Math.random() * 6000;
    setTimeout(() => {
      swapCell(i);
      scheduleNext(i);
    }, initialDelay);
  });
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
  const emailHref = `mailto:ryan@tippettsolutions.com?subject=${subject}&body=${body}`;

  feedback.textContent = 'Opening your email app with your quote request...';
  feedback.className = 'min-h-6 text-sm text-emerald-400';

  setTimeout(() => {
    window.location.href = emailHref;
  }, 380);
});
