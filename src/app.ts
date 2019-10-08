/// <reference path="../typings.d.ts"/>
import * as path from 'path';
let envPath = path.join(__dirname, '../../mmis-config');
require('dotenv').config(({ path: envPath }));

import * as express from 'express';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as _ from 'lodash';

const protect = require('@risingstack/protect');

import * as Knex from 'knex';
import { MySqlConnectionConfig } from 'knex';
import { Jwt } from './models/jwt';
const jwt = new Jwt();
import indexRoute from './routes/index';
import loginRoute from './routes/login';

import dashboardRoute from './routes/dashboard';
import purchasingRoute from './routes/purchasing';
import inventoryRoute from './routes/inventory';
import materialRoute from './routes/material';
import contractsRoute from './routes/contracts';

const app: express.Express = express();

//view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

// app.use(protect.express.sqlInjection({
//   body: false,
//   loggerFunction: console.error
// }));

// app.use(protect.express.xss({
//   body: true,
//   loggerFunction: console.error
// }));

let checkAuth = (req, res, next) => {
  let token: string = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
    .then((decoded: any) => {
      req.decoded = decoded;
      next();
    }, err => {
      console.log(err);
      return res.send({
        ok: false,
        error: 'No token provided.',
        code: 403
      });
    });
}

let staffAuth = (req, res, next) => {
  const decoded = req.decoded;
  const accessRight = decoded.accessRight;
  try {
    if (accessRight) {
      const rights = accessRight.split(',');
      if (_.indexOf(rights, 'WM_WAREHOUSE_ADMIN') > -1) {
        next();
      } else {
        res.send({ ok: false, error: 'No permission found!' });
      }
    } else {
      res.send({ ok: false, error: 'No permission found!' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
}

let adminAuth = (req, res, next) => {
  const decoded = req.decoded;
  const accessRight = decoded.accessRight;
  try {
    if (accessRight) {
      const rights = accessRight.split(',');
      if (_.indexOf(rights, 'WM_ADMIN') > -1) {
        next();
      } else {
        res.send({ ok: false, error: 'No permission found!' });
      }
    } else {
      res.send({ ok: false, error: 'No permission found!' });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
}

let dbConnection: MySqlConnectionConfig = {
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
}

app.use((req, res, next) => {
  req.db = Knex({
    client: 'mysql',
    connection: dbConnection,
    pool: {
      min: 0,
      max: 7,
      afterCreate: (conn, done) => {
        conn.query('SET NAMES utf8', (err) => {
          done(err, conn);
        });
      }
    },
    debug: true,
    acquireConnectionTimeout: 5000
  });

  next();
});



app.use('/', indexRoute);
//temperature
app.use('/dashboard', dashboardRoute);
app.use('/purchasing', purchasingRoute);
app.use('/inventory', inventoryRoute);
app.use('/material', materialRoute);
app.use('/contracts', contractsRoute);
app.use('/login', loginRoute);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

app.use((err: Error, req, res, next) => {
  res.status(err['status'] || 500);
  console.log(err);
  res.send({ ok: false, error: err });
});

export default app;
