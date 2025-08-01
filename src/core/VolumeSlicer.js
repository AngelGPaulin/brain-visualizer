import * as THREE from 'three';

export class VolumeSlicer {
    constructor(sceneManager) {
        if (!sceneManager || !sceneManager.renderer || !sceneManager.clippingPlanes) {
            console.error("VolumeSlicer requiere una instancia válida de SceneManager con renderer y clippingPlanes.");
            return;
        }
        this.sceneManager = sceneManager;
        this.model = null;
        this.niiViewer = null;
        this.activeCutPlane = 'none';
        this.modelBoundingBox = new THREE.Box3();
        this.currentClipPosition = 0;

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

    setNiiViewer(viewer) {
        this.niiViewer = viewer;
        console.log("Estableciendo visor NIfTI para VolumeSlicer.");
        
        if (this.niiViewer && this.niiViewer.volumes.length > 0) {
            const volume = this.niiViewer.volumes[0];
            this.modelBoundingBox.set(
                new THREE.Vector3(volume.minPlaneX, volume.minPlaneY, volume.minPlaneZ),
                new THREE.Vector3(volume.maxPlaneX, volume.maxPlaneY, volume.maxPlaneZ)
            );
            console.log("Bounding Box del volumen NIfTI:", this.modelBoundingBox);
        }
    }

    setCutPlane(type) {
        if (!['sagittal', 'coronal', 'axial', 'none'].includes(type)) {
            console.warn(`Tipo de corte inválido: ${type}. Usando 'none'.`);
            this.activeCutPlane = 'none';
        } else {
            this.activeCutPlane = type;
        }
        console.log(`Tipo de corte activo establecido a: ${this.activeCutPlane}`);

        if (this.activeCutPlane === 'none') {
            this.clearCuts();
        }
    }

    updateCutPlanePosition(normalizedPosition) {
        if (this.activeCutPlane === 'none') {
            return;
        }

        let minCoord, maxCoord;

        switch (this.activeCutPlane) {
            case 'sagittal':
                minCoord = this.modelBoundingBox.min.x;
                maxCoord = this.modelBoundingBox.max.x;
                break;
            case 'coronal':
                minCoord = this.modelBoundingBox.min.y;
                maxCoord = this.modelBoundingBox.max.y;
                break;
            case 'axial':
                minCoord = this.modelBoundingBox.min.z;
                maxCoord = this.modelBoundingBox.max.z;
                break;
            default:
                console.warn("Tipo de corte desconocido para updateCutPlanePosition.");
                return;
        }

        const actualPosition = minCoord + (maxCoord - minCoord) * normalizedPosition;
        this.currentClipPosition = actualPosition;

        console.log(`Actualizando posición de corte ${this.activeCutPlane} a: ${actualPosition.toFixed(2)} (normalizada: ${normalizedPosition.toFixed(2)})`);

        if (this.niiViewer) {
            // Para NIfTI: aplicar el corte directamente en la vista 3D
            const volume = this.niiViewer.volumes[0];
            if (!volume) return;

            switch(this.activeCutPlane) {
                case 'sagittal':
                    this.niiViewer.clipPlane = [1, 0, 0, -actualPosition];
                    break;
                case 'coronal':
                    this.niiViewer.clipPlane = [0, 1, 0, -actualPosition];
                    break;
                case 'axial':
                    this.niiViewer.clipPlane = [0, 0, 1, -actualPosition];
                    break;
            }
            this.niiViewer.updateGLVolume();
        } else if (this.model) {
            // Para OBJ: usar el sistema de clipping planes de Three.js
            this.sceneManager.applyClipPlane(this.activeCutPlane, actualPosition);
        }
    }

    clearCuts() {
        console.log("Limpiando todos los cortes.");
        this.activeCutPlane = 'none';
        this.currentClipPosition = 0;
        
        if (this.niiViewer) {
            this.niiViewer.clipPlane = [0, 0, 0, 0];
            this.niiViewer.updateGLVolume();
        } else {
            this.sceneManager.applyClipPlane('none');
        }
    }
}