import * as THREE from 'three';

export class MeshVisualizer {
  constructor(scene) {
    this.scene = scene;
    console.log("MeshVisualizer inicializado.");
  }

  // CAMBIA EL MATERIAL POR DEFECTO A MeshStandardMaterial
  addModel(object, material = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0, // Un gris claro por defecto
      metalness: 0.1, // Baja reflectividad metálica
      roughness: 0.8, // Superficie más opaca/mate
      side: THREE.DoubleSide // Renderiza ambos lados de las caras
  })) {
    if (!object) {
      console.error("No se puede añadir un modelo nulo a la escena.");
      return;
    }

    object.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;

        // Asegúrate de que estas líneas estén presentes y correctas:
        // Estas líneas son las que VolumeSlicer.js ahora sobreescribe, lo cual es correcto.
        // child.material.clippingPlanes = []; // Esta línea será sobreescrita por VolumeSlicer.setModel
        // child.material.needsUpdate = true;
      }
    });

    this.scene.add(object);
    console.log("Nuevo modelo OBJ cargado y añadido a la escena.");
  }
}