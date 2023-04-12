"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/index.js");
const IQuerySet_js_1 = require("./IQuerySet.js");
const JoinQuerySet_js_1 = require("./JoinQuerySet.js");
class QuerySet extends IQuerySet_js_1.default {
    constructor(dbSet) {
        super();
        this.dbSet = null;
        this.alias = null;
        if (dbSet) {
            this.bind(dbSet);
        }
    }
    bind(dbSet) {
        if (dbSet) {
            this.dbSet = dbSet;
            this.context = this.dbSet.context;
            this.stat = new sql.Statement();
            this.alias = dbSet.mapping.name.charAt(0);
            this.stat.collection.value = dbSet.mapping.name;
            this.stat.collection.alias = this.alias;
        }
    }
    getEntity(alias) {
        alias = alias || this.stat.collection.alias;
        return this.dbSet.getEntity(alias);
    }
    async list() {
        this.stat.command = sql.types.Command.SELECT;
        let tempObj = this.getEntity();
        this.setStatColumns(tempObj);
        let result = await this.context.execute(this.stat);
        return this.mapData(result);
    }
    async mapData(input) {
        return this.dbSet.mapData(input);
    }
    async select(param) {
        this.stat.command = sql.types.Command.SELECT;
        if (!(param && param instanceof Function)) {
            throw new Error('Select Function not found');
        }
        let a = this.getEntity();
        let tempObj = param(a);
        this.setStatColumns(tempObj);
        let result = await this.context.execute(this.stat);
        let temps = await this.mapData(result);
        let res = [];
        temps.forEach(t => {
            let r = param(t);
            res.push(r);
        });
        return res;
    }
    async unique() {
        let l = await this.list();
        if (l.length > 1) {
            throw new Error('More than one row found in unique call');
        }
        else {
            return l[0];
        }
    }
    where(param, ...args) {
        let res = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                res = param(a, args);
            }
            else {
                res = param;
            }
        }
        if (res && res instanceof sql.Expression && res.exps.length > 0) {
            this.stat.where = this.stat.where.add(res);
        }
        return this;
    }
    groupBy(param) {
        let res = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                res = param(a);
            }
            else if (param instanceof Array) {
                res = param;
            }
        }
        if (res) {
            if (res instanceof Array) {
                res.forEach(a => {
                    if (a instanceof sql.Expression && a.exps.length > 0) {
                        this.stat.groupBy.push(a);
                    }
                });
            }
            else if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.groupBy.push(res);
            }
        }
        return this;
    }
    orderBy(param) {
        let res = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                res = param(a);
            }
            else if (param instanceof Array) {
                res = param;
            }
        }
        if (res) {
            if (res instanceof Array) {
                res.forEach(a => {
                    if (a instanceof sql.Expression && a.exps.length > 0) {
                        this.stat.orderBy.push(a);
                    }
                });
            }
            else if (res instanceof sql.Expression && res.exps.length > 0) {
                this.stat.orderBy.push(res);
            }
        }
        return this;
    }
    limit(size, index) {
        this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
        this.stat.limit.exps.push(new sql.Expression(size.toString()));
        if (index) {
            this.stat.limit.exps.push(new sql.Expression(index.toString()));
        }
        return this;
    }
    async update(param) {
        if (!(param && param instanceof Function)) {
            throw new Error('Select Function not found');
        }
        let stat = new sql.Statement();
        stat.command = sql.types.Command.UPDATE;
        stat.collection.value = this.dbSet.mapping.name;
        let a = this.getEntity();
        let tempObj = param(a);
        Reflect.ownKeys(tempObj).forEach((key) => {
            let field = this.dbSet.getKeyField(key);
            let q = Reflect.get(tempObj, key);
            if (q instanceof sql.Field && q._updated) {
                let c1 = new sql.Expression(field.colName);
                let c2 = new sql.Expression('?');
                c2.args.push(this.dbSet.getValue(tempObj, key));
                let c = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
                stat.columns.push(c);
            }
        });
        if (stat.columns.length > 0) {
            let result = await this.context.execute(stat);
            if (result.error) {
                throw result.error;
            }
        }
    }
    async delete() {
        let stat = new sql.Statement();
        stat.command = sql.types.Command.DELETE;
        stat.collection.value = this.dbSet.mapping.name;
        await this.context.execute(stat);
    }
    join(coll, param, joinType) {
        joinType = joinType | sql.types.Join.InnerJoin;
        let temp = null;
        if (param) {
            if (param instanceof Function) {
                let a = this.getEntity();
                let b = coll.getEntity();
                temp = param(a, b);
            }
            else {
                temp = param;
            }
        }
        if (temp && temp instanceof sql.Expression && temp.exps.length > 0) {
            return new JoinQuerySet_js_1.default(this, coll, joinType, temp);
        }
        else {
            throw new Error('Invalid Join');
        }
    }
}
exports.default = QuerySet;
//# sourceMappingURL=QuerySet.js.map