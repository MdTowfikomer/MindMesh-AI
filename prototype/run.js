// Prototype Runner — MindMesh Tactile Neural Prototype
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  fs.readFile(FILE_PATH, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error loading prototype: ${err.message}`);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🧠 MindMesh Tactile Neural Prototype is live!`);
  console.log(`👉 Open in your browser: http://localhost:${PORT}\n`);
});
