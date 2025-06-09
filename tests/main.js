let zCounter = 1000;
document.querySelector(".btn-new-window").onclick = function () {
  createFloatingWindow();
};
function createFloatingWindow() {
  const win = document.createElement("div");
  win.className = "floating-window";
  win.style.zIndex = ++zCounter;
  win.innerHTML = `
        <div class="window-titlebar">
          <span class="window-title">Ventana flotante</span>
          <button class="window-close" title="Cerrar">&#10005;</button>
        </div>
        <div class="window-content">
          <b>¡Hola!</b> Esta es una ventana flotante tipo navegador.<br><br>
          Puedes moverla arrastrando la barra superior.<br>
          <ul style="margin: 10px 0 0 18px; padding: 0;">
            <li>Haz clic en "Nueva ventana flotante" para abrir más.</li>
            <li>Puedes cerrar esta ventana con la X.</li>
            <li>El contenido puede ser lo que quieras: formularios, imágenes, etc.</li>
          </ul>
        </div>
      `;
  document.body.appendChild(win);
  // Cerrar
  win.querySelector(".window-close").onclick = () => win.remove();
  // Traer al frente al hacer click
  win.addEventListener("mousedown", () => {
    win.style.zIndex = ++zCounter;
  });
  // Drag
  const titlebar = win.querySelector(".window-titlebar");
  let offsetX,
    offsetY,
    dragging = false;
  titlebar.addEventListener("mousedown", function (e) {
    dragging = true;
    win.style.zIndex = ++zCounter;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
  });
  document.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    // Limitar dentro del viewport
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    win.style.left = x + "px";
    win.style.top = y + "px";
  });
  document.addEventListener("mouseup", function () {
    dragging = false;
    document.body.style.userSelect = "";
  });
}

// #################---------imagenes---------###################

const imagenes = [
  // imagen 1
  {
    src: "/frontend/src/assets/images/background-acerca2.webp",
    alt: "dibujo de calama",
  },

  // imagen 2

  {
    src: "/frontend/src/assets/images/background-collab.webp",
    alt: "dibujo mar",
  },

  // imagen 3

  {
    src: "/frontend/src/assets/images/background-comment.webp",
    alt: "dibujo atardecer",
  },

  // imagen 4

  {
    src: "/frontend/src/assets/images/background-registro.webp",
    alt: "ciudad",
  },

  // imagen 5

  {
    src: "/frontend/src/assets/images/Earth-vangogh.webp",
    alt: "espacio estrellado",
  },
];

const contenenedor_imagenes = document.getElementById("contenedor-imagenes");

document.addEventListener("DOMContentLoaded", function (event) {
  let vista_previa = document.createElement("img");

  vista_previa.src = imagenes[0].src;
  vista_previa.alt = imagenes[0].alt;

  imagenes.forEach((imagen) => {
    let miniatura = document.createElement("img");

    miniatura.src = imagen.src;
    miniatura.alt = imagen.alt;

    miniatura.classList.add("miniatura");

    contenenedor_imagenes.appendChild(miniatura);
  });
});



//________________cookies__________________

function aceptarCookies() {
  console.log("aceptando cookies...")

  localStorage.setItem("cookies", true)
  localStorage.setItem("nombre-usuario", "Jorge")
  localStorage.setItem("edad", 28)
  localStorage.setItem("genero", "hombre")

}

function rechazarCookies() {
  console.log("rechazando cookies...")
  localStorage.clear();
}