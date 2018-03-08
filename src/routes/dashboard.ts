'use strict';

import * as express from 'express';
import * as moment from 'moment';
import * as wrap from 'co-express';

import { DashboardModel } from '../models/dashboard';

const router = express.Router();
const dashboardModel = new DashboardModel();

router.get('/', (req, res, next) => {
  res.send({ ok: true, message: 'Welcome to Inventory API server' });
});

router.get('/showPurchase', wrap(async (req, res, next) => {
  const db = req.db;
  // const srType = 'PO';
  try {
    let rs = await dashboardModel.showPurchase(db);
    res.send({
      ok: true, rows: rs[0]
    });
  }
  catch (error) {
    res.send({
      ok: false, error: error.message
    })
  }
  finally {
    db.destroy()
  }
}));
router.get('/showGeneric', wrap(async (req, res, next) => {
  const db = req.db;
  // const srType = 'PO';
  try {
    let rs = await dashboardModel.showGeneric(db);
    res.send({
      ok: true, rows: rs[0]
    });
  }
  catch (error) {
    res.send({
      ok: false, error: error.message
    })
  }
  finally {
    db.destroy()
  }
}));
router.get('/showInven', wrap(async (req, res, next) => {
  const db = req.db;
  // const srType = 'PO';
  try {
    let rs = await dashboardModel.showInven(db);
    res.send({
      ok: true, rows: rs[0]
    });
  }
  catch (error) {
    res.send({
      ok: false, error: error.message
    })
  }
  finally {
    db.destroy()
  }
}));
router.get('/showInven_cost', wrap(async (req, res, next) => {
  const db = req.db;
  // const srType = 'PO';
  try {
    let rs = await dashboardModel.showInven_cost(db);
    res.send({
      ok: true, rows: rs[0]
    });
  }
  catch (error) {
    res.send({
      ok: false, error: error.message
    })
  }
  finally {
    db.destroy()
  }
}));

router.get('/test-stockcard', wrap(async (req, res, next) => {
  //   const db = req.db;
  //   // await stockCard.saveStockReceive(db, [1,2,3,4,5])
  //   res.send({ ok: true });
  // }));

  // router.get('/version', (req, res, next) => {
  //   res.send({ ok: true, version: 'v2.0.0', build: '20170917' });
  // });

  // // export default router;
  // ////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////

  // router.get('/report/approve/requis/:requisId', wrap(async (req, res, next) => {
  //   let db = req.db;
  //   try {
  //     let requisId = req.params.requisId;
  //     let hosdetail = await inventoryReportModel.hospital(db);
  //     let hospitalName = hosdetail[0].hospname;
  //     moment.locale('th');
  //     let today = moment(new Date()).format('D MMMM ') + (moment(new Date()).get('year') + 543);
  //     let approve_requis = await inventoryReportModel.approve_requis(db, requisId);
  //     approve_requis = approve_requis[0];
  //     let no = approve_requis[0].requisition_code
  //     let warehouse = approve_requis[0].warehouse_name
  //     let checkdate = approve_requis[0].check_date
  //     let expired_date = approve_requis[0].expired_date
  //     // console.log(checkdate);
  //     console.log(expired_date);
  //     // checkdate = moment(checkdate).format('D MMMM ') + (moment(checkdate).get('year') + 543);
  //     expired_date = moment(expired_date).format('D MMMM ') + (moment(expired_date).get('year') + 543);
  //     let sum: any = 0;
  //     approve_requis.forEach(value => {
  //       sum += value.total_cost;
  //       value.cost = inventoryReportModel.comma(value.cost);
  //       value.requisition_qty = inventoryReportModel.commaQty(value.requisition_qty);
  //       value.total_cost = inventoryReportModel.comma(value.total_cost);
  //       value.expired_date = moment(value.expired_date).format('DD/MM/') + (moment(value.expired_date).get('year') + 543);
  //     })
  //     sum = inventoryReportModel.comma(sum);
  //     res.render('approve_requis', { hospitalName: hospitalName, today: today, approve_requis: approve_requis, no: no, warehouse: warehouse, checkdate: checkdate, sum: sum });
  //   } catch (error) {
  //     res.send({ ok: false, error: error.message });
  //   } finally {
  //     db.destroy();
  //   }

}));//ตรวจสอบแล้ว 08/10/60

export default router;