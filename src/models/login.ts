import Knex = require('knex');
import * as moment from 'moment';

export class LoginModel {
  doLogin(knex: Knex, username: string, password: string) {
    return knex('users')
      .select('id', 'fullname', 'access_right', 'warehouse_id')
      .where({
        username: username,
        password: password
      })
      .limit(1);
  }

  getHospitalInfo(knex: Knex) {
    return knex('sys_settings')
      .select('value')
      .where({ 'action_name': 'SYS_HOSPITAL' });
  }

}