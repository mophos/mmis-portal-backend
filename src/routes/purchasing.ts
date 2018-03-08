'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';

import { PurchasingModel } from '../models/purchasing';

const router = express.Router();
const models = new PurchasingModel();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Inventory API server' });
});

router.get('/list-subtype', (req, res, next) => {
  let db = req.db

  models.getSubtype(db)
    .then((results) => {
      res.send({ ok: true, rows: results })
    })
    .catch((error) => {
      res.send({ ok: false, error: error.message });
    })
    .finally(() => {
      db.destroy();
    })
})

export default router;