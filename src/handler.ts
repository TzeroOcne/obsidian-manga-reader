import { App, requestUrl } from 'obsidian';
import { MangaChapterData } from './types';
import { createFolderIfNotExist } from './util';

export const handlePost = (
  app: App,
  map: Record<string, string>,
) => {
  return async (body: MangaChapterData) => {
    const chapterFolderPath = [
      'entries',
      body.group,
      body.title,
      body.chapter,
    ].join('/');
    const resourceFolderPath = `${chapterFolderPath}/_resources`;

    await createFolderIfNotExist(app, resourceFolderPath, { parent: true });

    const fileList = await Promise.all(body.content.map(async ({
      source: fileurl,
    }) => {
      const fileName = fileurl.split('/').pop()!;
      const {
        arrayBuffer: fileData,
      } = await requestUrl(fileurl);

      const filePath = `${resourceFolderPath}/${fileName}`;
      let file = app.vault.getFileByPath(filePath);
      if (file) {
        await app.vault.modifyBinary(file, fileData);
      } else {
        file = await app.vault.createBinary(filePath, fileData);
      }
      return `![${file.name}](${encodeURI(file.path)})`;
    }),
    );

    const filePath = `${chapterFolderPath}/Chapter.md`;
    map[body.chapterLink] = filePath;
    const content = [
      '---',
      `id: ${body.chapterLink}`,
      'tags:',
      '  - manga-chapter',
      'cssclasses:',
      '  - manga-chapter',
      '---',
      ...fileList,
      '',
      `<button id="prev-button" name="${body.prevChapterLink}">`,
      '  Prev',
      '</button>',
      `<button id="next-button" name="${body.nextChapterLink}">`,
      '  Next',
      '</button>',
    ].join('\n');
    const file = app.vault.getFileByPath(filePath);
    if (file) {
      await app.vault.modify(file, content);
    } else {
      await app.vault.create(filePath, content);
    }
  };
};
