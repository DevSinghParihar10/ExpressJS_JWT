const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const authApi = require("./helper/api");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "JWT Authentication API",
      version: "1.0.0",
      description: "API endpoints for user authentication using JWT",
    },
  },
  apis: ["./helper/*.js"],
};

// Initialize Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/auth", authApi);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/expressUsers")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
