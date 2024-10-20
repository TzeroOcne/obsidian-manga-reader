import http from 'http';
import { MangaChapterData } from './types';

export type HTTPResponse = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage,
};

export type Handler = {
  post: (body: MangaChapterData) => Promise<void>|void,
};

export type CreateServerOptions = {
  staticFolder?: string,
};
