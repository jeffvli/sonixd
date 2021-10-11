import fs from 'fs';
import { getSongCachePath } from '../../shared/utils';

// We can re-use the image downloader package for song caching
const download = require('image-downloader');

const cacheSong = (fileName: string, url: string) => {
  if (!fileName.includes('undefined')) {
    const cachePath = getSongCachePath();

    // We save the song to a temp path first so that React does not try to use the
    // in-progress downloaded image which would cause the image to be cut off
    // Also we use string concatenation here instead of path joins because too many
    // joins start to kill performance
    const tempSongPath = `${cachePath}TEMP_${fileName}`;
    const cachedSongPath = `${cachePath}${fileName}`;

    // Check if an existing cached image exists
    if (!fs.existsSync(cachedSongPath) && !fs.existsSync(tempSongPath)) {
      const options = {
        url,
        dest: tempSongPath,
      };
      if (!options.url.includes('placeholder')) {
        try {
          download
            .image(options)
            .then(() => fs.renameSync(tempSongPath, cachedSongPath))
            // Ignore any errors here because it would most likely be a race
            // condition error
            .catch(() => undefined);
        } finally {
          if (fs.existsSync(tempSongPath)) {
            fs.rmSync(tempSongPath);
          }
        }
      }
    }
  }
};

export default cacheSong;
