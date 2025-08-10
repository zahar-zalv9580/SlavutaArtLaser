const VARIANTS = {
  white: {
    label: 'Білий',
    price: 120,
    color: '#f6efe6', // світлий відтінок дерева / білий
    images: [
      'product6-1a.jpg',
      'product6-2a.jpg'
    ]
  },
  dark: {
    label: 'Натуральний',
    price: 150,
    color: '#b28050', // дерев'яний коричневий
    images: [
      'product6-1b.jpg',
      'product6-2b.jpg'
    ]
  }
};

// --- Змінні DOM ---
const slidesContainer = document.querySelector('.product-slider .slides');
const thumbsContainer = document.querySelector('.product-slider .thumbnails');
const prevBtn = document.querySelector('.product-slider .prev');
const nextBtn = document.querySelector('.product-slider .next');

const priceEl = document.getElementById('product-price');
const variantsContainer = document.getElementById('variants');
const buyBtn = document.getElementById('buy-btn');
const titleEl = document.getElementById('product-title');

if (!variantsContainer) console.warn('product6.js: #variants не знайдено (swatches)');

// Стан
let currentSlide = 0;
let currentVariantKey = null;
let slideImgs = [];
let thumbImgs = [];

const LS_VARIANT_KEY = 'lastVariant_product6';
function loadSavedVariant() { return localStorage.getItem(LS_VARIANT_KEY); }
function saveVariant(key) { try { localStorage.setItem(LS_VARIANT_KEY, key); } catch (e) {} }

// Рендер свотчів (з кольором)
function renderVariantSwatches() {
  if (!variantsContainer) return;
  variantsContainer.innerHTML = '';
  Object.keys(VARIANTS).forEach((key) => {
    const v = VARIANTS[key];
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'variant-swatch';
    sw.dataset.variant = key;
    sw.title = v.label;
    sw.setAttribute('aria-label', `${v.label}`);
    sw.setAttribute('aria-pressed', 'false');
    sw.tabIndex = 0;

    // фон колірного кружка або текст fallback
    if (v.color) {
      sw.style.background = v.color;
    } else {
      // fallback: покажемо першу букву
      const span = document.createElement('span');
      span.className = 'sw-label';
      span.textContent = v.label[0] || '?';
      sw.appendChild(span);
      sw.style.background = '#f3f3f3';
    }

    // клік/клавіша
    sw.addEventListener('click', () => selectVariant(key));
    sw.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectVariant(key);
      }
    });

    variantsContainer.appendChild(sw);
  });
}

// Слайдер генерація
function buildSliderForVariant(key) {
  const variant = VARIANTS[key];
  if (!variant || !slidesContainer || !thumbsContainer) return;

  slidesContainer.innerHTML = '';
  thumbsContainer.innerHTML = '';
  slideImgs = [];
  thumbImgs = [];
  currentSlide = 0;

  variant.images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = (titleEl ? titleEl.textContent : 'Товар') + ' — ' + (variant.label || '');
    if (i === 0) img.classList.add('active');
    slidesContainer.appendChild(img);
    slideImgs.push(img);

    const t = document.createElement('img');
    t.src = src;
    t.alt = 'thumbnail ' + (i+1);
    if (i === 0) t.classList.add('active');
    t.addEventListener('click', () => showSlide(i));
    thumbsContainer.appendChild(t);
    thumbImgs.push(t);
  });

  if (prevBtn) prevBtn.onclick = () => showPrevSlide();
  if (nextBtn) nextBtn.onclick = () => showNextSlide();
}

function showSlide(index) {
  if (!slideImgs.length) return;
  slideImgs[currentSlide].classList.remove('active');
  thumbImgs[currentSlide].classList.remove('active');
  currentSlide = (index + slideImgs.length) % slideImgs.length;
  slideImgs[currentSlide].classList.add('active');
  thumbImgs[currentSlide].classList.add('active');
}
function showNextSlide() { showSlide(currentSlide + 1); }
function showPrevSlide() { showSlide(currentSlide - 1); }

function selectVariant(key) {
  if (!VARIANTS[key]) return;
  currentVariantKey = key;

  if (priceEl) priceEl.textContent = VARIANTS[key].price + ' грн';

  // оновити активність та aria-pressed
  document.querySelectorAll('.variant-swatch').forEach(el => {
    const active = (el.dataset.variant === key);
    el.classList.toggle('active', active);
    el.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  buildSliderForVariant(key);

  if (buyBtn) {
    buyBtn.dataset.variant = key;
    buyBtn.dataset.price = VARIANTS[key].price;
  }

  saveVariant(key);
}

function initProductPage() {
  renderVariantSwatches();
  const saved = loadSavedVariant();
  const defaultKey = saved && VARIANTS[saved] ? saved : Object.keys(VARIANTS)[0];
  selectVariant(defaultKey);
}
initProductPage();

// Додавання в корзину (з варіантом)
if (buyBtn) {
  buyBtn.addEventListener('click', () => {
    const productName = titleEl ? titleEl.textContent.trim() : 'Товар';
    const variantKey = buyBtn.dataset.variant || currentVariantKey;
    const variantLabel = VARIANTS[variantKey] ? VARIANTS[variantKey].label : '';
    const price = Number(buyBtn.dataset.price || (VARIANTS[variantKey] ? VARIANTS[variantKey].price : 0));
    const img = VARIANTS[variantKey] && VARIANTS[variantKey].images[0] ? VARIANTS[variantKey].images[0] : '';

    const item = {
      name: productName,
      variant: variantKey,
      variantLabel: variantLabel,
      price: price,
      img: img,
      qty: 1
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const exist = cart.find(ci => ci.name === item.name && ci.variant === item.variant);
    if (exist) exist.qty = (exist.qty || 1) + 1;
    else cart.push(item);

    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'shopcart.html';
  });
}