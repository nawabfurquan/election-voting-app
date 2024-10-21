const swaggerJSDoc = require("swagger-jsdoc");

// Swagger Doc options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GEVS Open Data REST API",
      version: "1.0.0",
      description: "Description",
    },
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
