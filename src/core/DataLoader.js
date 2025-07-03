import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class DataLoader {
  constructor() {
    this.objLoader = new OBJLoader();
  }

  /**
   * Carga un archivo OBJ desde una URL.
   * @param {string} url La URL del archivo OBJ a cargar.
   * @returns {Promise<THREE.Object3D>} Una promesa que resuelve con el objeto 3D cargado.
   */
  async loadOBJ(url) {
    try {
      console.log(`Cargando modelo OBJ desde: ${url}`);
      const object = await this.objLoader.loadAsync(url);
      console.log(`Modelo OBJ cargado exitosamente desde: ${url}`);

      // --- Opcional: Centrar el modelo ---
      // Calcula la caja delimitadora del objeto.
      const box = new THREE.Box3().setFromObject(object);
      // Obtiene el centro de la caja delimitadora.
      const center = box.getCenter(new THREE.Vector3());
      // Mueve el objeto para que su centro esté en el origen (0,0,0).
      object.position.sub(center);
      console.log(`Modelo centrado. Centro: (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`);

      // --- Opcional: Escalar el modelo a un tamaño razonable ---
      // Calcula el tamaño del modelo en cada dimensión.
      const size = box.getSize(new THREE.Vector3());
      // Encuentra la dimensión máxima (x, y o z).
      const maxDim = Math.max(size.x, size.y, size.z);
      // Define el tamaño deseado para la dimensión máxima del modelo.
      // Puedes ajustar este valor (ej. 50, 150, 200, 300) para adecuar el tamaño del cerebro a tu escena.
      // Empieza con 100 y ajusta según lo veas en el navegador.
      const desiredDim = 100;

      // Calcula el factor de escala necesario.
      if (maxDim > 0) { // Evita división por cero si el modelo no tiene dimensiones
          object.scale.multiplyScalar(desiredDim / maxDim);
          console.log(`Modelo escalado. Dimensión máxima original: ${maxDim.toFixed(2)}, Escala aplicada: ${(desiredDim / maxDim).toFixed(2)}`);
      } else {
          console.warn("La dimensión máxima del modelo es cero, no se aplicó escalado.");
      }

      return object;
    } catch (error) {
      console.error(`Error al cargar el archivo OBJ desde ${url}:`, error);
      throw error; // Propaga el error para que pueda ser manejado por la función que llama.
    }
  }

  // Puedes añadir otros métodos aquí para cargar diferentes tipos de archivos 3D (GLTF, etc.) si lo necesitas.
}