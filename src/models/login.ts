import Knex = require('knex');
import * as moment from 'moment';

export class LoginModel {
  // doLogin() ถูกถอดออกแล้ว — เคยอ่านจากตาราง users (legacy) แล้วออก JWT ด้วย
  // SECRET_KEY ตัวเดียวกับทั้งระบบ ซึ่งเป็นช่องทางเลี่ยงขั้นตอน 2FA
  // การเข้าสู่ระบบทั้งหมดต้องผ่าน mmis-management-backend ที่เดียว

  getHospitalInfo(knex: Knex) {
    return knex('sys_settings')
      .select('value')
      .where({ 'action_name': 'SYS_HOSPITAL' });
  }

}