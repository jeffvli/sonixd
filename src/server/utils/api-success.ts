interface SuccessResponse {
  data: any;
  totalEntries?: number;
  startIndex?: number;
}

class ApiSuccess {
  data: any;
  statusCode: number;
  totalEntries?: number;
  startIndex?: number;

  constructor(options: {
    statusCode: number;
    data: any;
    totalEntries?: number;
    startIndex?: number;
  }) {
    this.data = options.data;
    this.statusCode = options.statusCode;
    this.totalEntries = options.totalEntries;
    this.startIndex = options.startIndex;
  }

  static ok({ data, totalEntries, startIndex }: SuccessResponse) {
    return new ApiSuccess({
      statusCode: 200,
      data,
      totalEntries,
      startIndex,
    });
  }

  static created({ data, totalEntries, startIndex }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 201, data, totalEntries, startIndex });
  }

  static accepted({ data, totalEntries, startIndex }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 202, data, totalEntries, startIndex });
  }

  static noContent({ data, totalEntries, startIndex }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 204, data, totalEntries, startIndex });
  }

  static resetContent({ data, totalEntries, startIndex }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 205, data, totalEntries, startIndex });
  }

  static partialContent({ data, totalEntries, startIndex }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 206, data, totalEntries, startIndex });
  }
}

export default ApiSuccess;
