import { PaginationItems, SuccessResponse } from '../types/types';

class ApiSuccess {
  data: any;
  statusCode: number;
  paginationItems?: PaginationItems;

  constructor(options: {
    statusCode: number;
    data: any;
    paginationItems?: PaginationItems;
  }) {
    this.data = options.data;
    this.statusCode = options.statusCode;
    this.paginationItems = options.paginationItems;
  }

  static ok({ data, paginationItems }: SuccessResponse) {
    return new ApiSuccess({
      statusCode: 200,
      data,
      paginationItems,
    });
  }

  static created({ data, paginationItems }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 201, data, paginationItems });
  }

  static accepted({ data, paginationItems }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 202, data, paginationItems });
  }

  static noContent({ data, paginationItems }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 204, data, paginationItems });
  }

  static resetContent({ data, paginationItems }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 205, data, paginationItems });
  }

  static partialContent({ data, paginationItems }: SuccessResponse) {
    return new ApiSuccess({ statusCode: 206, data, paginationItems });
  }
}

export default ApiSuccess;
