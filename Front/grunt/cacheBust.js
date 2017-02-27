module.exports = {
  options: {
    deleteOriginals: true
  },
  fonts: {
      options: {
          baseDir: 'dist/assets/',
          assets: ['fonts/**']
      },
      src: ['dist/assets/css/app.min.css']
  },
  img: {
      options: {
          assets: ['dist/assets/img/**']
      },
      src: ['dist/assets/css/app.min.css', 'dist/tpl/**/*']
  },
  expand: {
      options: {
          baseDir: 'dist/assets/',
          assets: ['js/**', 'css/**']
      },
      src: ['dist/index.html']
  }
}
