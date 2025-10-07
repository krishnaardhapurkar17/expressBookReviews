const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid (i.e., does not already exist)
const isValid = (username) => {
    // Filter the users array to find any user with the same username.
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // If the length of the filtered array is 0, it means no user with that name was found.
    // Therefore, the username is valid for registration.
    return userswithsamename.length === 0;
}
// Function to check if username and password match a record
const authenticatedUser = (username, password) => {
    // Filter the users array to find any user with the matching username AND password.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // If the length of the filtered array is greater than 0, it means a matching user was found.
    // Therefore, the user is authenticated.
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
      return res.status(400).json({message: "Username and password are required"});
  }

  // Check if the user is valid
  if (authenticatedUser(username,password)) {
    // If authenticated, create a JWT
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 }); // Token is valid for 1 hour

    // Save the token and username in the session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    // If authentication fails, send an error
    return res.status(401).json({message: "Invalid login credentials"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;
  // Get the review text from the request query
  const reviewText = req.query.review;
  // Get the username from the session
  const username = req.session.authorization.username;

  // Check if the book exists
  if (books[isbn]) {
      let book = books[isbn];
      // Add or update the review using the username as the key
      book.reviews[username] = reviewText;
      return res.status(200).json({message: `The review for the book with ISBN ${isbn} has been added/updated.`});
  }
  else {
      return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Get the ISBN from the request parameters
    const isbn = req.params.isbn;
    // Get the username from the session
    const username = req.session.authorization.username;

    // Check if the book exists
    if (books[isbn]) {
        let book = books[isbn];
        // Check if a review from this user exists for this book
        if (book.reviews[username]) {
            // Delete the review
            delete book.reviews[username];
            return res.status(200).json({ message: `Review for the book with ISBN ${isbn} by user ${username} has been deleted.` });
        } else {
            return res.status(404).json({ message: `No review found by this user for the book with ISBN ${isbn}.` });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
