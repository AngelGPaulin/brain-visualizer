import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Contenedor con ID '${containerId}' no encontrado.`);
      return;
    }

    // 1. Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222); // Fondo gris oscuro para contraste

    // 2. Cámara (alejada un poco)
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 300); // Un valor más alto para asegurar que el modelo quepa en la vista inicial.

    // 3. Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true; // Habilita las sombras (importante para luces direccionales/puntuales)

    // 4. Controles de Órbita
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0); // La cámara mira al origen, donde estará el modelo centrado.
    this.controls.update();

    // 5. Luces (¡CRUCIAL PARA LA VISIBILIDAD CON MeshStandardMaterial!)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Luz suave que ilumina todo uniformemente
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Luz direccional, como el sol
    directionalLight.position.set(150, 200, 150); // Posición de la fuente de luz
    directionalLight.castShadow = true; // Permite que esta luz genere sombras
    // Opcional: Ajustes de sombra para mayor calidad
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    this.scene.add(directionalLight);

    // Opcional: Un helper visual para la luz direccional (solo para depuración, puedes comentarlo)
    // const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // this.scene.add(helper);

    // 6. Animación
    this.animate(); // Asegúrate de que esta función esté definida como un método de la clase.

    // Manejo de redimensionamiento de ventana
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // Método onWindowResize
  onWindowResize() {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  // Método animate (¡MUY IMPORTANTE que esté aquí y bind(this) sea correcto!)
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.controls) {
      this.controls.update(); // Actualiza los controles de órbita
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera); // Renderiza la escena
    }
  }
}