// --- TSAEC Comentarios: Lógica principal ---

// Utilidad para fecha relativa
function getRelativeTimeString(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Hace un momento';
}

// Simulación de usuario actual (para identificar comentarios propios)
const usuarioActualSimulado = {
  id: 'user123', // ID único para el usuario simulado
  nombre: 'Usuario Actual'
};

// Estado principal
const LOCAL_STORAGE_KEY = 'tsaecComentarios';
let comentarios = [];
let paginaActual = 1;
const porPagina = 5;
let orden = 'recientes';
let chart;

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('comentarioTexto');
  const contador = document.getElementById('contadorComentario');
  const categoriaBtns = document.querySelectorAll('.categoria-btn');
  const inputCategoria = document.getElementById('categoriaSeleccionada');
  const form = document.getElementById('commentForm');
  const limpiarBtn = document.getElementById('limpiarComentario');

  // Contador de caracteres
  textarea.addEventListener('input', () => {
    contador.textContent = `${textarea.value.length}/280`;
  });

  // Selección de categoría
  categoriaBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      categoriaBtns.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      inputCategoria.value = this.dataset.categoria;
    });
  });
  if (categoriaBtns.length) categoriaBtns[0].classList.add('selected');

  // Limpiar comentario
  limpiarBtn.addEventListener('click', () => {
    textarea.value = '';
    contador.textContent = '0/280';
    textarea.focus();
  });

  // Envío de comentario
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const texto = textarea.value.trim();
    const categoria = inputCategoria.value;
    if (!texto) {
      mostrarFeedback('El comentario no puede estar vacío', true);
      return;
    }
    const nuevoComentario = {
      id: Date.now().toString(), // ID único para el comentario
      userId: usuarioActualSimulado.id, // ID del usuario que crea el comentario
      nombre: usuarioActualSimulado.nombre, // Nombre del usuario
      avatar: '👤',
      categoria,
      texto,
      blooms: 0,
      fecha: Date.now()
    };
    comentarios.unshift(nuevoComentario);
    textarea.value = '';
    contador.textContent = '0/280';
    renderComentarios();
    mostrarFeedback('¡Comentario publicado!', false);
    actualizarGrafico();
    guardarComentariosEnLocalStorage(); // Guardar después de añadir
  });

  // Ordenamiento
  document.getElementById('orderSelect').addEventListener('change', function() {
    orden = this.value;
    paginaActual = 1;
    renderComentarios();
  });

  // Eventos delegados en la lista de comentarios (bloom, editar, eliminar, kebab)
  document.getElementById('commentsList').addEventListener('click', function(e) {
    const bloomBtn = e.target.closest('.bloom-btn');
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    const kebabBtn = e.target.closest('.kebab-btn');
    const saveEditBtn = e.target.closest('.save-edit-btn');
    const cancelEditBtn = e.target.closest('.cancel-edit-btn');

    if (bloomBtn) {
      const commentId = bloomBtn.dataset.id;
      const commentIndex = comentarios.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        comentarios[commentIndex].blooms++;
        guardarComentariosEnLocalStorage();
        renderComentarios(); // Re-render para actualizar blooms y orden si es necesario
        actualizarGrafico();
      }
    } else if (editBtn) {
      const commentId = editBtn.dataset.id;
      const commentCard = editBtn.closest('[data-comment-id]');
      handleEditarComentario(commentId, commentCard);
    } else if (deleteBtn) {
      const commentId = deleteBtn.dataset.id;
      handleEliminarComentario(commentId);
    } else if (kebabBtn) {
      e.stopPropagation(); // Evitar que el click se propague al document
      // Ocultar todos los menús kebab abiertos
      document.querySelectorAll('.kebab-menu').forEach(menu => {
        if (menu !== kebabBtn.nextElementSibling) {
          menu.classList.add('hidden');
        }
      });
      // Alternar el menú actual
      kebabBtn.nextElementSibling.classList.toggle('hidden');
    } else if (saveEditBtn) {
      const commentId = saveEditBtn.dataset.id;
      const commentCard = saveEditBtn.closest('[data-comment-id]');
      const textarea = commentCard.querySelector('.edit-area textarea');
      const nuevoTexto = textarea.value.trim();
      handleGuardarEdicion(commentId, nuevoTexto);
    } else if (cancelEditBtn) {
      const commentId = cancelEditBtn.dataset.id;
      const commentCard = cancelEditBtn.closest('[data-comment-id]');
      handleCancelarEdicion(commentCard);
    }
  });
  // Cerrar menús kebab si se hace clic fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.kebab-btn') && !e.target.closest('.kebab-menu')) {
      document.querySelectorAll('.kebab-menu').forEach(menu => menu.classList.add('hidden'));
    }
  });

  // Inicialización del gráfico
  const ctx = document.getElementById('participacionChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ideas', 'Problemas', 'Sugerencias'],
      datasets: [{
        label: 'Comentarios',
        data: [0, 0, 0],
        backgroundColor: ['#06b6d4', '#f59e42', '#22c55e']
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Cargar comentarios guardados
  cargarComentariosDesdeLocalStorage();

  // Render inicial
  renderComentarios();
  actualizarGrafico();
});

function guardarComentariosEnLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comentarios));
}

function cargarComentariosDesdeLocalStorage() {
  const comentariosGuardados = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (comentariosGuardados) {
    try {
      const parsedComentarios = JSON.parse(comentariosGuardados);
      // Asegurarse de que es un array
      if (Array.isArray(parsedComentarios)) {
        comentarios = parsedComentarios;
      } else {
        comentarios = [];
      }
    } catch (e) {
      console.error('Error al cargar comentarios desde localStorage:', e);
      comentarios = []; // Resetear si hay error de parseo
    }
  }
}

function renderComentarios() {
  const lista = document.getElementById('commentsList');
  lista.innerHTML = '';
  let datos = [...comentarios];
  if (orden === 'blooms') datos.sort((a, b) => b.blooms - a.blooms);
  else datos.sort((a, b) => b.fecha - a.fecha);
  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const paginados = datos.slice(inicio, fin);
  if (paginados.length === 0) {
    lista.innerHTML = '<div class="text-center text-neutral-400 py-10">Aún no hay comentarios.</div>';
    renderPaginacion(datos.length);
    return;
  }
  paginados.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'glass p-5 flex flex-col gap-2 shadow-lg animate__animated animate__fadeIn';
    card.dataset.commentId = c.id;
    const esPropio = c.userId === usuarioActualSimulado.id;
    card.innerHTML = `
      <div class="flex gap-4 items-start">
        <div class="flex-shrink-0">
          <span class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-2xl font-bold">${c.avatar ?? '👤'}</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <span class="font-semibold text-cyan-700">${c.nombre ?? 'Anónimo'}</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium ${c.categoria === 'idea' ? 'bg-cyan-100 text-cyan-700' : c.categoria === 'problema' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}">${c.categoria.charAt(0).toUpperCase() + c.categoria.slice(1)}</span>
            <span class="text-xs text-neutral-400 ml-auto" title="${new Date(c.fecha).toLocaleString('es-CL')}">${getRelativeTimeString(new Date(c.fecha))}</span>
            ${esPropio ? `
              <div class="relative ml-2">
                <button class="kebab-btn text-neutral-500 hover:text-cyan-600 p-1 rounded-full focus:outline-none" aria-label="Opciones">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="kebab-menu hidden absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button class="edit-btn block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="${c.id}"><i class="fas fa-edit mr-2"></i>Editar</button>
                  <button class="delete-btn block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" data-id="${c.id}"><i class="fas fa-trash mr-2"></i>Eliminar</button>
                </div>
              </div>
            ` : ''}
          </div>
          <div class="comment-text-display mb-2 text-neutral-700">${c.texto.replace(/</g, '&lt;')}</div>
          <div class="edit-area hidden mb-2">
            <textarea class="w-full p-2 border border-gray-300 rounded-md resize-none" rows="3"></textarea>
            <div class="mt-2 flex justify-end gap-2">
              <button class="cancel-edit-btn px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md" data-id="${c.id}">Cancelar</button>
              <button class="save-edit-btn px-3 py-1 text-sm bg-cyan-500 text-white hover:bg-cyan-600 rounded-md" data-id="${c.id}">Guardar</button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="bloom-btn flex items-center gap-1 text-yellow-500 hover:text-yellow-600 transition-all" data-id="${c.id}" aria-label="Apoyar comentario">
              <i class="fas fa-seedling"></i> <span>${c.blooms}</span>
            </button>
          </div>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });
  renderPaginacion(datos.length);
}

function renderPaginacion(total) {
  const pag = document.getElementById('paginacion');
  pag.innerHTML = '';
  const totalPag = Math.ceil(total / porPagina);
  for (let i = 1; i <= totalPag; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'px-3 py-1 rounded bg-white/70 border border-cyan-100 mx-1 ' + (i === paginaActual ? 'font-bold bg-cyan-100 text-cyan-700' : 'hover:bg-cyan-50');
    btn.onclick = () => { paginaActual = i; renderComentarios(); };
    btn.setAttribute('aria-label', `Página ${i}`);
    pag.appendChild(btn);
  }
}

function mostrarFeedback(msg, err) {
  const fb = document.getElementById('formFeedback');
  fb.textContent = msg;
  fb.className = 'mt-4 text-center text-sm animate__animated ' + (err ? 'text-red-500 animate__shakeX' : 'text-green-600 animate__fadeIn');
  setTimeout(() => { fb.textContent = ''; }, 2000);
}

function actualizarGrafico() {
  const ideas = comentarios.filter(c => c.categoria === 'idea').length;
  const problemas = comentarios.filter(c => c.categoria === 'problema').length;
  const sugerencias = comentarios.filter(c => c.categoria === 'sugerencia').length;
  if (chart) {
    chart.data.datasets[0].data = [ideas, problemas, sugerencias];
    chart.update();
  }
}



// --- Funciones para edición y eliminación de comentarios ---
function handleEditarComentario(commentId, commentCardElement) {
  const comment = comentarios.find(c => c.id === commentId);
  if (!comment || !commentCardElement) return;
  const textDisplay = commentCardElement.querySelector('.comment-text-display');
  const editArea = commentCardElement.querySelector('.edit-area');
  const textarea = editArea.querySelector('textarea');
  // Ocultar otros menús kebab
  document.querySelectorAll('.kebab-menu').forEach(menu => menu.classList.add('hidden'));
  textarea.value = comment.texto;
  textDisplay.classList.add('hidden');
  editArea.classList.remove('hidden');
  textarea.focus();
}

function handleGuardarEdicion(commentId, nuevoTexto) {
  if (!nuevoTexto) {
    mostrarFeedback('El comentario no puede estar vacío.', true);
    return;
  }
  const commentIndex = comentarios.findIndex(c => c.id === commentId);
  if (commentIndex !== -1) {
    comentarios[commentIndex].texto = nuevoTexto;
    guardarComentariosEnLocalStorage();
    renderComentarios();
    mostrarFeedback('Comentario actualizado.', false);
  }
}

function handleCancelarEdicion(commentCardElement) {
  if (!commentCardElement) return;
  const textDisplay = commentCardElement.querySelector('.comment-text-display');
  const editArea = commentCardElement.querySelector('.edit-area');
  textDisplay.classList.remove('hidden');
  editArea.classList.add('hidden');
}

function handleEliminarComentario(commentId) {
  document.querySelectorAll('.kebab-menu').forEach(menu => menu.classList.add('hidden'));
  if (confirm('¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.')) {
    comentarios = comentarios.filter(c => c.id !== commentId);
    guardarComentariosEnLocalStorage();
    renderComentarios();
    actualizarGrafico();
    mostrarFeedback('Comentario eliminado.', false);
  }
}

// Nueva función para crear un comentario visualmente atractivo y funcional
function createCommentElement(comment, usuarioActual) {
    const esPropio = usuarioActual && comment.userId === usuarioActual.id;
    const haDadoBloom = comment.blooms && comment.blooms.includes(usuarioActual?.id);
    const bloomCount = comment.blooms ? comment.blooms.length : 0;
    const categoriaColor = {
      'Idea': 'from-primary to-accent',
      'Problema': 'from-accent to-red-500',
      'Sugerencia': 'from-secondary to-primary'
    }[comment.categoria] || 'from-primary to-accent';

    const commentElement = document.createElement("div");
    commentElement.className = `glass-card comment relative group transition-shadow duration-300 hover:shadow-2xl`;
    commentElement.innerHTML = `
      <div class="flex items-center gap-3 mb-2">
        <img src="${comment.avatar || '/src/assets/images/missa.webp'}" alt="Avatar" class="w-12 h-12 rounded-full border-2 border-primary shadow">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-neutral-dark">${comment.username}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${categoriaColor} text-white ml-1">${comment.categoria}</span>
            ${esPropio ? '<span class="text-xs text-neutral-light ml-1">(Propio)</span>' : ''}
          </div>
          <span class="text-xs text-neutral-light">${getRelativeTimeString(new Date(comment.fecha))}</span>
        </div>
        <!-- Menú kebab -->
        <div class="relative">
          <button class="kebab-btn text-neutral-light hover:text-primary focus:outline-none p-2 rounded-full transition-all" aria-label="Opciones" tabindex="0">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="kebab-menu hidden absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-lg z-50 border border-neutral-light/30">
            ${esPropio ? `
              <button class="block w-full text-left px-4 py-2 hover:bg-neutral-light/20 text-neutral-dark edit-btn"><i class="fas fa-edit mr-2"></i>Editar</button>
              <button class="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 delete-btn"><i class="fas fa-trash mr-2"></i>Eliminar</button>
            ` : `
              <button class="block w-full text-left px-4 py-2 hover:bg-yellow-100 text-yellow-700 report-btn"><i class="fas fa-flag mr-2"></i>Reportar</button>
            `}
          </div>
        </div>
      </div>
      <div class="comment-content text-neutral-dark/90 mb-3">${comment.content}</div>
      <div class="flex items-center gap-3">
        <button class="bloom-btn flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold shadow hover:scale-105 focus:outline-none transition-all duration-200 ${haDadoBloom ? 'opacity-80 ring-2 ring-accent' : ''}" aria-pressed="${haDadoBloom}" tabindex="0">
          <i class="fas fa-seedling"></i>
          <span class="bloom-count">${bloomCount}</span>
          <span class="ml-1 text-xs">Bloom</span>
        </button>
      </div>
    `;

    // Lógica menú kebab
    const kebabBtn = commentElement.querySelector('.kebab-btn');
    const kebabMenu = commentElement.querySelector('.kebab-menu');
    kebabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.kebab-menu').forEach(m => m.classList.add('hidden'));
      kebabMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => kebabMenu.classList.add('hidden'));
    kebabMenu.addEventListener('click', e => e.stopPropagation());

    // Acciones menú
    if (esPropio) {
      kebabMenu.querySelector('.edit-btn').addEventListener('click', () => {
        // Lógica de edición (abrir modal o inline)
        showEditComment(comment);
      });
      kebabMenu.querySelector('.delete-btn').addEventListener('click', () => {
        showDeleteConfirm(comment);
      });
    } else {
      kebabMenu.querySelector('.report-btn').addEventListener('click', () => {
        showReportModal(comment);
      });
    }

    // Lógica bloom
    const bloomBtn = commentElement.querySelector('.bloom-btn');
    bloomBtn.addEventListener('click', async () => {
      try {
        if (!usuarioActual) return mostrarToast('Debes iniciar sesión', true);
        bloomBtn.disabled = true;
        if (haDadoBloom) {
          await window.comentariosApi.quitarBloom(comment.id);
          comment.blooms = comment.blooms.filter(id => id !== usuarioActual.id);
        } else {
          await window.comentariosApi.darBloom(comment.id);
          comment.blooms = [...(comment.blooms || []), usuarioActual.id];
        }
        bloomBtn.querySelector('.bloom-count').textContent = comment.blooms.length;
        bloomBtn.setAttribute('aria-pressed', String(!haDadoBloom));
        bloomBtn.classList.toggle('opacity-80');
        bloomBtn.classList.toggle('ring-2');
        bloomBtn.classList.toggle('ring-accent');
      } catch (err) {
        mostrarToast('Error al dar/quitar bloom', true);
      } finally {
        bloomBtn.disabled = false;
      }
    });

    return commentElement;
  }

// Inicialización moderna de comentarios
// (esto debe ejecutarse al cargar la página)
document.addEventListener("DOMContentLoaded", async function () {
  // Obtener usuario autenticado (si existe)
  let usuarioActual = null;
  try {
    usuarioActual = window.auth && window.auth.obtenerUsuarioActual ? window.auth.obtenerUsuarioActual() : null;
  } catch {}

  // Cargar comentarios desde la API
  const comments = await window.comentariosApi.obtenerComentarios();
  renderComments(comments, usuarioActual);

  // Configurar formulario de comentario
  const commentForm = document.getElementById("commentForm");
  const contador = document.getElementById("contadorComentario");
  const textarea = document.getElementById("comentarioTexto");
  const categoriaBtns = document.querySelectorAll('.categoria-btn');
  const inputCategoria = document.getElementById('categoriaSeleccionada');

  // Estado visual de selección de categoría
  categoriaBtns.forEach(b => b.classList.remove('ring-4', 'ring-primary', 'ring-accent', 'ring-secondary', 'scale-105', 'animate__pulse'));
  categoriaBtns.forEach(b => {
    b.addEventListener('click', function() {
      categoriaBtns.forEach(b => b.classList.remove('ring-4', 'ring-primary', 'ring-accent', 'ring-secondary', 'scale-105', 'animate__pulse'));
      this.classList.add('ring-4',
        this.dataset.categoria === 'idea' ? 'ring-primary' : this.dataset.categoria === 'problema' ? 'ring-accent' : 'ring-secondary',
        'scale-105', 'animate__pulse'
      );
      inputCategoria.value = this.dataset.categoria;
    });
  });
  // Selección inicial
  if (categoriaBtns.length) categoriaBtns[0].classList.add('ring-4', 'ring-primary', 'scale-105', 'animate__pulse');

  textarea.addEventListener('input', () => {
    contador.textContent = `${textarea.value.length}/280`;
  });
  commentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!usuarioActual) return mostrarToast('Debes iniciar sesión para comentar', true);
    const comentario = textarea.value;
    const categoria = inputCategoria.value;
    if (!comentario.trim()) return mostrarToast('El comentario no puede estar vacío', true);
    // Crear comentario en backend
    try {
      await window.comentariosApi.crearComentario({
        content: comentario,
        categoria
      });
      mostrarToast('Comentario publicado');
      // Recargar comentarios
      const updatedComments = await window.comentariosApi.obtenerComentarios();
      renderComments(updatedComments, usuarioActual);
      commentForm.reset();
      contador.textContent = '0/280';
      // Reset visual de categoría
      categoriaBtns.forEach(b => b.classList.remove('ring-4', 'ring-primary', 'ring-accent', 'ring-secondary', 'scale-105', 'animate__pulse'));
      if (categoriaBtns.length) categoriaBtns[0].classList.add('ring-4', 'ring-primary', 'scale-105', 'animate__pulse');
      inputCategoria.value = 'idea';
    } catch (err) {
      mostrarToast('Error al publicar el comentario', true);
    }
  });
});
