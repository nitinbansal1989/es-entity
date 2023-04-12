import * as bean from '../bean/index.js';
import Handler from './Handler.js';
import Connection from '../Connection.js';
export default class PostgreSql extends Handler {
    constructor(config) {
        super();
        this.handlerName = 'postgresql';
        this.driver = null;
        this.connectionPool = null;
        this.config = config;
    }
    async init() {
        this.driver = this.config.driver ?? (await import('pg')).native ?? await import('pg');
        this.connectionPool = new this.driver.Pool({
            user: this.config.username,
            password: this.config.password,
            database: this.config.database,
            host: this.config.host,
            port: this.config.port,
            max: this.config.connectionLimit
        });
    }
    async getConnection() {
        let conn = new this.driver.Client({
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
        try {
            await conn.connect();
            return new Connection(this, conn);
        }
        catch (err) {
            this.context.log('Connection Creation Failed', err);
            throw err;
        }
    }
    async initTransaction(conn) { await conn.query('BEGIN'); }
    async commit(conn) { await conn.query('COMMIT'); }
    async rollback(conn) { await conn.query('ROLLBACK'); }
    async close(conn) { await conn.end(); }
    async end() { return null; }
    async getTableInfo(tableName) {
        let descQuery = `select f.ordinal_position, f.column_name, f.data_type, f.is_nullable, f.column_default,
		case when (select count(1) from pg_constraint p where p.conrelid = c.oid and f.ordinal_position = any(p.conkey) and p.contype   = 'p') > 0 then true else false end as primarykey
	from information_schema.columns f
		join pg_class c on c.relname = f.table_name
	where f.table_name = '${tableName}'`;
        let tableInfo = await this.run(descQuery);
        let result = new Array();
        tableInfo.rows.forEach((row) => {
            let col = new bean.ColumnInfo();
            col.field = row['column_name'];
            let columnType = row['data_type'].toLowerCase();
            if (columnType.includes('boolean')) {
                col.type = bean.ColumnType.BOOLEAN;
            }
            else if (columnType.includes('int') ||
                columnType.includes('float') ||
                columnType.includes('double') ||
                columnType.includes('decimal') ||
                columnType.includes('real') ||
                columnType.includes('numeric')) {
                col.type = bean.ColumnType.NUMBER;
            }
            else if (columnType.includes('varchar') ||
                columnType.includes('text') ||
                columnType.includes('character varying') ||
                columnType.includes('uuid')) {
                col.type = bean.ColumnType.STRING;
            }
            else if (columnType.includes('timestamp') || columnType.includes('date')) {
                col.type = bean.ColumnType.DATE;
            }
            else if (columnType.includes('json')) {
                col.type = bean.ColumnType.JSON;
            }
            col.nullable = !row['is_nullable'];
            col.primaryKey = row['primarykey'];
            col.default = row['column_default'];
            result.push(col);
        });
        return result;
    }
    async run(query, args, connection) {
        let queryObj = this.prepareQuery(query, args);
        let temp = null;
        if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
            temp = await connection.conn.query(queryObj.query, queryObj.args);
        }
        else {
            let con = null;
            try {
                con = await this.connectionPool.connect();
                temp = await con.query(queryObj.query, queryObj.args);
            }
            finally {
                if (con) {
                    con.release();
                }
            }
        }
        let result = new bean.ResultSet();
        if (temp.rowCount)
            result.rowCount = temp.rowCount;
        if (Array.isArray(temp.rows))
            result.rows = temp.rows;
        if (result.rows && result.rows.length > 0)
            result.id = result.rows[0].id;
        return result;
    }
    convertPlaceHolder(query) {
        let i = 1;
        while (query.includes('?')) {
            query = query.replace('?', `$${i}`);
            i++;
        }
        return query;
    }
    limit(size, index) {
        return ' limit ' + size + (index ? ' OFFSET ' + index : '');
    }
}
