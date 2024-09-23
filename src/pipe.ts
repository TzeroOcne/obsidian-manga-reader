import net from 'net';
const pipeName = '\\\\.\\pipe\\obsidian-manga-reader'; // Change this to your pipe name

export default function pipe() {
  const server = net.createServer((connection) => {
    console.log('Client connected');

    connection.on('data', (data) => {
      console.log('Received message:', data.toString());
    });

    connection.on('end', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(pipeName, () => {
    console.log(`Listening on pipe: ${pipeName}`);
  });
}
