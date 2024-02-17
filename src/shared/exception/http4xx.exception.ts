import { HttpException } from "./http.exception";

export class BadRequestException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Bad Request", 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Unauthorized", 401);
  }
}

export class PaymentRequiredException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Payment Required", 402);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Forbidden", 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Not Found", 404);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Method Not Allowed", 405);
  }
}

export class NotAcceptableException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Not Acceptable", 406);
  }
}

export class ProxyAuthenticationRequiredException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Proxy Authentication Required", 407);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Request Timeout", 408);
  }
}

export class ConflictException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Conflict", 409);
  }
}

export class GoneException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Gone", 410);
  }
}

export class LengthRequiredException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Length Required", 411);
  }
}

export class PreconditionFailedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Precondition Failed", 412);
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Payload Too Large", 413);
  }
}

export class URITooLongException extends HttpException {
  constructor(message?: string) {
    super(message ?? "URI Too Long", 414);
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Unsupported Media Type", 415);
  }
}

export class RangeNotSatisfiableException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Range Not Satisfiable", 416);
  }
}

export class ExpectationFailedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Expectation Failed", 417);
  }
}

export class ImATeapotException extends HttpException {
  constructor(message?: string) {
    super(message ?? "I'm a teapot", 418);
  }
}

export class MisdirectedRequestException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Misdirected Request", 421);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Unprocessable Entity", 422);
  }
}

export class LockedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Locked", 423);
  }
}

export class FailedDependencyException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Failed Dependency", 424);
  }
}

export class TooEarlyException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Too Early", 425);
  }
}

export class UpgradeRequiredException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Upgrade Required", 426);
  }
}

export class PreconditionRequiredException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Precondition Required", 428);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Too Many Requests", 429);
  }
}

export class RequestHeaderFieldsTooLargeException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Request Header Fields Too Large", 431);
  }
}

export class UnavailableForLegalReasonsException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Unavailable For Legal Reasons", 451);
  }
}
