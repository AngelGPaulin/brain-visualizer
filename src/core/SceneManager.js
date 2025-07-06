import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Contenedor con ID '${containerId}' no encontrado. No se puede inicializar SceneManager.`);
      // Establecer una bandera para indicar que la inicialización falló
      this.isInitialized = false;
      return; // Salir del constructor si no se encuentra el contenedor
    }
    this.isInitialized = true; // Si el contenedor se encontró, la inicialización puede continuar

    // 1. Escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // 2. Cámara
    // Accede a clientWidth/Height solo después de confirmar que this.container existe
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 300);

    // 3. Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;

    this.renderer.localClippingEnabled = true;

    // 4. Controles de Órbita
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // 5. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(150, 200, 150);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    this.scene.add(directionalLight);

    // 6. Planos de Recorte
    this.clippingPlanes = {
      sagittal: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
      coronal: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      axial: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
    };
    this.renderer.clippingPlanes = [];
    this.activePlaneHelper = null;

    // 7. Animación: Es crucial bindear 'animate' al contexto de la instancia
    // antes de la primera llamada y para las llamadas recursivas.
    this.animate = this.animate.bind(this); // Pre-bindear el método una vez
    this.animate(); // Iniciar el bucle de animación

    // Manejo de redimensionamiento de ventana
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // Método para manejar el redimensionamiento de la ventana del navegador
  onWindowResize() {
    // Asegurarse de que SceneManager esté inicializado y el contenedor exista
    if (!this.isInitialized || !this.container) {
      console.warn("SceneManager no está completamente inicializado o el contenedor no existe durante el redimensionamiento.");
      return;
    }
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  // Método de bucle de animación
  animate() {
    // 'this.animate' ya está bindeado, así que no es necesario bindearlo de nuevo aquí
    requestAnimationFrame(this.animate);
    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Aplica un corte específico al modelo usando un plano de recorte.
   * @param {string} type El tipo de corte ('sagittal', 'coronal', 'axial', o 'none').
   * @param {number} position La posición del corte, normalizada de -1 a 1 (donde 0 es el centro).
   * Este valor se mapeará al rango de las dimensiones del modelo.
   */
  applyClipPlane(type, position = 0) {
    if (!this.isInitialized) { // Comprobar si SceneManager se inicializó correctamente
      console.warn("SceneManager no está inicializado. No se puede aplicar el plano de corte.");
      return;
    }
    this.renderer.clippingPlanes = [];

    if (this.activePlaneHelper) {
      this.scene.remove(this.activePlaneHelper);
      this.activePlaneHelper = null;
    }

    if (type === 'none') {
      return;
    }

    const plane = this.clippingPlanes[type];
    if (!plane) {
      console.warn(`Tipo de plano de recorte desconocido: ${type}`);
      return;
    }

    const modelScaleFactor = 100;

    console.log(`Slider 'position' (normalized): ${position}`);
    console.log(`modelScaleFactor: ${modelScaleFactor}`);
    console.log(`Calculated plane.constant: ${-position * (modelScaleFactor / 2)}`);

    plane.constant = -position * (modelScaleFactor / 2);

    this.renderer.clippingPlanes = [plane];

    console.log(`Aplicando corte: ${type}, posición slider: ${position}, constante del plano: ${plane.constant.toFixed(2)}`);
    console.log(`Normal del plano: (${plane.normal.x}, ${plane.normal.y}, ${plane.normal.z})`);
  }
}