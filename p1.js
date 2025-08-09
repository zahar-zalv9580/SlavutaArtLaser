// p1.js (повний — слайдер + обробник "Купити")
const slides = document.querySelectorAll('.product-slider .slides img');
const thumbs = document.querySelectorAll('.product-slider .thumbnails img');
const prevBtn = document.querySelector('.product-slider .prev');
const nextBtn = document.querySelector('.product-slider .next');

let current = 0;

function showSlide(index) {
  slides[current].classList.remove('active');
  thumbs[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  thumbs[current].classList.add('active');
}

prevBtn.addEventListener('click', () => {
  const newIndex = (current - 1 + slides.length) % slides.length;
  showSlide(newIndex);
});

nextBtn.addEventListener('click', () => {
  const newIndex = (current + 1) % slides.length;
  showSlide(newIndex);
});

thumbs.forEach((thumb, i) => {
  thumb.addEventListener('click', () => showSlide(i));
});

// Додавання в кошик з синхронізацією на сервер, якщо користувач залогінений
const buyBtn = document.querySelector('.btn-buy');

buyBtn.addEventListener('click', async () => {
  const priceText = document.querySelector('.price').textContent || '';
  const product = {
    name: document.querySelector('.product-info h1').textContent.trim(),
    price: parseInt(priceText.replace(/\D/g, ''), 10) || 0,
    img: document.querySelector('.product-slider .slides img.active').getAttribute('src'),
    qty: 1
  };

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Якщо товар вже є в кошику – збільшити кількість
  const existingIndex = cart.findIndex(item => item.name === product.name);
  if (existingIndex >= 0) {
    cart[existingIndex].qty++;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  // Якщо користувач залогінений — надсилаємо на сервер
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      // необов'язково чекати на відповідь — але можна обробити помилки
    } catch (err) {
      console.warn('Не вдалось надіслати на сервер:', err);
    }
  }

  // Перехід в кошик
  window.location.href = 'shopcart.html';
});