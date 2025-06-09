// Funciones para manejar los comentarios con el backend
const API_URL = 'http://localhost:4000/api';

// Función para obtener todos los comentarios
async function obtenerComentarios() {
  try {
    const response = await fetch(`${API_URL}/comentarios`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener comentarios');
    }
    
    return data.comentarios;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    throw error;
  }
}

// Función para crear un nuevo comentario
async function crearComentario(texto, categoria) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Debes iniciar sesión para comentar');
  }
  
  try {
    const response = await fetch(`${API_URL}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        texto,
        categoria
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al crear comentario');
    }
    
    return data.comentario;
  } catch (error) {
    console.error('Error al crear comentario:', error);
    throw error;
  }
}

// Función para responder a un comentario
async function responderComentario(comentarioId, texto) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Debes iniciar sesión para responder');
  }
  
  try {
    const response = await fetch(`${API_URL}/comentarios/${comentarioId}/respuestas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        texto
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al responder comentario');
    }
    
    return data.respuesta;
  } catch (error) {
    console.error('Error al responder comentario:', error);
    throw error;
  }
}

// Función para dar like a un comentario
async function darLike(comentarioId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Debes iniciar sesión para dar like');
  }
  
  try {
    const response = await fetch(`${API_URL}/comentarios/${comentarioId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al dar like');
    }
    
    return data;
  } catch (error) {
    console.error('Error al dar like:', error);
    throw error;
  }
}

// Función para reportar un comentario
async function reportarComentario(comentarioId, motivo) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Debes iniciar sesión para reportar');
  }
  
  try {
    const response = await fetch(`${API_URL}/comentarios/${comentarioId}/reportar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        motivo
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al reportar comentario');
    }
    
    return data;
  } catch (error) {
    console.error('Error al reportar comentario:', error);
    throw error;
  }
}

// Función para editar un comentario
async function editarComentario(comentarioId, texto) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Debes iniciar sesión para editar');
  }
  
  try {
    const response = await fetch(`${API_URL}/comentarios/${comentarioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        texto
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al editar comentario');
    }
    
    return data.comentario;
  } catch (error) {
    console.error('Error al editar comentario:', error);
    throw error;
  }
}

// Función para eliminar un comentario
async function eliminarComentario(comentarioId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Debes iniciar sesión para eliminar');
  }
  
  try {
    const response = await fetch(`${API_URL}/comentarios/${comentarioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al eliminar comentario');
    }
    
    return data;
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    throw error;
  }
}

// Exportar funciones
window.comentariosApi = {
  obtenerComentarios,
  crearComentario,
  responderComentario,
  darLike,
  reportarComentario,
  editarComentario,
  eliminarComentario
};
