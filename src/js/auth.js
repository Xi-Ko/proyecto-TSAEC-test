// Funciones para manejar la autenticación con el backend
const API_URL = 'http://localhost:4000/api';

// Función para registrar un nuevo usuario
async function registrarUsuario(usuario, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: usuario,
        email: email,
        password: password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al registrar usuario');
    }
    
    // Guardar el token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify({
        id: data.usuario.id,
        nombre: data.usuario.nombre,
        email: data.usuario.email
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
}

// Función para iniciar sesión
async function iniciarSesion(usuarioOCorreo, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuarioOCorreo: usuarioOCorreo,
        password: password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al iniciar sesión');
    }
    
    // Guardar el token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify({
        id: data.usuario.id,
        nombre: data.usuario.nombre,
        email: data.usuario.email
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    throw error;
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  // Redirigir a la página de inicio
  window.location.href = '/index.html';
}

// Función para verificar si el usuario está autenticado
function estaAutenticado() {
  const token = localStorage.getItem('token');
  return !!token; // Devuelve true si hay un token, false si no
}

// Función para obtener el usuario actual
function obtenerUsuarioActual() {
  const usuarioJSON = localStorage.getItem('usuario');
  return usuarioJSON ? JSON.parse(usuarioJSON) : null;
}

// Función para verificar el token con el backend
async function verificarToken() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/verificar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return false;
  }
}

// Función para proteger rutas que requieren autenticación
function protegerRuta() {
  if (!estaAutenticado()) {
    // Guardar la URL actual para redirigir después del login
    localStorage.setItem('redireccion', window.location.pathname);
    // Redirigir a la página de login
    window.location.href = '/src/pages/cuenta.html';
    return false;
  }
  return true;
}

// Función para redirigir al usuario después del login si hay una URL guardada
function redirigirDespuesDeLogin() {
  const redireccion = localStorage.getItem('redireccion');
  if (redireccion) {
    localStorage.removeItem('redireccion');
    window.location.href = redireccion;
  } else {
    window.location.href = '/index.html';
  }
}

// Exportar funciones
window.auth = {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  estaAutenticado,
  obtenerUsuarioActual,
  verificarToken,
  protegerRuta,
  redirigirDespuesDeLogin
};
