import settings from 'electron-settings';
import fs from 'fs';
import path from 'path';

const download = require('image-downloader');

const cacheImage = (fileName: string, url: string, cacheType: string) => {
  const settingsPath = path.dirname(settings.file());

  // We save the img to a temp path first so that React does not try to use the
  // in-progress downloaded image which would cause the image to be cut off
  const tempImgPath = path.join(
    settingsPath,
    'sonixdCache',
    `${settings.getSync('serverBase64')}`,
    cacheType,
    `TEMP_${fileName}`
  );

  const cachedImgPath = path.join(
    settingsPath,
    'sonixdCache',
    `${settings.getSync('serverBase64')}`,
    cacheType,
    `${fileName}`
  );

  const options = {
    url,
    dest: tempImgPath,
  };

  // Create the cache folder if it doesn't exist
  if (
    !fs.existsSync(
      path.join(
        settingsPath,
        'sonixdCache',
        `${settings.getSync('serverBase64')}`,
        cacheType
      )
    )
  ) {
    fs.mkdirSync(
      path.join(
        settingsPath,
        'sonixdCache',
        `${settings.getSync('serverBase64')}`,
        cacheType
      ),
      { recursive: true }
    );
  }

  // Check if an existing cached image exists
  if (!fs.existsSync(cachedImgPath) && !fs.existsSync(tempImgPath)) {
    if (!options.url.includes('placeholder')) {
      download
        .image(options)
        .then(() => fs.renameSync(tempImgPath, cachedImgPath))
        .catch((err: any) => console.log(err));
    }
  }
};

export default cacheImage;
