const fs = require('fs');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: 'Microservicio de autenticación con TypeScript, Express, MongoDB y arquitectura Hexagonal',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor de desarrollo'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/infrastructure/routes/*.ts', './src/infrastructure/server/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

// Crear directorio docs si no existe
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Escribir archivo JSON
const outputPath = path.join(docsDir, 'swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('✅ Documentación Swagger generada en:', outputPath);
console.log('📄 Puedes usar este archivo para importar en Postman o Insomnia'); 