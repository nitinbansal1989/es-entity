import INode from './INode.js';
import Join from './types/Join.js';
class Collection extends INode {
    constructor() {
        super();
        this.colAlias = null;
        this.value = null;
        this.stat = null;
        this.leftColl = null;
        this.rightColl = null;
        this.join = null;
        this.alias = null;
    }
    eval(handler) {
        let res = null;
        if (this.value) {
            res = this.colAlias ? `${this.colAlias}.${this.value}` : this.value;
        }
        else if (this.stat) {
            this.args = this.args.concat(this.stat.args);
            res = `(${this.stat.eval(handler)})`;
        }
        else if (this.leftColl && this.rightColl && this.join) {
            let val0 = this.leftColl.eval(handler);
            let val1 = this.rightColl.eval(handler);
            switch (this.join) {
                case Join.InnerJoin:
                    res = `(${val0} inner join ${val1})`;
                    break;
                case Join.LeftJoin:
                    res = `(${val0} left join ${val1})`;
                    break;
                case Join.RightJoin:
                    res = `(${val0} right join ${val1})`;
                    break;
                case Join.OuterJoin:
                    res = `(${val0} outer join ${val1})`;
                    break;
                default:
                    break;
            }
        }
        if (!res) {
            throw new Error('No Collection Found');
        }
        if (this.alias) {
            res = `${res} as ${this.alias}`;
        }
        return res;
    }
}
export default Collection;
