"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INode_js_1 = require("./INode.js");
const Command_js_1 = require("./types/Command.js");
const Expression_js_1 = require("./Expression.js");
const Collection_js_1 = require("./Collection.js");
class Statement extends INode_js_1.default {
    constructor() {
        super();
        this.command = null;
        this.columns = new Array();
        this.values = new Array();
        this.collection = new Collection_js_1.default();
        this.where = new Expression_js_1.default();
        this.groupBy = new Array();
        this.orderBy = new Array();
        this.limit = new Expression_js_1.default();
    }
    eval(handler) {
        if (!handler) {
            throw new Error('No Handler Found');
        }
        let result = null;
        switch (this.command) {
            case Command_js_1.default.SELECT:
                result = this.selectQuery(handler);
                break;
            case Command_js_1.default.INSERT:
                result = this.insertQuery(handler);
                break;
            case Command_js_1.default.UPDATE:
                result = this.updateQuery(handler);
                break;
            case Command_js_1.default.DELETE:
                result = this.deleteQuery(handler);
                break;
            default:
                break;
        }
        result = handler.convertPlaceHolder(result);
        return result;
    }
    insertQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let columnStr = this.getColumnStr(handler);
        let valueStr = this.getValueStr(handler);
        return `insert into ${collectionStr} (${columnStr}) values (${valueStr})`;
    }
    selectQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let columnStr = this.getColumnStr(handler);
        let whereStr = this.getWhereStr(handler);
        let groupByStr = this.getGroupByStr(handler);
        let orderByStr = this.getOrderByStr(handler);
        let limitStr = this.getLimitStr(handler);
        return `select ${columnStr} from ${collectionStr}${whereStr}${groupByStr}${orderByStr}${limitStr}`;
    }
    updateQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let columnStr = this.getColumnStr(handler);
        let whereStr = this.getWhereStr(handler);
        return `update ${collectionStr} set ${columnStr}${whereStr}`;
    }
    deleteQuery(handler) {
        let collectionStr = this.getCollectionStr(handler);
        let whereStr = this.getWhereStr(handler);
        return `delete from ${collectionStr}${whereStr}`;
    }
    getCollectionStr(handler) {
        let collectionStr = this.collection.eval(handler);
        this.args = this.args.concat(this.collection.args);
        return collectionStr;
    }
    getColumnStr(handler) {
        return this.columns.map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this).join(', ');
    }
    getWhereStr(handler) {
        let whereStr = this.where.eval(handler);
        this.args = this.args.concat(this.where.args);
        return whereStr ? ` where ${whereStr}` : '';
    }
    getValueStr(handler) {
        return this.values.map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this).join(', ');
    }
    getGroupByStr(handler) {
        let groupByStr = this.groupBy.map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this).join(', ');
        return groupByStr ? ` group by ${groupByStr}` : '';
    }
    getOrderByStr(handler) {
        let orderByStr = this.orderBy.map(ele => {
            let r = ele.eval(handler);
            this.args = this.args.concat(ele.args);
            return r;
        }, this).join(', ');
        return orderByStr ? ` order by ${orderByStr}` : '';
    }
    getLimitStr(handler) {
        let limitStr = this.limit.eval(handler);
        this.args = this.args.concat(this.limit.args);
        return limitStr;
    }
}
exports.default = Statement;
//# sourceMappingURL=Statement.js.map