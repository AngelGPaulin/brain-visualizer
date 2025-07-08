// src/core/DataLoader.js
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export class DataLoader {
    constructor() {
        console.log("DataLoader inicializado.");
        this.objLoader = new OBJLoader();
    }

    async loadFile(path) {
        const fileExtension = path.split('.').pop().toLowerCase();

        console.log(`Cargando archivo: ${path} con extensión: ${fileExtension}`);

        if (fileExtension === 'obj') {
            return this.loadOBJ(path);
        } else {
            const errorMsg = `Tipo de archivo no soportado: ${fileExtension}. Solo se aceptan .obj.`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    loadOBJ(url) {
        return new Promise((resolve, reject) => {
            console.log(`Cargando modelo OBJ desde: ${url}`);
            this.objLoader.load(
                url,
                (object) => {
                    console.log("Modelo OBJ cargado exitosamente.");
                    resolve(object);
                },
                (xhr) => {
                    // console.log((xhr.loaded / xhr.total * 100) + '% cargado');
                },
                (error) => {
                    console.error(`Error al cargar el archivo OBJ desde ${url}:`, error);
                    reject(new Error(`Error al cargar el OBJ: ${error.message}`));
                }
            );
        });
    }
}