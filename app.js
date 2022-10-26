const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { celebrate, Joi, errors } = require('celebrate');
const { errorsHandler } = require('./middlewares/errorsHandler');

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
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^(http|https):\/\/(www\.)?[\w-._~:/?#[\]@!$&'()*+,;=%]+#?$/i),
    about: Joi.string().min(2).max(30),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.use(auth);
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('/*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

// обработчик ошибок celebrate
app.use(errors());

// централизованная обработка ошибок
app.use(errorsHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
