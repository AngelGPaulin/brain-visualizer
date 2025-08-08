import { Niivue } from '@niivue/niivue';

export class DataLoader {
    constructor() {
        console.log("DataLoader (NIfTI-only) inicializado.");
    }

    async loadNII(files, containerId) {
        if (!files || files.length !== 3) {
            throw new Error("Se requieren exactamente 3 archivos NIfTI para la visualización.");
        }

        const canvas = document.getElementById(containerId);
        if (!canvas) {
            throw new Error(`Canvas con ID "${containerId}" no encontrado.`);
        }

        const nv = new Niivue({
            show3Dcrosshair: true,
            dragAndDropEnabled: false,
        });

        nv.attachToCanvas(canvas);

        const volumeList = files.map((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            let colormap, opacity = 1, colorbarVisible = false;
            let cal_min, cal_max;

            switch(index) {
                case 0: // Anatómico
                    colormap = 'gray';
                    break;
                case 1: // Atlas
                    opacity = 0.5;
                    break;
                case 2: // Estadísticas
                    colormap = 'warm';
                    colorbarVisible = true;
                    cal_min = 0.50;
                    cal_max = 5.0; 
                    break;
            }

            return {
                url: objectUrl,
                name: file.name,
                colormap: colormap,
                opacity: opacity,
                colorbarVisible: colorbarVisible,
                cal_min: cal_min,
                cal_max: cal_max
            };
        });

        try {
            await nv.loadVolumes(volumeList);
            nv.setSliceType(nv.sliceTypeMultiplanar);
            console.log("Volúmenes NIfTI cargados correctamente.");
            return nv;
        } catch (error) {
            console.error("Error al cargar los volúmenes NIfTI:", error);
            throw error;
        }
    }
}