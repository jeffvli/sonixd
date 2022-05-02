class ApiSuccess {
  data: any;
  statusCode: number;

  constructor(options: { statusCode: number; data: any }) {
    this.data = options.data;
    this.statusCode = options.statusCode;
  }

  static ok(data: any) {
    return new ApiSuccess({ statusCode: 200, data });
  }

  static created(data: any) {
    return new ApiSuccess({ statusCode: 201, data });
  }

  static accepted(data: any) {
    return new ApiSuccess({ statusCode: 202, data });
  }

  static noContent(data: any) {
    return new ApiSuccess({ statusCode: 204, data });
  }

  static resetContent(data: any) {
    return new ApiSuccess({ statusCode: 205, data });
  }

  static partialContent(data: any) {
    return new ApiSuccess({ statusCode: 206, data });
  }
}

export default ApiSuccess;
