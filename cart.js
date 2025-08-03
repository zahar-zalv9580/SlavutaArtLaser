// Отримуємо кошик з localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartItemsDiv = document.querySelector('.cart-items');
const totalPriceEl = document.getElementById('total-price');
const clearBtn = document.getElementById('clear-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');

function renderCart() {
  cartItemsDiv.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Ваш кошик порожній.</p>';
    totalPriceEl.textContent = '0 грн';
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
      <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p class="price">${item.price} грн</p>
      <input type="number" value="${item.qty}" min="1" data-index="${index}">
      <button class="remove" data-index="${index}">×</button>
    `;
    cartItemsDiv.appendChild(cartItem);
  });

  totalPriceEl.textContent = total + ' грн';
}

renderCart();

// Видалення товарів
cartItemsDiv.addEventListener('click', e => {
  if (e.target.classList.contains('remove')) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
});

// Зміна кількості товарів
cartItemsDiv.addEventListener('input', e => {
  if (e.target.type === 'number') {
    const index = e.target.dataset.index;
    cart[index].qty = parseInt(e.target.value);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
});

// Очистити кошик
clearBtn.addEventListener('click', () => {
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
});

// Оформити замовлення (поки просто alert)
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Ваш кошик порожній!');
    return;
  }
  alert('Дякуємо за замовлення! З вами зв’яжеться менеджер.');
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
});