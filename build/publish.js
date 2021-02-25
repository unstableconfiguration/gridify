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

fs.copyFile('src/css/gridify.css', 'dist/gridify.css', (err) => {
    if(err) throw err;
    console.log('copied src/css/gridify.css to dist/gridify.css');
});

fs.copyFile('dist/gridify.css', 'gh-pages/css/gridify.css', (err) => {
    if(err) throw err;
    console.log('copied dist/gridify.css to gh-pages/css/gridify.css');
});

// Publish /gh-pages/* to gh-pages branch and push to remote
ghpages.publish('gh-pages', function(err) {});