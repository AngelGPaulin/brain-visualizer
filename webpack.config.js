const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Importar el plugin

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/', // Asegura que las rutas se resuelvan desde la raíz del servidor
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // REMOVER la sección 'generator' de aquí, el CopyWebpackPlugin lo manejará
      {
        test: /\.(obj|gltf|glb|fbx|png|jpg|gif|svg)$/i,
        type: 'asset/resource', // Mantén esto, pero la copia la hará el plugin
        // Elimina la sección generator: { filename: 'assets/models/[name][ext]', }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    // AÑADIR CopyWebpackPlugin para copiar los assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets', // Origen: tu carpeta de assets
          to: 'assets',       // Destino: assets dentro de la carpeta 'dist'
        },
      ],
    }),
  ],
  resolve: {
    fallback: {
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "url": require.resolve("url/"),
      "fs": false,
      "util": require.resolve("util/"),
      "vm": require.resolve("vm-browserify"),
      "tty": require.resolve("tty-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
    }
  }
};