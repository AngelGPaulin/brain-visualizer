const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
      filename: 'index.html', // Nombre del archivo HTML de salida en 'dist'.
    }),
    // Copia archivos o directorios completos a la carpeta de salida (dist).
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets', // Origen: la carpeta 'assets' dentro de 'src'.
          to: 'assets', // Destino: una subcarpeta 'assets' dentro de 'dist'.
          noErrorOnMissing: true, // No lanza un error si la carpeta de origen no existe.
        },
      ],
    }),
    // Extrae el CSS de tus archivos JS en un archivo CSS aparte
    new MiniCssExtractPlugin({
        filename: '[name].css',
    }),
  ],

  // Reglas para cómo Webpack maneja los diferentes tipos de módulos (archivos).
  module: {
    rules: [
      // Regla para archivos CSS. Ahora usa MiniCssExtractPlugin.loader
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      // Regla para archivos de imagen y modelos 3D.
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