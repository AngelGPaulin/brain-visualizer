import { DataLoader } from "./core/DataLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const dataLoader = new DataLoader();

  // Elementos UI simplificados
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

  // Estado simplificado
  let currentNiiViewer = null;
  let isNiiMultiplanar = true;

  function setupEventListeners() {
    uiElements.submitNiiBtn.addEventListener("click", async () => {
      const files = [
        uiElements.anatomicalFile.files[0],
        uiElements.atlasFile.files[0],
        uiElements.statsFile.files[0]
      ];

      if (files.some(file => !file)) {
        alert("Por favor, selecciona los tres archivos NIfTI para continuar.");
        return;
      }
      
      try {
        uiElements.loadingOverlay.style.display = "flex";
        clearAllViewers();

        currentNiiViewer = await dataLoader.loadNII(files, "nii-canvas");
        
        uiElements.niiControls.style.display = "flex";
        
        isNiiMultiplanar = true;
        uiElements.toggleViewBtn.textContent = 'Cambiar a Vista 3D';
      } catch (error) {
        console.error("Error al cargar archivos NIfTI:", error);
        alert(`Error: ${error.message}`);
      } finally {
        uiElements.loadingOverlay.style.display = "none";
      }
    });

    uiElements.toggleViewBtn.addEventListener("click", () => {
      if (currentNiiViewer) {
        isNiiMultiplanar = !isNiiMultiplanar;
        if (isNiiMultiplanar) {
          currentNiiViewer.setSliceType(currentNiiViewer.sliceTypeMultiplanar);
          uiElements.toggleViewBtn.textContent = 'Cambiar a Vista 3D';
        } else {
          currentNiiViewer.setSliceType(currentNiiViewer.sliceTypeRender);
          uiElements.toggleViewBtn.textContent = 'Cambiar a Multiplanar';
        }
      }
    });

    uiElements.atlasSlider.addEventListener("input", (e) => {
      if (currentNiiViewer && currentNiiViewer.volumes.length > 1) {
        currentNiiViewer.setOpacity(1, e.target.value / 100);
      }
    });

    uiElements.statSlider.addEventListener("input", (e) => {
      if (currentNiiViewer && currentNiiViewer.volumes.length > 2) {
        currentNiiViewer.setOpacity(2, e.target.value / 100);
      }
    });
  }

  function clearAllViewers() {
    if (currentNiiViewer) {
      currentNiiViewer.destroy();
      currentNiiViewer = null;
    }
    uiElements.niiControls.style.display = "none";
  }

  setupEventListeners();
});