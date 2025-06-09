document.addEventListener("DOMContentLoaded", function(event) {
    const contenedor_preferencias = document.getElementById("preferencias")
    
    contenedor_preferencias = document.getElementById("preferencias")

    contenedor_preferencias.innerHTML = `
    <h4>Cookies aceptadas: ${localStorage.getItem("cookies") ??  "no registradas"}</h4>
    <h4>nombre: ${localStorage.setItem("nombre-usuario")}</h4>
    <h4>edad:  ${localStorage.setItem("edad")}</h4>
    <h4>genero:  ${localStorage.setItem("genero")}</h4>

    `     
    })