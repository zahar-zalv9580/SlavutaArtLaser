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