const ADMIN_PASSWORD = 'woodadmin';
const LS_REVIEWS = 'reviews';
const LS_LIKED = 'likedReviews';

// Product id (секція має data-product-id)
const productSection = document.querySelector('.product-page');
const PRODUCT_ID = productSection ? (productSection.dataset.productId || productSection.getAttribute('data-product-id')) : 'unknown-product';

// DOM
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

/* ---------- storage helpers ---------- */
function loadAllReviews() {
  try { return JSON.parse(localStorage.getItem(LS_REVIEWS) || '[]'); }
  catch { return []; }
}
function saveAllReviews(arr) { localStorage.setItem(LS_REVIEWS, JSON.stringify(arr)); }
function getLikedIds() { try { return JSON.parse(localStorage.getItem(LS_LIKED) || '[]'); } catch { return []; } }
function setLikedIds(arr) { localStorage.setItem(LS_LIKED, JSON.stringify(arr)); }

/* ---------- CRUD для відгуків і відповідей ---------- */
function getReviewsForProduct(pid) {
  return loadAllReviews().filter(r => r.productId === pid);
}

function addReview(productId, name, rating, text) {
  const all = loadAllReviews();
  const review = {
    id: 'r_' + Date.now(),
    productId,
    name,
    rating: Number(rating),
    text,
    date: new Date().toISOString(),
    approved: false,
    likes: 0,
    replies: [] // replies: [{id, name, text, date, approved}]
  };
  all.unshift(review);
  saveAllReviews(all);
  return review;
}

function deleteReviewById(id) {
  let all = loadAllReviews();
  all = all.filter(r => r.id !== id);
  saveAllReviews(all);
}

function approveReviewById(id) {
  const all = loadAllReviews();
  const idx = all.findIndex(r => r.id === id);
  if (idx >= 0) { all[idx].approved = true; saveAllReviews(all); }
}

/* Replies with moderation */
function addReply(reviewId, name, text) {
  const all = loadAllReviews();
  const idx = all.findIndex(r => r.id === reviewId);
  if (idx === -1) return null;
  const reply = {
    id: 'rp_' + Date.now(),
    name,
    text,
    date: new Date().toISOString(),
    approved: false // за замовчуванням — потребує модерації
  };
  all[idx].replies = all[idx].replies || [];
  all[idx].replies.push(reply);
  saveAllReviews(all);
  return reply;
}

function approveReplyById(reviewId, replyId) {
  const all = loadAllReviews();
  const rIdx = all.findIndex(r => r.id === reviewId);
  if (rIdx === -1) return;
  const rep = (all[rIdx].replies || []).find(rr => rr.id === replyId);
  if (rep) {
    rep.approved = true;
    saveAllReviews(all);
  }
}

function deleteReplyById(reviewId, replyId) {
  const all = loadAllReviews();
  const rIdx = all.findIndex(r => r.id === reviewId);
  if (rIdx === -1) return;
  all[rIdx].replies = (all[rIdx].replies || []).filter(rr => rr.id !== replyId);
  saveAllReviews(all);
}

/* Likes */
function toggleLike(reviewId) {
  const liked = getLikedIds();
  const all = loadAllReviews();
  const idx = all.findIndex(r => r.id === reviewId);
  if (idx === -1) return;
  if (liked.includes(reviewId)) {
    all[idx].likes = Math.max(0, (all[idx].likes || 0) - 1);
    setLikedIds(liked.filter(i => i !== reviewId));
  } else {
    all[idx].likes = (all[idx].likes || 0) + 1;
    liked.push(reviewId);
    setLikedIds(liked);
  }
  saveAllReviews(all);
}

/* ---------- утиліти ---------- */
function escapeHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatDate(iso) { try { return new Date(iso).toLocaleString(); } catch { return iso; } }
function renderStars(n) { let s=''; for(let i=0;i<5;i++) s += (i < n) ? '★' : '☆'; return `<span style="color:#f5a623">${s}</span>`; }

/* ---------- Рендер публічних відгуків (лише approved та approved replies) ---------- */
function renderReviews() {
  if (!reviewsList) return;
  const reviews = getReviewsForProduct(PRODUCT_ID).filter(r => r.approved);
  reviewsList.innerHTML = '';
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p>Поки немає підтверджених відгуків. Станьте першим!</p>';
  } else {
    const liked = getLikedIds();
    reviews.forEach(r => {
      const div = document.createElement('div');
      div.className = 'review-item';
      div.dataset.reviewId = r.id;
      const likesCount = r.likes || 0;
      const likedSign = liked.includes(r.id) ? '♥' : '♡';

      // тільки ті відповіді, які approved === true
      const approvedReplies = (r.replies || []).filter(rep => rep.approved);

      div.innerHTML = `
        <div class="meta"><strong>${escapeHtml(r.name)}</strong> • ${formatDate(r.date)} • ${renderStars(r.rating)}</div>
        <div class="text">${escapeHtml(r.text)}</div>

        <div class="review-actions" style="margin-top:8px; display:flex; gap:8px; align-items:center;">
          <button class="like-btn" data-id="${r.id}">${likedSign} <span class="likes-count">${likesCount}</span></button>
          <button class="reply-toggle" data-id="${r.id}">Відповісти</button>
        </div>

        <div class="reply-section" data-review="${r.id}" style="margin-top:10px;">
          <div class="reply-list">
            ${approvedReplies.map(rep => `
              <div class="reply-item" data-reply-id="${rep.id}">
                <div class="reply-meta"><strong>${escapeHtml(rep.name)}</strong> • ${formatDate(rep.date)}</div>
                <div class="reply-text">${escapeHtml(rep.text)}</div>
              </div>
            `).join('')}
          </div>

          <form class="reply-form" data-review="${r.id}" style="display:none; margin-top:8px;">
            <input name="reply-name" placeholder="Ваше ім'я" required style="padding:6px;border:1px solid #ccc;border-radius:6px;margin-bottom:6px;width:100%;">
            <textarea name="reply-text" placeholder="Ваша відповідь..." rows="2" required style="padding:6px;border:1px solid #ccc;border-radius:6px;width:100%;"></textarea>
            <div style="margin-top:6px;"><button type="submit" class="btn-reply-submit" style="background:#2d7dff;color:#fff;border:none;padding:8px 10px;border-radius:6px;">Відправити</button></div>
          </form>
        </div>
      `;
      reviewsList.appendChild(div);
    });
  }
  renderSummary();
}

/* ---------- Підсумок ---------- */
function renderSummary() {
  const all = getReviewsForProduct(PRODUCT_ID).filter(r => r.approved);
  const count = all.length;
  const avg = count === 0 ? 0 : (all.reduce((s,x) => s + Number(x.rating), 0) / count);
  avgRatingEl.textContent = count === 0 ? '—' : avg.toFixed(1) + '★';
  reviewsCountEl.textContent = `(${count})`;
}

/* ---------- Адмін-панель (включає відповіді) ---------- */
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
      <div style="flex:1">
        <div><strong>${escapeHtml(r.name)}</strong> • ${formatDate(r.date)} • ${renderStars(r.rating)} ${r.approved ? '(Підтверджено)' : '(Очікує)'}</div>
        <div style="margin-top:6px">${escapeHtml(r.text)}</div>
        <div style="margin-top:8px; font-size:13px; color:#666;">
          Лайків: ${r.likes || 0} • Відповідей: ${(r.replies || []).length}
        </div>

        <div style="margin-top:8px;">
          ${(r.replies || []).map(rep => `
            <div style="padding:6px;border-radius:6px;background:#fff;margin-top:6px;display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="flex:1">
                <div><strong>${escapeHtml(rep.name)}</strong> • ${formatDate(rep.date)} ${rep.approved ? '(Підтверджено)' : '(Очікує)'}</div>
                <div style="margin-top:4px">${escapeHtml(rep.text)}</div>
              </div>
              <div style="margin-left:8px">
                ${rep.approved ? '' : `<button class="admin-approve-reply" data-review="${r.id}" data-reply="${rep.id}" style="background:#2d7dff;color:#fff;border:none;padding:6px 8px;border-radius:6px;">Підтвердити</button>`}
                <button class="admin-delete-reply" data-review="${r.id}" data-reply="${rep.id}" style="background:#e63946;color:#fff;border:none;padding:6px 8px;border-radius:6px;margin-top:6px;">Видалити</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="admin-controls" style="margin-left:12px">
        ${r.approved ? '' : `<button class="btn-approve" data-id="${r.id}" style="background:#2d7dff;color:#fff;border:none;padding:6px 8px;border-radius:6px;">Підтвердити</button>`}
        <button class="btn-delete" data-id="${r.id}" style="background:#e63946;color:#fff;border:none;padding:6px 8px;border-radius:6px;margin-top:8px;">Видалити</button>
      </div>
    `;
    adminList.appendChild(node);
  });

  // події
  adminList.querySelectorAll('.btn-approve').forEach(b => {
    b.addEventListener('click', () => { approveReviewById(b.dataset.id); renderAdminPanel(); renderReviews(); });
  });
  adminList.querySelectorAll('.btn-delete').forEach(b => {
    b.addEventListener('click', () => { if(confirm('Видалити цей відгук?')) { deleteReviewById(b.dataset.id); renderAdminPanel(); renderReviews(); } });
  });

  adminList.querySelectorAll('.admin-approve-reply').forEach(b => {
    b.addEventListener('click', () => { approveReplyById(b.dataset.review, b.dataset.reply); renderAdminPanel(); renderReviews(); });
  });
  adminList.querySelectorAll('.admin-delete-reply').forEach(b => {
    b.addEventListener('click', () => { if(confirm('Видалити цю відповідь?')) { deleteReplyById(b.dataset.review, b.dataset.reply); renderAdminPanel(); renderReviews(); } });
  });
}

/* ---------- Події: submit форми відгуку ---------- */
if (reviewForm) {
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = (nameInput.value || '').trim();
    const text = (textInput.value || '').trim();
    const ratingNode = Array.from(ratingInputs).find(i => i.checked);
    const rating = ratingNode ? ratingNode.value : null;

    if (!name || !rating || !text) { alert('Будь ласка, заповніть ім’я, рейтинг та коментар.'); return; }

    addReview(PRODUCT_ID, name, rating, text);
    reviewForm.reset();
    alert('Дякуємо! Ваш відгук відправлено на модерацію.');
    renderAdminPanel();
    renderReviews();
  });
}

/* ---------- Делеговані події в reviewsList: лайки, відкриття форми відповіді, submit reply ---------- */
if (reviewsList) {
  reviewsList.addEventListener('click', e => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) { toggleLikeHandler(likeBtn.dataset.id); return; }

    const replyToggle = e.target.closest('.reply-toggle');
    if (replyToggle) {
      const rid = replyToggle.dataset.id;
      const form = reviewsList.querySelector(`.reply-form[data-review="${rid}"]`);
      if (form) form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
      return;
    }
  });

  // submit reply (делеговано)
  reviewsList.addEventListener('submit', e => {
    const form = e.target;
    if (form && form.classList.contains('reply-form')) {
      e.preventDefault();
      const rid = form.dataset.review;
      const rname = (form.querySelector('input[name="reply-name"]')?.value || '').trim();
      const rtext = (form.querySelector('textarea[name="reply-text"]')?.value || '').trim();
      if (!rname || !rtext) { alert('Будь ласка, вкажіть ім’я та текст відповіді.'); return; }
      addReply(rid, rname, rtext);
      form.reset();
      form.style.display = 'none';
      alert('Ваша відповідь відправлена на модерацію.');
      renderAdminPanel();
      renderReviews();
    }
  });
}

/* ---------- toggle like handler (забирає дублювання) ---------- */
function toggleLikeHandler(reviewId) {
  toggleLike(reviewId);
  renderReviews();
}

/* ---------- Admin login/logout ---------- */
function isAdminMode() { return sessionStorage.getItem('isAdmin') === '1' || new URLSearchParams(window.location.search).get('admin') === '1'; }
function enterAdminMode() {
  const pass = prompt('Введіть пароль адміністратора:');
  if (pass === ADMIN_PASSWORD) { sessionStorage.setItem('isAdmin','1'); activateAdminUI(); }
  else alert('Невірний пароль');
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

if (adminLoginBtn) adminLoginBtn.addEventListener('click', enterAdminMode);
if (adminLogout) adminLogout.addEventListener('click', leaveAdminMode);
if (isAdminMode()) activateAdminUI();

/* ---------- Ініціалізація ---------- */
renderReviews();
renderAdminPanel();