document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// ==========================================================================
// CANVAS — fundo estrelas
// ==========================================================================
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
const layerCount = 3;
const speeds = [0.05, 0.1, 0.2];
const baseStarCount = 50;
let shootingStar = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createStars();
}

function createStars() {
  stars = [];
  const scalingFactor = Math.max(canvas.width, canvas.height) / 1000;
  for (let i = 0; i < layerCount; i++) {
    const starCount = Math.floor(baseStarCount * scalingFactor * (i + 1));
    for (let j = 0; j < starCount; j++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (i + 1) + 0.5,
        speed: speeds[i],
        opacity: Math.random(),
        baseOpacity: Math.random() * 0.5 + 0.5,
        layer: i,
      });
    }
  }
}

function updateStars() {
  stars.forEach((star) => {
    star.y -= star.speed;
    star.opacity = star.baseOpacity + Math.sin(Date.now() * 0.001 * star.speed) * 0.3;
    if (star.y < 0) {
      star.y = canvas.height;
      star.x = Math.random() * canvas.width;
    }
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width / 8,
    canvas.width / 2, canvas.height / 2, canvas.width
  );
  gradient.addColorStop(0, "rgba(10, 20, 40, 1)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  stars.forEach((star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
}

function createShootingStar() {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 4 + 2;
  shootingStar = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * 300 + 100,
    speed,
    opacity: 1,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
  };
  setTimeout(createShootingStar, Math.random() * 20000 + 20000);
}

function updateShootingStar() {
  if (!shootingStar) return;
  shootingStar.x += shootingStar.dx;
  shootingStar.y += shootingStar.dy;
  shootingStar.opacity -= 0.01;
  if (
    shootingStar.opacity <= 0 ||
    shootingStar.x < 0 || shootingStar.x > canvas.width ||
    shootingStar.y < 0 || shootingStar.y > canvas.height
  ) shootingStar = null;
}

function drawShootingStar() {
  if (!shootingStar) return;
  const gradient = ctx.createLinearGradient(
    shootingStar.x, shootingStar.y,
    shootingStar.x - shootingStar.dx * shootingStar.length,
    shootingStar.y - shootingStar.dy * shootingStar.length
  );
  gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.moveTo(shootingStar.x, shootingStar.y);
  ctx.lineTo(
    shootingStar.x - shootingStar.dx * shootingStar.length,
    shootingStar.y - shootingStar.dy * shootingStar.length
  );
  ctx.stroke();
  ctx.closePath();
}

function animate() {
  updateStars();
  updateShootingStar();
  drawStars();
  drawShootingStar();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setTimeout(createShootingStar, Math.random() * 20000 + 20000);
animate();


// ==========================================================================
// NAVBAR
// ==========================================================================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    navLinks.classList.remove('open');
    const targetId = link.getAttribute('href');
    if (targetId.startsWith('#')) {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});


// ==========================================================================
// SCROLL ANIMATION
// ==========================================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-block').forEach(el => {
  observer.observe(el);
});


// ==========================================================================
// FETCH ÚNICO — habilidades + diário + equipe
// ==========================================================================
fetch('src/db/data.json')
  .then(res => res.json())
  .then(data => {

    const grid = document.getElementById('habilidades-grid');
    if (grid && data.habilidades) {
      data.habilidades.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('habilidade-card', 'scroll-block');
        card.innerHTML = `
          <i data-lucide="${item.icone}" class="habilidade-icon"></i>
          <h3>${item.titulo}</h3>
          <p>${item.descricao}</p>
        `;
        grid.appendChild(card);
        observer.observe(card);
      });
      lucide.createIcons();
    }

    // ── 2. DIÁRIO DE BORDO ──────────────────────────────────────────────────
    const diarioContainer = document.getElementById('diario-container');
    if (diarioContainer && data.diario) {
      data.diario.forEach(post => {
        const artigo = document.createElement('article');
        artigo.classList.add('card-diario', 'scroll-block');
        artigo.innerHTML = `
          <span class="card-data">Data: ${post.data}</span>
          <h3>${post.titulo}</h3>
          <p>${post.descricao}</p>
        `;
        diarioContainer.appendChild(artigo);
        observer.observe(artigo);
      });
    }

    // ── 3. EQUIPE ───────────────────────────────────────────────────────────
    const equipeContainer = document.getElementById('equipe-container');
    if (equipeContainer && data.equipe) {
      data.equipe.forEach(membro => {
        const card = document.createElement('div');
        card.classList.add('card-membro', 'scroll-block');

        const fotoHTML = membro.foto
          ? `<img src="${membro.foto}" alt="${membro.nome}" class="foto-membro">`
          : `<div class="foto-placeholder"></div>`;

        card.innerHTML = `
          ${fotoHTML}
          <h4>${membro.nome}</h4>
          <p>${membro.curso}</p>
          <a href="${membro.linkedin}" target="_blank" class="linkedin-link" aria-label="LinkedIn ${membro.nome}">
            <i class="fa-brands fa-linkedin"></i> LinkedIn
          </a>
        `;
        equipeContainer.appendChild(card);
        observer.observe(card);
      });
    }

  })
  .catch(err => console.error("Erro ao carregar data.json:", err));