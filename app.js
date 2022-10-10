const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();
const usersRouter = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.use('/', usersRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
