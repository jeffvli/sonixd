import fs from 'fs';
import path from 'path';
import { getSongCachePath } from '../../shared/utils';

// We can re-use the image downloader package for song caching
const download = require('image-downloader');

const cacheSong = (fileName: string, url: string) => {
  const cachePath = getSongCachePath();

  // We save the song to a temp path first so that React does not try to use the
  // in-progress downloaded image which would cause the image to be cut off
  const tempSongPath = path.join(cachePath, `TEMP_${fileName}`);

  const cachedSongPath = path.join(cachePath, `${fileName}`);

  const options = {
    url,
    dest: tempSongPath,
  };

  // Create the cache folder if it doesn't exist
  if (!fs.existsSync(path.join(cachePath, 'song'))) {
    fs.mkdirSync(path.join(cachePath, 'song'), { recursive: true });
  }

  // Check if an existing cached image exists
  if (!fs.existsSync(cachedSongPath) && !fs.existsSync(tempSongPath)) {
    if (!options.url.includes('placeholder')) {
      try {
        download
          .image(options)
          .then(() => fs.renameSync(tempSongPath, cachedSongPath))
          .catch((err: any) => console.log(err));
      } finally {
        if (fs.existsSync(tempSongPath)) {
          fs.rmSync(tempSongPath);
        }
      }
    }
  }
};

export default cacheSong;
