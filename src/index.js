import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { DataLoader } from './core/DataLoader.js';
import { MeshVisualizer } from './core/MeshVisualizer.js';
import { VolumeSlicer } from './core/VolumeSlicer.js';
import './ui/style.css'; // Asegúrate de que tus estilos base están importados

document.addEventListener('DOMContentLoaded', () => {
    console.log("Mi Visualizador Cerebral: DOM Cargado!");

    const loadingOverlay = document.getElementById('loading-overlay'); // Obtener el overlay

    // Mostrar el overlay al inicio de la carga de la página
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const sceneManager = new SceneManager('three-container');
    if (!sceneManager.isInitialized) {
        console.error("SceneManager no se inicializó correctamente. Deteniendo la aplicación.");
        if (loadingOverlay) loadingOverlay.style.display = 'none'; // Ocultar si hay error crítico al inicio
        return;
    }

    const dataLoader = new DataLoader();
    const meshVisualizer = new MeshVisualizer(sceneManager.scene);
    const volumeSlicer = new VolumeSlicer(sceneManager); // Pasamos sceneManager completo

    // --- Manejo de UI de cortes ---
    const sagittalBtn = document.getElementById('sagittal-cut');
    const coronalBtn = document.getElementById('coronal-cut');
    const axialBtn = document.getElementById('axial-cut');
    const noCutBtn = document.getElementById('no-cut');
    const positionSlider = document.getElementById('position-slider');

    if (sagittalBtn) sagittalBtn.addEventListener('click', () => {
        volumeSlicer.setCutPlane('sagittal');
        positionSlider.value = 50; // Resetea el slider al centro (0.5 normalizado)
    });
    if (coronalBtn) coronalBtn.addEventListener('click', () => {
        volumeSlicer.setCutPlane('coronal');
        positionSlider.value = 50;
    });
    if (axialBtn) axialBtn.addEventListener('click', () => {
        volumeSlicer.setCutPlane('axial');
        positionSlider.value = 50;
    });
    if (noCutBtn) noCutBtn.addEventListener('click', () => {
        volumeSlicer.clearCuts();
        positionSlider.value = 50;
    });

    if (positionSlider) positionSlider.addEventListener('input', (event) => {
        const normalizedPosition = event.target.value / 100;
        volumeSlicer.updateCutPlanePosition(normalizedPosition);
    });

    // --- Lógica para cargar modelo desde input de archivo ---
    const loadModelBtn = document.getElementById('load-model-btn');
    const modelInput = document.getElementById('model-input');

    if (loadModelBtn && modelInput) {
        loadModelBtn.addEventListener('click', () => {
            modelInput.click(); // Simula el click en el input file oculto
        });

        modelInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                console.log("Ningún archivo seleccionado.");
                return;
            }

            // Mostrar overlay al iniciar la carga de un nuevo archivo
            if (loadingOverlay) loadingOverlay.style.display = 'flex';

            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            let fileURL = null;

            console.log(`Archivo seleccionado: ${fileName}, Extensión: ${fileExtension}, Tamaño: ${file.size} bytes.`);

            // Limpiar visualizadores anteriores
            meshVisualizer.clearModel();
            volumeSlicer.clearCuts(); // Limpiar cortes al cargar un nuevo modelo
            positionSlider.value = 50; // Resetea el slider

            try {
                let loadedData;
                if (fileExtension === 'obj') {
                    fileURL = URL.createObjectURL(file);
                    console.log(`[index.js] Cargando OBJ local con URL temporal: ${fileURL}`);
                    loadedData = await dataLoader.loadOBJ(fileURL);
                    if (loadedData instanceof THREE.Object3D) {
                        meshVisualizer.setModel(loadedData);
                        volumeSlicer.setModel(loadedData); // Pasa el modelo al slicer
                        console.log("Modelo OBJ cargado desde input de archivo.");
                    }
                } else {
                    console.error(`Tipo de archivo no soportado para carga de usuario: ${fileExtension}`);
                    alert(`Error: Tipo de archivo no soportado (${fileExtension}). Solo .obj.`);
                }
            } catch (error) {
                console.error("Error general al cargar el archivo seleccionado:", error);
                alert(`Error al cargar el archivo: ${error.message}`);
            } finally {
                // Ocultar overlay SIEMPRE al finalizar la carga (éxito o error)
                if (fileURL) {
                    URL.revokeObjectURL(fileURL);
                    console.log("URL temporal revocada:", fileURL);
                }
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                    console.log("Overlay de carga ocultado.");
                }
            }
            event.target.value = ''; // Limpiar el input de archivo
        });
    }

    // --- Carga inicial del modelo OBJ por defecto ---
    const initialModelPath = 'assets/models/brain_model.obj';
    
    // La pantalla de carga ya se mostró al inicio del DOMContentLoaded,
    // así que no necesitamos mostrarla de nuevo aquí.
    dataLoader.loadFile(initialModelPath)
        .then(data => {
            if (data instanceof THREE.Object3D) {
                meshVisualizer.setModel(data);
                volumeSlicer.setModel(data); // Pasa el modelo al slicer si es una malla 3D
                console.log("Modelo OBJ inicial cargado y añadido a la escena.");
            } else {
                console.warn("Tipo de datos no reconocido después de la carga inicial. Se esperaba un modelo 3D.", data);
            }
        })
        .catch(error => {
            console.error("No se pudo cargar el modelo inicial de cerebro:", error);
        })
        .finally(() => {
            // Ocultar el overlay DESPUÉS de que la carga inicial termine (éxito o error)
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
                console.log("Overlay de carga ocultado después de la carga inicial.");
            }
        });
});