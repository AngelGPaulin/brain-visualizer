import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { DataLoader } from './core/DataLoader.js';
import { MeshVisualizer } from './core/MeshVisualizer.js';
import { VolumeSlicer } from './core/VolumeSlicer.js';

// ¡IMPORTANTE! Se importa el CSS aquí para que Webpack lo procese.
// Asegúrate de que el archivo style.css esté en la ruta 'src/ui/style.css'
import './ui/style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización
    const sceneManager = new SceneManager('three-container');
    const dataLoader = new DataLoader();
    const meshVisualizer = new MeshVisualizer(sceneManager.scene);
    const volumeSlicer = new VolumeSlicer(sceneManager);

    // Elementos UI
    const uiElements = {
        sagittalBtn: document.getElementById('sagittal-cut'),
        coronalBtn: document.getElementById('coronal-cut'),
        axialBtn: document.getElementById('axial-cut'),
        positionSlider: document.getElementById('position-slider'),
        toggleViewBtn: document.getElementById('toggle-view-btn'),
        loadModelBtn: document.getElementById('load-model-btn'),
        modelInput: document.getElementById('model-input'),
        threeContainer: document.getElementById('three-container'),
        niiCanvas: document.getElementById('nii-canvas'),
        loadingOverlay: document.getElementById('loading-overlay')
    };

    // Estado
    let currentNiiViewer = null;
    let activeAxis = null;

    // Configuración de botones de corte
    function setupCutButtons() {
        [uiElements.sagittalBtn, uiElements.coronalBtn, uiElements.axialBtn].forEach(btn => {
            btn.addEventListener('click', function() {
                // Resetear botones
                [uiElements.sagittalBtn, uiElements.coronalBtn, uiElements.axialBtn].forEach(b => {
                    b.classList.remove('active');
                });
                
                // Activar botón actual
                this.classList.add('active');
                
                // Establecer eje activo
                activeAxis = this.id === 'sagittal-cut' ? 'x' :
                             this.id === 'coronal-cut' ? 'y' : 'z';
                
                // Aplicar corte inicial en el centro
                updateSlicePosition(0.5);
            });
        });
    }

    // Actualizar posición de corte
    function updateSlicePosition(normalizedPos) {
        if (currentNiiViewer && activeAxis) {
            const volume = currentNiiViewer.volumes[0];
            const dims = volume.dims;
            const axisIndex = activeAxis === 'x' ? 0 : activeAxis === 'y' ? 1 : 2;
            const clipPosition = Math.floor(normalizedPos * dims[axisIndex]);
            const clipPlane = [0, 0, 0, 0];
            clipPlane[axisIndex] = 1;
            clipPlane[3] = -clipPosition;
            currentNiiViewer.setClipPlane(clipPlane);
        } else if (volumeSlicer.model && activeAxis) {
            // Se pasa el eje activo a la función de corte del VolumeSlicer
            volumeSlicer.updateCutPlanePosition(normalizedPos, activeAxis);
        }
    }

    // Configurar eventos
    function setupEventListeners() {
        // Slider
        uiElements.positionSlider.addEventListener('input', (e) => {
            if (activeAxis) { // Solo actualizamos si hay un eje de corte seleccionado
                updateSlicePosition(e.target.value / 100);
            }
        });

        // Carga de modelos
        uiElements.loadModelBtn.addEventListener('click', () => uiElements.modelInput.click());
        
        uiElements.modelInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                // Limpiar vista anterior
                meshVisualizer.clearModel();
                volumeSlicer.clearCuts();
                uiElements.positionSlider.value = 50;

                const extension = file.name.split('.').pop().toLowerCase();
                
                if (extension === 'obj') {
                    // Modo OBJ
                    uiElements.threeContainer.style.display = 'block';
                    uiElements.niiCanvas.style.display = 'none';
                    
                    const model = await dataLoader.loadOBJ(URL.createObjectURL(file));
                    meshVisualizer.setModel(model);
                    volumeSlicer.setModel(model);
                    currentNiiViewer = null;
                }
                else if (extension === 'nii' || extension === 'gz') {
                    // Modo NIfTI
                    uiElements.threeContainer.style.display = 'none';
                    uiElements.niiCanvas.style.display = 'block';
                    
                    currentNiiViewer = await dataLoader.loadNII(file, 'nii-canvas');
                    currentNiiViewer.setSliceType(currentNiiViewer.sliceTypeRender);
                }
            } catch (error) {
                console.error("Error al cargar archivo:", error);
                alert(`Error: ${error.message}`);
            } finally {
                event.target.value = '';
            }
        });
    }

    // Inicialización
    setupCutButtons();
    setupEventListeners();

    // Cargar modelo inicial y ocultar el overlay
    dataLoader.loadFile('assets/models/brain_model.obj')
        .then(model => {
            meshVisualizer.setModel(model);
            volumeSlicer.setModel(model);
            
            // Ocultar la pantalla de carga una vez que el modelo inicial se ha cargado
            uiElements.loadingOverlay.style.display = 'none';
        })
        .catch(error => {
            console.error("Error al cargar el modelo inicial:", error);
            alert("Error al cargar el modelo 3D inicial. Por favor, revisa la consola.");
            // Ocultar el overlay incluso si hay un error para que el usuario pueda interactuar
            uiElements.loadingOverlay.style.display = 'none';
        });
});