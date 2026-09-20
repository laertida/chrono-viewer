import './style.css'
console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiii")

const canvas = document.getElementById('poseCanvas');
const ctx = canvas.getContext('2d');
console.log(`i got canvas ${canvas}`)
let poseActual = [];
let historialSnapshots = [];
let timerCaptura;

// Configuración de la cronofotografía
const MAX_FANTASMAS = 10; 

// Conectar al puente Node.js
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.people) {
      poseActual = data.people;
      renderizar();
    }
  } catch (error) {
    console.error("Error al procesar el JSON:", error);
  }
};

// Bucle para tomar la "fotografía" cada X milisegundos
function iniciarCronofotografia(intervalo_ms) {
  clearInterval(timerCaptura); 
  timerCaptura = setInterval(() => {
    if (poseActual.length > 0) {
      const snapshot = JSON.parse(JSON.stringify(poseActual));
      historialSnapshots.push(snapshot);
      
      if (historialSnapshots.length > MAX_FANTASMAS) {
        historialSnapshots.shift(); 
      }
    }
  }, intervalo_ms);
}

iniciarCronofotografia(document.getElementById('intervaloInput').value);

document.getElementById('intervaloInput').addEventListener('change', (e) => {
  iniciarCronofotografia(e.target.value);
});

function limpiarHistorial() {
  historialSnapshots = [];
  renderizar(); // Forzar dibujado limpio
}

// --- FUNCIONES DE DIBUJO ---
function renderizar() {
  // 1. Limpiar el lienzo
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Dibujar el historial (los fantasmas)
  historialSnapshots.forEach((snapshot, index) => {
    const opacidad = 0.15 + (0.35 * (index / historialSnapshots.length));
    dibujarEsqueletoYPuntos(snapshot, opacidad, true);
  });

  // 3. Dibujar la pose actual
  dibujarEsqueletoYPuntos(poseActual, 1.0, false);
}

function dibujarEsqueletoYPuntos(people, opacidad, esFantasma) {
  people.forEach(person => {
    if (person.proximidad > 0.5) {
      const n = person.nose ? { x: person.nose.x * canvas.width, y: person.nose.y * canvas.height } : null;
      const le = person.left_eye ? { x: person.left_eye.x * canvas.width, y: person.left_eye.y * canvas.height } : null;
      const re = person.right_eye ? { x: person.right_eye.x * canvas.width, y: person.right_eye.y * canvas.height } : null;
      const lea = person.left_ear ? { x: person.left_ear.x * canvas.width, y: person.left_ear.y * canvas.height } : null;
      const rea = person.right_ear ? { x: person.right_ear.x * canvas.width, y: person.right_ear.y * canvas.height } : null;
      
      const lw = person.left_wrist ? { x: person.left_wrist.x * canvas.width, y: person.left_wrist.y * canvas.height } : null;
      const rw = person.right_wrist ? { x: person.right_wrist.x * canvas.width, y: person.right_wrist.y * canvas.height } : null;
      
      // --- 1. DIBUJAR LÍNEAS (Esqueleto) ---
      ctx.lineWidth = esFantasma ? 2 : 4; 
      ctx.strokeStyle = `rgba(255, 255, 0, ${opacidad})`; // Líneas amarillas
      if(n && le) {
        ctx.beginPath();
        ctx.moveTo(le.x, le.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke(); 
      }

      if(n && re) {
        ctx.beginPath();
        ctx.moveTo(re.x, re.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = `rgba(200, 200, 0, ${opacidad})`; // Líneas amarillas
        ctx.stroke(); 
      }

      if (lw && n) {
        ctx.beginPath();
        ctx.moveTo(lw.x, lw.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke(); 
      }
                     
      if (n && rw) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(rw.x, rw.y);
        ctx.stroke(); 
      }

      // --- 2. DIBUJAR PUNTOS ---
      if (n) dibujarPunto(n.x, n.y, `rgba(255, 68, 68, ${opacidad})`, 'Nariz', esFantasma);
      if (le) dibujarPunto(oi.x, oi.y, `rgba(200, 38, 18, ${opacidad})`, 'O. Izq', esFantasma);
      if (re) dibujarPunto(od.x, od.y, `rgba(225, 38, 18, ${opacidad})`, 'O. Der', esFantasma);                     
      if (lw) dibujarPunto(mi.x, mi.y, `rgba(68, 255, 68, ${opacidad})`, 'M. Izq', esFantasma);
      if (rw) dibujarPunto(md.x, md.y, `rgba(68, 68, 255, ${opacidad})`, 'M. Der', esFantasma);
    }
  });
}

function dibujarPunto(x, y, colorRgba, label, esFantasma) {
  ctx.beginPath();
  ctx.arc(x, y, esFantasma ? 4 : 6, 0, 2 * Math.PI);
  ctx.fillStyle = colorRgba;
  ctx.fill();
  
  if (!esFantasma) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(label, x + 10, y + 4);
  }
}
