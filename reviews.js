const ADMIN_PASSWORD = 'password';

// Отримуємо productId з розмітки
const productSection = document.querySelector('.product-page');
const PRODUCT_ID = productSection ? productSection.dataset.productId : (productSection ? productSection.getAttribute('data-product-id') : null) || 'unknown-product';

// DOM-елементи
const reviewForm = document.getElementById('review-form');
const nameInput = document.getElementById('review-name');
const ratingInputs = document.querySelectorAll('input[name="rating"]');
const textInput = document.getElementById('review-text');
const reviewsList = document.getElementById('reviews-list');
const avgRatingEl = document.getElementById('avg-rating');
const reviewsCountEl = document.getElementById('reviews-count');
const adminLoginBtn = document.getElementById('admin-login');

const adminPanel = document.getElementById('admin-panel');
const adminList = document.getElementById('admin-list');
const adminLogout = document.getElementById('admin-logout');

// Зчитування/запис в localStorage
function loadAllReviews() {
  const raw = localStorage.getItem('reviews') || '[]';
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveAllReviews(arr) {
  localStorage.setItem('reviews', JSON.stringify(arr));
}

// Повертає масив відгуків для продукту
function getReviewsForProduct(productId) {
  const all = loadAllReviews();
  return all.filter(r => r.productId === productId);
}

// Додаємо новий відгук (за замовчуванням approved: false)
function addReview(productId, name, rating, text) {
  const all = loadAllReviews();
  const review = {
    id: 'r_' + Date.now(),
    productId,
    name,
    rating: Number(rating),
    text,
    date: new Date().toISOString(),
    approved: false
  };
  all.unshift(review); // новіші вгорі
  saveAllReviews(all);
  return review;
}

// Видалити відгук
function deleteReviewById(id) {
  let all = loadAllReviews();
  all = all.filter(r => r.id !== id);
  saveAllReviews(all);
}

// Підтвердити відгук
function approveReviewById(id) {
  const all = loadAllReviews();
  const idx = all.findIndex(r => r.id === id);
  if (idx >= 0) {
    all[idx].approved = true;
    saveAllReviews(all);
  }
}

// Рендер списку опублікованих відгуків
function renderReviews() {
  const reviews = getReviewsForProduct(PRODUCT_ID).filter(r => r.approved);
  reviewsList.innerHTML = '';
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p>Поки немає підтверджених відгуків. Станьте першим!</p>';
  } else {
    reviews.forEach(r => {
      const el = document.createElement('div');
      el.className = 'review-item';
      el.innerHTML = `
        <div class="meta"><strong>${escapeHtml(r.name)}</strong> • ${formatDate(r.date)} • ${renderStars(r.rating)}</div>
        <div class="text">${escapeHtml(r.text)}</div>
      `;
      reviewsList.appendChild(el);
    });
  }
  renderSummary();
}

// Рендер адмін-панелі (всі відгуки для цього товару, включно з непідтвердженими)
function renderAdminPanel() {
  if (!adminPanel) return;
  const all = getReviewsForProduct(PRODUCT_ID);
  adminList.innerHTML = '';
  if (all.length === 0) {
    adminList.innerHTML = '<p>Немає відгуків для модерації.</p>';
    return;
  }
  all.forEach(r => {
    const node = document.createElement('div');
    node.className = 'admin-item';
    node.innerHTML = `
      <div>
        <div><strong>${escapeHtml(r.name)}</strong> • ${formatDate(r.date)} • ${renderStars(r.rating)} ${r.approved ? '(Підтверджено)' : '(Очікує)'}</div>
        <div style="margin-top:6px">${escapeHtml(r.text)}</div>
      </div>
      <div class="admin-controls">
        ${r.approved ? '' : `<button class="btn-approve" data-id="${r.id}">Підтвердити</button>`}
        <button class="btn-delete" data-id="${r.id}">Видалити</button>
      </div>
    `;
    adminList.appendChild(node);
  });

  // Події для кнопок
  adminList.querySelectorAll('.btn-approve').forEach(b => {
    b.addEventListener('click', () => {
      approveReviewById(b.dataset.id);
      renderAdminPanel();
      renderReviews();
    });
  });
  adminList.querySelectorAll('.btn-delete').forEach(b => {
    b.addEventListener('click', () => {
      if (confirm('Видалити цей відгук?')) {
        deleteReviewById(b.dataset.id);
        renderAdminPanel();
        renderReviews();
      }
    });
  });
}

// Показ середнього рейтингу та кількості
function renderSummary() {
  const all = getReviewsForProduct(PRODUCT_ID).filter(r => r.approved);
  const count = all.length;
  const avg = count === 0 ? 0 : (all.reduce((s, x) => s + Number(x.rating), 0) / count);
  avgRatingEl.textContent = count === 0 ? '—' : avg.toFixed(1) + '★';
  reviewsCountEl.textContent = `(${count})`;
}

// Формат дати
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

// Прості утиліти
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderStars(n) {
  let s = '';
  for (let i=0;i<5;i++) s += (i < n) ? '★' : '☆';
  return `<span style="color:#f5a623">${s}</span>`;
}

/* --------------------
   Обробники
   -------------------- */
if (reviewForm) {
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    const ratingNode = Array.from(ratingInputs).find(i => i.checked);
    const rating = ratingNode ? ratingNode.value : null;

    if (!name || !rating || !text) {
      alert('Будь ласка, заповніть ім’я, рейтинг та коментар.');
      return;
    }

    addReview(PRODUCT_ID, name, rating, text);
    reviewForm.reset();
    alert('Дякуємо! Ваш відгук відправлено на модерацію.');
    renderAdminPanel(); // якщо адмін — побачить новий чернеток
    renderReviews(); // пока не підтверджений — не відобразиться публічно
  });
}

/* --------------------
   Адмін — вхід/вихід
   - допускаємо два варіанти: через prompt (пароль) або через sessionStorage
   -------------------- */
function isAdminMode() {
  return sessionStorage.getItem('isAdmin') === '1' || new URLSearchParams(window.location.search).get('admin') === '1';
}

function enterAdminMode() {
  const pass = prompt('Введіть пароль адміністратора:');
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('isAdmin','1');
    activateAdminUI();
  } else {
    alert('Невірний пароль');
  }
}

function activateAdminUI() {
  if (adminPanel) adminPanel.style.display = 'block';
  if (adminLoginBtn) adminLoginBtn.style.display = 'none';
  if (adminLogout) adminLogout.style.display = 'inline-block';
  renderAdminPanel();
}

function leaveAdminMode() {
  sessionStorage.removeItem('isAdmin');
  if (adminPanel) adminPanel.style.display = 'none';
  if (adminLoginBtn) adminLoginBtn.style.display = 'inline-block';
  if (adminLogout) adminLogout.style.display = 'none';
}

// кнопки
if (adminLoginBtn) adminLoginBtn.addEventListener('click', enterAdminMode);
if (adminLogout) adminLogout.addEventListener('click', () => { leaveAdminMode(); });

// на старті — якщо admin=true в сесії або ?admin=1 в URL — показуємо панель
if (isAdminMode()) activateAdminUI();


// маркуємо початковий рендер
renderReviews();
renderAdminPanel();