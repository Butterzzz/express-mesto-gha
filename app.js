const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '6345d800a52e0c7f4c04df13',
  };

  next();
});
app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use((req, res) => res.status(404).send({ message: 'Страница не найдена' }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
