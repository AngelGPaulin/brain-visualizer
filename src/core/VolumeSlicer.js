import * as THREE from 'three';

export class VolumeSlicer {
    constructor(sceneManager) {
        if (!sceneManager || !sceneManager.renderer || !sceneManager.clippingPlanes) {
            console.error("VolumeSlicer requiere una instancia válida de SceneManager con renderer y clippingPlanes.");
            return;
        }
        this.sceneManager = sceneManager;
        this.model = null; // Para almacenar una referencia al modelo actual
        console.log("VolumeSlicer inicializado con SceneManager.");
    }

    /**
     * Establece el modelo 3D que será afectado por los planos de corte.
     * Itera sobre todas las mallas del modelo y configura sus materiales
     * para que sean sensibles a los planos de recorte definidos en SceneManager.
     * @param {THREE.Object3D} model El objeto 3D (normalmente el cerebro) que contiene las mallas a cortar.
     */
    setModel(model) {
        if (!model) {
            console.warn("setModel llamado con un modelo nulo.");
            return;
        }

        this.model = model;
        console.log("Estableciendo modelo para VolumeSlicer.");

        // Itera sobre todos los descendientes del modelo
        this.model.traverse((child) => {
            if (child.isMesh) {
                // Asegúrate de que el material tenga localClippingEnabled a true
                // y que use los planos de recorte globales del renderizador.
                // Es importante que el material sea un tipo compatible con recorte (ej. MeshStandardMaterial)
                if (child.material) {
                    child.material.clippingPlanes = this.sceneManager.renderer.clippingPlanes;
                    child.material.needsUpdate = true; // Asegura que los cambios en el material se apliquen
                    console.log(`Material del hijo actualizado para clipping en mesh: ${child.name || child.uuid}`);
                } else {
                    console.warn(`Malla sin material encontrado: ${child.name || child.uuid}`);
                }
            }
        });
    }

    /**
     * Aplica un corte específico al modelo llamando al método applyClipPlane
     * del SceneManager. Esto moverá el plano de corte y actualizará la vista.
     * @param {string} type El tipo de corte ('sagittal', 'coronal', 'axial', o 'none').
     * @param {number} position La posición del corte, normalizada de -1 a 1.
     */
    applyCut(type, position) {
        if (!this.model) {
            console.warn("No hay modelo establecido en VolumeSlicer para aplicar corte.");
            return;
        }
        console.log(`Aplicando corte '${type}' en posición: ${position}`);
        this.sceneManager.applyClipPlane(type, position);
    }

    /**
     * Remueve todos los cortes, generalmente volviendo al estado 'none'.
     */
    clearCuts() {
        console.log("Limpiando todos los cortes.");
        this.sceneManager.applyClipPlane('none');
    }
}