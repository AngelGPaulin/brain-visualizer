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

    async loadNII(files, containerId) {
        if (!files || files.length !== 3) {
            throw new Error("Se requieren exactamente 3 archivos NIfTI para la visualización multiplanar.");
        }

        const canvas = document.getElementById(containerId);
        if (!canvas) {
            throw new Error(`Canvas con ID "${containerId}" no encontrado.`);
        }

        const nv = new Niivue({
            backColor: [1, 1, 1, 1],
            show3Dcrosshair: true,
            dragAndDropEnabled: false,
            isResizeCanvas: true,
            isSliceMM: false,
        });

        nv.attachToCanvas(canvas);

        const volumeList = files.map((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            let colormap, opacity, colorbarVisible = true;

            switch(index) {
                case 0:
                    colormap = 'gray';
                    opacity = 1;
                    colorbarVisible = false;
                    break;
                case 1:
                    colormap = 'glasbey';
                    opacity = 0.5;
                    colorbarVisible = false;
                    break;
                case 2:
                    colormap = 'warm';
                    opacity = 1;
                    colorbarVisible = true;
                    break;
            }

            return {
                url: objectUrl,
                file: file,
                name: file.name,
                colormap: colormap,
                opacity: opacity,
                colorbarVisible: colorbarVisible
            };
        });

        try {
            await nv.loadVolumes(volumeList);
            
            const aalVolume = nv.volumes[1];
            const response = await fetch("assets/colormaps/aal.json"); 
            const cmap = await response.json();
            aalVolume.setColormapLabel(cmap);

            nv.setSliceType(nv.sliceTypeMultiplanar);
            console.log("NIfTI cargado en modo multiplanar.");
            
            return nv;
        } catch (error) {
            console.error("Error al cargar los archivos NIfTI:", error);
            throw error;
        } finally {
            volumeList.forEach(vol => URL.revokeObjectURL(vol.url));
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