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

    // --- Manejo de UI de cortes ---
    const sagittalBtn = document.getElementById('sagittal-cut');
    const coronalBtn = document.getElementById('coronal-cut');
    const axialBtn = document.getElementById('axial-cut');
    const noCutBtn = document.getElementById('no-cut');
    const positionSlider = document.getElementById('position-slider');

    // Función para manejar la selección de un tipo de corte
    const selectCutType = (type) => {
        volumeSlicer.setCutPlane(type);
        // Queremos que el cerebro se vea entero al seleccionar un nuevo tipo de corte.
        // Esto significa que el plano de corte debe estar en uno de los extremos del bounding box.
        // Por convención, usaremos el valor 0 (que corresponderá a minCoord del BB).
        positionSlider.value = 0; // Posiciona el slider al inicio (cerebro completo)
        volumeSlicer.updateCutPlanePosition(0); // Aplica el corte en la posición 0 (extremo)
    };


    if (sagittalBtn) sagittalBtn.addEventListener('click', () => selectCutType('sagittal'));
    if (coronalBtn) coronalBtn.addEventListener('click', () => selectCutType('coronal'));
    if (axialBtn) axialBtn.addEventListener('click', () => selectCutType('axial'));
    
    // El botón "Sin Corte" limpiará los cortes y reseteará el slider.
    if (noCutBtn) noCutBtn.addEventListener('click', () => {
        volumeSlicer.clearCuts(); // Llama a clearCuts para quitar los cortes
        positionSlider.value = 0; // Resetea el slider al inicio (representa "cerebro completo")
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

            // Limpiar visualizadores anteriores
            meshVisualizer.clearModel();
            // Siempre limpiar cortes y resetear slider al cargar un nuevo modelo
            volumeSlicer.clearCuts();
            positionSlider.value = 0; // Posición inicial del slider: cerebro completo

            try {
                let loadedData;
                if (fileExtension === 'obj') {
                    fileURL = URL.createObjectURL(file);
                    console.log(`[index.js] Cargando OBJ local con URL temporal: ${fileURL}`);
                    loadedData = await dataLoader.loadOBJ(fileURL);
                    if (loadedData instanceof THREE.Object3D) {
                        meshVisualizer.setModel(loadedData);
                        volumeSlicer.setModel(loadedData);
                        console.log("Modelo OBJ cargado desde input de archivo.");
                        // Una vez cargado, asegúrate de que el cerebro se muestre completo.
                        volumeSlicer.clearCuts();
                        positionSlider.value = 0; // El slider al inicio
                    }
                } else {
                    console.error(`Tipo de archivo no soportado para carga de usuario: ${fileExtension}`);
                    alert(`Error: Tipo de archivo no soportado (${fileExtension}). Solo .obj.`);
                }
            } catch (error) {
                console.error("Error general al cargar el archivo seleccionado:", error);
                alert(`Error al cargar el archivo: ${error.message}`);
            } finally {
                if (fileURL) {
                    URL.revokeObjectURL(fileURL);
                    console.log("URL temporal revocada:", fileURL);
                }
            }
            event.target.value = '';
        });
    }

    // --- Carga inicial del modelo OBJ por defecto ---
    const initialModelPath = 'assets/models/brain_model.obj';
    dataLoader.loadFile(initialModelPath)
        .then(data => {
            if (data instanceof THREE.Object3D) {
                meshVisualizer.setModel(data);
                volumeSlicer.setModel(data);
                console.log("Modelo OBJ inicial cargado y añadido a la escena.");
                // Asegúrate de que el cerebro se muestre completo al inicio.
                volumeSlicer.clearCuts(); // Esto asegura que el cerebro se muestre completo
                positionSlider.value = 0; // Y el slider se pone al inicio
            } else {
                console.warn("Tipo de datos no reconocido después de la carga inicial. Se esperaba un modelo 3D.", data);
            }
        })
        .catch(error => {
            console.error("No se pudo cargar el modelo inicial de cerebro:", error);
        });
});