🧠 Brain Visualizer
Brain Visualizer es una aplicación web interactiva y ligera, diseñada para la visualización de modelos 3D del cerebro y la exploración de datos volumétricos en formato NIfTI (\*.nii,\*.nii.gz). La herramienta es ideal para la investigación en neurociencia, la educación, y el análisis visual de imágenes cerebrales directamente desde el navegador.

Características Principales
Visualización 3D: Renderizado de modelos cerebrales en formato \*.obj.

Carga de Datos Volumétricos: Soporte para la carga y visualización de archivos NIfTI (\*.nii,\*.nii.gz).

Seccionamiento Interactivo: Generación de cortes axiales, sagitales y coronales en tiempo real para el análisis de volúmenes.

Interfaz de Usuario: Una interfaz intuitiva y eficiente que aprovecha WebGL y la potencia de Three.js para un rendimiento óptimo.

Estructura del Proyecto
El proyecto sigue una estructura modular para facilitar su comprensión y mantenimiento:

brain-visualizer-main/
│
├── index.html              -> Interfaz principal y punto de entrada.
├── package.json            -> Gestión de dependencias y scripts de Node.js.
├── webpack.config.js       -> Configuración del bundler Webpack.
├── README.md               -> Documentación del proyecto (este archivo).
│
├── src/
│   ├── index.js            -> Lógica principal de la aplicación.
│   ├── ui/style.css        -> Estilos CSS para la interfaz de usuario.
│   ├── core/               -> Módulos con la lógica del visualizador.
│   │   ├── DataLoader.js   -> Funcionalidad para cargar archivos de datos (.nii, .obj).
│   │   ├── MeshVisualizer.js -> Componente para la visualización de mallas 3D.
│   │   ├── SceneManager.js -> Encapsula la gestión de la escena 3D.
│   │   └── VolumeSlicer.js -> Lógica para generar los cortes en los volúmenes NIfTI.
│   └── assets/
│       ├── models/         -> Directorio para modelos 3D y datos de ejemplo.
│       └── extras/         -> Otros recursos, como imágenes o GIFs.

Instalación
Prerrequisitos
Asegúrate de tener instalado Node.js (versión 14 o superior) y npm en tu sistema.

Pasos
Clonar el repositorio:

git clone https://github.com/tuusuario/brain-visualizer.git
cd brain-visualizer

Instalar dependencias:

npm install

Ejecutar la aplicación:

npm run start

La aplicación se iniciará en http://localhost:8080.

Construcción para Producción
Para generar una versión optimizada y lista para producción, ejecuta el siguiente comando:

npm run build

Licencia
Este proyecto está bajo la licencia MIT. Para más detalles, consulta el archivo LICENSE.

Créditos
Los modelos cerebrales y los datos de ejemplo utilizados en este proyecto provienen de fuentes académicas públicas, incluyendo el Montreal Neurological Institute (MNI) y diversos Neuroimaging datasets.🧠 Brain Visualizer
Brain Visualizer es una aplicación web interactiva y ligera, diseñada para la visualización de modelos 3D del cerebro y la exploración de datos volumétricos en formato NIfTI (\*.nii,\*.nii.gz). La herramienta es ideal para la investigación en neurociencia, la educación, y el análisis visual de imágenes cerebrales directamente desde el navegador.

Características Principales
Visualización 3D: Renderizado de modelos cerebrales en formato \*.obj.

Carga de Datos Volumétricos: Soporte para la carga y visualización de archivos NIfTI (\*.nii,\*.nii.gz).

Seccionamiento Interactivo: Generación de cortes axiales, sagitales y coronales en tiempo real para el análisis de volúmenes.

Interfaz de Usuario: Una interfaz intuitiva y eficiente que aprovecha WebGL y la potencia de Three.js para un rendimiento óptimo.

Estructura del Proyecto
El proyecto sigue una estructura modular para facilitar su comprensión y mantenimiento:

brain-visualizer-main/
│
├── index.html              -> Interfaz principal y punto de entrada.
├── package.json            -> Gestión de dependencias y scripts de Node.js.
├── webpack.config.js       -> Configuración del bundler Webpack.
├── README.md               -> Documentación del proyecto (este archivo).
│
├── src/
│   ├── index.js            -> Lógica principal de la aplicación.
│   ├── ui/style.css        -> Estilos CSS para la interfaz de usuario.
│   ├── core/               -> Módulos con la lógica del visualizador.
│   │   ├── DataLoader.js   -> Funcionalidad para cargar archivos de datos (.nii, .obj).
│   │   ├── MeshVisualizer.js -> Componente para la visualización de mallas 3D.
│   │   ├── SceneManager.js -> Encapsula la gestión de la escena 3D.
│   │   └── VolumeSlicer.js -> Lógica para generar los cortes en los volúmenes NIfTI.
│   └── assets/
│       ├── models/         -> Directorio para modelos 3D y datos de ejemplo.
│       └── extras/         -> Otros recursos, como imágenes o GIFs.

Instalación
Prerrequisitos
Asegúrate de tener instalado Node.js (versión 14 o superior) y npm en tu sistema.

Pasos
Clonar el repositorio:

git clone https://github.com/tuusuario/brain-visualizer.git
cd brain-visualizer

Instalar dependencias:

npm install

Ejecutar la aplicación:

npm run start

La aplicación se iniciará en http://localhost:8080.

Construcción para Producción
Para generar una versión optimizada y lista para producción, ejecuta el siguiente comando:

npm run build

Licencia
Este proyecto está bajo la licencia MIT. Para más detalles, consulta el archivo LICENSE.

Créditos
Los modelos cerebrales y los datos de ejemplo utilizados en este proyecto provienen de fuentes académicas públicas, incluyendo el Montreal Neurological Institute (MNI) y diversos Neuroimaging datasets.
