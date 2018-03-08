import Knex = require('knex');
import * as moment from 'moment';

export class PurchasingModel {
    getSubtype(knex: Knex) {
        return knex('view_budget_subtype').groupBy('bgtypesub_id')
    }
}