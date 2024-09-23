export * from './https';

export type MangaReaderSettings = {
  host?: string,
  port?: number,
  pipeName?: string,
};

export type MangaPage = {
  name: string,
  source: string,
};

export type MangaChapterData = {
  group: string,
  title: string,
  chapter: string,
  content: MangaPage[],
};

export type CreateItemOptions = {
  parent?: boolean;
};
