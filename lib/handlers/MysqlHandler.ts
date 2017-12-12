// import * as mysql from "mysql";

import * as util from '../Util';
import * as Handler from "./../Handler";
import * as Query from "./../Query";
import Connection from '../Connection';

export default class MysqlHandler extends Handler.default {
	handlerName = 'mysql';
	connectionPool = null;
	driver = null;

	constructor(config: Handler.ConnectionConfig) {
		super();
		this.driver = require('mysql');
		this.config = config;
		this.connectionPool = this.driver.createPool({
			connectionLimit: this.config.connectionLimit,
			host: this.config.hostname,
			user: this.config.username,
			password: this.config.password,
			database: this.config.database
		});
	}

	getConnection(): Promise<Connection> {
		return new Promise<Connection>((resolve, reject) => {
			let conn = this.driver.createConnection({
				host: this.config.hostname,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database
			});
			conn.connect((err) => {
				if (err)
					reject(err);
				else {
					let res = new Connection(this, conn);
					resolve(res);
				}
			});
		});
	}

	openConnetion(conn): Promise<any> {
		let p = new Promise((resolve, reject) => {
			conn = this.driver.createConnection({
				host: this.config.hostname,
				user: this.config.username,
				password: this.config.password,
				database: this.config.database
			});
			conn.connect((err) => {
				if (err)
					reject(err);
				else
					resolve(conn);
			});
		});
		return p;
	}

	initTransaction(conn): Promise<void> {
		let p = new Promise<void>((resolve, reject) => {
			conn.beginTransaction((err) => {
				if (err)
					reject('Initializing Transaction Failed');
				else
					resolve();
			});
		});
		return p;
	}

	commit(conn): Promise<void> {
		let p = new Promise<void>((resolve, reject) => {
			conn.commit((err) => {
				if (err)
					reject('Initializing Transaction Failed');
				else
					resolve();
			});
		});
		return p;
	}

	rollback(conn): Promise<void> {
		let p = new Promise<void>((resolve) => {
			conn.rollback(() => {
				resolve();
			});
		});
		return p;
	}

	close(conn): Promise<void> {
		let p = new Promise<void>((resolve, reject) => {
			conn.end((err) => {
				if (err)
					reject('Initializing Transaction Failed');
				else
					resolve();
			});
		});
		return p;
	}

	getTableInfo(tableName: string): Array<Handler.ColumnInfo> {
		let p = this.run("describe " + tableName);
		let r = util.deAsync(p);
		let result: Array<Handler.ColumnInfo> = new Array<Handler.ColumnInfo>();
		r.rows.forEach((row) => {
			let a: Handler.ColumnInfo = new Handler.ColumnInfo();
			a.field = row["Field"];
			let columnType: string = (<string>row["Type"]).toLowerCase();
			if (columnType.includes("tinyint(1)")) {
				a.type = "boolean";
			} else if (columnType.includes("int")
				|| columnType.includes("float")
				|| columnType.includes("double")
				|| columnType.includes("decimal")) {
				a.type = "number";
			} else if (columnType.includes("varchar")
				|| columnType.includes('text')
				|| columnType.includes('json')) {
				a.type = "string";
			} else if (columnType.includes("timestamp")) {
				a.type = "date";
			}

			a.nullable = row["Null"] == "YES" ? true : false;
			a.primaryKey = (<string>row["Key"]).indexOf("PRI") >= 0 ? true : false;
			a.default = row["Default"];
			a.extra = row["Extra"];
			result.push(a);
		});
		return result;
	}

	async run(query: string | Query.ISqlNode, args?: Array<any>, connection?: Connection): Promise<Handler.ResultSet> {
		let q: string = null;
		if (typeof query === "string") {
			q = query;
		} else if (query instanceof Query.SqlStatement) {
			q = query.eval(this);
			args = query.args;
		}

		let result: Handler.ResultSet = new Handler.ResultSet();
		let p = new Promise<any>((resolve, reject) => {
			if (connection && connection instanceof Connection && connection.Handler.handlerName == this.handlerName && connection.conn) {
				connection.conn.query(q, args, function (err, r) {
					if (err) { reject(err); }
					resolve(r);
				});
			} else {
				this.connectionPool.query(q, args, function (err, r) {
					if (err) { reject(err); }
					resolve(r);
				});
			}
		}).then((res) => {
			if (res.insertId)
				result.id = res.insertId;
			if (res.changedRows) {
				result.rowCount = res.changedRows;
			} else if (Array.isArray(res)) {
				result.rows = <Array<any>>res;
				result.rowCount = (<Array<any>>res).length;
			}
			return result;
		});
		return p;
	}

}
