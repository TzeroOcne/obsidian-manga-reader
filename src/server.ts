import http, { IncomingMessage } from "http";
import { Handler, MangaChapterData } from "./types";

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

export const createServer = (handler: Handler) => {
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
      await handler.post(body);
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
