const path = require('path');

const DocObjectConfig = env => {
  return {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/ts/index.ts",
    target: ['web', 'es5'],
    output: {
      filename: env.PROD_BUILD ? "docobject.bundle.min.js" : "docobject.bundle.js",
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'var',
      library: 'Doc'
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/
        }
      ]
    }
  }
}

const DocObjectBootstrapConfig = env => {
  return {
    mode: "development-components",
    devtool: "inline-source-map",
    entry: {
      components: {
        import: "./src/ts/components/index.ts",
        library: {
          name: 'DocBinds',
          type: 'var'
        }
      },
      main: {
        import: "./src/ts/index.ts",
        library: {
          name: 'Doc',
          type: 'var'
        }
      }
    },
    target: ['web', 'es5'],
    output: {
      filename: env.PROD_BUILD ? "docobject-components.bundle.min.js" : "docobject-[name].bundle.js",
      path: path.resolve(__dirname, 'dist'),
    },
   
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/
        }
      ]
    }
  }
}


module.exports = (env) => {
  return [
    DocObjectConfig(env),
    DocObjectBootstrapConfig(env)
  ]
};