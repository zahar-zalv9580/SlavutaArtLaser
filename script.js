const products = [
  "Ключниця 'Family'",
  "Ключниця 'Haus'",
  "Брелок 'Україна'",
   
];

// ======= ПОШУК =======
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');

input.addEventListener('input', function() {
  const query = input.value.toLowerCase();

  if (!query) {
    suggestions.classList.add('hidden');
    return;
  }

  const filtered = products.filter(product => product.toLowerCase().includes(query));

  if (filtered.length > 0) {
    suggestions.innerHTML = filtered
      .map(item => `<div>${highlightMatch(item, query)}</div>`)
      .join('');
  } else {
    suggestions.innerHTML = `<div>Нічого не знайдено</div>`;
  }
  
  suggestions.classList.remove('hidden');
});

// Клік на підказку
suggestions.addEventListener('click', e => {
  if (e.target.tagName === 'DIV') {
    input.value = e.target.innerText;
    suggestions.classList.add('hidden');
  }
});

// Закриваємо при кліку поза блоком
document.addEventListener('click', e => {
  if (!form.contains(e.target)) {
    suggestions.classList.add('hidden');
  }
});

// Сабміт пошуку
form.addEventListener('submit', e => {
  e.preventDefault();
  if (input.value.trim()) {
    // Тут можна додати перенаправлення на каталог
    window.location.href = `products.html?search=${encodeURIComponent(input.value)}`;
  }
});

// Підсвічування збігів
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<b style="color:#2d7dff">$1</b>');
}

// ======= СЛАЙДЕР =======
const slides = document.querySelectorAll('.slide');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const indicators = document.querySelector('.indicators');

let index = 0;
let interval = setInterval(showNextSlide, 5000);

// Створюємо індикатори
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => showSlide(i));
  indicators.appendChild(dot);
});

const dots = indicators.querySelectorAll('div');

prev.addEventListener('click', showPrevSlide);
next.addEventListener('click', showNextSlide);

function showSlide(i) {
  slides[index].classList.remove('active');
  dots[index].classList.remove('active');
  index = i;
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  resetInterval();
}

function showNextSlide() {
  showSlide((index + 1) % slides.length);
}

function showPrevSlide() {
  showSlide((index - 1 + slides.length) % slides.length);
}

function resetInterval() {
  clearInterval(interval);
  interval = setInterval(showNextSlide, 5000);
}