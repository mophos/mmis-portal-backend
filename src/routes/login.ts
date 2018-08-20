'use strict';

import * as express from 'express';
import * as crypto from 'crypto';
import * as wrap from 'co-express';

import { Jwt } from '../models/jwt';
import { LoginModel } from '../models/login';

const router = express.Router();
const jwt = new Jwt();
const loginModel = new LoginModel();

router.post('/', wrap(async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    let encPassword = crypto.createHash('md5').update(password).digest('hex');
    let db = req.db;
    try {
      let results = await loginModel.doLogin(db, username, encPassword);
      if (results.length) {
        const payload = {
          fullname: results[0].fullname,
          id: results[0].id,
          accessRight: results[0].access_right,
          warehouseId: results[0].warehouse_id
        };
        
        const token = jwt.sign(payload);
        res.send({ ok: true, token: token })
      } else {
        res.send({ ok: false, error: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง' })
      }
    } catch (error) {
      res.send({ ok: false, error: error.message });
    }
  } else {
    res.send({ ok: false, error: 'กรุณาระบุชื่อผู้ใช้งานและรหัสผ่าน' })
  }
}));

router.get('/hospital', wrap(async (req, res, next) => {

  let db = req.db;

  try {
    let rs: any = await loginModel.getHospitalInfo(db);
    let json = JSON.parse(rs[0].value)
    res.send({ ok: true, hospitalName: json.hospname });
  } catch (error) {
    throw error;
  } finally {
    db.destroy();
  }

}));

export default router;
