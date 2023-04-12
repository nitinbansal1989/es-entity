import * as sql from '../sql/index.js';
class IQuerySet {
    constructor() {
        this.stat = null;
    }
    innerJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.InnerJoin);
    }
    leftJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.LeftJoin);
    }
    rightJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.RightJoin);
    }
    outerJoin(coll, param) {
        return this.join(coll, param, sql.types.Join.OuterJoin);
    }
    setStatColumns(tempObj) {
        let tempKeys = Reflect.ownKeys(tempObj);
        tempKeys.forEach(k => {
            let f = tempObj[k];
            if (f instanceof sql.Field) {
                let exp = f.expr();
                this.stat.columns.push(exp);
            }
        });
        return this;
    }
}
export default IQuerySet;
