import IQuerySet from './IQuerySet.js';
import * as sql from '../sql/index.js';
class JoinQuerySet extends IQuerySet {
    constructor(mainSet, joinSet, joinType, expr) {
        super();
        this.mainSet = null;
        this.joinSet = null;
        this.mainSet = mainSet;
        this.context = mainSet.context;
        this.joinSet = joinSet;
        this.stat = new sql.Statement();
        this.stat.collection.leftColl = this.mainSet.stat.collection;
        this.stat.collection.rightColl = this.joinSet.stat.collection;
        this.stat.collection.join = joinType;
        this.stat.where = this.stat.where.add(expr);
    }
    getEntity(alias) {
        let mainObj = this.mainSet.getEntity(alias);
        let joinObj = this.joinSet.getEntity(alias);
        return Object.assign(mainObj, joinObj);
    }
    async list() {
        this.stat.command = sql.types.Command.SELECT;
        let tempObj = this.getEntity();
        this.setStatColumns(tempObj);
        let result = await this.context.execute(this.stat);
        return this.mapData(result);
    }
    async mapData(input) {
        let resMain = await this.mainSet.mapData(input);
        let resJoin = await this.joinSet.mapData(input);
        let res = new Array();
        for (let i = 0; i < input.rowCount; i++) {
            let objMain = resMain[i];
            let objJoin = resJoin[i];
            let objFinal = Object.assign(objMain, objJoin);
            res.push(objFinal);
        }
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
    join(coll, param, joinType) {
        joinType = joinType || sql.types.Join.InnerJoin;
        let temp = null;
        if (param instanceof Function) {
            let a = this.getEntity();
            let b = coll.getEntity();
            temp = param(a, b);
        }
        else {
            temp = param;
        }
        let res = null;
        if (temp instanceof sql.Expression && temp.exps.length > 0) {
            res = new JoinQuerySet(this, coll, joinType, temp);
        }
        return res;
    }
}
export default JoinQuerySet;
