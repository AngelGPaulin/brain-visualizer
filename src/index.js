import './ui/style.css'; // Asegurate de que esta ruta sea correcta: './ui/style.css'
import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { DataLoader } from './core/DataLoader.js'; // Importa DataLoader
import { MeshVisualizer } from './core/MeshVisualizer.js'; // Importa MeshVisualizer

document.addEventListener('DOMContentLoaded', async () => { // Cambia a 'async' para usar await
    console.log('Mi Visualizador Cerebral: DOM Cargado!');

    const sceneManager = new SceneManager('app-container');
    const dataLoader = new DataLoader();
    const meshVisualizer = new MeshVisualizer(sceneManager.scene);

    // **Elimina el cubo de prueba si quieres, o déjalo para referencia**
    // Ya no necesitas estas lineas del cubo:
    // const geometry = new THREE.BoxGeometry(50, 50, 50);
    // const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    // const cube = new THREE.Mesh(geometry, material);
    // sceneManager.scene.add(cube);
    // console.log('Cubo de prueba añadido a la escena.');

    // --- Cargar y mostrar tu modelo OBJ de cerebro ---
    const brainModelUrl = 'assets/models/brain_model.obj'; // ASEGURATE DE QUE ESTA RUTA Y NOMBRE SEAN CORRECTOS

    const brainObject = await dataLoader.loadOBJ(brainModelUrl);

    if (brainObject) {
        // Un material basico para el cerebro. Puedes cambiar el color.
        const brainMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0, // Un gris claro
            side: THREE.DoubleSide, // Para ver ambas caras del modelo
            roughness: 0.8, // Que tan "áspero" es el material (0.0 es espejo, 1.0 es mate)
            metalness: 0.1 // Que tan "metalico" es el material
        });
        meshVisualizer.addModel(brainObject, brainMaterial);
        console.log('Modelo de cerebro OBJ cargado y añadido a la escena.');

        // Opcional: Ajusta la posicion de la camara para ver el cerebro
        // Esto depende del tamano y centrado de tu modelo.
        // Es posible que el SceneManager ya lo haya centrado bien.
        // sceneManager.camera.position.set(0, 0, 200);
        // sceneManager.controls.target.set(0, 0, 0); // Apunta la camara al centro
        // sceneManager.controls.update();

    } else {
        console.error('No se pudo cargar el modelo de cerebro.');
    }

});