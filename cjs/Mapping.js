"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityMapping = exports.FieldMapping = void 0;
class FieldMapping {
    constructor(data) {
        this.fieldName = null;
        this.colName = null;
        this.type = null;
        this.primaryKey = false;
        Object.assign(this, data);
    }
}
exports.FieldMapping = FieldMapping;
class EntityMapping {
    constructor(data) {
        this.name = '';
        this.entityName = '';
        this.fields = new Array();
        this.foreignRels = new Array();
        if (data) {
            this.name = data.name;
            this.entityName = data.entityName;
            data.fields.forEach((val) => {
                this.fields.push(new FieldMapping(val));
            });
        }
    }
}
exports.EntityMapping = EntityMapping;
//# sourceMappingURL=Mapping.js.map