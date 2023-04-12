"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INode_js_1 = require("./INode.js");
const Join_js_1 = require("./types/Join.js");
class Collection extends INode_js_1.default {
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
                case Join_js_1.default.InnerJoin:
                    res = `(${val0} inner join ${val1})`;
                    break;
                case Join_js_1.default.LeftJoin:
                    res = `(${val0} left join ${val1})`;
                    break;
                case Join_js_1.default.RightJoin:
                    res = `(${val0} right join ${val1})`;
                    break;
                case Join_js_1.default.OuterJoin:
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
exports.default = Collection;
//# sourceMappingURL=Collection.js.map