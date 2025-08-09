// Пошук по товарам через параметр ?search=
const searchParams = new URLSearchParams(window.location.search);
const searchQuery = searchParams.get('search');

if (searchQuery) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const title = card.querySelector('h3').innerText.toLowerCase();
    if (!title.includes(searchQuery.toLowerCase())) {
      card.style.display = 'none';
    }
  });
}

// Кошик
const cart = JSON.parse(localStorage.getItem('cart')) || [];

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseInt(btn.dataset.price),
      qty: 1
    };

    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.name} додано в кошик!`);
  });
});

const productsMeta = [
  { name: "Ключниця Family", category: "ключниці", price: 420, img: "product1-1.jpg", id: "1" },
  { name: "Ключниця Haus", category: "ключниці", price: 450, img: "product2-1.jpg", id: "2" },
  { name: "Брелок Україна", category: "брелки", price: 120, img: "product3-1.jpg", id: "3" },
  { name: "Скринька На мрію", category: "інше", price: 500, img: "product4-1.jpg", id: "4" },
  { name: "Підставка на телефон", category: "інше", price: 100, img: "product5-1.jpg", id: "5" },
  { name: "Скринька 'Спеції'", category: "інше", price: 150, img: "product6-1.jpg", id: "6" }
];

/* --------------------
   DOM-елементи
   -------------------- */
const urlParams = new URLSearchParams(window.location.search);
const urlSearch = urlParams.get('search') || '';

const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');
const categoryFilter = document.getElementById('categoryFilter');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');

const productCards = Array.from(document.querySelectorAll('.catalog-grid .product-card'));

/* Безпечний escape для вставки в HTML */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* --------------------
   Побудова метаданих карток (парсимо DOM)
   -------------------- */
function getCardMeta(card) {
  const btn = card.querySelector('.add-to-cart');
  const titleEl = card.querySelector('h3');
  const priceEl = card.querySelector('.price');

  const nameFromDOM = titleEl ? titleEl.innerText.trim() : '';
  const priceFromDOM = priceEl ? parseInt(priceEl.innerText.replace(/\D/g, ''), 10) : null;
  const imgFromDOM = card.querySelector('img') ? card.querySelector('img').getAttribute('src') : '';

  let id = btn ? (btn.dataset.id || null) : null;
  let name = btn ? (btn.dataset.name || nameFromDOM) : nameFromDOM;
  let price = btn && btn.dataset.price ? parseInt(btn.dataset.price, 10) : priceFromDOM;

  // Спробуємо знайти категорію/ціни в productsMeta по назві
  const metaMatch = productsMeta.find(p => {
    if (!p.name) return false;
    return p.name.toLowerCase().replace(/['"«»]/g,'').includes(name.toLowerCase().replace(/['"«»]/g,''));
  });

  const category = metaMatch ? metaMatch.category : (btn ? btn.dataset.category || '' : '');
  if (!price && metaMatch) price = metaMatch.price;
  if (!id && metaMatch) id = metaMatch.id;

  return {
    card,
    id: id || null,
    name: name || '',
    price: (typeof price === 'number' && !isNaN(price)) ? price : 0,
    category: category || '',
    img: imgFromDOM || (metaMatch ? metaMatch.img : '')
  };
}

const cardsMeta = productCards.map(getCardMeta);

/* --------------------
   Фільтрація карток (показ/приховання)
   -------------------- */
function filterProducts() {
  const text = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';
  const category = (categoryFilter && categoryFilter.value) ? categoryFilter.value : '';
  const min = (minPrice && minPrice.value) ? parseInt(minPrice.value, 10) : 0;
  const max = (maxPrice && maxPrice.value) ? parseInt(maxPrice.value, 10) : Infinity;

  cardsMeta.forEach(meta => {
    const matchesText = text === '' ? true : meta.name.toLowerCase().includes(text);
    const matchesCategory = category ? meta.category === category : true;
    const matchesPrice = (meta.price >= min) && (meta.price <= max);

    if (matchesText && matchesCategory && matchesPrice) {
      meta.card.classList.remove('hidden');
    } else {
      meta.card.classList.add('hidden');
    }
  });
}

/* --------------------
   Автопідказки
   -------------------- */
function updateSuggestions() {
  if (!suggestionsBox || !searchInput) return;
  const q = (searchInput.value || '').toLowerCase().trim();
  if (!q) {
    suggestionsBox.classList.remove('show');
    suggestionsBox.innerHTML = '';
    return;
  }

  const matches = productsMeta
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 6);

  if (matches.length === 0) {
    suggestionsBox.classList.remove('show');
    suggestionsBox.innerHTML = '';
    return;
  }

  suggestionsBox.innerHTML = matches
    .map(m => `<div data-name="${escapeHtml(m.name)}">${escapeHtml(m.name)} <span style="color:#888;font-size:12px"> — ${m.price}₴</span></div>`)
    .join('');
  suggestionsBox.classList.add('show');
}

/* --------------------
   Дія при кліку по підказці
   -------------------- */
if (suggestionsBox) {
  suggestionsBox.addEventListener('click', (e) => {
    const target = e.target.closest('div[data-name]');
    if (!target) return;
    const txt = target.dataset.name || target.innerText;
    if (searchInput) searchInput.value = txt;
    suggestionsBox.classList.remove('show');
    filterProducts();
  });
}

/* --------------------
   Закрити підказки при кліку поза контролами
   -------------------- */
document.addEventListener('click', (e) => {
  const controls = document.querySelector('.catalog-controls');
  if (!controls) return;
  if (!controls.contains(e.target)) {
    suggestionsBox && suggestionsBox.classList.remove('show');
  }
});

/* --------------------
   Обробники подій для контролів
   -------------------- */
if (searchInput) {
  // Якщо є параметр ?search= — підставимо його
  if (urlSearch) {
    searchInput.value = decodeURIComponent(urlSearch);
  }

  searchInput.addEventListener('input', () => {
    updateSuggestions();
    filterProducts();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      suggestionsBox && suggestionsBox.classList.remove('show');
    }
  });
}

if (categoryFilter) categoryFilter.addEventListener('input', filterProducts);
if (minPrice) minPrice.addEventListener('input', filterProducts);
if (maxPrice) maxPrice.addEventListener('input', filterProducts);

/* --------------------
   Кнопки "Купити" — додаємо в локальний кошик (localStorage)
   -------------------- */
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const meta = getCardMeta(card);

    const item = {
      id: btn.dataset.id || meta.id || null,
      name: btn.dataset.name || meta.name,
      price: btn.dataset.price ? parseInt(btn.dataset.price, 10) : meta.price,
      qty: 1,
      img: card.querySelector('img') ? card.querySelector('img').getAttribute('src') : (meta.img || '')
    };

    const stored = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = stored.find(ci => (ci.id && item.id && ci.id === item.id) || (ci.name === item.name));

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      stored.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(stored));

    // Візуальне підтвердження кнопки
    const orig = btn.textContent;
    btn.textContent = 'Додано ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
    }, 900);
  });
});

/* --------------------
   Ініціалізація (застосувати фільтр якщо щось задано в URL або контролах)
   -------------------- */
filterProducts();
updateSuggestions();