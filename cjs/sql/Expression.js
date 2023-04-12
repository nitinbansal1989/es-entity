"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Operator_js_1 = require("./types/Operator.js");
class Expression {
    constructor(value, operator, ...expressions) {
        this.args = new Array();
        this._alias = '';
        this._name = '';
        this._updated = false;
        this.value = null;
        this.exps = null;
        this.operator = null;
        this.value = value;
        this.exps = expressions;
        this.operator = operator;
    }
    add(...expressions) {
        if (this.operator == Operator_js_1.default.And) {
            this.exps = this.exps.concat(expressions);
            return this;
        }
        else if (!this.operator && this.exps.length == 0) {
            let exp = expressions.pop();
            expressions.forEach(expr => exp.add(expr));
            return exp;
        }
        else {
            let exp = new Expression(null, Operator_js_1.default.And, this);
            expressions.forEach(expr => exp.add(expr));
            return exp;
        }
    }
    and(operand) {
        return new Expression(null, Operator_js_1.default.And, this, operand);
    }
    or(operand) {
        return new Expression(null, Operator_js_1.default.Or, this, operand);
    }
    not() {
        return new Expression(null, Operator_js_1.default.Not, this);
    }
    eval(handler) {
        if (this.value) {
            return this.value;
        }
        else if (this.exps) {
            let values = this.exps.map(exp => {
                if (exp) {
                    let str = exp.eval(handler);
                    this.args = this.args.concat(exp.args);
                    return str;
                }
            });
            if (!this.operator && this.exps.length > 1) {
                this.operator = Operator_js_1.default.And;
            }
            let val0 = values[0] ? values[0] : '';
            let val1 = values[1] ? values[1] : '';
            let r = '';
            switch (this.operator) {
                case Operator_js_1.default.Equal:
                    r = handler.eq(val0, val1);
                    break;
                case Operator_js_1.default.NotEqual:
                    r = handler.neq(val0, val1);
                    break;
                case Operator_js_1.default.LessThan:
                    r = handler.lt(val0, val1);
                    break;
                case Operator_js_1.default.LessThanEqual:
                    r = handler.lteq(val0, val1);
                    break;
                case Operator_js_1.default.GreaterThan:
                    r = handler.gt(val0, val1);
                    break;
                case Operator_js_1.default.GreaterThanEqual:
                    r = handler.gteq(val0, val1);
                    break;
                case Operator_js_1.default.And:
                    r = handler.and(values);
                    break;
                case Operator_js_1.default.Or:
                    r = handler.or(values);
                    break;
                case Operator_js_1.default.Not:
                    r = handler.not(val0);
                    break;
                case Operator_js_1.default.Plus:
                    r = handler.plus(val0, val1);
                    break;
                case Operator_js_1.default.Minus:
                    r = handler.minus(val0, val1);
                    break;
                case Operator_js_1.default.Multiply:
                    r = handler.multiply(val0, val1);
                    break;
                case Operator_js_1.default.Devide:
                    r = handler.devide(val0, val1);
                    break;
                case Operator_js_1.default.Between:
                    r = handler.between(values);
                    break;
                case Operator_js_1.default.Exists:
                    r = handler.exists(val0);
                    break;
                case Operator_js_1.default.In:
                    r = handler.in(values);
                    break;
                case Operator_js_1.default.Like:
                    r = handler.like(val0, val1);
                    break;
                case Operator_js_1.default.IsNull:
                    r = handler.isNull(val0);
                    break;
                case Operator_js_1.default.IsNotNull:
                    r = handler.isNotNull(val0);
                    break;
                case Operator_js_1.default.Asc:
                    r = handler.asc(val0);
                    break;
                case Operator_js_1.default.Desc:
                    r = handler.desc(val0);
                    break;
                case Operator_js_1.default.Limit:
                    r = handler.limit(val0, val1);
                    break;
                case Operator_js_1.default.Count:
                    r = handler.count(val0);
                    break;
                case Operator_js_1.default.Sum:
                    r = handler.sum(val0);
                    break;
                case Operator_js_1.default.Min:
                    r = handler.min(val0);
                    break;
                case Operator_js_1.default.Max:
                    r = handler.max(val0);
                    break;
                case Operator_js_1.default.Avg:
                    r = handler.average(val0);
                    break;
                default:
                    break;
            }
            return r;
        }
    }
}
exports.default = Expression;
//# sourceMappingURL=Expression.js.map