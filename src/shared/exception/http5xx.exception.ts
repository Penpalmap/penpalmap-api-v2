import { HttpException } from "./http.exception";

export class InternalServerErrorException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Internal Server Error", 500);
  }
}

export class NotImplementedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Not Implemented", 501);
  }
}

export class BadGatewayException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Bad Gateway", 502);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Service Unavailable", 503);
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Gateway Timeout", 504);
  }
}

export class HttpVersionNotSupportedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "HTTP Version Not Supported", 505);
  }
}

export class VariantAlsoNegotiatesException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Variant Also Negotiates", 506);
  }
}

export class InsufficientStorageException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Insufficient Storage", 507);
  }
}

export class LoopDetectedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Loop Detected", 508);
  }
}

export class NotExtendedException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Not Extended", 510);
  }
}

export class NetworkAuthenticationRequiredException extends HttpException {
  constructor(message?: string) {
    super(message ?? "Network Authentication Required", 511);
  }
}
