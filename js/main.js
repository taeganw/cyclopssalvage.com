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

// Map exact eBay category names → { label, key }
// Keys are used for filter buttons; labels are shown in the UI
const CATEGORY_EXACT = {
  // HVAC
  'A/C Compressors & Clutches':           { label: 'HVAC',                  key: 'hvac'        },
  'A/C Condensers':                        { label: 'HVAC',                  key: 'hvac'        },
  'A/C Evaporators':                       { label: 'HVAC',                  key: 'hvac'        },
  'A/C Hoses & Fittings':                  { label: 'HVAC',                  key: 'hvac'        },
  'A/C Receiver Dryers & Accumulators':    { label: 'HVAC',                  key: 'hvac'        },
  'Heater Cores':                          { label: 'HVAC',                  key: 'hvac'        },
  'HVAC Blower Modules & Resistors':       { label: 'HVAC',                  key: 'hvac'        },
  'HVAC Blower Motors & Wheels':           { label: 'HVAC',                  key: 'hvac'        },
  'HVAC Control Unit Parts':               { label: 'HVAC',                  key: 'hvac'        },
  'HVAC Controls & Control Units':         { label: 'HVAC',                  key: 'hvac'        },
  'HVAC Vent Actuators':                   { label: 'HVAC',                  key: 'hvac'        },
  'Other Air Conditioning & Heating':      { label: 'HVAC',                  key: 'hvac'        },
  // Engine
  'Additional Fuel Injection Parts':       { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Air Filter Housings':                   { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Air Intake & Fuel Sensors':             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Camshafts':                             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Connecting Rods & Parts':               { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Crankshafts':                           { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Cylinder Heads':                        { label: 'Engine & Drivetrain',   key: 'engine'      },
  'EGR Parts & Valves':                    { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Engine Blocks':                         { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Engine Mounts':                         { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Engine Oil Coolers & Lines':            { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Engine Sensors & Switches':             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Expansion & Overflow Tanks':            { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Fan & Shroud Assemblies':               { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Fuel Filters':                          { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Fuel Injectors':                        { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Fuel Pumps & Sending Units':            { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Fuel Tanks & Filler Necks':             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Gaskets & Seals':                       { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Hoses, Lines & Pipes':                  { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Ignition Coils':                        { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Ignition Wires & Coil Boots':           { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Intake Manifolds':                      { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Manifolds & Headers':                   { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Oil Drain Plugs, Filler Caps & Dipsticks': { label: 'Engine & Drivetrain', key: 'engine'    },
  'Oil Filters':                           { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Oil Pans':                              { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Oil Pumps & Parts':                     { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Other Air & Fuel Delivery':             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Other Engine Parts':                    { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Oxygen Sensors':                        { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Pistons & Rings':                       { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Power Steering Pump Parts':             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Power Steering Pumps':                  { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Radiators':                             { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Rocker & Valve Covers':                 { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Secondary Air & Smog Pumps':            { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Thermostats & Housings':               { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Throttle Bodies':                       { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Timing Chains':                         { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Timing Covers':                         { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Turbos & Parts':                        { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Vacuum Pumps':                          { label: 'Engine & Drivetrain',   key: 'engine'      },
  // Transmission & Drivetrain
  'Additional Clutch Parts':              { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Additional Differential Parts':        { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Automatic Transmission':               { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Automatic Transmission Parts':         { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Axle Housings & Parts':                { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Axles':                                { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Clutch Kits':                          { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Differential Assemblies':              { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Driveshafts':                          { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Flywheels & Flexplates':               { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Gearboxes, Rack & Pinions':            { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Manual Transmission':                  { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Other Transmission & Drivetrain':      { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Shifters, Cables & Linkages':          { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Torque Converters':                    { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Transfer Case Parts':                  { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Transmission & Drivetrain Mounts':     { label: 'Engine & Drivetrain',   key: 'engine'      },
  // Suspension & Steering
  'Camber & Caster Parts':               { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Control Arms, Ball Joints & Assemblies': { label: 'Suspension & Brakes', key: 'suspension' },
  'Leaf & Coil Springs':                  { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Other Steering & Suspension Parts':    { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Power Steering Hoses':                 { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Radius, Swing & Trailing Arms':        { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Shock & Strut Mounts':                 { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Shocks, Struts & Assemblies':          { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Steering Wheels & Horn Buttons':       { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Sway Bars, Links & Bushings':          { label: 'Suspension & Brakes',   key: 'suspension'  },
  // Brakes
  'ABS & Stability Hydraulic Units':      { label: 'Suspension & Brakes',   key: 'suspension'  },
  'ABS Speed Sensors':                    { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Additional ABS Parts':                 { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Brake Boosters':                       { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Brake Cables':                         { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Brake Component Kits':                 { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Brake Hoses, Lines & Fittings':        { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Brake Shoes':                          { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Calipers & Brackets':                  { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Master Cylinders':                     { label: 'Suspension & Brakes',   key: 'suspension'  },
  'Other Brake Parts':                    { label: 'Suspension & Brakes',   key: 'suspension'  },
  // Electrical
  'Alternators & Generators':             { label: 'Electrical',            key: 'electrical'  },
  'Amplifiers':                           { label: 'Electrical',            key: 'electrical'  },
  'Anti-Theft Car Alarms':                { label: 'Electrical',            key: 'electrical'  },
  'Antennas':                             { label: 'Electrical',            key: 'electrical'  },
  'Battery Accessories':                  { label: 'Electrical',            key: 'electrical'  },
  'Car Stereos & Head Units':             { label: 'Electrical',            key: 'electrical'  },
  'Cruise Control Components':            { label: 'Electrical',            key: 'electrical'  },
  'ECUs & Computer Modules':              { label: 'Electrical',            key: 'electrical'  },
  'Fuses & Fuse Boxes':                   { label: 'Electrical',            key: 'electrical'  },
  'Instrument Clusters':                  { label: 'Electrical',            key: 'electrical'  },
  'Light Bulbs & LEDs':                   { label: 'Electrical',            key: 'electrical'  },
  'Other Electric, Hybrid & PHEV Specific Parts': { label: 'Electrical',   key: 'electrical'  },
  'Other Starters, Alternators, ECUs & Wiring':   { label: 'Electrical',   key: 'electrical'  },
  'Starter Motors':                       { label: 'Electrical',            key: 'electrical'  },
  'Subwoofers':                           { label: 'Electrical',            key: 'electrical'  },
  'Switches & Controls':                  { label: 'Electrical',            key: 'electrical'  },
  'Tire Pressure Monitoring Sensor':      { label: 'Electrical',            key: 'electrical'  },
  'Wiring Harnesses, Cables & Connectors':{ label: 'Electrical',            key: 'electrical'  },
  'Wiring, Harnesses & Connectors':       { label: 'Electrical',            key: 'electrical'  },
  // Exterior
  'Additional Glass & Window Parts':      { label: 'BMW Exterior',          key: 'exterior'    },
  'Auto Glass':                           { label: 'BMW Exterior',          key: 'exterior'    },
  'Body Moldings & Trims':                { label: 'BMW Exterior',          key: 'exterior'    },
  'Bumper Inserts & Covers':              { label: 'BMW Exterior',          key: 'exterior'    },
  'Bumpers & Reinforcements':             { label: 'BMW Exterior',          key: 'exterior'    },
  'Convertible Tops & Parts':             { label: 'BMW Exterior',          key: 'exterior'    },
  'Dash Panels':                          { label: 'BMW Exterior',          key: 'exterior'    },
  'Door Handles':                         { label: 'BMW Exterior',          key: 'exterior'    },
  'Door Seals':                           { label: 'BMW Exterior',          key: 'exterior'    },
  'Doors & Door Skins':                   { label: 'BMW Exterior',          key: 'exterior'    },
  'Emblems & Ornaments':                  { label: 'BMW Exterior',          key: 'exterior'    },
  'Exterior Locks & Lock Hardware':       { label: 'BMW Exterior',          key: 'exterior'    },
  'Fenders':                              { label: 'BMW Exterior',          key: 'exterior'    },
  'Fog Light Assemblies':                 { label: 'BMW Exterior',          key: 'exterior'    },
  'Frame Rails & Subframes':              { label: 'BMW Exterior',          key: 'exterior'    },
  'Grilles':                              { label: 'BMW Exterior',          key: 'exterior'    },
  'Hatches & Trunk Lids':                 { label: 'BMW Exterior',          key: 'exterior'    },
  'Headlight Assemblies':                 { label: 'BMW Exterior',          key: 'exterior'    },
  'Heat Shields, Wraps & Sleeves':        { label: 'BMW Exterior',          key: 'exterior'    },
  'Hinges, Latches & Additional Hood Components': { label: 'BMW Exterior',  key: 'exterior'    },
  'Hood Panels':                          { label: 'BMW Exterior',          key: 'exterior'    },
  'Lift Supports & Prop Rods':            { label: 'BMW Exterior',          key: 'exterior'    },
  'Liftgates':                            { label: 'BMW Exterior',          key: 'exterior'    },
  'Mirror Assemblies':                    { label: 'BMW Exterior',          key: 'exterior'    },
  'Other Exterior Parts & Accessories':   { label: 'BMW Exterior',          key: 'exterior'    },
  'Rear View Mirrors':                    { label: 'BMW Exterior',          key: 'exterior'    },
  'Side Marker Light Assemblies':         { label: 'BMW Exterior',          key: 'exterior'    },
  'Splash Guards & Mud Flaps':            { label: 'BMW Exterior',          key: 'exterior'    },
  'Sunroofs & Parts':                     { label: 'BMW Exterior',          key: 'exterior'    },
  'Tail Light Assemblies':                { label: 'BMW Exterior',          key: 'exterior'    },
  'Trim':                                 { label: 'BMW Exterior',          key: 'exterior'    },
  'Turn Signal Light Assemblies':         { label: 'BMW Exterior',          key: 'exterior'    },
  'Window Cranks, Grab Handles & Door Pulls': { label: 'BMW Exterior',      key: 'exterior'    },
  'Window Motors & Regulators':           { label: 'BMW Exterior',          key: 'exterior'    },
  'Window Seals, Gaskets & Trims':        { label: 'BMW Exterior',          key: 'exterior'    },
  'Wiper Arms':                           { label: 'BMW Exterior',          key: 'exterior'    },
  'Wiper Linkages, Transmissions & Motors': { label: 'BMW Exterior',        key: 'exterior'    },
  // Interior
  'Additional Seat Parts':                { label: 'BMW Interior',          key: 'interior'    },
  'Center & Overhead Console Parts':      { label: 'BMW Interior',          key: 'interior'    },
  'Center & Overhead Consoles':           { label: 'BMW Interior',          key: 'interior'    },
  'Center & Third Brake Light Assemblies':{ label: 'BMW Interior',          key: 'interior'    },
  'Cup Holders':                          { label: 'BMW Interior',          key: 'interior'    },
  'Door Panels':                          { label: 'BMW Interior',          key: 'interior'    },
  'Floor Mats, Carpets & Cargo Liners':   { label: 'BMW Interior',          key: 'interior'    },
  'Handbrake & Shift Boots':              { label: 'BMW Interior',          key: 'interior'    },
  'Headrests':                            { label: 'BMW Interior',          key: 'interior'    },
  'Interior Light Assemblies':            { label: 'BMW Interior',          key: 'interior'    },
  'Other Interior Parts & Accessories':   { label: 'BMW Interior',          key: 'interior'    },
  'Pedal Assemblies, Pads & Parts':       { label: 'BMW Interior',          key: 'interior'    },
  'Seat Belts & Parts':                   { label: 'BMW Interior',          key: 'interior'    },
  'Seats':                                { label: 'BMW Interior',          key: 'interior'    },
  'Shift Knobs':                          { label: 'BMW Interior',          key: 'interior'    },
  'Sun & Privacy Shades':                 { label: 'BMW Interior',          key: 'interior'    },
  'Sun Visors':                           { label: 'BMW Interior',          key: 'interior'    },
  // Wheels
  'Other Wheel & Tire Parts':             { label: 'Wheels & Tires',        key: 'wheels'      },
  'Wheel Bearings, Hubs & Seals':         { label: 'Wheels & Tires',        key: 'wheels'      },
  'Wheel Center Caps':                    { label: 'Wheels & Tires',        key: 'wheels'      },
  'Wheel Nuts, Bolts & Studs':            { label: 'Wheels & Tires',        key: 'wheels'      },
  'Wheels':                               { label: 'Wheels & Tires',        key: 'wheels'      },
  // Exhaust
  'Clamps, Flanges, Hangers & Hardware':  { label: 'Exhaust',               key: 'exhaust'     },
  'Coolant Hoses':                        { label: 'Exhaust',               key: 'exhaust'     },
  'Exhaust Pipes & Tips':                 { label: 'Exhaust',               key: 'exhaust'     },
  'Mufflers & Resonators':                { label: 'Exhaust',               key: 'exhaust'     },
  'Other Exhaust & Emission Parts':       { label: 'Exhaust',               key: 'exhaust'     },
  'Sprockets':                            { label: 'Exhaust',               key: 'exhaust'     },
  // Misc automotive
  'Additional Parts':                     { label: 'Other Auto',            key: 'autoother'   },
  'Other':                                { label: 'Other',                 key: 'other'       },
  'Other Car & Truck Parts & Accessories':{ label: 'Other Auto',            key: 'autoother'   },
  'Owner & Operator Manuals':             { label: 'Other Auto',            key: 'autoother'   },
  'Pulleys':                              { label: 'Engine & Drivetrain',   key: 'engine'      },
  'Tensioners & Pulleys':                 { label: 'Engine & Drivetrain',   key: 'engine'      },
  // Collectibles / Merchandise
  'Decks':                                { label: 'Collectibles',          key: 'collectibles'},
  'Other Rock & Pop Artists F':           { label: 'Collectibles',          key: 'collectibles'},
  'T-Shirts':                             { label: 'Clothing',              key: 'clothing'    },
  'Trading Card Singles':                 { label: 'Collectibles',          key: 'collectibles'},
};

// Fallback fragment matching for any categories not in the exact map
const CATEGORY_FALLBACK = [
  { fragment: 'dixon',        label: 'Dixon Flannels',  key: 'flannels'    },
  { fragment: 'flannel',      label: 'Dixon Flannels',  key: 'flannels'    },
  { fragment: 'button-down',  label: 'Dixon Flannels',  key: 'flannels'    },
  { fragment: 'shirt',        label: 'Clothing',        key: 'clothing'    },
  { fragment: 'men',          label: 'Clothing',        key: 'clothing'    },
  { fragment: 'women',        label: 'Clothing',        key: 'clothing'    },
  { fragment: 'rock',         label: 'Collectibles',    key: 'collectibles'},
  { fragment: 'memorabilia',  label: 'Collectibles',    key: 'collectibles'},
  { fragment: 'collectible',  label: 'Collectibles',    key: 'collectibles'},
  { fragment: 'sporting',     label: 'Sporting Goods',  key: 'sporting'    },
  { fragment: 'interior',     label: 'BMW Interior',    key: 'interior'    },
  { fragment: 'exterior',     label: 'BMW Exterior',    key: 'exterior'    },
  { fragment: 'engine',       label: 'Engine & Drivetrain', key: 'engine'  },
  { fragment: 'brake',        label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'suspension',   label: 'Suspension & Brakes', key: 'suspension' },
  { fragment: 'hvac',         label: 'HVAC',            key: 'hvac'        },
  { fragment: 'electrical',   label: 'Electrical',      key: 'electrical'  },
];

function categoryMatch(raw) {
  if (!raw) return null;
  const exact = CATEGORY_EXACT[raw];
  if (exact) return exact;
  const lower = raw.toLowerCase();
  const fallback = CATEGORY_FALLBACK.find(m => lower.includes(m.fragment));
  return fallback || null;
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

  // Build a map of key -> { label, count } derived from actual data
  const groups = {};
  listings.forEach(item => {
    const key   = categoryKey(item.category);
    const label = categoryLabel(item.category);
    if (!groups[key]) groups[key] = { label, count: 0 };
    groups[key].count++;
  });

  filterBar.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className       = 'filter-btn filter-btn--active';
  allBtn.dataset.filter  = 'all';
  allBtn.textContent     = 'All';
  filterBar.appendChild(allBtn);

  // Priority order for known groups, then sort remainder alphabetically
  const priority = ['flannels', 'clothing', 'collectibles', 'interior', 'exterior', 'engine', 'suspension', 'hvac', 'electrical', 'wheels', 'exhaust', 'sporting', 'autoother'];
  const keys     = Object.keys(groups);
  const ordered  = [
    ...priority.filter(k => keys.includes(k)),
    ...keys.filter(k => !priority.includes(k) && k !== 'other').sort(),
    ...(keys.includes('other') ? ['other'] : []),
  ];

  ordered.forEach(key => {
    const { label, count } = groups[key];
    const btn = document.createElement('button');
    btn.className      = 'filter-btn';
    btn.dataset.filter = key;
    btn.textContent    = label;
    btn.title          = `${count} listing${count !== 1 ? 's' : ''}`;
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

  if (updatedEl && data.updated_at) {
    const d = new Date(data.updated_at);
    updatedEl.textContent = `Updated ${d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
  }

  buildFilterBar(allListings);

  let activeFilter = 'all';
  let searchQuery  = '';
  let visibleCount = PAGE_SIZE;

  function getFiltered() {
    return allListings.filter(item => {
      const matchCat    = activeFilter === 'all' || categoryKey(item.category) === activeFilter;
      const matchSearch = !searchQuery  || item.title.toLowerCase().includes(searchQuery);
      return matchCat && matchSearch;
    });
  }

  function renderPage() {
    grid.innerHTML = '';
    const filtered = getFiltered();

    if (countEl) {
      const label = filtered.length === allListings.length
        ? `${allListings.length} listings`
        : `${filtered.length} of ${allListings.length} listings`;
      countEl.textContent = label;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `<p class="listings-empty">No listings match your search.</p>`;
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

  const searchInput = document.getElementById('listingsSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery  = searchInput.value.trim().toLowerCase();
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
