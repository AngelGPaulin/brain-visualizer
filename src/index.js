import * as THREE from "three";
import { SceneManager } from "./core/SceneManager.js";
import { DataLoader } from "./core/DataLoader.js";
import { MeshVisualizer } from "./core/MeshVisualizer.js";
import { VolumeSlicer } from "./core/VolumeSlicer.js";
import "./ui/style.css";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Mi Visualizador Cerebral: DOM Cargado!");

  /* ---------- Inicialización ---------- */
  const sceneManager = new SceneManager("three-container");
  if (!sceneManager.isInitialized) {
    console.error("SceneManager no se inicializó correctamente. Deteniendo la aplicación.");
    return;
  }

  const dataLoader     = new DataLoader();
  const meshVisualizer = new MeshVisualizer(sceneManager.scene);
  const volumeSlicer   = new VolumeSlicer(sceneManager);

  /* ---------- Controles de corte ---------- */
  const sagittalBtn  = document.getElementById("sagittal-cut");
  const coronalBtn   = document.getElementById("coronal-cut");
  const axialBtn     = document.getElementById("axial-cut");
  const positionSl   = document.getElementById("position-slider");

  const setCut = (type) => {
    volumeSlicer.setCutPlane(type);
    positionSl.value = 0;
    volumeSlicer.updateCutPlanePosition(0);
  };

  sagittalBtn?.addEventListener("click", () => setCut("sagittal"));
  coronalBtn ?.addEventListener("click", () => setCut("coronal"));
  axialBtn   ?.addEventListener("click", () => setCut("axial"));

  positionSl?.addEventListener("input", (e) => {
    volumeSlicer.updateCutPlanePosition(e.target.value / 100);
  });

  /* ---------- Carga de archivos ---------- */
  const loadBtn   = document.getElementById("load-model-btn");
  const fileInput = document.getElementById("model-input");

  loadBtn?.addEventListener("click", () => fileInput.click());

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    console.log(`Archivo seleccionado: ${file.name}, Extensión: ${extension}, Tamaño: ${file.size} bytes`);

    const threeC = document.getElementById("three-container");
    const niiC   = document.getElementById("nii-canvas");

    /* Reinicia visualización */
    meshVisualizer.clearModel();
    volumeSlicer.clearCuts();
    positionSl.value = 0;

    /* Ruta temporal (solo OBJ) */
    let tempURL = null;

    try {
      if (extension === "obj") {
        /* ---- OBJ ---- */
        tempURL = URL.createObjectURL(file);              // ← solo OBJ
        niiC.style.display   = "none";
        threeC.style.display = "block";

        const obj3D = await dataLoader.loadOBJ(tempURL);  // url → loader
        meshVisualizer.setModel(obj3D);
        volumeSlicer.setModel(obj3D);
        console.log("Modelo OBJ cargado correctamente.");

      } else if (extension === "nii" || extension === "gz") {
        /* ---- NIfTI ---- */
        threeC.style.display = "none";
        niiC.style.display   = "block";

        await dataLoader.loadNII(file, "nii-canvas");     // ← pasa File real
        console.log("Volumen NIfTI cargado correctamente.");

      } else {
        alert(`Formato no soportado (${extension}).`);
      }

    } catch (err) {
      console.error("Error al cargar el archivo:", err);
      alert(`Error al cargar archivo: ${err.message}`);

    } finally {
      if (tempURL) {
        URL.revokeObjectURL(tempURL);
        console.log("URL temporal revocada:", tempURL);
      }
      e.target.value = ""; // limpia input
    }
  });

  /* ---------- Modelo inicial ---------- */
  dataLoader
    .loadFile("assets/models/brain_model.obj")
    .then((obj) => {
      if (obj instanceof THREE.Object3D) {
        meshVisualizer.setModel(obj);
        volumeSlicer.setModel(obj);
        positionSl.value = 0;
        console.log("Modelo inicial cargado.");
      }
    })
    .catch((err) => console.error("No se pudo cargar modelo inicial:", err));
});
