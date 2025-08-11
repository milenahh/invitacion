let sparkleRunning = false;
let openingCurtain = false;
let curtainOffset = 0;

let curtainBorder; // definido dinámicamente

function setupCanvas(canvas) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function createRainParticles(count, width, height) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 18 + 8,
      thickness: Math.random() * 1.6 + 0.8,
      speed: Math.random() * 3 + 2,
      hueLight: 55 + Math.random() * 15,
      alpha: 0.5 + Math.random() * 0.5
    });
  }
  return arr;
}

function drawRain(ctx, particles, W, H) {
  for (let p of particles) {
    const flicker = Math.sin((Date.now()/200) + p.x*0.01) * 8;
    const lightness = Math.min(95, Math.max(50, p.hueLight + flicker));
    ctx.strokeStyle = `hsla(50, 90%, ${lightness}%, ${p.alpha})`;

    ctx.lineWidth = p.thickness;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + p.length);
    ctx.stroke();
  }
}

function updateRain(particles, W, H) {
  for (let p of particles) {
    p.y += p.speed;
    if (p.y > H + p.length) {
      p.y = -p.length - Math.random() * 80;
      p.x = Math.random() * W;
      p.speed = 1.5 + Math.random() * 3.5;
      p.length = 8 + Math.random() * 20;
      p.thickness = 0.8 + Math.random() * 1.8;
      p.alpha = 0.4 + Math.random() * 0.6;
      p.hueLight = 50 + Math.random() * 20;
    }
  }
}

function startSparklesOnce() {
  if (sparkleRunning) return;
  sparkleRunning = true;

  const canvas = document.getElementById("sparkle-canvas");
  let ctx = setupCanvas(canvas);
  let W = canvas.clientWidth;
  let H = canvas.clientHeight;

  // definir curtainBorder dinámico según ancho
  curtainBorder = Math.min(350, W * 0.2);

  let particles = createRainParticles(Math.max(100, Math.floor(W / 2)), W, H);

  window.addEventListener("resize", () => {
    ctx = setupCanvas(canvas);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    curtainBorder = Math.min(350, W * 0.2);
    particles = createRainParticles(Math.max(100, Math.floor(W / 2)), W, H);
  });

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);

    if (openingCurtain) {
      curtainOffset += 10;
      if (curtainOffset >= W / 2 - curtainBorder) {
        curtainOffset = W / 2 - curtainBorder;
      }
    }

    // lado izquierdo
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W / 2 - curtainOffset, H);
    ctx.clip();
    drawRain(ctx, particles, W, H);
    ctx.restore();

    // lado derecho
    ctx.save();
    ctx.beginPath();
    ctx.rect(W / 2 + curtainOffset, 0, W / 2 - curtainOffset, H);
    ctx.clip();
    drawRain(ctx, particles, W, H);
    ctx.restore();

    updateRain(particles, W, H);
    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

document.addEventListener("DOMContentLoaded", () => {
  const envelope = document.getElementById("envelope");
  const envelopeContainer = document.getElementById("envelope-container");
  const sparkleContainer = document.getElementById("sparkle-container");
  const introMessage = document.getElementById("intro-message");
  const invitation = document.getElementById("invitation");

  envelope.addEventListener("click", () => {
    envelope.classList.add("fade-out");

    setTimeout(() => {
      envelopeContainer.classList.add("hidden");
      sparkleContainer.classList.remove("hidden");
      startSparklesOnce();

      // mostrar letrero inicial
      introMessage.classList.remove("hidden");

      // después de 2.5s, quitar letrero y abrir telón
      setTimeout(() => {
        introMessage.classList.add("fade-out");

        setTimeout(() => {
          introMessage.classList.add("hidden");
          openingCurtain = true;

          // mostrar invitación cuando ya se abrió el telón
          setTimeout(() => {
            invitation.classList.remove("hidden");
          }, 2000);

        }, 1000);

      }, 2500);

    }, 450);
  });
});