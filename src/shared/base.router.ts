import { Router } from "express";

export abstract class BaseRouter {
  protected readonly router: Router;

  protected constructor() {
    this.router = Router();
  }

  get routes(): Router {
    return this.router;
  }
}
