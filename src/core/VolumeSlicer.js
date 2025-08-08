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
        if (this.activeCutPlane === 'none') return;
    
        let minCoord, maxCoord;
        let normal;
    
        switch (this.activeCutPlane) {
            case 'sagittal':
                minCoord = this.modelBoundingBox.min.x;
                maxCoord = this.modelBoundingBox.max.x;
                normal   = [ 1, 0, 0 ];
                break;
    
            case 'coronal':
                minCoord = this.modelBoundingBox.min.y;
                maxCoord = this.modelBoundingBox.max.y;
                normal   = [ 0, 1, 0 ];
                break;
    
            case 'axial':
                minCoord = this.modelBoundingBox.min.z;
                maxCoord = this.modelBoundingBox.max.z;
                normal   = [ 0, 0, 1 ];
                break;
    
            default:
                console.warn("Tipo de corte desconocido:", this.activeCutPlane);
                return;
        }
    
        const actualPosition = minCoord + (maxCoord - minCoord) * normalizedPosition;
        this.currentClipPosition = actualPosition;
    
        console.log(
          `Corte activo: ${this.activeCutPlane} → eje ${
            this.activeCutPlane === 'sagittal' ? 'X'
          : this.activeCutPlane === 'coronal'  ? 'Y'
          :                                     'Z'
          }`,
          `pos = ${actualPosition.toFixed(2)} (norm = ${normalizedPosition.toFixed(2)})`
        );
    
        if (this.niiViewer) {
            this.niiViewer.setClipPlane([ normal[0], normal[1], normal[2], -actualPosition ]);
            this.niiViewer.updateGLVolume();
        } else if (this.model) {
            this.sceneManager.applyClipPlane(this.activeCutPlane, actualPosition);
        }
    }


    clearCuts() {
        console.log("Limpiando todos los cortes.");
        this.activeCutPlane = 'none';
        this.currentClipPosition = 0;
        
        if (this.niiViewer) {
            this.niiViewer.setClipPlane([0, 0, 0, 0]);
            this.niiViewer.updateGLVolume();
        } else {
            this.sceneManager.applyClipPlane('none');
        }
    }
}