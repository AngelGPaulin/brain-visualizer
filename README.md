
🧠 Brain Visualizer

Una aplicación web interactiva para visualizar modelos 3D del cerebro y datos volumétricos en formato NIfTI (.nii, .nii.gz). Ideal para investigaciones en neurociencia, demostraciones educativas o análisis visual de imágenes cerebrales.

Características
---------------
- Visualización 3D de modelos cerebrales (.obj)
- Carga de imágenes cerebrales volumétricas (.nii, .nii.gz)
- Cortes axiales, sagitales y coronales del volumen
- Interfaz interactiva y ligera en el navegador
- Visualización mediante WebGL (Three.js)

Estructura del proyecto
------------------------
brain-visualizer-main/
│
├── index.html                  -> Interfaz principal
├── package.json                -> Dependencias y scripts de Node.js
├── webpack.config.js           -> Configuración de Webpack
├── README.md                   -> Este archivo
│
├── src/
│   ├── index.js                -> Punto de entrada de la app
│   ├── ui/style.css            -> Estilos de la interfaz
│   ├── core/                   -> Lógica principal
│   │   ├── DataLoader.js       -> Carga de archivos .nii y .obj
│   │   ├── MeshVisualizer.js   -> Visualización de modelos 3D
│   │   ├── SceneManager.js     -> Manejo de la escena 3D
│   │   └── VolumeSlicer.js     -> Cortes en volúmenes NIfTI
│   └── assets/
│       ├── models/             -> Modelos 3D y datos cerebrales
│       └── extras/             -> Recursos adicionales (GIF, etc.)

Instalación
-----------
Prerrequisitos:
- Node.js ≥ 14
- npm

Pasos:
1. Clona el repositorio
   git clone https://github.com/tuusuario/brain-visualizer.git
   cd brain-visualizer

2. Instala dependencias
   npm install

3. Ejecuta la app
   npm run start

La aplicación estará disponible en http://localhost:8080.

Build para producción
---------------------
npm run build

Licencia
--------
MIT

Créditos
--------
Modelos cerebrales y datos de ejemplo provienen de fuentes académicas públicas como MNI y Neuroimaging datasets.
