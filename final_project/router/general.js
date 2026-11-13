const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const exists = users.some((user) => user.username === username);
  if (exists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: "Book not found for ISBN " + isbn });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  const result = [];

  for (const key of keys) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      result.push({ isbn: key, ...books[key] });
    }
  }

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found for author " + author });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  const result = [];

  for (const key of keys) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      result.push({ isbn: key, ...books[key] });
    }
  }

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found with title " + title });
});

// Task 5: Get book reviews
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found for ISBN " + isbn });
});

// ---------- Tasks 10-13: Axios with async-await ----------

// Forward the upstream status/message if Axios got an error response
const sendAxiosError = (res, error) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }
  return res.status(500).json({ message: "Error fetching data", error: error.message });
};

// Task 10: Get the book list using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

// Task 11: Get book details by ISBN using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = encodeURIComponent(req.params.isbn);
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

// Task 12: Get book details by author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = encodeURIComponent(req.params.author);
    const response = await axios.get(`${BASE_URL}/author/${author}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

// Task 13: Get book details by title using async-await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = encodeURIComponent(req.params.title);
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return sendAxiosError(res, error);
  }
});

module.exports.general = public_users;