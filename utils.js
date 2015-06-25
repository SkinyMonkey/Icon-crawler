var fs = require('fs');

function fileExists(filePath) {
  try {
    fs.statSync(filePath);
    return true;
  }
  catch(e) {
    return false;
  }
}

module.exports = {
  'fileExists': fileExists
}
