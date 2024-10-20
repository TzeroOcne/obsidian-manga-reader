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
  chapterNumber: string,
  content: MangaPage[],
  chapterLink: string,
  prevChapterLink: string,
  nextChapterLink: string,
};

export type CreateItemOptions = {
  parent?: boolean;
};
