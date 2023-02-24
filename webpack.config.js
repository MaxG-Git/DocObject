const path = require('path');




module.exports = (env) => {
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
}};