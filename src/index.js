import * as THREE from "three";
import { SceneManager } from "./core/SceneManager.js";
import { DataLoader } from "./core/DataLoader.js";
import { MeshVisualizer } from "./core/MeshVisualizer.js";
import { VolumeSlicer } from "./core/VolumeSlicer.js";
import "./ui/styles.css";

document.addEventListener("DOMContentLoaded", () => {
  const sceneManager = new SceneManager("three-container");
  const dataLoader = new DataLoader();
  const meshVisualizer = new MeshVisualizer(sceneManager.scene);
  const volumeSlicer = new VolumeSlicer(sceneManager);

  // Elementos UI (ACTUALIZADOS)
  const uiElements = {
    niiUploadForm: document.getElementById("nii-upload-form"),
    anatomicalFile: document.getElementById("anatomical-file"),
    atlasFile: document.getElementById("atlas-file"),
    statsFile: document.getElementById("stats-file"),
    submitNiiBtn: document.getElementById("submit-nii-btn"),
    toggleUploadBtn: document.getElementById("toggle-upload-btn"),
    objControls: document.getElementById("obj-controls"),
    objFile: document.getElementById("obj-file"),
    
    sagittalBtn: document.getElementById("sagittal-cut"),
    coronalBtn: document.getElementById("coronal-cut"),
    axialBtn: document.getElementById("axial-cut"),
    positionSlider: document.getElementById("position-slider"),
    threeContainer: document.getElementById("three-container"),
    niiCanvas: document.getElementById("nii-canvas"),
    loadingOverlay: document.getElementById("loading-overlay"),
    niiControls: document.getElementById("nii-controls"),
    cutControls: document.getElementById("cut-controls"),
    toggleViewBtn: document.getElementById("toggle-view-btn"),
    atlasSlider: document.getElementById("atlasSlider"),
    statSlider: document.getElementById("statSlider"),
  };

  // Estado
  let currentNiiViewer = null;
  let isNiiMultiplanar = true;
  let isNiiMode = false;

  function setupCutButtons() {
    [uiElements.sagittalBtn, uiElements.coronalBtn, uiElements.axialBtn].forEach((btn) => {
      btn.addEventListener("click", function () {
        [uiElements.sagittalBtn, uiElements.coronalBtn, uiElements.axialBtn].forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        const cutType =
          this.id === "sagittal-cut" ? "sagittal" :
          this.id === "coronal-cut" ? "coronal" :
          "axial";
        volumeSlicer.setCutPlane(cutType);
        updateSlicePosition(uiElements.positionSlider.value / 100);
      });
    });
  }

  function updateSlicePosition(normalizedPos) {
    if (currentNiiViewer) {
      const volume = currentNiiViewer.volumes[0];
      const dims = volume.dims;
      // Corregido: Ahora se usa activeCutPlane en lugar de currentCutPlane
      const cutType = volumeSlicer.activeCutPlane; 
      const axisIndex = cutType === 'sagittal' ? 0 : cutType === 'coronal' ? 1 : 2;
      const clipPosition = Math.floor(normalizedPos * dims[axisIndex]);
      const clipPlane = [0, 0, 0, 0];
      clipPlane[axisIndex] = 1;
      clipPlane[3] = -clipPosition;
      currentNiiViewer.setClipPlane(clipPlane);
    } else {
      volumeSlicer.updateCutPlanePosition(normalizedPos);
    }
  }

  function setupEventListeners() {
    uiElements.toggleUploadBtn.addEventListener("click", () => {
      isNiiMode = !isNiiMode;
      if (isNiiMode) {
        uiElements.niiUploadForm.style.display = "block";
        uiElements.objControls.style.display = "none";
        uiElements.toggleUploadBtn.textContent = "Cambiar a Carga de OBJ";
      } else {
        uiElements.niiUploadForm.style.display = "none";
        uiElements.objControls.style.display = "block";
        uiElements.toggleUploadBtn.textContent = "Cargar Modelo";
      }
      clearAllViewers();
    });

    uiElements.objFile.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        uiElements.loadingOverlay.style.display = "flex";
        clearAllViewers();

        const model = await dataLoader.loadOBJ(URL.createObjectURL(file));
        meshVisualizer.setModel(model);
        volumeSlicer.setModel(model);
        
        uiElements.threeContainer.style.display = "block";
        uiElements.niiCanvas.style.display = "none";
        uiElements.cutControls.style.display = "flex";
        uiElements.niiControls.style.display = "none";
      } catch (error) {
        console.error("Error al cargar archivo OBJ:", error);
        alert(`Error: ${error.message}`);
      } finally {
        uiElements.loadingOverlay.style.display = "none";
      }
    });

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
        volumeSlicer.setNiiViewer(currentNiiViewer);
        
        uiElements.threeContainer.style.display = "none";
        uiElements.niiCanvas.style.display = "block";
        uiElements.cutControls.style.display = "none";
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

    uiElements.positionSlider.addEventListener("input", (e) => {
      updateSlicePosition(e.target.value / 100);
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
    meshVisualizer.clearModel();
    volumeSlicer.clearCuts();
    if (currentNiiViewer) {
      currentNiiViewer.destroy();
      currentNiiViewer = null;
    }
    uiElements.cutControls.style.display = "none";
    uiElements.niiControls.style.display = "none";
  }

  setupCutButtons();
  setupEventListeners();

  dataLoader
    .loadFile("assets/models/brain_model.obj")
    .then((model) => {
      meshVisualizer.setModel(model);
      volumeSlicer.setModel(model);
      uiElements.loadingOverlay.style.display = "none";
      uiElements.niiUploadForm.style.display = "none";
      uiElements.objControls.style.display = "block";
    })
    .catch((error) => {
      console.error("Error al cargar el modelo inicial:", error);
      alert("Error al cargar el modelo 3D inicial. Por favor, revisa la consola.");
      uiElements.loadingOverlay.style.display = "none";
    });
});