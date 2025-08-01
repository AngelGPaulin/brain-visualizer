import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Contenedor con ID '${containerId}' no encontrado.`);
            this.isInitialized = false;
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;

        // Inicializa los planos de recorte. Los valores de 'constant' se modificarán dinámicamente.
        this.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),  // Sagital (X)
            new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),  // Coronal (Y)
            new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)   // Axial (Z)
        ];

        this.isInitialized = true;
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.renderer.localClippingEnabled = true; // Habilitar recorte local en el renderizador

        this.camera.position.set(0, 0, 150); // Ajusta la posición de la cámara para que el modelo sea visible
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;

        this.setupLighting();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(directionalLight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    clearScene() {
        while (this.scene.children.length > 0) {
            const obj = this.scene.children[0];
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
        this.setupLighting();
    }

    /**
     * Aplica o limpia un plano de recorte al renderizador.
     * @param {string} type El tipo de corte ('sagittal', 'coronal', 'axial', 'none').
     * @param {number} [position=0] La coordenada real en el espacio 3D para el corte.
     */
    applyClipPlane(type, position = 0) {
        // Deshabilitar todos los planos primero
        this.clippingPlanes.forEach(plane => {
            plane.constant = Infinity; // Mueve el plano infinitamente lejos para deshabilitarlo
        });
        this.renderer.clippingPlanes = []; // Limpiar los planos del renderizador

        let targetPlane = null;

        switch (type) {
            case 'sagittal': // Corta a lo largo del eje X (plano YZ)
                targetPlane = this.clippingPlanes[0];
                targetPlane.normal.set(1, 0, 0); // Normal apunta en la dirección positiva de X
                targetPlane.constant = -position; // Si normal es (1,0,0) y position es X, entonces X + constant = 0 => constant = -X
                break;
            case 'coronal': // Corta a lo largo del eje Y (plano XZ)
                targetPlane = this.clippingPlanes[1];
                targetPlane.normal.set(0, 1, 0); // Normal apunta en la dirección positiva de Y
                targetPlane.constant = -position;
                break;
            case 'axial': // Corta a lo largo del eje Z (plano XY)
                targetPlane = this.clippingPlanes[2];
                targetPlane.normal.set(0, 0, 1); // Normal apunta en la dirección positiva de Z
                targetPlane.constant = -position;
                break;
            case 'none':
                console.log("No clipping planes applied.");
                break;
            default:
                console.warn(`Tipo de corte desconocido: ${type}`);
                return;
        }

        if (targetPlane) {
            this.renderer.clippingPlanes = [targetPlane];
            console.log(`Aplicando plano de corte ${type} con normal (${targetPlane.normal.x}, ${targetPlane.normal.y}, ${targetPlane.normal.z}) y constante ${targetPlane.constant.toFixed(2)}`);
        }
    }
}