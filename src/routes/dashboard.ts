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

router.get('/orderPoint/:warehouseId', wrap(async (req, res, next) => {
  const db = req.db;
  let warehouseId = req.params.warehouseId;
  let types = await dashboardModel.getGenericTypes(db)
  types = types[0]
  let _rs: any;
  let rs = [];
  try {
    for (let i = 0; i < types.length; i++) {
      _rs = await dashboardModel.orderPoint(db, types[i].generic_type_id, warehouseId);
      _rs = _rs[0]
      rs.push(_rs)
    }
    res.send({
      ok: true, rows: rs
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

router.get('/budget/list/:budgetYear', async (req, res, next) => {

  let budgetYear = req.params.budgetYear;
  let db = req.db;
  try {
    let rs: any = await dashboardModel.getBudgetByYear(db, budgetYear);
    res.send({ ok: true, rows: rs });
  } catch (error) {
    console.log(error)
    res.send({ ok: false, error: error.messgae });
  } finally {
    db.destroy();
  }
});

router.get('/budget/transaction/:budgetchart/:sDate/:eDate/:budgetYear/:budgetDetailId?', async (req, res, next) => {
  let db = req.db;
  let budgetYear = req.params.budgetYear;
  let budgetDetailId = req.params.budgetDetailId;
  let sDate = req.params.sDate;
  let eDate = req.params.eDate;
  let budgetchart = req.params.budgetchart;
  let rs: any
  try {
    if (budgetchart == 1) {
      rs = await dashboardModel.getBudgetTransactionDay(db, budgetYear, budgetDetailId, sDate, eDate);
    } else if (budgetchart == 2) {
      rs = await dashboardModel.getBudgetTransactionMonth(db, budgetYear, budgetDetailId, sDate, eDate);
    }
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/budget/all/:budgetDetailId/:selectedYear', async (req, res, next) => {
  let db = req.db;
  let budgetDetailId = req.params.budgetDetailId;
  let selectedYear = req.params.selectedYear;
  try {
    let rs: any = await dashboardModel.getBudget(db, budgetDetailId, selectedYear);
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/budget/amount/:budgetDetailId', async (req, res, next) => {
  let db = req.db;
  let budgetDetailId = req.params.budgetDetailId;
  try {
    let rs: any = await dashboardModel.getBudgetAmount(db, budgetDetailId);
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/inventoryValue/:warehouseId/:date', async (req, res, next) => {
  let db = req.db;
  let warehouseId = req.params.warehouseId;
  let types = await dashboardModel.getGenericTypes(db)
  let date = req.params.date;
  let rs: any = []
  let _rs: any = []
  types = types[0]
  try {
    for (let i = 0; i < types.length; i++) {
      _rs = await dashboardModel.getInventoryValue(db, types[i].generic_type_id, warehouseId, date);
      rs.push(_rs[0])
    }
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/poApproved', async (req, res, next) => {
  let db = req.db;
  try {
    let rs: any = await dashboardModel.poApproved(db);
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/getOrdersWaiting/:warehouseId', async (req, res, next) => {
  let db = req.db;
  let warehouseId = req.params.warehouseId;
  try {
    let rs: any = await dashboardModel.getOrdersWaiting(db, warehouseId);
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/getOrdersWaitingApprove/:warehouseId', async (req, res, next) => {
  let db = req.db;
  let warehouseId = req.params.warehouseId;
  try {
    let rs: any = await dashboardModel.getOrdersWaitingApprove(db, warehouseId);
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

router.get('/getOrdersUnpaid/:warehouseId', async (req, res, next) => {
  let db = req.db;
  let warehouseId = req.params.warehouseId;
  try {
    let rs: any = await dashboardModel.getOrdersUnpaid(db, warehouseId);
    rs = rs[0]
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  } finally {
    db.destroy();
  }
});

export default router;