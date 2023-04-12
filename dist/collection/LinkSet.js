import QuerySet from './QuerySet.js';
class LinkSet extends QuerySet {
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
export default LinkSet;
