import { SceneManager } from './core/SceneManager.js';
import { DataLoader } from './core/DataLoader.js';
import { MeshVisualizer } from './core/MeshVisualizer.js';
import { VolumeSlicer } from './core/VolumeSlicer.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Mi Visualizador Cerebral: DOM Cargado!");

    const sceneManager = new SceneManager('threejs-container');
    const dataLoader = new DataLoader();
    const meshVisualizer = new MeshVisualizer(sceneManager.scene);
    const volumeSlicer = new VolumeSlicer(sceneManager);

    // Cargar el modelo 3D
    dataLoader.loadOBJ('assets/models/brain_model.obj')
        .then(model => {
            meshVisualizer.addModel(model);
            volumeSlicer.setModel(model);
            console.log("Modelo de cerebro cargado y configurado para corte.");
        })
        .catch(error => {
            console.error("No se pudo cargar el modelo de cerebro.", error);
        });

    // --- Configuración de los controles de UI para el corte ---
    const cutTypeButtons = document.querySelectorAll('.cut-type-btn');
    const positionSlider = document.getElementById('posicionCorteSlider');
    const sliderValueDisplay = document.getElementById('slider-value');
    const sliderContainer = document.getElementById('slider-container'); // <--- NUEVA REFERENCIA

    let currentCutType = 'none';

    cutTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.cutType;
            currentCutType = type;

            if (type === 'none') {
                volumeSlicer.clearCuts();
                sliderContainer.style.display = 'none'; // <--- OCULTA EL CONTENEDOR DEL SLIDER
            } else {
                let initialPositionForCut = -1;

                positionSlider.value = initialPositionForCut;
                sliderValueDisplay.textContent = initialPositionForCut;

                volumeSlicer.applyCut(type, initialPositionForCut);
                sliderContainer.style.display = 'block'; // <--- MUESTRA EL CONTENEDOR DEL SLIDER
            }

            cutTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    positionSlider.addEventListener('input', (event) => {
        const position = parseFloat(event.target.value);
        sliderValueDisplay.textContent = position;
        if (currentCutType !== 'none') {
            volumeSlicer.applyCut(currentCutType, position);
        }
    });

    // Inicializa el estado del botón "Sin Corte" como activo al cargar la página
    document.querySelector('[data-cut-type="none"]').classList.add('active');
    sliderContainer.style.display = 'none'; // <--- OCULTA EL SLIDER AL INICIO

    sliderValueDisplay.textContent = positionSlider.value;
});