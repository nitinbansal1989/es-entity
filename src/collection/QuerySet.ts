import * as bean from '../bean/index.js';
import * as sql from '../sql/index.js';
import * as types from '../model/types.js';
import * as model from '../model/index.js';
import IQuerySet from './IQuerySet.js';
import DBSet from './DBSet.js';
import JoinQuerySet from './JoinQuerySet.js';
import Context from '../Context.js';

/**
 * QuerySet
 */
class QuerySet<T extends Object, U extends Object = types.SubEntityType<T>> extends IQuerySet<U> {
	protected dbSet: DBSet<T> = null;
	alias: string = null;
	stat = new sql.Statement();

	protected EntityType: types.IEntityType<U>;

	constructor(context: Context, dbSet: DBSet<T>, EntityType: types.IEntityType<U>) {
		super();

		this.context = context;
		this.bind(dbSet);
		this.EntityType = EntityType;
	}

	private bind(dbSet: DBSet<T>) {
		this.dbSet = dbSet;

		this.alias = dbSet.tableName.charAt(0);
		this.stat.collection.value = dbSet.tableName;
		this.stat.collection.alias = this.alias;
	}

	getEntity() {
		let res = new this.EntityType();
		let keys = Reflect.ownKeys(res);
		keys.forEach(key => {
			let field = Reflect.get(res, key);
			if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
				field.bind(this.context);
			}
		});
		return res;
	}

	// Selection Functions
	async list() {
		this.stat.command = sql.types.Command.SELECT;

		// Get all Columns
		let temp = new this.EntityType();
		let targetKeys = <string[]>Reflect.ownKeys(temp);
		let fields = this.dbSet.filterFields(targetKeys);
		this.stat.columns = this.getColumnExprs(fields, this.alias);

		let result = await this.context.execute(this.stat);
		return this.mapData(result);
	}

	// Selection Functions
	select<V = types.SubEntityType<U>>(TargetType: types.IEntityType<V>): IQuerySet<V> {
		let res = new QuerySet<T, V>(this.context, this.dbSet, TargetType);
		return res;
	}

	async selectPlain(keys: (keyof U)[]) {
		this.stat.command = sql.types.Command.SELECT;

		let fields = this.dbSet.filterFields(<string[]>keys);
		this.stat.columns = this.getColumnExprs(fields, this.alias);

		let input = await this.context.execute(this.stat);
		let data = input.rows.map(row => {
			let obj: types.SelectType<U> = {};
			fields.forEach(field => {
				let colName = field.colName;
				let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
				Reflect.set(obj, field.fieldName, val);
			});
			return obj;
		});
		return data;
	}

	private async mapData(input: bean.ResultSet) {
		let data = input.rows.map(row => {
			let obj = new this.EntityType();
			let keys = (<string[]>Reflect.ownKeys(obj));

			keys.forEach(key => {
				let field = Reflect.get(obj, key);
				let fieldMapping = this.dbSet.fieldMap.get(key);
				if (fieldMapping) {
					let colName = fieldMapping.colName;
					let val = row[colName] ?? row[colName.toLowerCase()] ?? row[colName.toUpperCase()];
					Reflect.set(obj, key, val);
				} else if (field instanceof model.LinkObject || field instanceof model.LinkArray) {
					field.bind(this.context);
				}
			});
			return obj;
		});
		return data;
	}

	// Conditional Functions
	where(param: types.IWhereFunc<model.WhereExprBuilder<U>>, ...args: any[]): IQuerySet<U> {
		let res: sql.Expression = null;
		if (param && param instanceof Function) {
			let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
			let eb = new model.WhereExprBuilder<U>(fieldMap);
			res = param(eb, args);
		}
		if (res && res instanceof sql.Expression && res.exps.length > 0) {
			this.stat.where = this.stat.where.add(res);
		}
		return this;
	}

	groupBy(param: types.IArrFieldFunc<model.GroupExprBuilder<U>>): IQuerySet<U> {
		let res = null;
		if (param && param instanceof Function) {
			let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
			let eb = new model.GroupExprBuilder<U>(fieldMap);
			res = param(eb);
		}
		if (res && Array.isArray(res)) {
			res.forEach(expr => {
				if (expr instanceof sql.Expression && expr.exps.length > 0) {
					this.stat.groupBy.push(expr);
				}
			});
		}
		return this;
	}

	orderBy(param: types.IArrFieldFunc<model.OrderExprBuilder<U>>): IQuerySet<U> {
		let res = null;
		if (param && param instanceof Function) {
			let fieldMap = new Map(Array.from(this.dbSet.fieldMap));
			let eb = new model.OrderExprBuilder<U>(fieldMap);
			res = param(eb);
		}
		if (res && Array.isArray(res)) {
			res.forEach(a => {
				if (a instanceof sql.Expression && a.exps.length > 0) {
					this.stat.orderBy.push(a);
				}
			});
		}
		return this;
	}

	limit(size: number, index?: number): IQuerySet<U> {
		this.stat.limit = new sql.Expression(null, sql.types.Operator.Limit);
		this.stat.limit.exps.push(new sql.Expression(size.toString()));
		if (index) {
			this.stat.limit.exps.push(new sql.Expression(index.toString()));
		}
		return this;
	}

	async update(param: types.IUpdateFunc<U>): Promise<void> {
		if (!(param && param instanceof Function)) {
			throw new Error('Update Function not found');
		}

		let stat = new sql.Statement();
		stat.command = sql.types.Command.UPDATE;
		stat.collection.value = this.dbSet.tableName;

		let obj = this.getEntity();
		let tempObj = param(obj);

		// Dynamic update
		let keys = Reflect.ownKeys(tempObj.obj).filter(key => (<(string | symbol)[]>tempObj.updatedKeys).includes(key));
		keys.forEach((key) => {
			let field = this.dbSet.getField(key);
			if (!field) return;

			let c1 = new sql.Expression(field.colName);
			let c2 = new sql.Expression('?');
			c2.args.push(Reflect.get(tempObj, key));

			let expr = new sql.Expression(null, sql.types.Operator.Equal, c1, c2);
			stat.columns.push(expr);
		});

		if (stat.columns.length > 0) {
			let result = await this.context.execute(stat);
			if (result.error) {
				throw result.error;
			}
		}
	}

	join<A extends Object>(coll: IQuerySet<A>, param: types.IJoinFunc<U, A>, joinType?: sql.types.Join): IQuerySet<U & A> {
		joinType = joinType | sql.types.Join.InnerJoin;

		let temp: sql.Expression = null;
		if (param && param instanceof Function) {
			let mainObj = this.getEntity();
			let joinObj = coll.getEntity();
			temp = param(mainObj, joinObj);
		}

		if (temp && temp instanceof sql.Expression && temp.exps.length > 0) {
			return new JoinQuerySet<U, A>(this, coll, joinType, temp);
		} else {
			throw new Error('Invalid Join');
		}
	}

}

export default QuerySet;
