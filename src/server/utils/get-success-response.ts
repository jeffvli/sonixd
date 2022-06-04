import { PaginationItems } from '../types/types';

const getPaginationUrl = (url: string, action: 'next' | 'prev') => {
  const currentPageRegex = url.match(/page=(\d+)/gm);

  if (currentPageRegex) {
    const currentPage = Number(currentPageRegex[0].split('=')[1]);
    const newPage = action === 'next' ? currentPage + 1 : currentPage - 1;
    const normalizedUrl = process.env.APP_BASE_URL?.replace(/\/$/, '');

    return `${normalizedUrl}${url.replace(/page=\d+/gm, `page=${newPage}`)}`;
  }

  return null;
};

const getSuccessResponse = (options: {
  statusCode: number;
  data: any;
  paginationItems?: PaginationItems;
}) => {
  const { statusCode, data, paginationItems } = options;

  let pagination;

  if (paginationItems) {
    const { startIndex, totalEntries, limit, url } = paginationItems;
    const hasPrevPage = startIndex - limit >= 0;
    const hasNextPage = startIndex + limit <= totalEntries;

    pagination = {
      prevPage: hasPrevPage ? getPaginationUrl(url, 'prev') : null,
      nextPage: hasNextPage ? getPaginationUrl(url, 'next') : null,
      startIndex,
      totalEntries,
    };
  }

  return {
    response: 'Success',
    statusCode,
    data,
    pagination,
  };
};

export default getSuccessResponse;