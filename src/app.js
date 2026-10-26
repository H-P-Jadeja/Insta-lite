const express = require('express');
const usersRouter = require('./routes/users.routes');
const postsRouter = require('./routes/posts.routes');

const app = express();

app.use(express.json());

// Step 01: Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// User routes
app.use('/users', usersRouter);

// Post routes
app.use('/posts', postsRouter);

module.exports = app;
