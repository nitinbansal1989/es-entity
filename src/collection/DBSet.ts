import * as fs from 'fs';
import * as path from 'path';
import Case from 'case';

import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as types from '../types/index.js';
import * as Mapping from '../Mapping.js';
import * as funcs from '../funcs/index.js';
import IQuerySet from './IQuerySet.js';
import QuerySet from './QuerySet.js';

interface IOptions {
	primaryKeys: string[];
	entityName?: string;
	entityPath?: string;
}

class DBSet<T extends Object> extends IQuerySet<T> {
	protected entityType: types.IEntityType<T>;
	protected options: IOptions = null;

	mapping: Mapping.EntityMapping = new Mapping.EntityMapping();

	// private columns: bean.ColumnInfo[] = null;

	constructor(entityType: types.IEntityType<T>, options: IOptions) {
		super();

		this.entityType = entityType;
		this.options = options;

		this.options.entityName = this.options.entityName || this.entityType.name;
	}

	bind() {
		let filePath: string = null;
		if (this.options.entityPath) {
			filePath = this.options.entityPath;
		} else if (this.context.getEntityPath()) {
			filePath = path.join(this.context.getEntityPath(), this.options.entityName + '.json');
		}
		if (filePath && fs.statSync(filePath).isFile()) {
			let data = fs.readFileSync(filePath, 'utf-8');
			this.mapping = new Mapping.EntityMapping(JSON.parse(data));
		} else {
			this.mapping = new Mapping.EntityMapping();
			this.mapping.entityName = this.options.entityName;
			this.mapping.name = Case.snake(this.options.entityName);

			// get info from describe db
			// this.columns = await this.context.handler.getTableInfo(this.mapping.name);

			let obj = new this.entityType();
			let keys = Reflect.ownKeys(obj);
			keys.forEach(key => {
				let field = Reflect.get(obj, key);

				// Bind Fields
				if (field instanceof sql.Field) {
					let primaryKey = this.options.primaryKeys.includes(key.toString());
					this.bindField(key.toString(), field, primaryKey);
				}
			});
		}
		return this;
	}

	private bindField(key: string, field: sql.Field<any>, primaryKey: boolean) {
		let colName = Case.snake(key);
		// let column = new bean.ColumnInfo();

		try {
			// if (!column) {
			// 	throw new Error(`Column: ${colName} not found in Table: ${this.mapping.name}`);
			// }
			let fieldMapping = new Mapping.FieldMapping({
				fieldName: key,
				colName: colName
			});
			fieldMapping.type = this.checkColumnType(field);
			fieldMapping.primaryKey = primaryKey;
			this.mapping.fields.push(fieldMapping);
		} catch (err) {
			this.context.log(err);
		}
	}

	private checkColumnType(field: sql.Field<any>) {
		if (field instanceof types.String) {
			return 'string';
		} else if (field instanceof types.Number) {
			return 'number';
		} else if (field instanceof types.BigInt) {
			return 'bigint';
		} else if (field instanceof types.Boolean) {
			return 'boolean';
		} else if (field instanceof types.Date) {
			return 'date';
		} else if (field instanceof types.Binary) {
			return 'binary';
		} else if (field instanceof types.Json) {
			return 'jsonObject';
		} else {
			throw new Error(`Type mismatch found for column in Table:${this.mapping.name}`);
		}
	}

	getEntityType() {
		return this.entityType;
	}

	getKeyField(key: string | symbol) {
		return this.mapping.fields.filter(a => {
			return a.fieldName == key;
		})[0];
	}

	getEntity(alias?: string) {
		let a = new this.entityType();
		let keys = Reflect.ownKeys(a);
		keys.forEach(key => {
			let field = Reflect.get(a, key);
			if (field instanceof sql.Field) {
				let fieldInfo = this.getKeyField(key);

				field._name = fieldInfo && fieldInfo.colName ? fieldInfo.colName : '';
				field._alias = alias;
				field._updated = false;
			} else if (field instanceof types.LinkObject || field instanceof types.LinkArray) {
				field.bind(this.context);
			}
		});
		return a;
	}

	getValue(obj: any, key: string) {
		return (<sql.Field<any>>obj[key]).get();
	}

	async insert(entity: T) {
		let stat: sql.Statement = new sql.Statement();
		stat.command = sql.types.Command.INSERT;
		stat.collection.value = this.mapping.name;

		Reflect.ownKeys(entity).forEach((key) => {
			let q = Reflect.get(entity, key);
			if (q instanceof sql.Field && q._updated) {
				let field = this.getKeyField(key);

				let col = new sql.Collection();
				col.value = field.colName;
				stat.columns.push(col);

				let v: sql.Expression = new sql.Expression('?');
				v.args.push(this.getValue(entity, <string>key));
				stat.values.push(v);
			}
		});

		let result = await this.context.execute(stat);
		let primaryFields = this.getPrimaryFields();

		if (primaryFields.length == 1) {
			let primaryField = primaryFields[0];
			let id = result.id || this.getValue(entity, primaryField.fieldName);
			try {
				return await this.get(id);
			} catch (err) {
				return null;
			}
		} else if (primaryFields.length > 1) {
			let param = {};
			primaryFields.forEach(field => {
				Reflect.set(param, field.fieldName, this.getValue(entity, field.fieldName));
			});
			return this.get(param);
		}
	}

	private getPrimaryFields() {
		return this.mapping.fields.filter(f => {
			return f.primaryKey;
		});
	}

	private whereExpr(entity: T) {
		let primaryFields = this.getPrimaryFields();
		if (!(primaryFields && primaryFields.length)) {
			throw new bean.SqlException('Primary Key fields not found');
		}

		let whereExpr = new sql.Expression();
		primaryFields.forEach(priField => {
			let w1 = new sql.Expression(priField.colName);
			let w2 = new sql.Expression('?');
			w2.args.push(this.getValue(entity, priField.fieldName));
			whereExpr = whereExpr.add(new sql.Expression(null, sql.types.Operator.Equal, w1, w2));
		});
		return whereExpr;
	}

	async update(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;
		stat.collection.value = this.mapping.name;

		let primaryFields = this.getPrimaryFields();
		Reflect.ownKeys(entity).forEach((key) => {
			let field = this.getKeyField(key);

			let q = Reflect.get(entity, key);
			let isPrimaryField = false;
			for (let f of primaryFields) {
				if (f.fieldName == field.fieldName) {
					isPrimaryField = true;
					break;
				}
			}
			if (q instanceof sql.Field && q._updated && !isPrimaryField) {
				let c1 = new sql.Expression(field.colName);
				let c2 = new sql.Expression('?');
				c2.args.push(this.getValue(entity, <string>key));

				let c = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
				stat.columns.push(c);
			}
		});

		stat.where = this.whereExpr(entity);

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw result.error;
			} else if (primaryFields.length == 1) {
				let param = this.getValue(entity, primaryFields[0].fieldName);
				return this.get(param);
			} else {
				let param = {};
				primaryFields.forEach(field => {
					Reflect.set(param, field.fieldName, this.getValue(entity, field.fieldName));
				});
				return this.get(param);
			}
		} else {
			return entity;
		}
	}

	async insertOrUpdate(entity: T) {
		let primaryFields = this.getPrimaryFields();
		let param = {};
		primaryFields.forEach(field => {
			Reflect.set(param, field.fieldName, this.getValue(entity, field.fieldName));
		});
		let obj = await this.get(param);

		if (obj) {
			return this.update(entity);
		} else {
			return this.insert(entity);
		}
	}

	async delete(entity: T) {
		let stat = new sql.Statement();
		stat.command = sql.types.Command.DELETE;
		stat.collection.value = this.mapping.name;

		stat.where = this.whereExpr(entity);
		await this.context.execute(stat);
	}

	async get(id: any) {
		if (id == null) throw new Error('Id parameter cannot be null');

		let primaryFields = this.getPrimaryFields();
		if (primaryFields.length == 0) {
			throw new Error('No Primary Field Found in Table: ' + this.mapping.name);
		} else if (primaryFields.length == 1) {
			if (typeof id === 'object') {
				let field = primaryFields[0];
				return this.where((a) => {
					return (<sql.Field<any>>Reflect.get(a, field.fieldName)).eq(id[field.fieldName]);
				}).unique();
			} else {
				let field = primaryFields[0];
				return this.where((a) => {
					return (<sql.Field<any>>Reflect.get(a, field.fieldName)).eq(id);
				}).unique();
			}
		} else if (primaryFields.length > 1 && typeof id === 'object') {
			let whereExpr = new sql.Expression();
			primaryFields.forEach(priField => {
				let w1 = new sql.Expression(priField.colName);
				let w2 = new sql.Expression('?');
				w2.args.push(id[priField.fieldName]);
				whereExpr = whereExpr.add(new sql.Expression(null, sql.types.Operator.Equal, w1, w2));
			});
			return this.where(whereExpr).unique();
		}
	}

	where(param?: funcs.IWhereFunc<T> | sql.Expression, ...args: any[]): IQuerySet<T> {
		let q = new QuerySet(this);

		let res: sql.Expression = null;
		if (param) {
			if (param instanceof Function) {
				let a = this.getEntity(q.alias);
				res = param(a, args);
			} else {
				res = param;
			}
		}
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			q.stat.where = q.stat.where.add(res);
		}
		return q;
	}

	groupBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]) {
		let q = this.where();
		return q.groupBy(func);
	}

	orderBy(func?: funcs.IArrFieldFunc<T> | sql.Expression | sql.Expression[]) {
		let q = this.where();
		return q.orderBy(func);
	}

	limit(size: number, index?: number) {
		let q = this.where();
		return q.limit(size, index);
	}

	list() {
		let q = this.where();
		return q.list();
	}

	unique() {
		let q = this.where();
		return q.unique();
	}

	select<U>(param?: funcs.ISelectFunc<T, U>) {
		let q = this.where();
		return q.select<U>(param);
	}

	async mapData(input: bean.ResultSet): Promise<Array<T>> {
		let data = new Array<T>();
		await Promise.all(input.rows.map(async row => {
			let obj = this.getEntity();
			let keys = Reflect.ownKeys(obj);

			keys.filter(key => {
				let field = Reflect.get(obj, key);
				return field instanceof sql.Field;
			}).forEach(key => {
				let fieldMapping = this.mapping.fields.find(f => {
					return f.fieldName == key;
				});
				if (fieldMapping) {
					let val = this.context.handler.mapData(row, fieldMapping.colName, fieldMapping.type);
					let field = (<sql.Field<any>>Reflect.get(obj, key));
					field.set(val);
					field._updated = false;
				}
			});

			await Promise.all(keys.filter(key => {
				let field = Reflect.get(obj, key);
				return (field instanceof types.LinkObject || field instanceof types.LinkArray);
			}).map(async key => {
				let field = (<types.LinkObject<any> | types.LinkArray<any>>Reflect.get(obj, key));
				await field.apply(obj);
			}));

			data.push(obj);
		}));
		return data;
	}

	join<A>(coll: IQuerySet<A>, param?: funcs.IJoinFunc<T, A> | sql.Expression, joinType?: sql.types.Join) {
		let q = this.where();
		return q.join(coll, param, joinType);
	}

}

export default DBSet;
