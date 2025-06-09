// Componente de Perfil Rápido Flotante
(function() {
  // Función para inicializar el perfil rápido
  function initQuickProfile() {
    // Cargar el HTML del perfil rápido
    fetch('/src/components/quick-profile/quick-profile.html')
      .then(response => response.text())
      .then(html => {
        // Añadir el HTML al final del body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Configurar eventos después de cargar el HTML
        setupQuickProfileEvents();
      })
      .catch(error => console.error('Error al cargar el perfil rápido:', error));
  }
  
  // Configurar eventos del perfil rápido
  function setupQuickProfileEvents() {
    // Elementos DOM
    const modal = document.getElementById('quick-profile-modal');
    const container = document.getElementById('quick-profile-container');
    const handle = document.getElementById('quick-profile-handle');
    const closeBtn = document.getElementById('quick-profile-close');
    const openBtns = [
      document.getElementById('quick-profile-btn'),
      document.getElementById('quick-profile-btn-mobile')
    ].filter(Boolean);
    
    // Cargar datos del perfil
    loadProfileData();
    
    // Evento para abrir el perfil
    openBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          // Verificar si el usuario está autenticado
          const usuario = localStorage.getItem('usuario');
          if (!usuario) {
            alert('Debes iniciar sesión para ver tu perfil.');
            window.location.href = '/src/pages/cuenta.html';
            return;
          }
          modal.classList.remove('hidden');
          // Efecto de entrada
          container.style.animation = 'fadeInDown 0.3s ease-out forwards';
        });
      }
    });
    
    // Evento para cerrar el perfil
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // Efecto de salida
        container.style.animation = 'fadeOutUp 0.2s ease-in forwards';
        setTimeout(() => {
          modal.classList.add('hidden');
        }, 200);
      });
    }
    
    // Cerrar al hacer clic fuera del contenedor
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          // Efecto de salida
          container.style.animation = 'fadeOutUp 0.2s ease-in forwards';
          setTimeout(() => {
            modal.classList.add('hidden');
          }, 200);
        }
      });
    }
    
    // Funcionalidad para arrastrar la ventana
    if (handle && container) {
      let isDragging = false;
      let offsetX, offsetY;
      
      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: false });
      
      function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        
        // Obtener la posición inicial
        if (e.type === 'touchstart') {
          offsetX = e.touches[0].clientX - container.getBoundingClientRect().left;
          offsetY = e.touches[0].clientY - container.getBoundingClientRect().top;
        } else {
          offsetX = e.clientX - container.getBoundingClientRect().left;
          offsetY = e.clientY - container.getBoundingClientRect().top;
        }
        
        // Añadir eventos de movimiento y finalización
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        
        // Añadir clase de arrastre activo
        handle.classList.add('cursor-grabbing');
      }
      
      function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        // Calcular nueva posición
        const left = clientX - offsetX;
        const top = clientY - offsetY;
        
        // Limitar al viewport
        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;
        
        const boundedLeft = Math.max(0, Math.min(left, maxX));
        const boundedTop = Math.max(0, Math.min(top, maxY));
        
        // Aplicar nueva posición
        container.style.left = boundedLeft + 'px';
        container.style.top = boundedTop + 'px';
        container.style.right = 'auto';
        container.style.transform = 'none';
      }
      
      function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        
        // Quitar clase de arrastre activo
        handle.classList.remove('cursor-grabbing');
      }
    }
  }
  
  // Cargar datos del perfil desde localStorage
  function loadProfileData() {
    // Elementos DOM
    const avatar = document.getElementById('quick-profile-avatar');
    const name = document.getElementById('quick-profile-name');
    const level = document.getElementById('quick-profile-level');
    const comments = document.getElementById('quick-profile-comments');
    const likes = document.getElementById('quick-profile-likes');
    
    // Datos del perfil (desde localStorage o valores por defecto)
    const userData = {
      avatar: localStorage.getItem('user_avatar') || '/src/assets/images/missa.webp',
      name: localStorage.getItem('user_nombre') || 'María Martínez',
      level: localStorage.getItem('user_nivel') || 'Ecologista',
      comments: localStorage.getItem('user_comentarios') || '14',
      likes: localStorage.getItem('user_likes') || '82'
    };
    
    // Actualizar la UI
    if (avatar) avatar.src = userData.avatar;
    if (name) name.textContent = userData.name;
    if (level) level.textContent = userData.level;
    if (comments) comments.textContent = userData.comments;
    if (likes) likes.textContent = userData.likes;
  }
  
  // Añadir estilos CSS para animaciones
  function addAnimationStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translate(0, -20px);
        }
        to {
          opacity: 1;
          transform: translate(0, 0);
        }
      }
      
      @keyframes fadeOutUp {
        from {
          opacity: 1;
          transform: translate(0, 0);
        }
        to {
          opacity: 0;
          transform: translate(0, -20px);
        }
      }
      
      .cursor-grabbing {
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  // Añadir estilos de animación al cargar
  addAnimationStyles();
  
  // Exponer la función de inicialización globalmente
  window.initQuickProfile = initQuickProfile;
})();
