"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_js_1 = require("../sql/Field.js");
const bean = require("../bean/index.js");
class NumberType extends Field_js_1.default {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (typeof value == 'number') {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Number Value');
        }
    }
}
exports.default = NumberType;
//# sourceMappingURL=NumberType.js.map