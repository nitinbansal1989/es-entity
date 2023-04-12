"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expression_js_1 = require("./Expression.js");
const Operator_js_1 = require("./types/Operator.js");
class Field {
    constructor() {
        this._value = null;
        this._alias = '';
        this._name = '';
        this._updated = false;
    }
    get() {
        return this._value;
    }
    set(value) {
        if (value !== this._value) {
            this._updated = true;
            this._value = value;
        }
    }
    toJSON() {
        if (this._value != null) {
            return this._value.valueOf();
        }
        else {
            return null;
        }
    }
    expr() {
        let name = this._alias ? this._alias + '.' + this._name : this._name;
        return new Expression_js_1.default(name);
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Field) {
            w = operand.expr();
        }
        else {
            w = new Expression_js_1.default('?');
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Equal, this.expr(), this._argExp(operand));
    }
    neq(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.NotEqual, this.expr(), this._argExp(operand));
    }
    lt(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.LessThan, this.expr(), this._argExp(operand));
    }
    gt(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.GreaterThan, this.expr(), this._argExp(operand));
    }
    lteq(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.LessThanEqual, this.expr(), this._argExp(operand));
    }
    gteq(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.GreaterThanEqual, this.expr(), this._argExp(operand));
    }
    and(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.And, this.expr(), this._argExp(operand));
    }
    or(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Or, this.expr(), this._argExp(operand));
    }
    not() {
        return new Expression_js_1.default(null, Operator_js_1.default.Not, this.expr());
    }
    in(...operand) {
        let vals = operand.map(val => {
            let arg = new Expression_js_1.default('?');
            let temp = null;
            temp = val;
            arg.args = arg.args.concat(temp);
            return arg;
        });
        return new Expression_js_1.default(null, Operator_js_1.default.In, this.expr(), ...vals);
    }
    between(first, second) {
        return new Expression_js_1.default(null, Operator_js_1.default.Between, this.expr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Like, this.expr(), this._argExp(operand));
    }
    IsNull() {
        return new Expression_js_1.default(null, Operator_js_1.default.IsNull, this.expr());
    }
    IsNotNull() {
        return new Expression_js_1.default(null, Operator_js_1.default.IsNotNull, this.expr());
    }
    plus(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Plus, this.expr(), this._argExp(operand));
    }
    minus(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Minus, this.expr(), this._argExp(operand));
    }
    multiply(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Multiply, this.expr(), this._argExp(operand));
    }
    devide(operand) {
        return new Expression_js_1.default(null, Operator_js_1.default.Devide, this.expr(), this._argExp(operand));
    }
    asc() {
        return new Expression_js_1.default(null, Operator_js_1.default.Asc, this.expr());
    }
    desc() {
        return new Expression_js_1.default(null, Operator_js_1.default.Desc, this.expr());
    }
    sum() {
        return new Expression_js_1.default(null, Operator_js_1.default.Sum, this.expr());
    }
    min() {
        return new Expression_js_1.default(null, Operator_js_1.default.Min, this.expr());
    }
    max() {
        return new Expression_js_1.default(null, Operator_js_1.default.Max, this.expr());
    }
    count() {
        return new Expression_js_1.default(null, Operator_js_1.default.Count, this.expr());
    }
    average() {
        return new Expression_js_1.default(null, Operator_js_1.default.Avg, this.expr());
    }
}
exports.default = Field;
//# sourceMappingURL=Field.js.map