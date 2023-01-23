import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import * as sql from '../sql/index.js';
export default class Oracle extends Handler {
    handlerName = 'oracle';
    driver = null;
    connectionPool = null;
    constructor(config) {
        super(config);
    }
    async init() {
        this.driver = this.config.driver || await import('oracledb');
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
        return conn;
    }
    async initTransaction(conn) { }
    async commit(conn) { return conn.conn.commit(); }
    async rollback(conn) { return conn.conn.rollback(); }
    async close(conn) { return conn.conn.close(); }
    async end() { }
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
                col.type = bean.ColumnType.OBJECT;
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
        let dataArgs = Array();
        let q;
        if (typeof query === 'string') {
            q = query;
            if (args)
                dataArgs.push(...args);
        }
        else if (query instanceof sql.Statement) {
            q = query.eval(this);
            dataArgs.push(...query.args);
        }
        else {
            q = '';
        }
        let temp = null;
        if (connection && connection instanceof bean.Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
            temp = await connection.conn.execute(q, args);
        }
        else {
            let conn = await this.connectionPool.getConnection();
            try {
                temp = await conn.execute(q, dataArgs);
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
//# sourceMappingURL=Oracle.js.map