export interface Setupable<T> {
  setup(): Promise<T>;
}
