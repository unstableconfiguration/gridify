const fs = require('fs');
const ghpages = require('gh-pages');

// Copy build files to gh-pages branch folder
fs.copyFile('dist/gridify.js', 'gh-pages/scripts/gridify.js', (err) => {
  if (err) throw err;
  console.log('dist/gridify.js copied to gh-pages/scripts/gridify.js');
});

fs.copyFile('dist/gridify-tests.js', 'gh-pages/scripts/gridify-tests.js', (err) => { 
    if (err) throw err;
    console.log('dist/gridify-tests.js copied to gh-pages/scripts/gridify-tests.js');
});

// Publish /gh-pages/* to gh-pages branch and push to remote
ghpages.publish('gh-pages', function(err) {});