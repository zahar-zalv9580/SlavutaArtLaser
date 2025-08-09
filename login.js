const LOGIN_ENDPOINT = '/api/login';         // POST { email, password } -> { token }
const CART_SYNC_ENDPOINT = '/api/cart/sync'; // POST { cart: [...] } (Authorization: Bearer <token>)

const form = document.getElementById('loginForm');
const msg = document.getElementById('loginMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    msg.textContent = 'Вкажіть email і пароль.';
    return;
  }

  try {
    const res = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(()=>({}));

    if (!res.ok) {
      msg.textContent = data.message || `Помилка: ${res.status}`;
      return;
    }

    if (!data.token) {
      msg.textContent = 'Сервер не повернув токен. Перевірте API.';
      return;
    }

    // Зберігаємо токен
    localStorage.setItem('token', data.token);

    // Синхронізація локального кошика (якщо є) на сервер
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (Array.isArray(localCart) && localCart.length > 0) {
      try {
        await fetch(CART_SYNC_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({ cart: localCart })
        });
        // після успішного sync можна очистити локальний або залишити - залежить від бажаного UX
        // localStorage.removeItem('cart');
      } catch (err) {
        console.warn('Sync failed', err);
        // не перериваємо — користувач вже залогінений
      }
    }

    // Перенаправляємо користувача в кошик
    window.location.href = 'shopcart.html';
  } catch (err) {
    console.error(err);
    msg.textContent = 'Неможливо підключитися до сервера.';
  }
});
