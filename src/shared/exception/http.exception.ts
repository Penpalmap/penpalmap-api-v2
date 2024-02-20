export abstract class HttpException extends Error {
  constructor(public message: string, public readonly status: number) {
    super(message);
  }
}
