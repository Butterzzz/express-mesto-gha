const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { PORT = 3000 } = process.env;
const app = express();

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-err');

mongoose.connect('mongodb://localhost:27017/mestodb');

// защита от автоматических запросов через лимиты (для защиты от DoS-атак)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});

app.use(express.json());

// для защиты приложения от веб-уязвимостей путем соответствующей настройки заголовков HTTP
app.use(helmet());
app.use(limiter);
app.disable('x-powered-by');

// роуты, не требующие авторизации
app.post('/signup', createUser);
app.post('/signin', login);

app.use(auth);
app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use('/*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

// централизованная обработка ошибок
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
