"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QuerySet_js_1 = require("./QuerySet.js");
class LinkSet extends QuerySet_js_1.default {
    constructor(entityType, foreignFunc) {
        super();
        this.foreignFunc = null;
        this.entityType = entityType;
        this.foreignFunc = foreignFunc;
    }
    apply(parentObj) {
        let a = this.getEntity();
        let expr = this.foreignFunc(a, parentObj);
        this.where(expr);
    }
}
exports.default = LinkSet;
//# sourceMappingURL=LinkSet.js.map