import * as THREE from 'three';

export class MeshVisualizer {
    constructor(scene) {
        this.scene = scene;
        this.currentModel = null;
        console.log("MeshVisualizer inicializado.");
    }

    /**
     * Añade un modelo 3D (malla OBJ) a la escena y lo procesa (escala, centra).
     * @param {THREE.Object3D} model El objeto 3D a visualizar.
     */
    setModel(model) {
        if (this.currentModel) {
            this.scene.remove(this.currentModel); // Eliminar modelo anterior si existe
        }

        this.currentModel = model;
        this.processModel(this.currentModel); // Procesar el modelo aquí
        this.scene.add(this.currentModel);
        console.log("Modelo añadido a la escena del visualizador de mallas.");
    }

    // Mover la lógica de procesamiento (escalado y centrado) aquí desde DataLoader
    processModel(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xAAAAAA,
                    metalness: 0.2,
                    roughness: 0.8,
                });
            }
        });

        const initialBoundingBox = new THREE.Box3().setFromObject(model);
        const initialCenter = new THREE.Vector3();
        initialBoundingBox.getCenter(initialCenter);
        const initialSize = new THREE.Vector3();
        initialBoundingBox.getSize(initialSize);

        const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);
        const desiredMaxDim = 100;
        const scaleFactor = desiredMaxDim / maxDim;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        console.log(`Modelo escalado. Dimensión máxima original: ${maxDim.toFixed(2)}, Escala aplicada: ${scaleFactor.toFixed(2)}`);

        const scaledBoundingBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = new THREE.Vector3();
        scaledBoundingBox.getCenter(scaledCenter);
        model.position.sub(scaledCenter);

        const finalBoundingBox = new THREE.Box3().setFromObject(model);
        const finalCenter = new THREE.Vector3();
        finalBoundingBox.getCenter(finalCenter);
        const finalSize = new THREE.Vector3();
        finalBoundingBox.getSize(finalSize);

        console.log(`Caja delimitadora FINAL del modelo (min): (${finalBoundingBox.min.x.toFixed(2)}, ${finalBoundingBox.min.y.toFixed(2)}, ${finalBoundingBox.min.z.toFixed(2)})`);
        console.log(`Caja delimitadora FINAL del modelo (max): (${finalBoundingBox.max.x.toFixed(2)}, ${finalBoundingBox.max.y.toFixed(2)}, ${finalBoundingBox.max.z.toFixed(2)})`);
        console.log(`Tamaño FINAL del modelo: (${finalSize.x.toFixed(2)}, ${finalSize.y.toFixed(2)}, ${finalSize.z.toFixed(2)})`);
        console.log(`Centro FINAL del modelo: (${finalCenter.x.toFixed(2)}, ${finalCenter.y.toFixed(2)}, ${finalCenter.z.toFixed(2)})`);
    }

    clearModel() {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel = null;
            console.log("Modelo removido de la escena del visualizador de mallas.");
        }
    }
}