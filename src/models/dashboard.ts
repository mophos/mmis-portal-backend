import Knex = require('knex');
import * as moment from 'moment';

export class DashboardModel {

	showPurchase(knex: Knex) {
		return knex.raw(`
    SELECT 
		p.purchase_order_status as purchase_order_status,
		round(sum(p.total_price),2) as total_price,
    COUNT(p.purchase_order_status) as count_status 
    FROM
    pc_purchasing_order p
    GROUP BY 
    purchase_order_status
    `)
	}

	showGeneric(knex: Knex) {
		return knex.raw(`
		SELECT
	count( qty.generic_id ) count_generic_id,
	qty.generic_type_id generic_type_id,
	qty.generic_type_name generic_type_name,
	(
SELECT
	COUNT( mp.product_id ) 
FROM
	mm_products mp
	JOIN mm_generics mg ON mp.generic_id = mg.generic_id 
WHERE
	mg.generic_type_id = qty.generic_type_id 
	) AS count_product_id 
FROM
	(
SELECT
	sum( wm.qty ) AS qty,
	mp.product_id,
	mg.generic_id,
	mg.min_qty,
	mg.generic_type_id,
	mgt.generic_type_name 
FROM
	wm_products wm
	JOIN mm_products mp ON wm.product_id = mp.product_id
	JOIN mm_generics mg ON mg.generic_id = mp.generic_id
	LEFT JOIN mm_generic_types mgt ON mgt.generic_type_id = mg.generic_type_id 
GROUP BY
	wm.product_id 
	) AS qty 
WHERE
	qty.qty < qty.min_qty 
GROUP BY
	qty.generic_type_id
    `)
	}

	showInven(knex: Knex) {
		return knex.raw(`SELECT
		pi.warehouse_name,
		pi.warehouse_id,
		COUNT( pi.generic_id ) count_generic 
	FROM
		(
	SELECT
		ww.warehouse_name,
		wp.warehouse_id,
		SUM( wp.qty ) AS sum_qty,
		mp.generic_id,
		mpg.min_qty
	FROM
		wm_products AS wp
		 LEFT JOIN mm_products AS mp ON wp.product_id = mp.product_id
		 LEFT JOIN mm_generics AS mg ON mg.generic_id = mp.generic_id
		 LEFT JOIN wm_warehouses AS ww ON ww.warehouse_id = wp.warehouse_id
		 LEFT JOIN mm_generic_planning mpg ON ( mpg.warehouse_id = wp.warehouse_id AND mpg.generic_id = mp.generic_id)
	GROUP BY
		wp.warehouse_id,
		mp.product_id 
		) AS pi
	WHERE
		pi.sum_qty <= pi.min_qty 
	GROUP BY
		pi.warehouse_id
    `)
	}

	showInven_cost(knex: Knex) {
		return knex.raw(`SELECT
		ww.warehouse_name,
		round( sum( wp.qty * wp.cost ), 2 ) as sum_cost
	FROM
		wm_products AS wp
		LEFT JOIN wm_warehouses AS ww ON ww.warehouse_id = wp.warehouse_id
	WHERE 
		wp.qty > 0 and wp.cost > 0
	GROUP BY
		wp.warehouse_id
	ORDER BY
		sum_cost desc`)
	}

	orderPoint(knex: Knex, generic_type_id: any, warehouseId: any) {
		let sql = `SELECT
		count(alls.generic_type_name) AS count,
		alls.generic_type_name
	FROM
		(
	SELECT
		(
	SELECT
		sum( wp.qty ) 
	FROM
		wm_products AS wp
		INNER JOIN mm_products AS mp ON mp.product_id = wp.product_id 
	WHERE
		wp.warehouse_id = '${warehouseId}' 
		AND wp.product_id = mp.product_id 
		AND mp.generic_id = mg.generic_id 
		) AS remain_qty,
		mg.generic_id,
		mg.generic_name,
		gt.generic_type_name,
		mg.min_qty,
		mg.max_qty,
		mg.working_code,
		(
	SELECT
		sum( pci.qty * ug.qty ) AS total_qty 
	FROM
		pc_purchasing_order_item AS pci
		INNER JOIN pc_purchasing_order AS pco ON pco.purchase_order_id = pci.purchase_order_id
		INNER JOIN mm_unit_generics AS ug ON ug.unit_generic_id = pci.unit_generic_id
		INNER JOIN mm_products AS mp ON mp.product_id = pci.product_id 
	WHERE
		pco.purchase_order_status IN ( 'ORDERPOINT', 'PREPARED', 'CONFIRM', 'CONFIRMED' ) 
		AND pco.is_cancel = "N" 
		AND mp.generic_id = mg.generic_id 
		AND pci.product_id = mp.product_id 
		AND pco.purchase_order_id NOT IN ( SELECT purchase_order_id FROM wm_receives AS rp INNER JOIN wm_receive_approve AS ra ON ra.receive_id = rp.receive_id ) 
		) AS total_purchased 
	FROM
		mm_generics AS mg
		INNER JOIN mm_generic_types AS gt ON gt.generic_type_id = mg.generic_type_id 
	WHERE
		mg.mark_deleted = "N" 
		AND mg.is_active = "Y" 
		AND mg.generic_id NOT IN ( SELECT generic_id FROM pc_product_reserved WHERE reserved_status IN ( 'SELECTED', 'CONFIRMED' ) ) 
		AND mg.generic_type_id = '${generic_type_id}' 
	GROUP BY
		mg.working_code 
	HAVING
		remain_qty <= mg.min_qty 
		) AS alls`
		return knex.raw(sql)
	}

	getGenericTypes(knex: Knex) {
		let sql = `SELECT * FROM mm_generic_types`
		return knex.raw(sql)
	}

	getBudgetByYear(knex: Knex, budgetYear: any) {
		return knex('view_budget_subtype')
			.select('bgdetail_id'
				, knex.raw(`concat(bgtype_name, ' - ',bgtypesub_name) as budget_desc`))
			.where('bg_year', budgetYear)
			.orderBy('bgtype_name', 'bgtypesub_name');
	}

	getBudgetTransactionDay(knex: Knex, budgetYear: any, budgetDetailId: any, sDate: any, eDate: any) {
		let sql = `
		SELECT
		q.bgdetail_id,
		concat( vbg.bgtype_name, ' - ', vbg.bgtypesub_name ) AS budget_desc,
		q.amount,
		q.date_time,
		vbg.bg_year
	FROM
		(
	SELECT
		pbt.bgdetail_id,
		sum( pbt.amount ) AS amount,
		date_time AS date_time
	FROM
		pc_budget_transection AS pbt 
	WHERE
		pbt.transaction_status = 'SPEND' `

		if (budgetDetailId) {
			sql += ` AND pbt.bgdetail_id = ${budgetDetailId} `
		}

		sql += ` AND date(pbt.date_time) >= '${sDate}' 
		AND date(pbt.date_time) <= '${eDate}' AND amount > 0 
	GROUP BY
		date(pbt.date_time) 
		) AS q
		JOIN view_budget_subtype AS vbg ON q.bgdetail_id = vbg.bgdetail_id
		WHERE
			vbg.bg_year = ${budgetYear}
		ORDER BY
			q.date_time`
		return knex.raw(sql)
	}

	getBudgetTransactionMonth(knex: Knex, budgetYear: any, budgetDetailId: any, sDate: any, eDate: any) {
		let sql = `
		SELECT
		q.bgdetail_id,
		concat( vbg.bgtype_name, ' - ', vbg.bgtypesub_name ) AS budget_desc,
		q.amount,
		q.date_time,
		vbg.bg_year
	FROM
		(
	SELECT
		pbt.bgdetail_id,
		sum( pbt.amount ) AS amount,
		date_time AS date_time
	FROM
		pc_budget_transection AS pbt 
	WHERE
		pbt.transaction_status = 'SPEND' `

		if (budgetDetailId) {
			sql += ` AND pbt.bgdetail_id = ${budgetDetailId} `
		}

		sql += ` AND MONTH(pbt.date_time) >= '${sDate}' 
		AND MONTH(pbt.date_time) <= '${eDate}' AND amount > 0 
	GROUP BY
		MONTH(pbt.date_time) 
		) AS q
		JOIN view_budget_subtype AS vbg ON q.bgdetail_id = vbg.bgdetail_id
		WHERE
			vbg.bg_year = ${budgetYear}
		ORDER BY
			q.date_time`
		return knex.raw(sql)
	}

	getBudget(knex: Knex, budgetDetailId: any, selectedYear: any) {
		let sql = `SELECT
		* 
	FROM
		(
	SELECT
		sum( bbd.amount ) AS amount,
		bbd.bgdetail_id 
	FROM
		bm_budget_detail AS bbd
		WHERE
			bbd.status = 'APPROVE'
			AND bbd.bg_year = ${selectedYear}
	GROUP BY
		bbd.bgtype_id,
		bbd.bgtypesub_id 
		) AS q 
	WHERE
		q.bgdetail_id = ${budgetDetailId}`
		return knex.raw(sql)
	}

	getBudgetAmount(knex: Knex, budgetDetailId: any) {
		let sql = `
	SELECT
		pbt.bgdetail_id,
		sum(pbt.amount) as amount
	FROM
		pc_budget_transection as pbt
	WHERE
		pbt.transaction_status = 'SPEND'
		AND pbt.bgdetail_id = ${budgetDetailId}
	GROUP BY
		pbt.bgdetail_id`
		return knex.raw(sql)
	}

	getInventoryValue(knex: Knex, genericTypeId: any, warehouseId: any, date: any) {
		let sql = `SELECT
		sum(q.cost) AS cost,
		q.generic_type_name
	FROM
		(
	SELECT
		vscw.conversion_qty,
		avg( vscw.balance_unit_cost ) AS unit_cost,
		( sum( vscw.in_qty ) - sum( vscw.out_qty ) ) * avg( vscw.balance_unit_cost ) AS cost,
		mgt.generic_type_name 
	FROM
		view_stock_card_warehouse AS vscw
		JOIN mm_generics AS mg ON mg.generic_id = vscw.generic_id
		JOIN mm_generic_types AS mgt ON mgt.generic_type_id = mg.generic_type_id 
	WHERE
		vscw.stock_date <= '${date} 23:59:59' 
		AND mg.generic_type_id = '${genericTypeId}'
		AND vscw.warehouse_id = '${warehouseId}' 
	GROUP BY
		vscw.generic_id 
	ORDER BY
		mg.generic_id 
		) AS q`
		return knex.raw(sql)
	}

	poApproved(knex: Knex) {
		let sql = `SELECT
		count(*) as po
	FROM
		pc_purchasing_order AS po 
	WHERE
		po.purchase_order_status = 'APPROVED'`
		return knex.raw(sql)
	}

	getOrdersWaiting(knex: Knex, warehouseId: any) {
		let sql = `SELECT
		count( * ) AS total 
	FROM
		wm_requisition_orders AS ro 
	WHERE
		ro.requisition_order_id NOT IN ( SELECT DISTINCT rc.requisition_order_id FROM wm_requisition_confirms AS rc ) 
		AND ro.is_temp = 'N'
		and ro.is_cancel = 'N'
		and ro.wm_withdraw = '${warehouseId}'`
		return knex.raw(sql)
	}

	getOrdersWaitingApprove(knex: Knex, warehouseId: any) {
		let sql = `SELECT
		rc.confirm_id,
		rc.confirm_date,
		rc.requisition_order_id,
		rc.is_cancel,
		ro.requisition_date,
		ro.requisition_code,
		rt.requisition_type,
		wh.warehouse_name AS requisition_warehouse_name,
		( SELECT ifnull( sum( rci.confirm_qty ), 0 ) FROM wm_requisition_confirm_items AS rci WHERE rci.confirm_id = rc.confirm_id ) AS confirm_qty 
	FROM
		wm_requisition_confirms AS rc
		INNER JOIN wm_requisition_orders AS ro ON ro.requisition_order_id = rc.requisition_order_id
		LEFT JOIN wm_requisition_type AS rt ON rt.requisition_type_id = ro.requisition_type_id
		INNER JOIN wm_warehouses AS wh ON wh.warehouse_id = ro.wm_requisition 
	WHERE
		ro.wm_withdraw = '${warehouseId}' 
		AND rc.is_approve <> 'Y' 
		AND rc.is_cancel = 'N' 
	GROUP BY
		rc.requisition_order_id 
	HAVING
		confirm_qty > 0 
	ORDER BY
		ro.requisition_code DESC`
		return knex.raw(sql)
	}

	getOrdersUnpaid(knex: Knex, warehouseId: any) {
		let sql = `SELECT
		count( * ) AS total 
	FROM
		wm_requisition_order_unpaids AS rou
		INNER JOIN wm_requisition_orders AS ro ON ro.requisition_order_id = rou.requisition_order_id
		INNER JOIN wm_warehouses AS whr ON whr.warehouse_id = ro.wm_requisition 
	WHERE
		rou.is_paid = 'N' 
		AND rou.is_cancel = 'N' 
		AND ro.wm_withdraw = '${warehouseId}'
		and ro.is_cancel = 'N'`
		return knex.raw(sql)
	}
}