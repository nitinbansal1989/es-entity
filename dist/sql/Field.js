import Expression from './Expression.js';
import Operator from './types/Operator.js';
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
        return new Expression(name);
    }
    _argExp(operand) {
        let w = null;
        if (operand instanceof Field) {
            w = operand.expr();
        }
        else {
            w = new Expression('?');
            w.args = w.args.concat(operand);
        }
        return w;
    }
    eq(operand) {
        return new Expression(null, Operator.Equal, this.expr(), this._argExp(operand));
    }
    neq(operand) {
        return new Expression(null, Operator.NotEqual, this.expr(), this._argExp(operand));
    }
    lt(operand) {
        return new Expression(null, Operator.LessThan, this.expr(), this._argExp(operand));
    }
    gt(operand) {
        return new Expression(null, Operator.GreaterThan, this.expr(), this._argExp(operand));
    }
    lteq(operand) {
        return new Expression(null, Operator.LessThanEqual, this.expr(), this._argExp(operand));
    }
    gteq(operand) {
        return new Expression(null, Operator.GreaterThanEqual, this.expr(), this._argExp(operand));
    }
    and(operand) {
        return new Expression(null, Operator.And, this.expr(), this._argExp(operand));
    }
    or(operand) {
        return new Expression(null, Operator.Or, this.expr(), this._argExp(operand));
    }
    not() {
        return new Expression(null, Operator.Not, this.expr());
    }
    in(...operand) {
        let vals = operand.map(val => {
            let arg = new Expression('?');
            let temp = null;
            temp = val;
            arg.args = arg.args.concat(temp);
            return arg;
        });
        return new Expression(null, Operator.In, this.expr(), ...vals);
    }
    between(first, second) {
        return new Expression(null, Operator.Between, this.expr(), this._argExp(first), this._argExp(second));
    }
    like(operand) {
        return new Expression(null, Operator.Like, this.expr(), this._argExp(operand));
    }
    IsNull() {
        return new Expression(null, Operator.IsNull, this.expr());
    }
    IsNotNull() {
        return new Expression(null, Operator.IsNotNull, this.expr());
    }
    plus(operand) {
        return new Expression(null, Operator.Plus, this.expr(), this._argExp(operand));
    }
    minus(operand) {
        return new Expression(null, Operator.Minus, this.expr(), this._argExp(operand));
    }
    multiply(operand) {
        return new Expression(null, Operator.Multiply, this.expr(), this._argExp(operand));
    }
    devide(operand) {
        return new Expression(null, Operator.Devide, this.expr(), this._argExp(operand));
    }
    asc() {
        return new Expression(null, Operator.Asc, this.expr());
    }
    desc() {
        return new Expression(null, Operator.Desc, this.expr());
    }
    sum() {
        return new Expression(null, Operator.Sum, this.expr());
    }
    min() {
        return new Expression(null, Operator.Min, this.expr());
    }
    max() {
        return new Expression(null, Operator.Max, this.expr());
    }
    count() {
        return new Expression(null, Operator.Count, this.expr());
    }
    average() {
        return new Expression(null, Operator.Avg, this.expr());
    }
}
export default Field;
