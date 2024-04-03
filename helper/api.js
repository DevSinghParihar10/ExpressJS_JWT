const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const ResponseFormat = require("../utils/responseformate");
const https = require('https');

const SECRET_KEY = "wR8X2^6#tqF!zK@Y$%k9D7&g*pB3nEhA"; 

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               company:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: User already exists
 */
router.post("/register", async (req, res) => {
  const { name, age, company, username, password } = req.body;
  if (!name || !age || !company || !username || !password) {
    return res.status(400).json(new ResponseFormat("Bad Request","","400","All fields are required"));
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json(new ResponseFormat("","","","User already exists"));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      age,
      company,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json(new ResponseFormat("success","","", "User registered successfully" ));
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json(new ResponseFormat("Failed","","500","Internal Server Error" ));
  }
});

// User Login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in as an existing user
 *     description: Log in using username and password to obtain a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: JWT token generated successfully
 *       '401':
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json(new ResponseFormat("Bad Request","","400","Username and password are required"));
  }

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json(new ResponseFormat("Bad Request","","","Invalid username or password"));
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json(new ResponseFormat("Bad Request","","401","Invalid username or password"));
    }

    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json(new ResponseFormat("Failed","","500","Internal Server Error" ));
  }
});

// Middleware to verify JWT token and extract user information

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.username = decoded.username; // Add username to req object
    next();
  });
};
// Update user details with jwt token
router.put("/update", verifyToken, async (req, res) => {
  const { name, age, company } = req.body;
  if (!name || !age || !company) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username: req.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name;
    user.age = age;
    user.company = company;
    await user.save();

    res.status(200).json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

/**
 * @swagger
 * /auth/apis:
 *   get:
 *     summary: Fetch data from public APIs
 *     description: Retrieve data from public APIs and apply optional filtering.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter results by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of results
 *     responses:
 *       '200':
 *         description: Successfully fetched data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   API:
 *                     type: string
 *                   Description:
 *                     type: string
 *                   Auth:
 *                     type: string
 *                   HTTPS:
 *                     type: boolean
 *                   Cors:
 *                     type: string
 *                   Link:
 *                     type: string
 *                   Category:
 *                     type: string
 *                   Example:
 *                     type: boolean
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

// Define route handler for /apis endpoint
router.get("/apis", async (req, res) => {
  try {
    // Fetch data from the public API
    const response = await axios.get("https://api.publicapis.org/entries", {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    // Extract the data from the response
    const { entries } = response.data;
    
    // Apply filtering based on query parameters
    let filteredData = entries;

    // Filter by category if category query parameter is provided
    const category = req.query.category;
    if (category) {
      filteredData = filteredData.filter(
        (entry) => entry.Category.toLowerCase() === category.toLowerCase()
      );
    }

    // Limit the number of results if limit query parameter is provided
    const limit = parseInt(req.query.limit);
    if (!isNaN(limit)) {
      filteredData = filteredData.slice(0, limit);
    }

    // Send the filtered data as the response
    res.json(filteredData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = router;
