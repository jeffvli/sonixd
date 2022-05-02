const getSuccessResponse = (options: { statusCode: number; data: any }) => {
  const { statusCode, data } = options;

  return {
    response: 'Success',
    statusCode,
    data,
  };
};

export default getSuccessResponse;
