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
        // AÑADIR COLOR DE FONDO NEGRO A LA ESCENA PARA EVITAR VISUALIZACIONES ANARANJADAS
        this.scene.background = new THREE.Color(0x000000); 

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;

        this.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
        ];

        this.isInitialized = true;
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.renderer.localClippingEnabled = true; // Habilitar recorte local en el renderizador

        this.camera.position.set(0, 0, 150);
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

    applyClipPlane(type, position = 0) {
        this.clippingPlanes.forEach(plane => {
            plane.constant = Infinity;
        });
        this.renderer.clippingPlanes = [];

        let targetPlane = null;

        switch (type) {
            case 'sagittal':
                targetPlane = this.clippingPlanes[0];
                targetPlane.normal.set(1, 0, 0);
                targetPlane.constant = -position;
                break;
            case 'coronal':
                targetPlane = this.clippingPlanes[1];
                targetPlane.normal.set(0, 0, 1);
                targetPlane.constant = -position;
                break;
            case 'axial':
                targetPlane = this.clippingPlanes[2];
                targetPlane.normal.set(0, 1, 0);
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