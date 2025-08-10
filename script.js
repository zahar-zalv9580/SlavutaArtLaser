
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