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
	showInven_cost(knex: Knex){
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
}