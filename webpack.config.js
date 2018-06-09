//Dependences
const webpack = require('webpack')
const path = require('path')
const glob = require('glob')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
var CopyWebpackPlugin = require('copy-webpack-plugin')




const HtmlWebpackPlugin = require('html-webpack-plugin')
//Static Filepath
const dirs = {}
dirs.root = path.resolve(__dirname, './')
dirs.src = path.resolve(dirs.root, './src')
dirs.dist = path.resolve(dirs.root, './dist')
dirs.public = path.resolve(dirs.src, './public')
dirs.view = path.resolve(dirs.src, './views')
dirs.components = path.resolve(dirs.public, './components')
//Filepath of each page
const options = {
  cwd: dirs.view, // 
  sync: true, // 
}
const views = new glob.Glob('*/*', options).found

//Generate chunk entries
const entries = {}
views.forEach((page) => {
    page = page + '/index'
    entries[page] = path.resolve(dirs.view, page)
})

entries['public/vendor'] = ['vue']
entries['public/style'] = path.resolve(dirs.public,'./less/entry.less');



entries['app'] = path.resolve(dirs.src,'./main.js');



//Generate Html plugins

const plugins = views.map((page) => {
    return new HtmlWebpackPlugin({
        filename: page + '/index.html',
        template: path.resolve(dirs.view, page, 'index.html'),
        favicon: path.resolve(dirs.public, './images/favicon.ico'),
        chunks: [page + '/index','public/vendor','public/style']
    })
})




mainpage = new HtmlWebpackPlugin({

  filename: path.resolve(dirs.dist, './index.html'),
  template: path.resolve(dirs.root,'./index.html'),
  favicon: path.resolve(dirs.public, './images/favicon.ico'),

  chunks: ['public/vendor', 'app', 'public/style']

})


plugins.push(mainpage);




//Export webpack configuration
module.exports = {
  entry: entries,
  output: {
    path: dirs.dist,
    // publicPath:'../../',
    publicPath:'./',
    filename: '[name].js'
  },
  module: {
    rules: [
/*      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },*/
      {
        test:/\.vue$/,
        loader:'vue-loader',
        options: {
          loaders: {
              less:ExtractTextPlugin.extract(['css-loader','less-loader'])
          }
        }
      },
      {
        test:   /\.less$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract(['css-loader','less-loader'])
      },
      {
        test: /\.(woff|woff2|svg|eot|ttf)$/, 
        loader: 'file-loader?name=public/font/[name].[ext]'
      },
      {
        test: /\.(png|jpg|ico)$/,
        loader: 'file-loader?name=public/images/[name].[ext]'
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [
    ...plugins,
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'public/vendor'
    }),
    new webpack.HotModuleReplacementPlugin(),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './static'),
        to: 'static',
        ignore: ['.*']
      }
    ])

  ],
  resolve: {
      extensions: ['.js', '.vue'],
      alias: {
          vue: 'vue/dist/vue.common.js',
          components: dirs.components
      }
  },


  devServer: {
    contentBase: "./dist",
    hot: true,
    inline: true,
    progress:true
  }
}