module.exports = function (grunt) {
  var gtx = require('gruntfile-gtx').wrap(grunt);

  gtx.loadAuto();

  var gruntConfig = require('./grunt');
  gruntConfig.package = require('./package.json');

  gtx.config(gruntConfig);

  // We need our bower components in order to develop
  gtx.alias('build:dist', [
    //'recess:less',
    'clean:dist',
    //'copy:libs',
    'copy:dist',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'cacheBust',
    'usemin',
    'clean:tmp'
  ]);

  gtx.alias('build:html', [
    'clean:html',
    'copy:html',
    'recess:html',
    'swig:html',
    'concat:html',
    'uglify:html'
  ]);

  gtx.alias('release', ['bump-commit']);
  gtx.alias('release-patch', ['bump-only:patch', 'release']);
  gtx.alias('release-minor', ['bump-only:minor', 'release']);
  gtx.alias('release-major', ['bump-only:major', 'release']);
  gtx.alias('prerelease', ['bump-only:prerelease', 'release']);

  gtx.finalise();
}
