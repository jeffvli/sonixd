const getSuccessResponse = (options: {
  statusCode: number;
  data: any;
  totalEntries?: number;
  startIndex?: number;
}) => {
  const { statusCode, data, totalEntries, startIndex } = options;

  return {
    response: 'Success',
    statusCode,
    data,
    totalEntries,
    startIndex,
  };
};

export default getSuccessResponse;
