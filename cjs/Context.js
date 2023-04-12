"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DBSet_js_1 = require("./collection/DBSet.js");
const getHandler_js_1 = require("./handlers/getHandler.js");
class Context {
    constructor(config) {
        this.connection = null;
        this.logger = null;
        this.dbSetMap = new Map();
        this.config = null;
        this.config = config;
        if (!this.config.dbConfig) {
            throw new Error('Database Config Not Found');
        }
        this.handler = (0, getHandler_js_1.default)(this.config.dbConfig);
        if (this.config.entityPath) {
            this.setEntityPath(this.config.entityPath);
        }
        this.logger = this.config.logger || console;
    }
    log(...arg) {
        this.logger.error(arg);
    }
    async init() {
        await this.handler.init();
        await Promise.all(Reflect.ownKeys(this).filter(key => {
            let o = Reflect.get(this, key);
            return o instanceof DBSet_js_1.default;
        }, this).map(key => {
            let obj = Reflect.get(this, key);
            obj.context = this;
            obj = obj.bind();
            this.dbSetMap.set(obj.getEntityType(), obj);
        }));
    }
    get handler() {
        return this._handler;
    }
    set handler(handler) {
        this._handler = handler;
        this._handler.context = this;
    }
    getEntityPath() {
        return this._entityPath;
    }
    setEntityPath(entityPath) {
        this._entityPath = entityPath;
    }
    async execute(query, args) {
        return this.handler.run(query, args, this.connection);
    }
    flush() { }
    async initTransaction() {
        let res = this;
        if (!this.connection) {
            res = Object.assign({}, this);
            Object.setPrototypeOf(res, Object.getPrototypeOf(this));
            let keys = Reflect.ownKeys(res);
            keys.forEach((key) => {
                let prop = Reflect.get(res, key);
                if (prop instanceof DBSet_js_1.default) {
                    prop.context = res;
                }
            });
        }
        res.connection = await res.handler.getConnection();
        await res.connection.initTransaction();
        return res;
    }
    async commit() {
        await this.connection.commit();
        await this.connection.close();
    }
    async rollback() {
        await this.connection.rollback();
        await this.connection.close();
    }
    end() {
        return this.handler.end();
    }
}
exports.default = Context;
//# sourceMappingURL=Context.js.map