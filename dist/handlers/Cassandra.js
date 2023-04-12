import Handler from './Handler.js';
export default class Cassandra extends Handler {
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
