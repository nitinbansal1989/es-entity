"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinkSet_js_1 = require("../collection/LinkSet.js");
class LinkObjectType {
    constructor(entityType, foreignFunc) {
        this.linkSet = null;
        this.applied = false;
        this._value = null;
        this.linkSet = new LinkSet_js_1.default(entityType, foreignFunc);
    }
    bind(context) {
        this.linkSet.context = context;
        let dbSet = context.dbSetMap.get(this.linkSet.entityType);
        this.linkSet.bind(dbSet);
    }
    async apply(parentObj) {
        this.linkSet.apply(parentObj);
    }
    async get() {
        if (!this.applied) {
            this._value = await this.linkSet.unique();
            this.applied = true;
        }
        return this._value;
    }
    toJSON() {
        if (this._value != null) {
            return this._value.valueOf();
        }
        else {
            return null;
        }
    }
}
exports.default = LinkObjectType;
//# sourceMappingURL=LinkObjectType.js.map