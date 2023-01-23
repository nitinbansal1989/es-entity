export default class Connection {
    handler = null;
    conn = null;
    constructor(handler, conn) {
        this.handler = handler;
        this.conn = conn;
    }
    get Handler() {
        return this.handler;
    }
    async initTransaction() {
        await this.handler.initTransaction(this.conn);
    }
    async commit() {
        await this.handler.commit(this.conn);
    }
    async rollback() {
        await this.handler.rollback(this.conn);
    }
    async close() {
        await this.handler.close(this.conn);
        this.conn = null;
    }
}
//# sourceMappingURL=Connection.js.map