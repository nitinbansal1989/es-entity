"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean = require("../bean/index.js");
const Handler_js_1 = require("./Handler.js");
const Connection_js_1 = require("../Connection.js");
class Mysql extends Handler_js_1.default {
    constructor(config) {
        super();
        this.handlerName = 'mysql';
        this.driver = null;
        this.connectionPool = null;
        this.config = config;
    }
    async init() {
        this.driver = this.config.driver ?? await Promise.resolve().then(() => require('mysql'));
        this.connectionPool = this.driver.createPool({
            connectionLimit: this.config.connectionLimit,
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
    getConnection() {
        let that = this;
        return new Promise((resolve, reject) => {
            let conn = that.driver.createConnection({
                host: that.config.host,
                port: that.config.port,
                user: that.config.username,
                password: that.config.password,
                database: that.config.database
            });
            conn.connect((err) => {
                if (err) {
                    that.context.log('Connection Creation Failed', err);
                    reject(err);
                }
                else {
                    let res = new Connection_js_1.default(this, conn);
                    resolve(res);
                }
            });
        });
    }
    initTransaction(conn) {
        let that = this;
        return new Promise((resolve, reject) => {
            conn.conn.beginTransaction((err) => {
                if (err) {
                    that.context.log('Initializing Transaction Failed', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    commit(conn) {
        let that = this;
        return new Promise((resolve, reject) => {
            conn.conn.commit((err) => {
                if (err) {
                    that.context.log('Commiting Transaction Failed', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    rollback(conn) {
        return new Promise((resolve) => {
            conn.conn.rollback(() => {
                resolve();
            });
        });
    }
    close(conn) {
        let that = this;
        return new Promise((resolve, reject) => {
            conn.conn.end((err) => {
                if (err) {
                    that.context.log('Connection Close Failed', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
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
                || columnType.includes('real')
                || columnType.includes('float')
                || columnType.includes('double')
                || columnType.includes('decimal')) {
                col.type = bean.ColumnType.NUMBER;
            }
            else if (columnType.includes('varchar')
                || columnType.includes('text')
                || columnType == 'time') {
                col.type = bean.ColumnType.STRING;
            }
            else if (columnType.includes('timestamp')
                || columnType.includes('date')) {
                col.type = bean.ColumnType.DATE;
            }
            else if (columnType.includes('blob')
                || columnType.includes('binary')) {
                col.type = bean.ColumnType.BINARY;
            }
            else if (columnType.includes('json')) {
                col.type = bean.ColumnType.JSON;
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
        let queryObj = this.prepareQuery(query, args);
        let temp = null;
        if (connection && connection instanceof Connection_js_1.default && connection.Handler.handlerName == this.handlerName && connection.conn) {
            let conn = connection.conn;
            temp = await new Promise((resolve, reject) => {
                conn.query(queryObj.query, queryObj.args, function (err, r) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(r);
                    }
                });
            });
        }
        else {
            let conn = null;
            try {
                conn = await new Promise((resolve, reject) => {
                    this.connectionPool.getConnection(function (err, newConn) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(newConn);
                        }
                    });
                });
                temp = await new Promise((resolve, reject) => {
                    conn.query(queryObj.query, queryObj.args, function (err, r) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(r);
                        }
                    });
                });
            }
            finally {
                if (conn) {
                    conn.release();
                }
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
exports.default = Mysql;
//# sourceMappingURL=Mysql.js.map