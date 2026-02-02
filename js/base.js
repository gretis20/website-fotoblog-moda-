document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButton = document.querySelector('.hamburger-menu');
  const mainNav = document.getElementById('main-nav');

  if (!hamburgerButton || !mainNav) return;

  // Abrir/cerrar menú y animar hamburguesa
  hamburgerButton.addEventListener('click', (e) => {
    e.stopPropagation(); // evita conflicto con click en documento
    const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
    hamburgerButton.setAttribute('aria-expanded', !isExpanded);

    mainNav.classList.toggle('nav-open');
    hamburgerButton.classList.toggle('active'); // agrega clase para animación
  });

  // Cerrar menú si se hace click fuera
  document.addEventListener('click', (event) => {
    if (!mainNav.contains(event.target) &&
        !hamburgerButton.contains(event.target) &&
        mainNav.classList.contains('nav-open')) {

      hamburgerButton.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('nav-open');
      hamburgerButton.classList.remove('active'); // quita animación
    }
  });
});


// Ajuste del menú con RESIZE 
window.addEventListener('resize', () => {
  const mainNav = document.getElementById('main-nav');
  const hamburgerButton = document.querySelector('.hamburger-menu');

  // Si el ancho es mayor a 768px (modo escritorio)
  if (window.innerWidth > 768) {
    mainNav.classList.remove('nav-open');
    hamburgerButton.classList.remove('active');
    hamburgerButton.setAttribute('aria-expanded', 'false');
  }
});


// VALIDACIÓN FORMULARIO

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-contacto');
  const inputs = form.querySelectorAll('input, textarea');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    inputs.forEach(input => {
      const error = input.nextElementSibling; 
      error.textContent = ''; // limpiar mensajes anteriores
      input.classList.remove('error');
    });

    // Validar nombre
    const nombre = document.getElementById('nombre');
    
    if (nombre.value.trim() === '') {
      const error = nombre.nextElementSibling;
      error.textContent = 'Por favor ingresa tu nombre';
      nombre.classList.add('error');
      valid = false;
    }

    // Validar email
    const email = document.getElementById('email');
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if (email.value.trim() === '') {
      const error = email.nextElementSibling;
      error.textContent = 'Por favor ingresa tu correo';
      email.classList.add('error');
      valid = false;
    } else if (!emailPattern.test(email.value)) {
      const error = email.nextElementSibling;
      error.textContent = 'Correo no válido';
      email.classList.add('error');
      valid = false;
    }

    // Validar mensaje
    const mensaje = document.getElementById('mensaje');
    if (mensaje.value.trim() === '') {
      const error = mensaje.nextElementSibling;
      error.textContent = 'Por favor ingresa un mensaje';
      mensaje.classList.add('error');
      valid = false;
    }
    if (valid) {
      alert(' ✔ Formulario enviado con éxito');
      form.reset();
    }
  });
});

if (valid) {
  // Limpia si todo está bien
  inputs.forEach(input => {
    const error = input.nextElementSibling;
    error.textContent = ''; // limpiar mensajes anteriores
    input.classList.remove('error');
  });
  alert('Formulario enviado con éxito');
  form.reset();
}


