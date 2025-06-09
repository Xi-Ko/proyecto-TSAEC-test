// --- TSAEC Comentarios: Lógica principal (Refactorizada para API) ---

// Utilidad para fecha relativa (se mantiene)
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

// Mostrar feedback (se mantiene, pero puede ser mejorado o centralizado)
function mostrarToast(msg, err = false, duration = 3000) {
  const toastId = 'toast-feedback';
  let toastElement = document.getElementById(toastId);
  if (!toastElement) {
    toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = `fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white animate__animated`;
    document.body.appendChild(toastElement);
  }

  toastElement.textContent = msg;
  toastElement.className = `fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white animate__animated ${err ? 'bg-red-500 animate__shakeX' : 'bg-green-600 animate__fadeInUp'}`;

  toastElement.classList.remove('hidden');

  setTimeout(() => {
    toastElement.classList.add('animate__fadeOutDown');
    setTimeout(() => {
      toastElement.classList.add('hidden');
      toastElement.classList.remove('animate__fadeOutDown', 'animate__fadeInUp', 'animate__shakeX');
    }, 500);
  }, duration);
}


// Función para renderizar estrellas de calificación
function renderRatingStars(calificacion, maxStars = 5) {
  if (calificacion === null || calificacion === undefined) {
    return '<span class="text-xs text-neutral-400">Sin calificación</span>';
  }
  let starsHtml = '<div class="flex items-center">';
  for (let i = 1; i <= maxStars; i++) {
    starsHtml += `<i class="fas fa-star ${i <= calificacion ? 'text-yellow-400' : 'text-neutral-300'}"></i>`;
  }
  starsHtml += ` <span class="ml-1 text-xs text-neutral-500">(${calificacion}/${maxStars})</span>`;
  starsHtml += '</div>';
  return starsHtml;
}

// Creación de un elemento de comentario (adaptado de la sección "moderna")
function createCommentElement(comment, usuarioActual) {
  // Asegurarse de que comment.usuario existe y tiene nombre y avatar
  const userName = comment.Usuario ? comment.Usuario.nombre : 'Anónimo';
  const userAvatar = comment.Usuario ? comment.Usuario.avatar : '/src/assets/images/missa.webp'; // Usar avatar del usuario

  const esPropio = usuarioActual && comment.usuario_id === usuarioActual.id;
  const categoriaColorClass = {
    'idea': 'bg-cyan-100 text-cyan-700',
    'problema': 'bg-orange-100 text-orange-700',
    'sugerencia': 'bg-green-100 text-green-700'
  };
  const categoriaClass = categoriaColorClass[comment.categoria] || 'bg-gray-100 text-gray-700';

  const commentElement = document.createElement("div");
  commentElement.className = `glass p-5 flex flex-col gap-2 shadow-lg animate__animated animate__fadeIn mb-4`; // Usando clases de la sección antigua para consistencia visual temporal
  commentElement.dataset.commentId = comment.id;

  commentElement.innerHTML = `
    <div class="flex gap-4 items-start">
      <div class="flex-shrink-0">
        <img src="${userAvatar}" alt="Avatar de ${userName}" class="w-12 h-12 rounded-full object-cover border-2 border-primary-light">
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-1">
          <span class="font-semibold text-cyan-700">${userName}</span>
          <span class="px-2 py-0.5 rounded text-xs font-medium ${categoriaClass}">${comment.categoria.charAt(0).toUpperCase() + comment.categoria.slice(1)}</span>
          <span class="text-xs text-neutral-400 ml-auto" title="${new Date(comment.creado_en).toLocaleString('es-CL')}">${getRelativeTimeString(new Date(comment.creado_en))}</span>
          ${esPropio ? `
            <div class="relative ml-2">
              <button class="kebab-btn text-neutral-500 hover:text-cyan-600 p-1 rounded-full focus:outline-none" aria-label="Opciones">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div class="kebab-menu hidden absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <!-- Edit button can be re-added if edit functionality is implemented via API -->
                <!-- <button class="edit-btn block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="${comment.id}"><i class="fas fa-edit mr-2"></i>Editar</button> -->
                <button class="delete-btn block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" data-id="${comment.id}"><i class="fas fa-trash mr-2"></i>Eliminar</button>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="comment-text-display mb-2 text-neutral-700">${comment.contenido.replace(/</g, '&lt;')}</div>
        <div class="mb-2">
          ${renderRatingStars(comment.calificacion)}
        </div>
        <!-- Edit area can be re-added if edit functionality is implemented -->
        <!--
        <div class="edit-area hidden mb-2">
          <textarea class="w-full p-2 border border-gray-300 rounded-md resize-none" rows="3"></textarea>
          <div class="mt-2 flex justify-end gap-2">
            <button class="cancel-edit-btn px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md" data-id="${comment.id}">Cancelar</button>
            <button class="save-edit-btn px-3 py-1 text-sm bg-cyan-500 text-white hover:bg-cyan-600 rounded-md" data-id="${comment.id}">Guardar</button>
          </div>
        </div>
        -->
      </div>
    </div>
  `;

  // Lógica menú kebab
  const kebabBtn = commentElement.querySelector('.kebab-btn');
  const kebabMenu = commentElement.querySelector('.kebab-menu');
  if (kebabBtn) {
    kebabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Ocultar todos los otros menús kebab abiertos
      document.querySelectorAll('.kebab-menu').forEach(menu => {
        if (menu !== kebabMenu) {
          menu.classList.add('hidden');
        }
      });
      kebabMenu.classList.toggle('hidden');
    });
  }

  // Acciones menú (solo eliminar por ahora)
  if (esPropio) {
    const deleteBtn = commentElement.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
          try {
            // Se asume que window.comentariosApi.eliminarComentario(comment.id) existe y maneja la autenticación
            await window.comentariosApi.eliminarComentario(comment.id);
            mostrarToast('Comentario eliminado exitosamente.');
            commentElement.remove(); // Optimistic UI update
            // Opcional: Recargar todos los comentarios para consistencia total
            // loadAndRenderComments();
          } catch (err) {
            console.error('Error al eliminar comentario:', err);
            mostrarToast(err.message || 'Error al eliminar el comentario.', true);
          }
        }
        kebabMenu.classList.add('hidden'); // Cerrar menú después de la acción
      });
    }
    // const editBtn = commentElement.querySelector('.edit-btn');
    // if (editBtn) {
    //   editBtn.addEventListener('click', () => { /* Lógica para editar, llamando a una función que muestre un modal/formulario de edición y use la API */ });
    // }
  }

  // Cerrar menús kebab si se hace clic fuera
  // Este listener se moverá a nivel de documento para evitar múltiples adjuntos.
  // document.addEventListener('click', function(e) {
  //   if (!e.target.closest('.kebab-btn') && !e.target.closest('.kebab-menu')) {
  //     document.querySelectorAll('.kebab-menu').forEach(menu => menu.classList.add('hidden'));
  //   }
  // });


  return commentElement;
}

// Renderiza la lista de comentarios en el DOM
function renderCommentsUI(comments, usuarioActual) {
  const commentsListElement = document.getElementById('commentsList');
  commentsListElement.innerHTML = ''; // Limpiar lista anterior

  if (!comments || comments.length === 0) {
    commentsListElement.innerHTML = '<div class="text-center text-neutral-400 py-10">Aún no hay comentarios. ¡Sé el primero!</div>';
    return;
  }

  comments.forEach(comment => {
    const commentElem = createCommentElement(comment, usuarioActual);
    commentsListElement.appendChild(commentElem);
  });
}


// Carga y renderiza comentarios y actualiza paginación
async function loadAndRenderComments(page = 1, limit = 5, order = 'recientes') {
  const commentForm = document.getElementById('commentForm');
  const commentSubmitButton = commentForm ? commentForm.querySelector('button[type="submit"]') : null;
  if (commentSubmitButton) commentSubmitButton.disabled = true;

  try {
    // Se asume que window.comentariosApi.obtenerComentarios({pagina, limite, orden}) existe
    // y que el backend devuelve { comentarios: [], total: X, pagina_actual: Y, paginas: Z }
    const response = await window.comentariosApi.obtenerComentarios({ pagina: page, limite: limit, orden });

    let usuarioActual = null;
    if (window.auth && typeof window.auth.obtenerUsuarioActual === 'function') {
      usuarioActual = window.auth.obtenerUsuarioActual();
    }

    renderCommentsUI(response.comentarios, usuarioActual);
    renderPaginacionUI(response.total, response.pagina_actual, response.paginas, limit, order);

  } catch (error) {
    console.error('Error al cargar comentarios:', error);
    mostrarToast(error.message || 'No se pudieron cargar los comentarios.', true);
    const commentsListElement = document.getElementById('commentsList');
    commentsListElement.innerHTML = `<div class="text-center text-red-500 py-10">Error al cargar comentarios: ${error.message}</div>`;
  } finally {
    if (commentSubmitButton) commentSubmitButton.disabled = false;
  }
}

// Renderiza la paginación
function renderPaginacionUI(totalItems, currentPage, totalPages, limit, currentOrder) {
  const paginationContainer = document.getElementById('paginacion');
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.className = `px-3 py-1 rounded mx-1 ${i === currentPage ? 'font-bold bg-cyan-500 text-white' : 'bg-white/70 border border-cyan-100 hover:bg-cyan-50'}`;
    button.setAttribute('aria-label', `Ir a página ${i}`);
    if (i === currentPage) {
      button.setAttribute('aria-current', 'page');
    }
    button.addEventListener('click', () => {
      loadAndRenderComments(i, limit, currentOrder);
    });
    paginationContainer.appendChild(button);
  }
}


// Configuración del formulario de comentarios y otros listeners
function setupCommentFormAndListeners() {
  const commentForm = document.getElementById('commentForm');
  const textarea = document.getElementById('comentarioTexto');
  const contador = document.getElementById('contadorComentario');
  const categoriaBtns = document.querySelectorAll('.categoria-btn');
  const inputCategoria = document.getElementById('categoriaSeleccionada');
  const limpiarBtn = document.getElementById('limpiarComentario');
  const orderSelect = document.getElementById('orderSelect');
  const ratingStarsContainer = document.getElementById('ratingStars'); // Contenedor para estrellas de calificación

  let currentRating = 0; // Para almacenar la calificación seleccionada

  // --- Configuración de estrellas de calificación (si existe el contenedor) ---
  if (ratingStarsContainer) {
    for (let i = 1; i <= 5; i++) {
      const starIcon = document.createElement('i');
      starIcon.classList.add('fas', 'fa-star', 'text-2xl', 'text-neutral-300', 'cursor-pointer', 'hover:text-yellow-400', 'transition-colors');
      starIcon.dataset.value = i;
      starIcon.addEventListener('click', function() {
        currentRating = parseInt(this.dataset.value);
        // Actualizar visualización de estrellas
        ratingStarsContainer.querySelectorAll('i').forEach(icon => {
          icon.classList.toggle('text-yellow-400', parseInt(icon.dataset.value) <= currentRating);
          icon.classList.toggle('text-neutral-300', parseInt(icon.dataset.value) > currentRating);
        });
      });
      ratingStarsContainer.appendChild(starIcon);
    }
  }


  if (textarea && contador) {
    textarea.addEventListener('input', () => {
      contador.textContent = `${textarea.value.length}/280`;
    });
  }

  if (categoriaBtns.length && inputCategoria) {
    // Selección inicial (si no hay una ya seleccionada por defecto en HTML)
    if (!inputCategoria.value && categoriaBtns.length > 0) {
        inputCategoria.value = categoriaBtns[0].dataset.categoria; // Asignar valor por defecto
        categoriaBtns[0].classList.add('selected', 'ring-4', 'ring-primary'); // Marcar visualmente
    }
    // Aplicar clase 'selected' basada en inputCategoria.value si ya existe
    categoriaBtns.forEach(btn => {
        if (btn.dataset.categoria === inputCategoria.value) {
            btn.classList.add('selected', 'ring-4', btn.dataset.categoria === 'idea' ? 'ring-primary' : btn.dataset.categoria === 'problema' ? 'ring-accent' : 'ring-secondary');
        }
        btn.addEventListener('click', function() {
            categoriaBtns.forEach(b => b.classList.remove('selected', 'ring-4', 'ring-primary', 'ring-accent', 'ring-secondary'));
            this.classList.add('selected', 'ring-4', this.dataset.categoria === 'idea' ? 'ring-primary' : this.dataset.categoria === 'problema' ? 'ring-accent' : 'ring-secondary');
            inputCategoria.value = this.dataset.categoria;
        });
    });
  }


  if (limpiarBtn && textarea && contador) {
    limpiarBtn.addEventListener('click', () => {
      textarea.value = '';
      contador.textContent = '0/280';
      // Resetear estrellas de calificación
      if (ratingStarsContainer) {
        ratingStarsContainer.querySelectorAll('i').forEach(icon => {
          icon.classList.remove('text-yellow-400');
          icon.classList.add('text-neutral-300');
        });
      }
      currentRating = 0;
      textarea.focus();
    });
  }

  if (commentForm && textarea && inputCategoria) {
    commentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const contenido = textarea.value.trim();
      const categoria = inputCategoria.value;
      //const calificacion = currentRating; // Obtener de las estrellas

      let usuarioActual = null;
      if (window.auth && typeof window.auth.obtenerUsuarioActual === 'function') {
        usuarioActual = window.auth.obtenerUsuarioActual();
      }

      if (!usuarioActual) {
        mostrarToast('Debes iniciar sesión para comentar.', true);
        // Podrías redirigir a login o mostrar un modal de login
        // window.location.href = '/login.html';
        return;
      }

      if (!contenido) {
        mostrarToast('El comentario no puede estar vacío.', true);
        return;
      }
      if (!categoria) {
        mostrarToast('Debes seleccionar una categoría.', true);
        return;
      }
      // if (calificacion === 0) { // Opcional: requerir calificación
      //   mostrarToast('Por favor, asigna una calificación.', true);
      //   return;
      // }


      const commentData = {
        contenido,
        categoria,
        // Solo incluir calificacion si es mayor que 0
        ...(currentRating > 0 && { calificacion: currentRating })
      };

      const submitButton = commentForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        // Se asume que window.comentariosApi.crearComentario(data) existe y maneja la autenticación
        await window.comentariosApi.crearComentario(commentData);
        mostrarToast('¡Comentario publicado exitosamente!');
        textarea.value = '';
        contador.textContent = '0/280';
        // Resetear estrellas
        if (ratingStarsContainer) {
            ratingStarsContainer.querySelectorAll('i').forEach(icon => {
                icon.classList.remove('text-yellow-400');
                icon.classList.add('text-neutral-300');
            });
        }
        currentRating = 0;
        // Recargar comentarios para mostrar el nuevo (idealmente desde la página 1 del orden actual)
        const currentOrder = orderSelect ? orderSelect.value : 'recientes';
        loadAndRenderComments(1, 5, currentOrder);

      } catch (err) {
        console.error('Error al publicar comentario:', err);
        mostrarToast(err.message || 'Error al publicar el comentario.', true);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  if (orderSelect) {
    orderSelect.addEventListener('change', function() {
      const currentOrder = this.value;
      loadAndRenderComments(1, 5, currentOrder); // Cargar página 1 con el nuevo orden
    });
  }

  // Listener global para cerrar menús kebab
  document.addEventListener('click', function(e) {
    const openKebabMenu = document.querySelector('.kebab-menu:not(.hidden)');
    if (openKebabMenu && !e.target.closest('.kebab-btn') && !e.target.closest('.kebab-menu')) {
      openKebabMenu.classList.add('hidden');
    }
  });
}


// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si las APIs necesarias están disponibles
  if (!window.comentariosApi || typeof window.comentariosApi.obtenerComentarios !== 'function' || typeof window.comentariosApi.crearComentario !== 'function') {
    console.error('Error: window.comentariosApi no está disponible o incompleto.');
    mostrarToast('Error crítico: La API de comentarios no está disponible. Funcionalidad limitada.', true, 10000);
    // Podrías deshabilitar el formulario de comentarios aquí o mostrar un mensaje más persistente
    const commentForm = document.getElementById('commentForm');
    if(commentForm) commentForm.style.display = 'none';
    const commentsList = document.getElementById('commentsList');
    if(commentsList) commentsList.innerHTML = '<div class="text-center text-red-600 font-bold py-10">Error: No se puede conectar con el servicio de comentarios.</div>';
    return;
  }

  if (!window.auth || typeof window.auth.obtenerUsuarioActual !== 'function' /*|| typeof window.auth.getToken !== 'function'*/) {
    // Nota: getToken puede ser manejado internamente por comentariosApi.
    console.warn('Advertencia: window.auth no está disponible o incompleto. Funciones de usuario pueden estar limitadas.');
    // No necesariamente un error fatal si los comentarios se pueden ver sin estar logueado.
  }

  setupCommentFormAndListeners();
  const initialOrder = document.getElementById('orderSelect') ? document.getElementById('orderSelect').value : 'recientes';
  loadAndRenderComments(1, 5, initialOrder); // Cargar comentarios iniciales
});

// Nota: El gráfico (actualizarGrafico) ha sido omitido ya que su fuente de datos (comentarios globales) fue eliminada.
// Si se necesita, debería ser reimplementado para usar datos de la API.
// La funcionalidad de edición de comentarios (handleEditarComentario, handleGuardarEdicion, handleCancelarEdicion)
// también ha sido omitida en esta refactorización inicial. Si se requiere,
// se debe implementar usando llamadas a una API `updateComentario(commentId, data)`.
// El botón de editar en la plantilla del comentario está comentado.
// La funcionalidad de "Reportar" del menú kebab para comentarios no propios también necesitaría su propia lógica y API.
// El sistema de "Blooms" original fue eliminado en favor de la "calificacion" (rating) que ahora se muestra.
// La UI para seleccionar la calificación (estrellas) se ha añadido al formulario.
