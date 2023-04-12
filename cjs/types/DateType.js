"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_js_1 = require("../sql/Field.js");
const bean = require("../bean/index.js");
class DateType extends Field_js_1.default {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (value instanceof Date) {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Date Value');
        }
    }
}
exports.default = DateType;
//# sourceMappingURL=DateType.js.map