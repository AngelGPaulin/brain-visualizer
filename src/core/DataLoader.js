import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // Asegúrate de que esta ruta sea correcta

export class DataLoader {
    constructor() {
        console.log("DataLoader inicializado."); //
        this.objLoader = new OBJLoader();
    }

    /**
     * Carga un modelo OBJ desde una ruta específica.
     * @param {string} path La ruta al archivo OBJ. (Ej: 'assets/models/brain_model.obj')
     * @returns {Promise<Object3D>} Una promesa que resuelve con el objeto 3D cargado.
     */
    loadOBJ(path) {
        return new Promise((resolve, reject) => {
            console.log(`Cargando modelo OBJ desde: ${path}`); //

            // ¡IMPORTANTE! Asegúrate de que esta línea NO esté presente o esté COMENTADA:
            // const correctedPath = `src/${path}`;

            const modelPath = path; // Usar la ruta tal cual: 'assets/models/brain_model.obj'

            this.objLoader.load(
                modelPath,
                (object) => {
                    console.log("Modelo OBJ cargado exitosamente."); //
                    // Línea que dio el error 'this.processModel is not a function'
                    this.processModel(object);
                    resolve(object);
                },
                (xhr) => {
                    // console.log((xhr.loaded / xhr.total * 100) + '% cargado');
                },
                (error) => {
                    console.error(`Error al cargar el archivo OBJ desde ${modelPath}:`, error); //
                    reject(new Error(`HttpError: fetch for "${modelPath}" responded with 404: Not Found`)); //
                }
            );
        });
    }

    // ESTA FUNCIÓN DEBE ESTAR AQUÍ, DENTRO DE LA CLASE DataLoader
    processModel(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xAAAAAA,
                    metalness: 0.2,
                    roughness: 0.8,
                });
                // No es estrictamente necesario calcular boundingBox aquí,
                // se calculará después del traverse
            }
        });

        // 1. Calcula la caja delimitadora del modelo ANTES del escalado o cualquier transformación
        const initialBoundingBox = new THREE.Box3().setFromObject(model);
        const initialCenter = new THREE.Vector3();
        initialBoundingBox.getCenter(initialCenter);
        const initialSize = new THREE.Vector3();
        initialBoundingBox.getSize(initialSize);

        // 2. Escalar el modelo para que se ajuste a la escena
        const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);
        const desiredMaxDim = 100; // Por ejemplo, un tamaño deseado en unidades Three.js
        const scaleFactor = desiredMaxDim / maxDim;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        console.log(`Modelo escalado. Dimensión máxima original: ${maxDim.toFixed(2)}, Escala aplicada: ${scaleFactor.toFixed(2)}`); //

        // 3. Recalcula el bounding box y centra DESPUÉS del escalado
        // Ahora, el modelo ya está escalado, y vamos a moverlo para que su centro esté en el origen.
        const scaledBoundingBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = new THREE.Vector3();
        scaledBoundingBox.getCenter(scaledCenter);
        model.position.sub(scaledCenter); // Centra el modelo en el origen después de escalar

        // 4. Última verificación y logs
        const finalBoundingBox = new THREE.Box3().setFromObject(model);
        const finalCenter = new THREE.Vector3();
        finalBoundingBox.getCenter(finalCenter); // Esto debería ser muy cercano a (0,0,0)
        const finalSize = new THREE.Vector3();
        finalBoundingBox.getSize(finalSize);

        console.log(`Caja delimitadora FINAL del modelo (min): (${finalBoundingBox.min.x.toFixed(2)}, ${finalBoundingBox.min.y.toFixed(2)}, ${finalBoundingBox.min.z.toFixed(2)})`); //
        console.log(`Caja delimitadora FINAL del modelo (max): (${finalBoundingBox.max.x.toFixed(2)}, ${finalBoundingBox.max.y.toFixed(2)}, ${finalBoundingBox.max.z.toFixed(2)})`); //
        console.log(`Tamaño FINAL del modelo: (${finalSize.x.toFixed(2)}, ${finalSize.y.toFixed(2)}, ${finalSize.z.toFixed(2)})`); //
        console.log(`Centro FINAL del modelo: (${finalCenter.x.toFixed(2)}, ${finalCenter.y.toFixed(2)}, ${finalCenter.z.toFixed(2)})`); // Nuevo log para verificar el centro
    }
}