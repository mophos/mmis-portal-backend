'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';


const router = express.Router();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Portal API Service' });
});

router.get('/version', (req, res, next) => {
<<<<<<< HEAD
  res.send({ ok: true, version: 'V3.4.0', build: '20190930' });
=======
  res.send({ ok: true, version: 'V3.3.1', build: '20190528' });
>>>>>>> be1e63f88e12d90f7c2d0e6fdc3e0d452bb07c0e
});

// export default router;
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////



export default router;
