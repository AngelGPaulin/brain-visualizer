import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { DataLoader } from './core/DataLoader.js';
import { MeshVisualizer } from './core/MeshVisualizer.js';
import { VolumeSlicer } from './core/VolumeSlicer.js';
import './ui/style.css';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Mi Visualizador Cerebral: DOM Cargado!");

    const sceneManager = new SceneManager('three-container');
    if (!sceneManager.isInitialized) {
        console.error("SceneManager no se inicializó correctamente. Deteniendo la aplicación.");
        return;
    }

    const dataLoader = new DataLoader();
    const meshVisualizer = new MeshVisualizer(sceneManager.scene);
    const volumeSlicer = new VolumeSlicer(sceneManager);

    const sagittalBtn = document.getElementById('sagittal-cut');
    const coronalBtn = document.getElementById('coronal-cut');
    const axialBtn = document.getElementById('axial-cut');
    const positionSlider = document.getElementById('position-slider');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const loadModelBtn = document.getElementById('load-model-btn');
    const modelInput = document.getElementById('model-input');
    const threeContainer = document.getElementById('three-container');
    const niiCanvas = document.getElementById('nii-canvas');

    let currentNiiViewer = null;
    let currentView = '3D';

    const selectCutType = (type) => {
        volumeSlicer.setCutPlane(type);
        positionSlider.value = 0;
        volumeSlicer.updateCutPlanePosition(0);
    };

    if (sagittalBtn) sagittalBtn.addEventListener('click', () => selectCutType('sagittal'));
    if (coronalBtn) coronalBtn.addEventListener('click', () => selectCutType('coronal'));
    if (axialBtn) axialBtn.addEventListener('click', () => selectCutType('axial'));

    if (positionSlider) {
        positionSlider.addEventListener('input', (event) => {
            const normalizedPosition = event.target.value / 100;
            volumeSlicer.updateCutPlanePosition(normalizedPosition);
        });
    }

    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            if (currentNiiViewer) {
                if (currentView === '3D') {
                    currentNiiViewer.setSliceType(currentNiiViewer.sliceTypeMultiplanar);
                    currentView = '2D';
                    toggleViewBtn.textContent = "Cambiar a Vista 3D";
                } else {
                    currentNiiViewer.setSliceType(currentNiiViewer.sliceTypeRender);
                    currentView = '3D';
                    toggleViewBtn.textContent = "Cambiar a Vista 2D";
                }
            }
        });
    }

    if (loadModelBtn && modelInput) {
        loadModelBtn.addEventListener('click', () => {
            modelInput.click();
        });

        modelInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                console.log("Ningún archivo seleccionado.");
                return;
            }

            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            let fileURL = null;

            console.log(`Archivo seleccionado: ${fileName}, Extensión: ${fileExtension}, Tamaño: ${file.size} bytes.`);

            meshVisualizer.clearModel();
            volumeSlicer.clearCuts();
            positionSlider.value = 0;

            try {
                fileURL = URL.createObjectURL(file);

                if (fileExtension === 'obj') {
                    if (niiCanvas) niiCanvas.style.display = 'none';
                    if (threeContainer) {
                        threeContainer.style.display = 'block';
                        threeContainer.style.visibility = 'visible';
                    }

                    const loadedData = await dataLoader.loadOBJ(fileURL);
                    if (loadedData instanceof THREE.Object3D) {
                        meshVisualizer.setModel(loadedData);
                        volumeSlicer.setModel(loadedData);
                        console.log("Modelo OBJ cargado desde input de archivo.");
                        currentNiiViewer = null;
                        currentView = '3D';
                    }
                } else if (fileExtension === 'nii' || fileExtension === 'gz') {
                    if (threeContainer) threeContainer.style.visibility = 'hidden';
                    if (niiCanvas) {
                        niiCanvas.style.display = 'block';
                        niiCanvas.style.position = 'absolute';
                        niiCanvas.style.top = '0';
                        niiCanvas.style.left = '0';
                        niiCanvas.style.width = '100vw';
                        niiCanvas.style.height = '100vh';
                        niiCanvas.style.zIndex = '0';
                    }

                    currentNiiViewer = await dataLoader.loadNII(file, 'nii-canvas');
                    currentView = '3D';
                    toggleViewBtn.textContent = "Cambiar a Vista 2D";
                    console.log("Archivo NIfTI visualizado correctamente.");
                } else {
                    console.error(`Tipo de archivo no soportado para carga de usuario: ${fileExtension}`);
                    alert(`Error: Tipo de archivo no soportado (${fileExtension}). Solo .obj o .nii/.gz.`);
                }
            } catch (error) {
                console.error("Error general al cargar el archivo seleccionado:", error);
                alert(`Error al cargar el archivo: ${error.message}`);
            } finally {
                if (fileURL) {
                    URL.revokeObjectURL(fileURL);
                    console.log("URL temporal revocada:", fileURL);
                }
                event.target.value = '';
            }
        });
    }

    const initialModelPath = 'assets/models/brain_model.obj';
    dataLoader.loadFile(initialModelPath)
        .then(data => {
            if (data instanceof THREE.Object3D) {
                meshVisualizer.setModel(data);
                volumeSlicer.setModel(data);
                console.log("Modelo OBJ inicial cargado y añadido a la escena.");
                volumeSlicer.clearCuts();
                positionSlider.value = 0;
            } else {
                console.warn("Tipo de datos no reconocido después de la carga inicial. Se esperaba un modelo 3D.", data);
            }
        })
        .catch(error => {
            console.error("No se pudo cargar el modelo inicial de cerebro:", error);
        });
});
