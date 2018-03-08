'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';

import { InventoryModel } from '../models/inventory';

const router = express.Router();
const models = new InventoryModel();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Inventory API server' });
});

export default router;