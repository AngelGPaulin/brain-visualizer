// src/core/VolumeSlicer.js
import * as THREE from 'three';

export class VolumeSlicer {
    constructor(sceneManager) {
        if (!sceneManager || !sceneManager.renderer || !sceneManager.clippingPlanes) {
            console.error("VolumeSlicer requiere una instancia válida de SceneManager con renderer y clippingPlanes.");
            return;
        }
        this.sceneManager = sceneManager;
        this.model = null;
        this.activeCutPlane = 'none';
        this.modelBoundingBox = new THREE.Box3(); // Para almacenar el bounding box del modelo
        this.currentClipPosition = 0; // Guardar la última posición del corte

        console.log("VolumeSlicer inicializado con SceneManager.");
    }

    setModel(model) {
        if (!model) {
            console.warn("setModel llamado con un modelo nulo.");
            return;
        }

        this.model = model;
        console.log("Estableciendo modelo para VolumeSlicer.");

        this.modelBoundingBox.setFromObject(this.model);
        console.log("Bounding Box del modelo:", this.modelBoundingBox);


        this.model.traverse((child) => {
            if (child.isMesh) {
                if (child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach(material => {
                        material.clippingPlanes = this.sceneManager.renderer.clippingPlanes;
                        material.needsUpdate = true;
                    });
                    console.log(`Material del hijo actualizado para clipping en mesh: ${child.name || child.uuid}`);
                } else {
                    console.warn(`Malla sin material encontrado: ${child.name || child.uuid}`);
                }
            }
        });
    }

    /**
     * Establece el tipo de plano de corte activo.
     * Al cambiar de tipo, no aplica un corte visible inicialmente.
     * En su lugar, el slider (en index.js) se encargará de posicionar el corte.
     * @param {string} type El tipo de corte ('sagittal', 'coronal', 'axial', o 'none').
     */
    setCutPlane(type) {
        if (!['sagittal', 'coronal', 'axial', 'none'].includes(type)) {
            console.warn(`Tipo de corte inválido: ${type}. Usando 'none'.`);
            this.activeCutPlane = 'none';
        } else {
            this.activeCutPlane = type;
        }
        console.log(`Tipo de corte activo establecido a: ${this.activeCutPlane}`);

        // NOTA: Ya no llamamos a applyCut aquí. El `index.js` es responsable de llamar
        // `updateCutPlanePosition` con la posición inicial del slider (0 o 100).
        if (this.activeCutPlane === 'none') {
            this.clearCuts(); // Si se establece 'none', limpia los cortes
        }
    }

    /**
     * Actualiza la posición del plano de corte activo.
     * Este método es para ser llamado por el slider.
     * Mapea normalizedPosition (0-1) a un rango que cubre el bounding box completo del modelo.
     * @param {number} normalizedPosition La posición del corte, normalizada de 0 a 1.
     */
    updateCutPlanePosition(normalizedPosition) {
        if (!this.model || this.activeCutPlane === 'none') {
            // Si no hay modelo o no hay corte activo, no hagas nada.
            // La responsabilidad de 'none' es de clearCuts().
            return;
        }

        let minCoord, maxCoord;

        switch (this.activeCutPlane) {
            case 'sagittal': // Corta a lo largo del eje X
                minCoord = this.modelBoundingBox.min.x;
                maxCoord = this.modelBoundingBox.max.x;
                break;
            case 'coronal': // Corta a lo largo del eje Y
                minCoord = this.modelBoundingBox.min.y;
                maxCoord = this.modelBoundingBox.max.y;
                break;
            case 'axial': // Corta a lo largo del eje Z
                minCoord = this.modelBoundingBox.min.z;
                maxCoord = this.modelBoundingBox.max.z;
                break;
            default:
                console.warn("Tipo de corte desconocido para updateCutPlanePosition.");
                return;
        }

        // Mapear normalizedPosition (0 a 1) al rango minCoord a maxCoord
        // Si 0 en slider es minCoord y 1 es maxCoord
        const actualPosition = minCoord + (maxCoord - minCoord) * normalizedPosition;
        this.currentClipPosition = actualPosition;

        console.log(`Actualizando posición de corte ${this.activeCutPlane} a: ${actualPosition.toFixed(2)} (normalizada: ${normalizedPosition.toFixed(2)})`);

        // La normal del plano de corte en SceneManager.js apunta hacia el lado "visible"
        // Si la normal es (1,0,0) (sagital), un `constant` de -X cortará a la izquierda de X.
        // Queremos que `actualPosition` sea el punto exacto donde se encuentra el corte.
        // Entonces, el valor de la constante para el plano será el NEGATIVO de la posición.
        this.sceneManager.applyClipPlane(this.activeCutPlane, actualPosition);
    }

    /**
     * Remueve todos los cortes.
     */
    clearCuts() {
        console.log("Limpiando todos los cortes.");
        this.activeCutPlane = 'none'; // Resetear el plano activo
        this.currentClipPosition = 0; // Resetear la posición (no relevante cuando no hay corte, pero buena práctica)
        this.sceneManager.applyClipPlane('none'); // Notifica a SceneManager para limpiar los planos
    }
}