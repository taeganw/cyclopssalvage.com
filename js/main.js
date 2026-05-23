/* ============================================================
   CYCLOPS SALVAGE — main.js
   ============================================================ */

/* ── Mobile nav toggle ───────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });
}

/* ── Nav background on scroll ───────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(17,17,17,0.98)'
      : 'rgba(17,17,17,0.96)';
  }, { passive: true });
}

/* ── Scroll reveal ───────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

/* ── Counter animation ───────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;
  const duration = 1600;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ── Smooth scroll for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Active nav link on scroll ───────────────────────────── */
const sections    = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav__link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinksAll.forEach(link => {
        link.classList.toggle(
          'nav__link--active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

/* ── Card tilt on hover ──────────────────────────────────── */
function attachTilt(card) {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translate(-2px,-2px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease, box-shadow 0.2s';
    setTimeout(() => { card.style.transition = ''; }, 400);
  });
}
document.querySelectorAll('.category-card').forEach(attachTilt);

/* ── eBay Listings ───────────────────────────────────────── */

const FALLBACK_IMG = 'images/mascot-color.webp';

// Map raw eBay category fragments → display labels + filter keys
// Order matters — first match wins, so more specific entries go first
const CATEGORY_MAP = [
  // Clothing
  { fragment: 'dixon',          label: 'Dixon Flannels',  key: 'flannels'  },
  { fragment: 'flannel',        label: 'Dixon Flannels',  key: 'flannels'  },
  { fragment: 'button-down',    label: 'Dixon Flannels',  key: 'flannels'  },
  { fragment: 'shirt',          label: 'Clothing',        key: 'clothing'  },
  { fragment: 'tops',           label: 'Clothing',        key: 'clothing'  },
  { fragment: 'men',            label: 'Clothing',        key: 'clothing'  },
  { fragment: 'women',          label: 'Clothing',        key: 'clothing'  },
  // BMW Interior
  { fragment: 'seat belt',      label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'seat',           label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'door panel',     label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'door handle',    label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'trim',           label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'console',        label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'headrest',       label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'glove box',      label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'floor mat',      label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'carpet',         label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'interior light', label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'steering wheel', label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'switch',         label: 'BMW Interior',    key: 'interior'  },
  { fragment: 'interior',       label: 'BMW Interior',    key: 'interior'  },
  // BMW Exterior
  { fragment: 'body molding',   label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'bumper',         label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'convertible top',label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'sunroof',        label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'mirror',         label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'tail light',     label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'auto glass',     label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'window seal',    label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'window motor',   label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'glass',          label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'hatch',          label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'trunk',          label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'lock',           label: 'BMW Exterior',    key: 'exterior'  },
  { fragment: 'exterior',       label: 'BMW Exterior',    key: 'exterior'  },
  // BMW Engine & Drivetrain
  { fragment: 'engine',         label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'crankshaft',     label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'transmission',   label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'differential',   label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'driveshaft',     label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'fuel',           label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'coolant',        label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'air intake',     label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'wiring',         label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'ecu',            label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'pulley',         label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'heat shield',    label: 'Engine & Drivetrain', key: 'engine' },
  { fragment: 'oil',            label: 'Engine & Drivetrain', key: 'engine' },
  // BMW Suspension & Brakes
  { fragment: 'steering',       label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'suspension',     label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'control arm',    label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'spring',         label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'brake',          label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'abs',            label: 'Suspension & Brakes', key: 'suspension' },
  // BMW HVAC
  { fragment: 'air conditioning', label: 'HVAC',           key: 'hvac'      },
  { fragment: 'hvac',           label: 'HVAC',             key: 'hvac'      },
  { fragment: 'blower',         label: 'HVAC',             key: 'hvac'      },
  { fragment: 'a/c',            label: 'HVAC',             key: 'hvac'      },
  // Memorabilia
  { fragment: 'rock',           label: 'Memorabilia',      key: 'memorabilia' },
  { fragment: 'pop artist',     label: 'Memorabilia',      key: 'memorabilia' },
  { fragment: 'memorabilia',    label: 'Memorabilia',      key: 'memorabilia' },
  { fragment: 'collectible',    label: 'Memorabilia',      key: 'memorabilia' },
  { fragment: 'entertainment',  label: 'Memorabilia',      key: 'memorabilia' },
  // Sporting
  { fragment: 'sporting',       label: 'Sporting Goods',   key: 'sporting'  },
];

function categoryMatch(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return CATEGORY_MAP.find(m => lower.includes(m.fragment)) || null;
}

function categoryKey(raw) {
  return categoryMatch(raw)?.key || 'other';
}

function categoryLabel(raw) {
  return categoryMatch(raw)?.label || raw || 'Other';
}

function bigImg(url) {
  if (!url) return '';
  return url.replace(/s-l\d+(\.\w+)$/, 's-l500$1');
}

function formatPrice(value, currency) {
  const num = parseFloat(value);
  if (isNaN(num)) return 'See listing';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(num);
}

function buildListingCard(item) {
  const card = document.createElement('a');
  card.className = 'listing-card';
  card.href      = item.url;
  card.target    = '_blank';
  card.rel       = 'noopener';
  card.dataset.category = categoryKey(item.category);

  const isAuction = item.buying_options && item.buying_options.includes('AUCTION');

  card.innerHTML = `
    <div class="listing-card__texture"></div>
    <div class="listing-card__img-wrap">
      <img
        src="${bigImg(item.image) || FALLBACK_IMG}"
        alt="${item.title}"
        class="listing-card__img"
        loading="lazy"
        onerror="this.src='${FALLBACK_IMG}';this.onerror=null"
      />
      ${isAuction ? '<span class="listing-card__badge listing-card__badge--auction">Auction</span>' : '<span class="listing-card__badge">Buy Now</span>'}
    </div>
    <div class="listing-card__body">
      <span class="listing-card__cat">${categoryLabel(item.category)}</span>
      <h3 class="listing-card__title">${item.title}</h3>
      <div class="listing-card__footer">
        <span class="listing-card__price">${formatPrice(item.price, item.currency)}</span>
        <span class="listing-card__cta">View →</span>
      </div>
    </div>
  `;

  attachTilt(card);
  return card;
}

function buildFilterBar(listings) {
  const filterBar = document.getElementById('listingsFilter');
  if (!filterBar) return;

  // Collect unique category keys present in the data
  const seen = new Set();
  listings.forEach(item => seen.add(categoryKey(item.category)));

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn filter-btn--active';
  allBtn.dataset.filter = 'all';
  allBtn.textContent = 'All';
  filterBar.appendChild(allBtn);

  // Order: flannels first, then BMW, then rest alphabetically
  const priority = ['flannels', 'bmw', 'motors'];
  const ordered  = [
    ...priority.filter(k => seen.has(k)),
    ...[...seen].filter(k => !priority.includes(k)).sort(),
  ];

  ordered.forEach(key => {
    const label = [...Object.values(CATEGORY_MAP)].find(m => m.key === key)?.label || key;
    const btn = document.createElement('button');
    btn.className    = 'filter-btn';
    btn.dataset.filter = key;
    btn.textContent  = label;
    filterBar.appendChild(btn);
  });

  // filter clicks handled by renderListings
}

const PAGE_SIZE = 48;

function appendCards(items) {
  const grid = document.getElementById('listingsGrid');
  items.forEach(item => {
    const card = buildListingCard(item);
    card.classList.add('reveal');
    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

function renderListings(data) {
  const grid      = document.getElementById('listingsGrid');
  const countEl   = document.getElementById('listingsCount');
  const updatedEl = document.getElementById('listingsUpdated');

  if (!grid) return;

  const allListings = data.listings || [];

  if (countEl) {
    countEl.textContent = `${allListings.length} listing${allListings.length !== 1 ? 's' : ''}`;
  }

  if (updatedEl && data.updated_at) {
    const d = new Date(data.updated_at);
    updatedEl.textContent = `Updated ${d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
  }

  buildFilterBar(allListings);

  let activeFilter  = 'all';
  let visibleCount  = PAGE_SIZE;

  function getFiltered() {
    return activeFilter === 'all'
      ? allListings
      : allListings.filter(item => categoryKey(item.category) === activeFilter);
  }

  function renderPage() {
    grid.innerHTML = '';
    const filtered = getFiltered();

    if (filtered.length === 0) {
      grid.innerHTML = `<p class="listings-empty">No listings found. Check back soon.</p>`;
      return;
    }

    appendCards(filtered.slice(0, visibleCount));

    // Load More button
    if (visibleCount < filtered.length) {
      const remaining = filtered.length - visibleCount;
      const btn = document.createElement('button');
      btn.className   = 'load-more-btn';
      btn.textContent = `Load More (${remaining} remaining)`;
      btn.addEventListener('click', () => {
        visibleCount += PAGE_SIZE;
        renderPage();
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      const wrap = document.createElement('div');
      wrap.className = 'load-more-wrap';
      wrap.appendChild(btn);
      grid.appendChild(wrap);
    }
  }

  // Wire filter bar clicks into our renderer
  const filterBar = document.getElementById('listingsFilter');
  if (filterBar) {
    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      activeFilter = btn.dataset.filter;
      visibleCount = PAGE_SIZE;
      renderPage();
    });
  }

  renderPage();
}

function renderListingsError() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;
  grid.innerHTML = `
    <div class="listings-error">
      <p>Couldn't load listings right now.</p>
      <a href="https://www.ebay.com/str/cyclopssalvage" target="_blank" rel="noopener" class="btn btn--primary">
        Browse on eBay
      </a>
    </div>
  `;
}

async function loadListings() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;

  grid.innerHTML = `<div class="listings-loading"><span></span><span></span><span></span></div>`;

  try {
    const res = await fetch('listings.json?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderListings(data);
  } catch (err) {
    console.warn('listings.json fetch failed:', err);
    renderListingsError();
  }
}

loadListings();
