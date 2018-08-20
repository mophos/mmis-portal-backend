'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';


const router = express.Router();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Inventory API server' });
});

router.get('/version', (req, res, next) => {
  res.send({ ok: true, version: 'V2.0.0', build: '20180814' });
});

// export default router;
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////



export default router;
