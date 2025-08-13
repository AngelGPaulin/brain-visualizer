import { Niivue } from '@niivue/niivue';
import { DataLoader } from "./core/DataLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const dataLoader = new DataLoader();

  // Referencias a los elementos del DOM
  const uiElements = {
    niiUploadForm: document.getElementById("nii-upload-form"),
    anatomicalFile: document.getElementById("anatomical-file"),
    atlasFile: document.getElementById("atlas-file"),
    statsFile: document.getElementById("stats-file"),
    submitNiiBtn: document.getElementById("submit-nii-btn"),
    loadingOverlay: document.getElementById("loading-overlay"),
    niiControls: document.getElementById("nii-controls"),
    toggleViewBtn: document.getElementById("toggle-view-btn"),
    atlasSlider: document.getElementById("atlasSlider"),
    statSlider: document.getElementById("statSlider"),
  };

  // ✅ **CAMBIO CLAVE**: Creamos UNA SOLA instancia de Niivue y la reutilizamos.
  const niivue = new Niivue({
    show3Dcrosshair: true,
    dragAndDropEnabled: true, // Habilitamos drag-and-drop como una opción extra
  });
  niivue.attachToCanvas(document.getElementById("nii-canvas"));
  
  let isNiiMultiplanar = true;

  /**
   * Carga una nueva lista de volúmenes en la instancia existente de Niivue.
   */
  async function loadVolumes(volumeList) {
    uiElements.loadingOverlay.style.display = "flex";

    try {
      // No se crea ni se destruye, solo se cargan los nuevos volúmenes.
      await niivue.loadVolumes(volumeList);
      niivue.setSliceType(niivue.sliceTypeMultiplanar);

      uiElements.niiControls.style.display = "flex";
      isNiiMultiplanar = true;
      uiElements.toggleViewBtn.textContent = 'Cambiar a Vista 3D';
    } catch (error) {
      console.error("Error fatal al cargar volúmenes:", error);
      alert("No se pudo cargar el modelo. Revisa la consola para más detalles.");
    } finally {
      uiElements.loadingOverlay.style.display = "none";
    }
  }

  function setupEventListeners() {
    // Listener para cargar archivos del usuario
    uiElements.submitNiiBtn.addEventListener("click", () => {
      const files = [
        uiElements.anatomicalFile.files[0],
        uiElements.atlasFile.files[0],
        uiElements.statsFile.files[0]
      ];
      if (files.some(file => !file)) {
        alert("Por favor, selecciona los tres archivos NIfTI para continuar.");
        return;
      }
      const userVolumeList = dataLoader.getUserVolumeList(files);
      loadVolumes(userVolumeList);
    });

    // Otros listeners (ahora usan la constante 'niivue')
    uiElements.toggleViewBtn.addEventListener("click", () => {
      isNiiMultiplanar = !isNiiMultiplanar;
      if (isNiiMultiplanar) {
        niivue.setSliceType(niivue.sliceTypeMultiplanar);
        uiElements.toggleViewBtn.textContent = 'Cambiar a Vista 3D';
      } else {
        niivue.setSliceType(niivue.sliceTypeRender);
        uiElements.toggleViewBtn.textContent = 'Cambiar a Multiplanar';
      }
    });

    uiElements.atlasSlider.addEventListener("input", (e) => {
      if (niivue.volumes.length > 1) {
        niivue.setOpacity(1, e.target.value / 100);
      }
    });

    uiElements.statSlider.addEventListener("input", (e) => {
      if (niivue.volumes.length > 2) {
        niivue.setOpacity(2, e.target.value / 100);
      }
    });
  }

  // --- INICIO DE LA APLICACIÓN ---
  setupEventListeners();
  const defaultVolumeList = dataLoader.getDefaultVolumeList();
  loadVolumes(defaultVolumeList); // Carga los volúmenes por defecto en la instancia única.
});