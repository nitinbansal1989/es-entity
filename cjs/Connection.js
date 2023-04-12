"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Connection {
    constructor(handler, conn) {
        this.handler = null;
        this.conn = null;
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
exports.default = Connection;
//# sourceMappingURL=Connection.js.map