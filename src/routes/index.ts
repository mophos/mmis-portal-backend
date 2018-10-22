'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';


const router = express.Router();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Portal API server' });
});

router.get('/version', (req, res, next) => {
  res.send({ ok: true, version: 'V3.0.1', build: '20181022' });
});

// export default router;
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////



export default router;
