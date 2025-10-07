const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the username already exists using the imported isValid function
    if (isValid(username)) { 
      // If username is new, add the user to the users array
      users.push({"username":username, "password":password});
      return res.status(200).json({message: "User successfully registered. You can now log in."});
    } else {
      // If username exists, return a conflict error
      return res.status(409).json({message: "User already exists!"});
    }
  } 
  // If username or password are not provided, return a bad request error
  return res.status(400).json({message: "Unable to register user. Please provide a username and password."});
});

// Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    // Creating a new Promise that resolves with the books object
    const getBooks = new Promise((resolve, reject) => {
        resolve(books);
    });

    // Awaiting the promise to resolve and then sending the data
    const allBooks = await getBooks;
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  
  const getBookDetails = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      // If the book is found, resolve the promise with the book details
      resolve(book);
    } else {
      // If not found, reject the promise with an error message
      reject({ status: 404, message: "Book not found" });
    }
  });

  try {
    // Await the promise to get the book details
    const bookDetails = await getBookDetails;
    return res.status(200).json(bookDetails);
  } catch (error) {
    // If the promise is rejected, catch the error and send a response
    return res.status(error.status).json({ message: error.message });
  }
});
  
// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const results = [];
    
    bookKeys.forEach(key => {
      if (books[key].author === author) {
        results.push(books[key]);
      }
    });

    if (results.length > 0) {
      // If books are found, resolve the promise with the results
      resolve(results);
    } else {
      // If no books are found, reject the promise
      reject({ status: 404, message: "No books found by this author" });
    }
  });

  try {
    // Await the promise to get the books
    const authorBooks = await getBooksByAuthor;
    return res.status(200).json(authorBooks);
  } catch (error) {
    // If the promise is rejected, catch the error and send a response
    return res.status(error.status).json({ message: error.message });
  }
});

// Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const results = [];

    bookKeys.forEach(key => {
      if (books[key].title === title) {
        results.push(books[key]);
      }
    });

    if (results.length > 0) {
      // If books are found, resolve the promise with the results
      resolve(results);
    } else {
      // If no books are found, reject the promise
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  try {
    // Await the promise to get the books
    const titleBooks = await getBooksByTitle;
    return res.status(200).json(titleBooks);
  } catch (error) {
    // If the promise is rejected, catch the error and send a response
    return res.status(error.status).json({ message: error.message });
  }
});

  // If we found any books, send them with a 200 OK status
  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    // Otherwise, send a 404 Not Found status with an error message
    return res.status(404).json({message: "No books found with this title"});
  }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;
  
  // Check if a book with the given ISBN exists
  if (books[isbn]) {
    // If the book is found, send its 'reviews' object with a 200 OK status
    return res.status(200).json(books[isbn].reviews);
  } else {
    // If the book is not found, send a 404 Not Found status with an error message
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
