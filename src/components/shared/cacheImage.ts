import fs from 'fs';
import path from 'path';
import { getImageCachePath } from '../../shared/utils';

const download = require('image-downloader');

const cacheImage = (fileName: string, url: string) => {
  const cachePath = getImageCachePath();

  // We save the img to a temp path first so that React does not try to use the
  // in-progress downloaded image which would cause the image to be cut off
  const tempImgPath = path.join(cachePath, `TEMP_${fileName}`);

  const cachedImgPath = path.join(cachePath, `${fileName}`);

  const options = {
    url,
    dest: tempImgPath,
  };

  // Create the cache folder if it doesn't exist
  if (!fs.existsSync(path.join(cachePath, 'image'))) {
    fs.mkdirSync(path.join(cachePath, 'image'), { recursive: true });
  }

  // Check if an existing cached image exists
  if (!fs.existsSync(cachedImgPath) && !fs.existsSync(tempImgPath)) {
    if (!options.url.includes('placeholder')) {
      try {
        download
          .image(options)
          .then(() => fs.renameSync(tempImgPath, cachedImgPath))
          .catch((err: any) => console.log(err));
      } finally {
        if (fs.existsSync(tempImgPath)) {
          fs.rmSync(tempImgPath);
        }
      }
    }
  }
};

export default cacheImage;
