import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import moment from 'moment';
import arrayMove from 'array-move';
import settings from 'electron-settings';
import { mockSettings } from './mockSettings';

export const isCached = (filePath: string) => {
  return fs.existsSync(filePath);
};

export const getRootCachePath = () => {
  const baseCachePath =
    process.env.NODE_ENV === 'test'
      ? mockSettings.cachePath
      : String(settings.getSync('cachePath'));

  const serverBase64 =
    process.env.NODE_ENV === 'test'
      ? mockSettings.serverBase64
      : String(settings.getSync('serverBase64'));

  return path.join(baseCachePath, 'sonixdCache', serverBase64);
};

export const getImageCachePath = () => {
  return path.join(getRootCachePath(), 'image', '/');
};

export const getSongCachePath = () => {
  return path.join(getRootCachePath(), 'song', '/');
};

export const getRecoveryPath = () => {
  return path.join(getRootCachePath(), '__recovery');
};

export const createRecoveryFile = (id: any, type: string, data: any) => {
  const recoveryPath = getRecoveryPath();

  if (!fs.existsSync(recoveryPath)) {
    fs.mkdirSync(recoveryPath, { recursive: true });
  }

  const filePath = path.join(recoveryPath, `${type}_${id}.json`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
};

export const isFailedResponse = (res: any) => {
  if (res.length >= 1) {
    const statuses = _.map(res, 'status');

    if (statuses.includes('failed')) {
      return true;
    }
  } else if (res.status === 'failed') return true;

  return false;
};

export const errorMessages = (res: any) => {
  const errors: any[] = [];

  if (res.length >= 1) {
    const statuses = _.map(res, 'status');
    if (statuses.includes('failed')) {
      res.forEach((response: any) => {
        if (response.status === 'failed') {
          errors.push(response.error.message);
        }
      });
    }
  } else {
    errors.push(res.error.message);
  }

  return errors;
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
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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

  if (Number.isNaN(minutes)) {
    return null;
  }

  return `${minutes}:${seconds}`;
};

export const formatDate = (date: string) => {
  return moment(date).format('MMM D YYYY');
};

export const convertByteToMegabyte = (kb: number) => {
  return (kb * 0.000001).toFixed(1);
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

export const moveSelectedUp = (entryData: any[], selectedEntries: any[]) => {
  // Ascending index is needed to move the indexes in order
  const selectedIndices = selectedEntries.map((selected: any) => {
    return entryData.findIndex((item: any) => item.uniqueId === selected.uniqueId);
  });

  const selectedIndexesAsc = selectedIndices.sort((a: number, b: number) => a - b);
  const cr = consecutiveRanges(selectedIndexesAsc);

  // Handle case when index hits 0
  if (
    !(
      selectedIndexesAsc.includes(0) &&
      areConsecutive(selectedIndexesAsc, selectedIndexesAsc.length)
    )
  ) {
    selectedIndexesAsc.map((index: number) => {
      if (cr[0]?.includes(0)) {
        if (!cr[0]?.includes(index) && index !== 0) {
          return arrayMove.mutate(entryData, index, index - 1);
        }
      } else if (index !== 0) {
        return arrayMove.mutate(entryData, index, index - 1);
      }

      return undefined;
    });
  }

  return entryData;
};

export const moveSelectedDown = (entryData: any[], selectedEntries: any[]) => {
  // Descending index is needed to move the indexes in order
  const selectedIndices = selectedEntries.map((selected: any) => {
    return entryData.findIndex((item: any) => item.uniqueId === selected.uniqueId);
  });

  const cr = consecutiveRanges(selectedIndices.sort((a, b) => a - b));
  const selectedIndexesDesc = selectedIndices.sort((a, b) => b - a);

  // Handle case when index hits the end
  if (
    !(
      selectedIndexesDesc.includes(entryData.length - 1) &&
      areConsecutive(selectedIndexesDesc, selectedIndexesDesc.length)
    )
  ) {
    selectedIndexesDesc.map((index) => {
      if (cr[0]?.includes(entryData.length - 1)) {
        if (!cr[0]?.includes(index) && index !== entryData.length - 1) {
          return arrayMove.mutate(entryData, index, index + 1);
        }
      } else if (index !== entryData.length - 1) {
        return arrayMove.mutate(entryData, index, index + 1);
      }

      return undefined;
    });
  }

  return entryData;
};

export const moveSelectedToTop = (entryData: any, selectedEntries: any) => {
  const uniqueIds = _.map(selectedEntries, 'uniqueId');

  // Remove the selected entries from the queue
  const newList = entryData.filter((entry: any) => {
    return !uniqueIds.includes(entry.uniqueId);
  });

  // Get the updated entry rowIndexes since dragging an entry multiple times will change the existing selected rowIndex
  const updatedEntries = selectedEntries.map((entry: any) => {
    const findIndex = entryData.findIndex((item: any) => item.uniqueId === entry.uniqueId);
    return { ...entry, rowIndex: findIndex };
  });

  // Sort the entries by their rowIndex so that we can re-add them in the proper order
  const sortedEntries = updatedEntries.sort((a: any, b: any) => a.rowIndex - b.rowIndex);

  newList.splice(0, 0, ...sortedEntries);

  return newList;
};

export const moveSelectedToBottom = (entryData: any, selectedEntries: any) => {
  const uniqueIds = _.map(selectedEntries, 'uniqueId');

  // Remove the selected entries from the queue
  const newList = entryData.filter((entry: any) => {
    return !uniqueIds.includes(entry.uniqueId);
  });

  // Get the updated entry rowIndexes since dragging an entry multiple times will change the existing selected rowIndex
  const updatedEntries = selectedEntries.map((entry: any) => {
    const findIndex = entryData.findIndex((item: any) => item.uniqueId === entry.uniqueId);
    return { ...entry, rowIndex: findIndex };
  });

  // Sort the entries by their rowIndex so that we can re-add them in the proper order
  const sortedEntries = updatedEntries.sort((a: any, b: any) => a.rowIndex - b.rowIndex);

  newList.push(...sortedEntries);

  return newList;
};

export const moveSelectedToIndex = (
  entryData: any,
  selectedEntries: any,
  moveBeforeId: string | number
) => {
  const uniqueIds = _.map(selectedEntries, 'uniqueId');

  // Remove the selected entries from the queue
  const newList = entryData.filter((entry: any) => {
    return !uniqueIds.includes(entry.uniqueId);
  });

  // Used if dragging onto the first selected row. We'll need to calculate the number of selected rows above the first selected row
  // so we can subtract it from the spliceIndexPre value when moving it into the newList, which has all selected entries removed
  const spliceIndexPre = entryData.findIndex((entry: any) => entry.uniqueId === moveBeforeId);

  const queueAbovePre = entryData.slice(0, spliceIndexPre);
  const selectedAbovePre = queueAbovePre.filter((entry: any) => uniqueIds.includes(entry.uniqueId));

  // Used if dragging onto a non-selected row
  const spliceIndexPost = newList.findIndex((entry: any) => entry.uniqueId === moveBeforeId);

  // Used if dragging onto consecutive selected rows
  // If the moveBeforeId index is selected, then we find the first consecutive selected index to move to
  let firstConsecutiveSelectedDragIndex = -1;
  for (let i = spliceIndexPre - 1; i > 0; i -= 1) {
    if (uniqueIds.includes(entryData[i].uniqueId)) {
      firstConsecutiveSelectedDragIndex = i;
    } else {
      break;
    }
  }

  // If we get a negative index, don't move the entry.
  // This can happen if you try to drag and drop too fast
  if (spliceIndexPre < 0 && spliceIndexPre < 0) {
    return entryData;
  }

  // Find the slice index to add the selected entries to
  const spliceIndex =
    spliceIndexPost >= 0
      ? spliceIndexPost
      : firstConsecutiveSelectedDragIndex >= 0
      ? firstConsecutiveSelectedDragIndex
      : spliceIndexPre - selectedAbovePre.length;

  // Get the updated entry rowIndexes since dragging an entry multiple times will change the existing selected rowIndex
  const updatedEntries = selectedEntries.map((entry: any) => {
    const findIndex = entryData.findIndex((item: any) => item.uniqueId === entry.uniqueId);
    return { ...entry, rowIndex: findIndex };
  });

  // Sort the entries by their rowIndex so that we can re-add them in the proper order
  const sortedEntries = updatedEntries.sort((a: any, b: any) => a.rowIndex - b.rowIndex);

  // Splice the entries into the new queue array
  newList.splice(spliceIndex, 0, ...sortedEntries);

  // Finally, return the modified list
  return newList;
};

export const getUpdatedEntryRowIndex = (selectedEntries: any, entryData: any) => {
  const updatedEntries = selectedEntries.map((entry: any) => {
    const findIndex = entryData.findIndex((item: any) => item.uniqueId === entry.uniqueId);
    return { ...entry, rowIndex: findIndex };
  });

  // Sort the entries by their rowIndex so that we can re-add them in the proper order
  const sortedEntries = updatedEntries.sort((a: any, b: any) => a.rowIndex - b.rowIndex);

  return sortedEntries;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getCurrentEntryList = (playQueue: any) => {
  if (playQueue.sortedEntry.length > 0) {
    return 'sortedEntry';
  }

  if (playQueue.shuffle) {
    return 'shuffledEntry';
  }

  return 'entry';
};

export const getTheme = (themes: any[], value: string) => {
  return themes.find((theme) => theme.value === value);
};

export const filterPlayQueue = (filters: any[], entries: any) => {
  const enabledFilters = filters.filter((f: any) => f.enabled === true);
  const joinedFilterRegex = enabledFilters.map((f: any) => f.filter).join('|');
  if (joinedFilterRegex) {
    const filteredEntries = entries.filter((entry: any) => !entry.title.match(joinedFilterRegex));

    return {
      entries: filteredEntries,
      count: { original: entries.length, filtered: filteredEntries.length },
    };
  }
  return { entries, count: { original: entries.length, filtered: entries.length } };
};

export const getPlayedSongsNotification = (options: {
  original: number;
  filtered: number;
  type: 'play' | 'add';
}) => {
  if (options.type === 'play') {
    if (options.original === options.filtered) {
      return `Playing ${options.original} songs`;
    }

    return `Playing ${options.filtered} songs [-${options.original - options.filtered} filtered]`;
  }

  if (options.original === options.filtered) {
    return `Added ${options.original} songs`;
  }

  return `Added ${options.filtered} songs [-${options.original - options.filtered} filtered]`;
};
