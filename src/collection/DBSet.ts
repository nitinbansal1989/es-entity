import * as decoratorKeys from '../decorators/Constants.js';
import { TABLE_COLUMN_KEYS } from '../decorators/Constants.js';
import * as model from '../model/index.js';
import * as types from '../model/types.js';

class DBSet<T extends Object>  {
	protected EntityType: types.IEntityType<T>;

	// mapping: Mapping.EntityMapping = new Mapping.EntityMapping();
	tableName: string;
	// entityName: string;
	// columns: bean.ColumnInfo[] = [];
	fieldMap = new Map<string, model.FieldMapping>();
	private primaryFields: model.FieldMapping[] = [];

	constructor(EntityType: types.IEntityType<T>) {
		this.EntityType = EntityType;
		let tableName: string | null = Reflect.getMetadata(decoratorKeys.TABLE_KEY, this.EntityType);
		if (!tableName) throw new Error('Table Name Not Found');

		this.tableName = tableName;
		this.bind();
	}

	bind() {
		// get info from describe db
		// this.columns = await context.handler.getTableInfo(this.tableName);

		let keys: string[] = Reflect.getMetadata(TABLE_COLUMN_KEYS, this.EntityType.prototype);

		// Bind Fields
		keys.forEach(key => this.bindField(key));
		return this;
	}

	private bindField(key: string) {
		// let snakeCaseKey = Case.snake(key);
		// let column = this.columns.find(col => col.field == key || col.field == snakeCaseKey);

		// if (!column) return;

		// this.checkColumnType(column, key);
		let columnName: string | null = Reflect.getMetadata(decoratorKeys.COLUMN_KEY, this.EntityType.prototype, key);
		if (columnName) {
			let columnType = Reflect.getMetadata('design:type', this.EntityType.prototype, key);
			let primaryKey = Reflect.getMetadata(decoratorKeys.ID_KEY, this.EntityType.prototype, key) === true;

			let fieldMapping = new model.FieldMapping(key, columnName, columnType, primaryKey);
			this.fieldMap.set(key, fieldMapping);
			if (primaryKey) this.primaryFields.push(fieldMapping);
		}
	}

	// private checkColumnType(column: bean.ColumnInfo, key: string) {
	// 	let obj = new this.entityType();
	// 	let designType = Reflect.getMetadata('design:type', obj, key);
	// 	if (designType) {
	// 		if ((column.type == bean.ColumnType.STRING && designType != String)
	// 			|| (column.type == bean.ColumnType.NUMBER && designType != Number)
	// 			|| (column.type == bean.ColumnType.BOOLEAN && designType != Boolean)
	// 			|| (column.type == bean.ColumnType.DATE && designType != Date)
	// 			|| (column.type == bean.ColumnType.BINARY && designType != Buffer)
	// 			|| (column.type == bean.ColumnType.ARRAY && designType != Array)
	// 			|| (column.type == bean.ColumnType.OBJECT
	// 				&& (designType != Array || !(designType.prototype instanceof Object))))
	// 			throw new Error(`Type mismatch found for Column: ${column.field} in Table:${this.tableName}`);
	// 	}
	// }

	getEntityType() {
		return this.EntityType;
	}

	getField(key: string) {
		return this.fieldMap.get(key);
	}

	getPrimaryFields() {
		return this.primaryFields;
	}

	filterFields(props: (string | symbol)[]) {
		let fields = Array.from(this.fieldMap.values());
		return fields.filter(f => props.includes(f.fieldName));
	}

}

export default DBSet;
