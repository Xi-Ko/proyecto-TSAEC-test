// Configuración del visor PDF.js
window.addEventListener("load", function () {
  // Obtener el iframe del visor
  const viewer = document.getElementById("pdf-viewer");

  // Configurar opciones del visor
  const viewerOptions = {
    // Configuración de la barra de herramientas
    toolbar: {
      toolbarViewerLeft: {
        visible: false,
      },
      toolbarViewerRight: {
        visible: false,
      },
      toolbarViewerMiddle: {
        visible: false,
      },
    },
    // Configuración del tema
    theme: {
      // Colores personalizados
      primary: "#2ecc71",
      secondary: "#27ae60",
    },
    // Configuración de la vista
    view: {
      // Zoom inicial
      initialZoom: 1.0,
      // Mostrar miniaturas
      showThumbnails: false,
      // Mostrar marcadores
      showBookmarks: false,
    },
  };

  // Aplicar configuración cuando el iframe esté listo
  viewer.addEventListener("load", function () {
    const viewerWindow = viewer.contentWindow;
    if (viewerWindow.PDFViewerApplication) {
      viewerWindow.PDFViewerApplication.initialize(viewerOptions);
    }
  });
});
