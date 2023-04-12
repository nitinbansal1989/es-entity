"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handler_js_1 = require("./Handler.js");
class Cassandra extends Handler_js_1.default {
    constructor(config) {
        super();
        this.handlerName = 'cassandra';
        this.driver = null;
    }
    async init() { }
    async getConnection() { return null; }
    async initTransaction(conn) { return null; }
    async commit(conn) { return null; }
    async rollback(conn) { return null; }
    async close(con) { return null; }
    async end() { return null; }
    async getTableInfo(tableName) {
        return null;
    }
    async run(query) {
        return null;
    }
}
exports.default = Cassandra;
//# sourceMappingURL=Cassandra.js.map