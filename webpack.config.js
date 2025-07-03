const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Punto de entrada de tu aplicación, generalmente tu archivo JavaScript principal.
  entry: './src/index.js',

  // Configuración de la salida de los archivos compilados por Webpack.
  output: {
    filename: 'bundle.js', // Nombre del archivo JavaScript resultante.
    path: path.resolve(__dirname, 'dist'), // Directorio de salida.
    clean: true, // Limpia el directorio 'dist' antes de cada build.
  },

  // Configuración del servidor de desarrollo de Webpack.
  devServer: {
    // Especifica dónde debe buscar el servidor los archivos estáticos.
    // Ahora apunta a la carpeta 'dist', donde CopyWebpackPlugin copiará tus assets.
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    compress: true, // Habilita la compresión Gzip para todos los assets servidos.
    port: 8080, // Puerto en el que se ejecutará el servidor de desarrollo.
    open: true, // Abre el navegador automáticamente cuando el servidor se inicia.
    hot: true, // Habilita Hot Module Replacement (HMR).
  },

  // Plugins utilizados por Webpack para tareas adicionales.
  plugins: [
    // Genera un archivo HTML y le inyecta automáticamente tu bundle JavaScript.
    new HtmlWebpackPlugin({
      template: './index.html', // Ruta a tu archivo de plantilla HTML.
      filename: 'index.html',   // Nombre del archivo HTML de salida en 'dist'.
    }),
    // Copia archivos o directorios completos a la carpeta de salida (dist).
    // Esto es crucial para tus modelos 3D y otros assets que no son importados directamente
    // en tu JS pero que necesitas que estén disponibles en el servidor.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets', // Origen: la carpeta 'assets' dentro de 'src'.
          to: 'assets',       // Destino: una subcarpeta 'assets' dentro de 'dist'.
          noErrorOnMissing: true, // No lanza un error si la carpeta de origen no existe.
        },
      ],
    }),
  ],

  // Reglas para cómo Webpack maneja los diferentes tipos de módulos (archivos).
  module: {
    rules: [
      // Regla para archivos CSS.
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // style-loader inyecta CSS en el DOM, css-loader interpreta @import y url().
      },
      // Regla para archivos de imagen y modelos 3D.
      // 'asset/resource' copiará estos archivos a la carpeta de salida.
      {
        test: /\.(png|svg|jpg|jpeg|gif|obj|nii|gz|minc|gltf)$/i,
        type: 'asset/resource',
        generator: {
          // Define el nombre y la ruta de los archivos copiados en 'dist'.
          filename: 'assets/[name][ext]' // Por ejemplo, 'dist/assets/brain_model.obj'.
        }
      }
    ],
  },

  // Configuración de cómo Webpack resuelve los módulos.
  resolve: {
    extensions: ['.js'], // Permite omitir la extensión .js al importar módulos.
  },
};