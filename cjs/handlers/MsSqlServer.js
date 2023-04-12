"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean = require("../bean/index.js");
const Handler_js_1 = require("./Handler.js");
const sql = require("../sql/index.js");
const Connection_js_1 = require("../Connection.js");
class MsSqlServer extends Handler_js_1.default {
    constructor(config) {
        super();
        this.handlerName = 'mssql';
        this.connectionPool = null;
        this.driver = null;
        this.config = config;
    }
    async init() {
        this.driver = this.config.driver ?? await Promise.resolve().then(() => require('mssql'));
        this.connectionPool = new this.driver.ConnectionPool({
            server: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        }).connect();
    }
    async getConnection() {
        await this.driver.connect({
            server: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        let conn = new this.driver.Request();
        return new Connection_js_1.default(this, conn);
    }
    async initTransaction(conn) { return null; }
    async commit(conn) { return null; }
    async rollback(conn) { return null; }
    async close(conn) { return null; }
    async end() { return null; }
    async getTableInfo(tableName) {
        let r = await this.run(`select Field, Type, Null, Key, Default, Extra from information_schema.columns where table_name = '${tableName}'`);
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
            else if (columnType.includes('blob')
                || columnType.includes('binary')) {
                col.type = bean.ColumnType.BINARY;
            }
            col.nullable = row['Null'] == 'YES' ? true : false;
            col.primaryKey = row['Key'].indexOf('PRI') >= 0 ? true : false;
            col.default = row['Default'];
            col.extra = row['Extra'];
            result.push(col);
        });
        return result;
    }
    async run(query, args, connection) {
        let q = null;
        if (typeof query === "string") {
            q = query;
        }
        else if (query instanceof sql.Statement) {
            q = query.eval(this);
            args = (query.args == undefined ? [] : query.args);
        }
        let temp = null;
        let conn = null;
        if (connection && connection instanceof Connection_js_1.default && connection.Handler.handlerName == this.handlerName && connection.conn) {
            conn = connection.conn;
        }
        else {
            conn = this.connectionPool.request();
        }
        temp = await new Promise((resolve, reject) => {
            conn.query(q, args, function (err, r) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(r);
                }
            });
        });
        let result = new bean.ResultSet();
        if (temp.rowCount)
            result.rowCount = temp.rowCount;
        if (Array.isArray(temp.rows))
            result.rows = temp.rows;
        if (result.rows && result.rows.length > 0)
            result.id = result.rows[0].id;
        return result;
    }
}
exports.default = MsSqlServer;
//# sourceMappingURL=MsSqlServer.js.map