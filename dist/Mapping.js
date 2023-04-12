export class FieldMapping {
    constructor(data) {
        this.fieldName = null;
        this.colName = null;
        this.type = null;
        this.primaryKey = false;
        Object.assign(this, data);
    }
}
export class EntityMapping {
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
