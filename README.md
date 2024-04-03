### ExpressJS Project README

This repository contains an ExpressJS project that implements API endpoints for user authentication using JSON Web Tokens (JWT) and interacts with MongoDB for user data storage.

#### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up MongoDB:

   Make sure MongoDB is installed and running locally on your machine. You can change the MongoDB connection URL in `app.js` if needed.
   Currently you create a database called "expressUsers" and collection "users".

5. Start the server:

   ```bash
   npm start
   ```
   or else you can use nodemon if you want devMode

#### Project Structure

- **app.js**: This file initializes the Express application, sets up middleware, connects to MongoDB, and starts the server.
  
- **api.js**: Contains API routes for user registration, login, fetching data from public APIs, updating user details, and accessing protected routes. Swagger documentation is also implemented here for API documentation.

- **models/User.js**: Defines the User schema and model for MongoDB.

- **utils/responseformat.js**: Defines a custom response format class for consistent API responses.

#### Dependencies

- **Express**: Web application framework for Node.js.
  
- **Body Parser**: Middleware to parse request bodies.

- **Mongoose**: MongoDB object modeling tool for Node.js.
  
- **Swagger-jsdoc**: Library to generate Swagger documentation from JSDoc comments.

- **Bcrypt**: Library for password hashing.

- **JSON Web Token (JWT)**: Library for generating and verifying JWT tokens.

- **Axios**: HTTP client for making requests to external APIs.

#### Usage
*Use Swagger for interactive ui url- http://localhost:3000/api-docs*
- Register a new user: `POST /auth/register`
- Log in as an existing user: `POST /auth/login` this generates JWT token
- Fetch data from public APIs: `GET /auth/apis`
    eg 'http://localhost:3000/auth/apis?category=animals&limit=10'
*Use postman or similar client to access these protected URLS with bearer token*
- Update user details (protected route): `PUT /auth/update`
- Access protected routes: `GET /auth/protected`

#### Authentication

- JWT tokens are generated upon successful login and must be included in the `Authorization` header for accessing protected routes.

#### Environment Variables

- You can set the `SECRET_KEY` environment variable to a secure value for JWT token generation and verification.

#### Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvement, feel free to open an issue or submit a pull request.

