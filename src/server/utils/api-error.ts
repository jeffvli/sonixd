class ApiError extends Error {
  message: string;
  statusCode: number;

  constructor(options: { statusCode: number; message: string }) {
    super(options.message);
    this.message = options.message;
    this.statusCode = options.statusCode;
  }

  static badRequest(message: string) {
    return new ApiError({
      statusCode: 400,
      message: message || 'Bad request.',
    });
  }

  static unauthorized(message: string) {
    return new ApiError({
      statusCode: 401,
      message: message || 'Unauthorized.',
    });
  }

  static forbidden(message: string) {
    return new ApiError({ statusCode: 403, message: message || 'Forbidden.' });
  }

  static notFound(message: string) {
    return new ApiError({ statusCode: 404, message: message || 'Not found.' });
  }

  static conflict(message: string) {
    return new ApiError({ statusCode: 409, message: message || 'Conflict.' });
  }

  static gone(message: string) {
    return new ApiError({ statusCode: 410, message: message || 'Gone.' });
  }

  static internal(message: string) {
    return new ApiError({
      statusCode: 500,
      message: message || 'Internal error.',
    });
  }
}

export default ApiError;
