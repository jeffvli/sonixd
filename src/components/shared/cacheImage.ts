import fs from 'fs';
import { getImageCachePath } from '../../shared/utils';

const download = require('image-downloader');

const cacheImage = (fileName: string, url: string) => {
  if (!fileName.includes('undefined')) {
    const cachePath = getImageCachePath();

    // We save the img to a temp path first so that React does not try to use the
    // in-progress downloaded image which would cause the image to be cut off
    // Also we use string concatenation here instead of path joins because too many
    // joins start to kill performance
    const tempImgPath = `${cachePath}TEMP_${fileName}`;
    const cachedImgPath = `${cachePath}${fileName}`;

    // Check if an existing cached image exists
    if (!fs.existsSync(cachedImgPath) && !fs.existsSync(tempImgPath)) {
      const options = {
        url,
        dest: tempImgPath,
      };

      if (!options.url.match('placeholder|2a96cbd8b46e442fc41c2b86b821562f')) {
        try {
          download
            .image(options)
            .then(() => fs.renameSync(tempImgPath, cachedImgPath))
            // Ignore any errors here because it would most likely be a race
            // condition error
            .catch(() => undefined);
        } finally {
          if (fs.existsSync(tempImgPath)) {
            fs.rmSync(tempImgPath);
          }
        }
      }
    }
  }
};

export default cacheImage;
