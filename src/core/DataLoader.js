export class DataLoader {
    constructor() {
        console.log("DataLoader (como proveedor de listas de volúmenes) inicializado.");
    }

    /**
     * Devuelve la lista de volúmenes por defecto.
     * @returns {Array} La lista de objetos de volumen para Niivue.
     */
    getDefaultVolumeList() {
        const basePath = 'assets/models/';
        const volumeList = [
            {
                url: `${basePath}mni152.nii.gz`,
                name: 'mni152.nii.gz',
                colormap: 'gray',
                opacity: 1,
                colorbarVisible: false
            },
            {
                url: `${basePath}aal.nii.gz`,
                name: 'aal.nii.gz',
                opacity: 0.5,
                colorbarVisible: false
            },
            {
                url: `${basePath}stats.nv_demo_mskd.nii.gz`,
                name: 'stats.nv_demo_mskd.nii.gz',
                colormap: 'warm',
                opacity: 1,
                colorbarVisible: true,
                cal_min: 0.50,
                cal_max: 5.0
            }
        ];
        return volumeList;
    }

    /**
     * Crea una lista de volúmenes a partir de los archivos del usuario.
     * @param {FileList} files - Los archivos seleccionados por el usuario.
     * @returns {Array} La lista de objetos de volumen para Niivue.
     */
    getUserVolumeList(files) {
        if (!files || files.length !== 3) {
            throw new Error("Se requieren exactamente 3 archivos NIfTI para la visualización.");
        }

        return Array.from(files).map((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            let colormap, opacity = 1, colorbarVisible = false;
            let cal_min, cal_max;

            switch(index) {
                case 0: colormap = 'gray'; break;
                case 1: opacity = 0.5; break;
                case 2: 
                    colormap = 'warm';
                    colorbarVisible = true;
                    cal_min = 0.50;
                    cal_max = 5.0; 
                    break;
            }

            return { url: objectUrl, name: file.name, colormap, opacity, colorbarVisible, cal_min, cal_max };
        });
    }
}