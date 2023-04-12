"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean = require("../bean/index.js");
const Handler_js_1 = require("./Handler.js");
const sql = require("../sql/index.js");
const Connection_js_1 = require("../Connection.js");
class Oracle extends Handler_js_1.default {
    constructor(config) {
        super();
        this.handlerName = 'oracle';
        this.connectionPool = null;
        this.driver = null;
        this.config = config;
    }
    async init() {
        this.driver = this.config.driver || await Promise.resolve().then(() => require('oracledb'));
        this.connectionPool = await this.driver.createPool({
            user: this.config.username,
            password: this.config.password,
            connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
        });
    }
    async getConnection() {
        let conn = await this.driver.getConnection({
            user: this.config.username,
            password: this.config.password,
            connectString: `${this.config.host}:${this.config.port}/${this.config.database}`
        });
        return new Connection_js_1.default(this, conn);
    }
    async initTransaction(conn) { return null; }
    async commit(conn) { return conn.conn.commit(); }
    async rollback(conn) { return conn.conn.rollback(); }
    async close(conn) { return conn.conn.close(); }
    async end() { return null; }
    async getTableInfo(tableName) {
        let r = await this.run('describe ' + tableName);
        let result = new Array();
        r.rows.forEach((row) => {
            let col = new bean.ColumnInfo();
            col.field = row['Field'];
            let columnType = row['Type'].toLowerCase();
            if (columnType.includes('tinyint(1)')) {
                col.type = bean.ColumnType.BOOLEAN;
            }
            else if (columnType.includes('int')
                || columnType.includes('float')
                || columnType.includes('double')
                || columnType.includes('decimal')) {
                col.type = bean.ColumnType.NUMBER;
            }
            else if (columnType.includes('varchar')
                || columnType.includes('text')) {
                col.type = bean.ColumnType.STRING;
            }
            else if (columnType.includes('timestamp')) {
                col.type = bean.ColumnType.DATE;
            }
            else if (columnType.includes('json')) {
                col.type = bean.ColumnType.JSON;
            }
            col.nullable = row['IS_NULL'] == 'YES' ? true : false;
            col.primaryKey = row['Key'].indexOf('PRI') >= 0 ? true : false;
            col.default = row['Default'];
            col.extra = row['Extra'];
            result.push(col);
        });
        return result;
    }
    async run(query, args, connection) {
        let q = null;
        if (typeof query === 'string') {
            q = query;
        }
        else if (query instanceof sql.Statement) {
            q = query.eval(this);
            args = query.args;
        }
        let temp = null;
        if (connection && connection instanceof Connection_js_1.default && connection.Handler.handlerName == this.handlerName && connection.conn) {
            temp = await connection.conn.execute(q, args);
        }
        else {
            let conn = null;
            try {
                conn = await this.connectionPool.getConnection();
                temp = await conn.execute(q, args);
            }
            finally {
                conn.close();
            }
        }
        let result = new bean.ResultSet();
        if (temp.insertId)
            result.id = temp.insertId;
        if (temp.changedRows) {
            result.rowCount = temp.changedRows;
        }
        else if (Array.isArray(temp)) {
            result.rows = temp;
            result.rowCount = temp.length;
        }
        return result;
    }
}
exports.default = Oracle;
//# sourceMappingURL=Oracle.js.map