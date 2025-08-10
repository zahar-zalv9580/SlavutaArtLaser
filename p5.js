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

// Додавання в кошик
const buyBtn = document.querySelector('.btn-buy');

buyBtn.addEventListener('click', () => {
  const product = {
    name: document.querySelector('.product-info h1').textContent,
    price: parseInt(document.querySelector('.price').textContent),
    img: document.querySelector('.product-slider .slides img.active').src,
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
  window.location.href = 'shopcart.html';
});