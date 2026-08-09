'use strict';

import * as express from 'express';
import * as wrap from 'co-express';

import { LoginModel } from '../models/login';

const router = express.Router();
const loginModel = new LoginModel();

// หมายเหตุ: POST / (login) ถูกถอดออกแล้ว
// การเข้าสู่ระบบทั้งหมดต้องผ่าน mmis-management-backend (/api/um/login) ที่เดียว
// เพื่อให้ผ่านขั้นตอนบังคับเปลี่ยนรหัสผ่านและ 2FA
// ไฟล์นี้เหลือไว้เฉพาะ GET /hospital ที่หน้า login เรียกใช้แสดงชื่อโรงพยาบาล

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
