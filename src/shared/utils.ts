import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import moment from 'moment';

let settingsPath = path.join(
  String(process.env.APPDATA),
  process.env.NODE_ENV !== 'production' ? 'Electron' : 'sonixd',
  'settings.json'
);

// For CI
settingsPath = fs.existsSync(settingsPath)
  ? settingsPath
  : 'src/shared/settings.json';

export const getSettings = () => {
  const parsedSettings = JSON.parse(String(fs.readFileSync(settingsPath)));
  return {
    repeat: parsedSettings.repeat,
    shuffle: parsedSettings.shuffle,
    volume: parsedSettings.volume,
    fadeDuration: parsedSettings.fadeDuration,
    fadeType: parsedSettings.fadeType,
    pollingInterval: parsedSettings.pollingInterval,
    volumeFade: parsedSettings.volumeFade,
    showDebugWindow: parsedSettings.showDebugWindow,
    theme: parsedSettings.theme,
    font: parsedSettings.font,
    scrollWithCurrentSong: parsedSettings.scrollWithCurrentSong,
  };
};

export const isCached = (filePath: string) => {
  return fs.existsSync(filePath);
};

export const getRootCachePath = () => {
  return path.join(
    String(settings.getSync('cachePath')),
    'sonixdCache',
    `${settings.getSync('serverBase64')}`
  );
};

export const getImageCachePath = () => {
  return path.join(getRootCachePath(), 'image');
};

export const getSongCachePath = () => {
  return path.join(getRootCachePath(), 'song');
};

export const shuffle = (array: any[]) => {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const formatSongDuration = (duration: number) => {
  const hours = Math.floor(duration / 60 / 60);
  const minutes = Math.floor((duration / 60) % 60);
  const seconds = String(duration % 60).padStart(2, '0');

  // if (minutes > 60) {
  //   const hours = Math.floor(minutes / 60);
  //   const newMinutes = Math.floor(minutes % 60);
  //   const newSeconds = String(duration % 60).padStart(2, '0');
  //   return `${hours}:${newMinutes}:${newSeconds}`;
  // }
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
};

export const formatDate = (date: string) => {
  return moment(date).format('L');
};

// https://www.geeksforgeeks.org/check-if-array-elements-are-consecutive/
const getMin = (arr: number[], n: number) => {
  let min = arr[0];
  for (let i = 1; i < n; i += 1) {
    if (arr[i] < min) min = arr[i];
  }
  return min;
};

const getMax = (arr: number[], n: number) => {
  let max = arr[0];
  for (let i = 1; i < n; i += 1) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
};

export const areConsecutive = (arr: number[], n: number) => {
  if (n < 1) return false;

  /* 1) Get the minimum element in array */
  const min = getMin(arr, n);

  /* 2) Get the maximum element in array */
  const max = getMax(arr, n);

  /* 3) max - min + 1 is equal to n,  then only check all elements */
  if (max - min + 1 === n) {
    /* Create a temp array to hold visited flag of all elements.
               Note that, calloc is used here so that all values are initialized
               as false */
    const visited = new Array(n);
    for (let i = 0; i < n; i += 1) {
      visited[i] = false;
    }
    let i;
    for (i = 0; i < n; i += 1) {
      /* If we see an element again, then return false */
      if (visited[arr[i] - min] !== false) {
        return false;
      }
      /* If visited first time, then mark the element as visited */
      visited[arr[i] - min] = true;
    }
    /* If all elements occur once, then return true */
    return true;
  }
  return false; // if (max - min  + 1 != n)
};

// https://www.geeksforgeeks.org/find-all-ranges-of-consecutive-numbers-from-array/
export const consecutiveRanges = (a: number[]) => {
  let length = 1;
  const list: any[] = [];

  // If the array is empty,
  // return the list
  if (a.length === 0) {
    return list;
  }

  // Traverse the array from first position
  for (let i = 1; i <= a.length; i += 1) {
    // Check the difference between the
    // current and the previous elements
    // If the difference doesn't equal to 1
    // just increment the length variable.
    if (i === a.length || a[i] - a[i - 1] !== 1) {
      // If the range contains
      // only one element.
      // add it into the list.
      if (length === 1) {
        // list.push(a[i - length].toString());
      } else {
        // Build the range between the first
        // element of the range and the
        // current previous element as the
        // last range.
        const range = [];
        for (let j = Number(a[i - length]); j <= a[i - 1]; j += 1) {
          range.push(j);
        }
        list.push(range);

        // list.push(a[i - length] + a[i - 1]);
      }

      // After finding the first range
      // initialize the length by 1 to
      // build the next range.
      length = 1;
    } else {
      length += 1;
    }
  }

  return list;
};
