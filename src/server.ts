import http, { IncomingMessage } from 'http';
import { Handler, MangaChapterData } from './types';
import path from 'path';
import fs from 'fs';

// Set MIME types
const mimeTypes: { [key: string]: string } = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',  // Correct MIME type for WebAssembly
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

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

// Function to serve static files
const serveStaticFile = (req: IncomingMessage, res: http.ServerResponse, staticFolder: string) => {
  const requestedPath = req.url?.replace(/^\/static/, '') || '/';
  const filePath = path.join(staticFolder, requestedPath);
  

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // Get the file extension and set the appropriate Content-Type header
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res); // Pipe file stream to response
  });
};

export const createServer = (handler: Handler, staticFolder = path.join(__dirname, 'static')) => {
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

    // Serve static files if request URL starts with '/static'
    if (req.url?.startsWith('/static') && req.method === 'GET') {
      serveStaticFile(req, res, staticFolder);
      return;
    }

    if (req.method === 'POST') {
      const body = await parseRequestBody<MangaChapterData>(req);
      await handler.post(body);
    }

    // Send response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      code: 'SUCCESS',
    }));
  });

  return server;
};
