import * as THREE from 'three';

export class MeshVisualizer {
  constructor(scene) {
    this.scene = scene;
    console.log("MeshVisualizer inicializado.");
  }

  /**
   * Añade un objeto 3D (normalmente el modelo cargado) a la escena.
   * Aplica un material por defecto si no se proporciona uno.
   * @param {THREE.Object3D} object El objeto 3D a añadir a la escena.
   * @param {THREE.Material} material El material a aplicar a las mallas del objeto (opcional).
   */
  addModel(object, material = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, side: THREE.DoubleSide })) {
    if (!object) {
      console.error("No se puede añadir un modelo nulo a la escena.");
      return;
    }

    // Recorre todos los hijos del objeto.
    object.traverse((child) => {
      // Si el hijo es una malla (parte visible del modelo).
      if (child.isMesh) {
        // Aplica el material proporcionado o el material por defecto.
        child.material = material;
        // Habilita que el objeto proyecte sombras.
        child.castShadow = true;
        // Habilita que el objeto reciba sombras.
        child.receiveShadow = true;
      }
    });

    // Añade el objeto (que ahora contiene el modelo 3D) a la escena.
    this.scene.add(object);
    console.log("Nuevo modelo OBJ cargado y añadido a la escena.");
  }

  // Puedes añadir otros métodos aquí para manipular el modelo si es necesario,
  // como removerlo, cambiar su material, o alternar su visibilidad.
}