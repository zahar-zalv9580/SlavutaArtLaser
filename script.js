const products = [
  "iPhone 15 Pro Max",
  "Samsung Galaxy S24",
  "Ноутбук Lenovo Legion",
  "Навушники AirPods Pro",
  "Смарт-годинник Apple Watch",
  "Кавомашина DeLonghi",
  "Телевізор LG OLED",
  "Ігрова приставка PlayStation 5"
];

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');

input.addEventListener('input', function() {
  const query = input.value.toLowerCase();

  if (query.length === 0) {
    suggestions.classList.add('hidden');
    return;
  }

  const filtered = products.filter(product => 
    product.toLowerCase().includes(query)
  );

  if (filtered.length > 0) {
    suggestions.innerHTML = filtered
      .map(item => `<div>${highlightMatch(item, query)}</div>`)
      .join('');
    suggestions.classList.remove('hidden');
  } else {
    suggestions.innerHTML = `<div>Нічого не знайдено</div>`;
    suggestions.classList.remove('hidden');
  }
});

// Клік на підказку вставляє її в поле
suggestions.addEventListener('click', function(e) {
  if (e.target.tagName === 'DIV') {
    input.value = e.target.innerText;
    suggestions.classList.add('hidden');
  }
});

// Сабміт форми (пошук)
form.addEventListener('submit', function(e) {
  e.preventDefault();
  alert(`Шукаю: ${input.value}`);
  suggestions.classList.add('hidden');
});

// Функція підсвічування збігів
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<b style="color:#2d7dff">$1</b>');
}