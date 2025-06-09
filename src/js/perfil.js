// Funciones para manejar el perfil de usuario con el backend
const API_URL = 'http://localhost:4000/api';

// Función para obtener el perfil del usuario actual
async function obtenerPerfil() {
  if (!window.auth.estaAutenticado()) {
    window.location.href = '/src/pages/cuenta.html';
    return;
  }
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }
  
  try {
    const response = await fetch(`${API_URL}/perfil`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener perfil');
    }
    
    return data.perfil;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

// Función para actualizar el perfil del usuario
async function actualizarPerfil(datosActualizados) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }
  
  try {
    const response = await fetch(`${API_URL}/perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datosActualizados)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al actualizar perfil');
    }
    
    return data.perfil;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
}

// Función para cambiar la contraseña
async function cambiarContrasena(contrasenaActual, nuevaContrasena) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/cambiar-contrasena`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        contrasenaActual,
        nuevaContrasena
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al cambiar contraseña');
    }
    
    return data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
}

// Función para eliminar la cuenta
async function eliminarCuenta(contrasena) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }
  
  try {
    const response = await fetch(`${API_URL}/perfil`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        contrasena
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al eliminar cuenta');
    }
    
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    return data;
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    throw error;
  }
}

// Permitir subir/cambiar avatar
function actualizarAvatar(avatarUrl) {
  const usuario = window.auth.obtenerUsuarioActual();
  if (usuario) {
    usuario.avatar = avatarUrl;
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('user_avatar', avatarUrl);
  }
}

// Exportar funciones
window.perfil = {
  obtenerPerfil,
  // Mostrar siempre el perfil del usuario autenticado
  mostrarPerfilAutenticado: function() {
    const usuario = window.auth.obtenerUsuarioActual();
    if (usuario) {
      document.getElementById('nombre-usuario-perfil').textContent = usuario.nombre;
      document.getElementById('email-usuario-perfil').textContent = usuario.email;
    }
  },
  actualizarPerfil,
  cambiarContrasena,
  eliminarCuenta
};
