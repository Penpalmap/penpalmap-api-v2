export class PageDto<T> {
  limit: number;
  offset: number;
  total: number;
  data: T[];

  constructor(limit: number, offset: number, total: number, data: T[]) {
    this.limit = limit;
    this.offset = offset;
    this.total = total;
    this.data = data;
  }

  static empty<T>(): PageDto<T> {
    return new PageDto(0, 0, 0, []);
  }

  empty(): PageDto<T> {
    return PageDto.empty();
  }

  static concat<T>(page1: PageDto<T>, page2: PageDto<T>): PageDto<T> {
    return new PageDto(page1.limit, page1.offset, page1.total + page2.total, [
      ...page1.data,
      ...page2.data,
    ]);
  }

  concat(page: PageDto<T>): PageDto<T> {
    return PageDto.concat(this, page);
  }

  static map<T, R>(page: PageDto<T>, callback: (item: T) => R): PageDto<R> {
    return new PageDto(
      page.limit,
      page.offset,
      page.total,
      page.data.map(callback),
    );
  }

  map<R>(callback: (item: T) => R): PageDto<R> {
    return PageDto.map(this, callback);
  }

  static filter<T>(
    page: PageDto<T>,
    callback: (item: T) => boolean,
  ): PageDto<T> {
    return new PageDto(
      page.limit,
      page.offset,
      page.total,
      page.data.filter(callback),
    );
  }

  filter(callback: (item: T) => boolean): PageDto<T> {
    return PageDto.filter(this, callback);
  }
}
