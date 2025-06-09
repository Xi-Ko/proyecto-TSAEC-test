// Header Component JavaScript - Actualizado para Tailwind CSS
(function () {
  // Variables para el scroll
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  // Cargar el script del perfil rápido
  function loadQuickProfileScript() {
    const script = document.createElement('script');
    script.src = '/src/components/quick-profile/quick-profile.js';
    document.head.appendChild(script);
  }
  
  // Cargar el script al inicializar
  loadQuickProfileScript();

  // Inicializar el menú
  function initHeaderMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const header = document.querySelector(".header-wave");
    const navLinks = document.querySelectorAll('.mobile-menu a');
    let isMenuOpen = false;

    if (!menuToggle || !mobileMenu || !header) return;

    // Función para cerrar el menú
    function closeMobileMenu() {
      const menuToggle = document.querySelector(".menu-toggle");
      const mobileMenu = document.querySelector(".mobile-menu");
      const spans = menuToggle?.querySelectorAll("span");
      
      if (!menuToggle || !mobileMenu) return;
      
      isMenuOpen = false;
      menuToggle.setAttribute("aria-expanded", "false");
      mobileMenu.style.maxHeight = "0";
      
      // Restaurar ícono de hamburguesa
      if (spans && spans.length === 3) {
        spans[0].style.transform = "";
        spans[1].style.opacity = "";
        spans[2].style.transform = "";
      }
      
      // Eliminar la clase de overflow-hidden del body después de la transición
      setTimeout(() => {
        document.body.classList.remove('overflow-hidden');
        mobileMenu.classList.add('hidden');
      }, 300);
    }
    
    // Cerrar menú al hacer clic fuera de él
    function handleClickOutside(event) {
      if (isMenuOpen && !menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        closeMobileMenu();
      }
    }
    
    // Cerrar menú al presionar la tecla Escape
    function handleEscapeKey(event) {
      if (isMenuOpen && event.key === 'Escape') {
        closeMobileMenu();
      }
    }

    // Toggle del menú móvil
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      isMenuOpen = !expanded;
      menuToggle.setAttribute("aria-expanded", !expanded);
      
      // Animar el ícono del hamburger
      const spans = menuToggle.querySelectorAll("span");
      if (spans.length === 3) {
        if (!expanded) {
          // Cambiar a X
          spans[0].style.transform = "translateY(8px) rotate(45deg)";
          spans[1].style.opacity = "0";
          spans[2].style.transform = "translateY(-8px) rotate(-45deg)";
        } else {
          // Restaurar hamburger
          spans[0].style.transform = "";
          spans[1].style.opacity = "";
          spans[2].style.transform = "";
        }
      }
      
      // Mostrar/ocultar menú con animación
      if (!expanded) {
        document.body.classList.add('overflow-hidden');
        mobileMenu.classList.remove("hidden");
        // Usar requestAnimationFrame para asegurar que el navegador procese el cambio de display
        requestAnimationFrame(() => {
          mobileMenu.style.maxHeight = `${mobileMenu.scrollHeight}px`;
          
          // Agregar event listeners para cerrar el menú
          document.addEventListener('click', handleClickOutside);
          document.addEventListener('keydown', handleEscapeKey);
        });
      } else {
        mobileMenu.style.maxHeight = "0px";
        // Esperar a que termine la animación antes de ocultar
        mobileMenu.addEventListener("transitionend", function handler() {
          if (mobileMenu.style.maxHeight === "0px") {
            mobileMenu.classList.add("hidden");
            document.body.classList.remove('overflow-hidden');
            mobileMenu.removeEventListener("transitionend", handler);
          }
        });
        
        // Remover event listeners cuando el menú está cerrado
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      }
    });

    // Cerrar menú al hacer click en un link del menú móvil
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    // Resaltar link activo
    const currentPage = window.location.pathname;
    const allNavLinks = document.querySelectorAll(".nav-item a, .mobile-menu a");
    
    allNavLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPage || 
          (currentPage === "/" && href === "/index.html") ||
          (currentPage !== "/" && href !== "/index.html" && currentPage.includes(href))) {
        link.classList.add("text-primary", "bg-primary/10");
        link.setAttribute("aria-current", "page");
      }
    });
    
    // Ajustar el header cuando cambia el tamaño de la ventana
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        mobileMenu.classList.add("hidden");
        mobileMenu.style.maxHeight = "0px";
        menuToggle.setAttribute("aria-expanded", "false");
        // Restaurar hamburger
        const spans = menuToggle.querySelectorAll("span");
        if (spans.length === 3) {
          spans[0].style.transform = "";
          spans[1].style.opacity = "";
          spans[2].style.transform = "";
        }
      }
    });
  }

  // Control de scroll del header
  function initScrollBehavior() {
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const header = document.querySelector(".header-wave");
          if (!header) return;

          // Cambia la apariencia basada en el scroll
          if (window.scrollY > 100) {
            header.classList.add("bg-white", "shadow-md");
            header.classList.remove("bg-transparent");
          } else {
            header.classList.add("bg-transparent");
            header.classList.remove("bg-white", "shadow-md");
          }
          
          // Ocultar/mostrar el header basado en la dirección del scroll
          if (window.scrollY > lastScrollY && window.scrollY > 100) {
            header.style.transform = "translateY(-100%)";
          } else {
            header.style.transform = "translateY(0)";
          }

          lastScrollY = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Obtener datos del perfil
  function getUserProfile() {
    // Usar datos del usuario autenticado si existen
    const usuario = window.auth && window.auth.obtenerUsuarioActual && window.auth.obtenerUsuarioActual();
    return {
      avatar:
        (usuario && usuario.avatar) || localStorage.getItem("user_avatar") || (usuario && usuario.foto) || "/src/assets/images/missa.webp",
      nombre: (usuario && usuario.nombre) || localStorage.getItem("user_nombre") || "Usuario TSAEC",
      comentarios: Number(localStorage.getItem("user_comentarios") || 0),
      apoyos: Number(localStorage.getItem("user_apoyos") || 0),
      sugerencias: Number(localStorage.getItem("user_sugerencias") || 0),
      email: (usuario && usuario.email) || ""
    };
  }

  // Mostrar popup del perfil
  function showQuickProfilePopup() {
    if (document.querySelector(".quick-profile-popup")) return;

    const user = getUserProfile(); // Hacer el tamaño responsive basado en el ancho de la pantalla
    const winWidth = Math.min(440, window.innerWidth * 0.9);
    const winHeight = Math.min(420, window.innerHeight * 0.9);
    const left = Math.max(0, (window.innerWidth - winWidth) / 2);
    const top = Math.max(40, (window.innerHeight - winHeight) / 2);

    const win = document.createElement("div");
    win.className = "floating-window quick-profile-popup";
    win.style.cssText = `
            z-index: 3000;
            width: ${winWidth}px;
            max-width: 90vw;
            left: ${left}px;
            top: ${top}px;
            transform: translate3d(0,0,0);
            touch-action: none;
        `;

    win.innerHTML = `
            <div class="browser-tab browser-tab-floating">
                <span class="tab-title"><span class="tab-icon">🌐</span> Perfil rápido</span>
                <button class="window-close" title="Cerrar">&#10005;</button>
            </div>
            <div class="window-content text-center">
                <img src="${user.avatar}" alt="Avatar" class="profile-avatar rounded-full shadow-lg mx-auto mb-3" style="width:90px;height:90px;object-fit:cover;" />
                <div class="profile-name text-xl font-semibold mb-1">${user.nombre}</div>
                <div class="text-neutral-medium text-xs mb-2">${user.email || ''}</div>
                <div class="profile-stats flex justify-center gap-4 mb-4">
                    <span><b>${user.comentarios}</b> <span class="text-xs">comentarios</span></span>
                    <span><b>${user.apoyos}</b> <span class="text-xs">apoyos</span></span>
                    <span><b>${user.sugerencias}</b> <span class="text-xs">sugerencias</span></span>
                </div>
                <div class="flex flex-col gap-2">
                  <button class="profile-config-btn btn-primary w-full py-2 rounded-lg">Editar perfil</button>
                  <button class="logout-btn w-full py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Cerrar sesión</button>
                </div>
            </div>
        `;

    document.body.appendChild(win); // Cerrar ventana - mejorado para soporte táctil
    const closeButton = win.querySelector(".window-close");
    if (closeButton) {
      // Soporte para click del mouse
      closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        win.remove();
      });

      // Soporte para eventos táctiles
      closeButton.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          win.remove();
        },
        { passive: false }
      );
    }

    // Traer al frente al hacer click
    win.addEventListener("mousedown", () => {
      win.style.zIndex = ++window.zCounter || 3001;
    }); // Funcionalidad de arrastrar
    const titlebar = win.querySelector(".browser-tab");
    let offsetX,
      offsetY,
      dragging = false;
    function moveWindow(clientX, clientY) {
      let x = clientX - offsetX;
      let y = clientY - offsetY;

      // Permitir que la ventana se mueva hasta que al menos un 20% sea visible
      const maxX = window.innerWidth - win.offsetWidth;
      const maxY = window.innerHeight - win.offsetHeight;
      x = Math.max(
        -win.offsetWidth * 0.8,
        Math.min(x, maxX + win.offsetWidth * 0.8)
      );
      y = Math.max(
        -win.offsetHeight * 0.8,
        Math.min(y, maxY + win.offsetHeight * 0.8)
      );

      requestAnimationFrame(() => {
        win.style.left = x + "px";
        win.style.top = y + "px";
      });
    }

    // Eventos de mouse
    titlebar.addEventListener("mousedown", (e) => {
      dragging = true;
      win.style.zIndex = ++window.zCounter || 3001;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      moveWindow(e.clientX, e.clientY);
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
      document.body.style.userSelect = "";
    }); // Eventos táctiles mejorados
    let lastTouch = null;
    titlebar.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          dragging = true;
          win.style.zIndex = ++window.zCounter || 3001;
          const rect = win.getBoundingClientRect();
          const touch = e.touches[0];
          offsetX = touch.clientX - rect.left;
          offsetY = touch.clientY - rect.top;
          lastTouch = touch;
          document.body.style.userSelect = "none";
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging || e.touches.length !== 1) return;
        const touch = e.touches[0];

        // Calcular el delta del movimiento
        if (lastTouch) {
          const deltaX = touch.clientX - lastTouch.clientX;
          const deltaY = touch.clientY - lastTouch.clientY;

          // Si el movimiento es significativo, prevenir el scroll
          if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            e.preventDefault();
          }
        }

        moveWindow(touch.clientX, touch.clientY);
        lastTouch = touch;
      },
      { passive: false }
    );

    document.addEventListener("touchend", () => {
      dragging = false;
      lastTouch = null;
      document.body.style.userSelect = "";
    });

    // Ir a perfil completo
    win.querySelector(".profile-config-btn").onclick = () => {
      window.location.href = "/src/pages/perfil.html";
    };
    // Cerrar sesión
    win.querySelector(".logout-btn").onclick = () => {
      if (window.auth && window.auth.cerrarSesion) {
        window.auth.cerrarSesion();
      } else {
        localStorage.clear();
        window.location.href = "/src/pages/cuenta.html";
      }
    };
    // Cerrar sesión
    win.querySelector('#quick-logout-btn').onclick = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('user_avatar');
      window.location.href = '/index.html';
    };
    // Cambiar avatar
    const avatarImg = win.querySelector('#quick-profile-avatar');
    const avatarInput = win.querySelector('#quick-profile-avatar-input');
    avatarImg.onclick = () => avatarInput.click();
    avatarInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        localStorage.setItem('user_avatar', evt.target.result);
        avatarImg.src = evt.target.result;
        // Si el usuario está autenticado, actualiza también el objeto usuario
        const usuario = window.auth && window.auth.obtenerUsuarioActual && window.auth.obtenerUsuarioActual();
        if (usuario) {
          usuario.avatar = evt.target.result;
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }
      };
      reader.readAsDataURL(file);
    };

  }

  // Inicializar perfil rápido
  function initQuickProfile() {
    // Manejar clic en el botón de perfil del escritorio
    const desktopBtn = document.getElementById("profile-btn");
    if (desktopBtn) {
      desktopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Si no está autenticado, redirigir a login
        if (!window.auth || !window.auth.estaAutenticado || !window.auth.estaAutenticado()) {
          window.location.href = '/src/pages/cuenta.html';
          return;
        }
        showQuickProfilePopup();
      });
    }
    
    // Manejar clic en el botón de perfil móvil
    const mobileBtn = document.getElementById("profile-btn-mobile");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Si no está autenticado, redirigir a login
        if (!window.auth || !window.auth.estaAutenticado || !window.auth.estaAutenticado()) {
          window.location.href = '/src/pages/cuenta.html';
          return;
        }
        // Cerrar el menú móvil si está abierto
        closeMobileMenu();
        showQuickProfilePopup();
      });
    }
    
    // Cerrar el menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.mobile-menu a:not(#profile-btn-mobile)');
    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Exponer funciones necesarias globalmente
  window.initHeaderMenu = initHeaderMenu;
  window.initQuickProfile = initQuickProfile;
  window.initScrollBehavior = initScrollBehavior;
  window.closeMobileMenu = closeMobileMenu;
  window.showQuickProfilePopup = showQuickProfilePopup;

  // Inicialización automática cuando el DOM está listo
  document.addEventListener("DOMContentLoaded", initHeaderMenu);
})();
