module.exports = {
  dist: {
    files: [
      {
        src: [
          'index.html',
          'tpl/**',
          'assets/fonts/**',
          'assets/img/**'
        ],
        dest: 'dist/',
        cwd: 'src/',
        expand: true
      }
    ]
  },
  angular: {
    files: [
      {expand: true, src: ['**', '!**/less/**'], cwd: 'src/', dest: "dist/"}
    ]
  }
};
