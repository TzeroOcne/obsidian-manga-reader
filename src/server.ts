import { App, requestUrl } from 'obsidian';
import http, { IncomingMessage } from "http";
import { CreateItemOptions, MangaChapterData } from "./types";

// Function to parse request body as JSON
const parseRequestBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    let body = '';

    // Collect data as it arrives
    req.on('data', chunk => {
      body += chunk.toString(); // Convert buffer to string
    });

    // End event is fired once all data is received
    req.on('end', () => {
      try {
        // Try to parse the body as JSON
        const parsedBody = JSON.parse(body);
        resolve(parsedBody); // Resolve the promise with the parsed data
      } catch (error) {
        reject(error); // Reject the promise on error
      }
    });
  });
};

async function createFolderIfNotExist(
  app: App,
  path: string,
  {
    parent = false,
  }: CreateItemOptions,
) {
  if (parent) {
    const parentPath = path.split('/').slice(0, -1).join('/');
    if (parentPath !== '') {
      await createFolderIfNotExist(app, parentPath, { parent });
    }
  }

const folder = app.vault.getFolderByPath(path);
if (folder) {
  return folder;
}

return app.vault.createFolder(path);
  }

export const createServer = (app: App) => {
  const server = http.createServer(async (req, res) => {
    // Set CORS headers to allow any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight (OPTIONS) request
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      const body = await parseRequestBody<MangaChapterData>(req);
      const chapterFolderPath = [
        'entries',
        body.group,
        body.title,
        body.chapter,
      ].join('/');
      const resourceFolderPath = `${chapterFolderPath}/_resources`;
      await createFolderIfNotExist(app, resourceFolderPath, { parent: true });

      const fileList = await Promise.all(body.content.map(async ({ source }) => {
        const fileurl = source;
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
        return `![${file.name}](${file.path.replace(/ /g, '%20')})`;
      }));

      const filePath = `${chapterFolderPath}/Chapter.md`;
      const content = fileList.join('\n');
      const file = app.vault.getFileByPath(filePath);
      if (file) {
        await app.vault.modify(file, content);
      } else {
        await app.vault.create(filePath, content);
      }
    }

    // Send response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      code: 'SUCCESS',
    }));
  })

  return server;
};
