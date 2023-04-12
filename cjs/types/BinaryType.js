"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Field_js_1 = require("../sql/Field.js");
const bean = require("../bean/index.js");
class BinaryType extends Field_js_1.default {
    constructor(data) {
        super();
        this.set(data);
    }
    set(value) {
        if (value == null || value == undefined) {
            super.set(null);
        }
        else if (value instanceof Buffer) {
            super.set(value);
        }
        else {
            throw new bean.SqlException('Invalid Buffer Value');
        }
    }
}
exports.default = BinaryType;
//# sourceMappingURL=BinaryType.js.map