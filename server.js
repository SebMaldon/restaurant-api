const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});