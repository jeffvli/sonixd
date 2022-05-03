class ApiError extends Error {
  message: string;
  statusCode: number;

  constructor(options: { statusCode: number; message: string }) {
    super(options.message);
    this.message = options.message;
    this.statusCode = options.statusCode;
  }

  static badRequest(message: string) {
    return new ApiError({ statusCode: 400, message });
  }

  static unauthorized(message: string) {
    return new ApiError({ statusCode: 401, message });
  }

  static forbidden(message: string) {
    return new ApiError({ statusCode: 403, message });
  }

  static notFound(message: string) {
    return new ApiError({ statusCode: 404, message });
  }

  static conflict(message: string) {
    return new ApiError({ statusCode: 409, message });
  }

  static gone(message: string) {
    return new ApiError({ statusCode: 410, message });
  }

  static internal(message: string) {
    return new ApiError({ statusCode: 500, message });
  }
}

export default ApiError;
