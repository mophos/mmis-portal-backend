'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';

import { MaterialModel } from '../models/material';

const router = express.Router();
const models = new MaterialModel();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Inventory API server' });
});

export default router;