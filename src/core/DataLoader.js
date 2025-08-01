import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Niivue } from '@niivue/niivue';

export class DataLoader {
    constructor() {
        console.log("DataLoader inicializado.");
        this.objLoader = new OBJLoader();
    }

    async loadOBJ(url) {
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                url,
                (object) => {
                    console.log("Archivo OBJ cargado correctamente.");
                    resolve(object);
                },
                (xhr) => {
                    const percent = (xhr.loaded / xhr.total) * 100;
                    console.log(`Cargando modelo: ${percent.toFixed(2)}%`);
                },
                (error) => {
                    console.error("Error al cargar el archivo OBJ:", error);
                    reject(error);
                }
            );
        });
    }

    async loadNII(file, containerId) {
        if (!(file instanceof File)) {
            throw new Error("El archivo proporcionado no es un objeto File válido.");
        }

        const canvas = document.getElementById(containerId);
        if (!canvas) {
            throw new Error(`Canvas con ID "${containerId}" no encontrado.`);
        }

        const nv = new Niivue({
            show3Dcrosshair: true,
            dragAndDropEnabled: false,
            isResizeCanvas: true,
            isSliceMM: false, // Usar coordenadas de voxel
        });

        nv.attachToCanvas(canvas);

        const objectUrl = URL.createObjectURL(file);

        try {
            await nv.loadVolumes([
                {
                    url: objectUrl,
                    file: file,
                    name: file.name,
                    colorMap: 'gray',
                    opacity: 1,
                }
            ]);

            nv.setSliceType(nv.sliceTypeRender); // Modo 3D
            nv.setClipPlane([0, 0, 0, 0]); // Inicializar plano de corte
            console.log("NIfTI cargado en modo 3D con cortes habilitados.");
            return nv;
        } catch (error) {
            console.error("Error al cargar el archivo NIfTI:", error);
            throw error;
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }

    async loadFile(url) {
        const extension = url.split('.').pop().toLowerCase();
        if (extension === 'obj') {
            return await this.loadOBJ(url);
        } else {
            throw new Error("Formato de archivo no compatible para carga directa por URL.");
        }
    }
}