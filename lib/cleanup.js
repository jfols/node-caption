// Cleanup
// ---
// cleans up after generation of a captioned image

// Dependencies
var fs = require('fs'),
  util = require('util'),
  debug = require('debug')('cleanup')

// args are in this order so we can bind in the outputFile
var cleanup = module.exports = function (outputFile, err, captionedImage, originalImage, callback) {
  debug('cleaning up files: %s, %s, %s', originalImage, captionedImage, outputFile)
  // clean up if we've created a file, but don't fail here if the image doesn't exist.
  try {
    if (fs.existsSync(originalImage)) {
      fs.unlink(originalImage, (error) => {
        if (error) {
          console.warn(`node-caption: failed to remove file in cleanup ${originalImage}.`, error);
        }
      });
    }
  } catch (e) {
    debug('encountered non-fatal error removing %s. (%s)', originalImage, e.message)
  }
  // return errors if we have them
  if (err) return callback(err)
  // move image if we have a destination
  if (outputFile) {
    debug('copying %s to %s...', captionedImage, outputFile)
    var is = fs.createReadStream(captionedImage),
      os = fs.createWriteStream(outputFile)
    is.pipe(os)
    is.on('error', callback)
    is.on('end', function () {
      fs.unlink(captionedImage, (error) => {
        if (error) {
          console.warn(`node-caption: failed to remove file in cleanup ${captionedImage}.`, error);
        }
      })
      return callback(null, outputFile)
    })
  } else {
    debug('finished removing files.')
    callback(null, captionedImage)
  }
}