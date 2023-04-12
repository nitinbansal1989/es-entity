"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bean = require("../bean/index.js");
const Mysql_js_1 = require("./Mysql.js");
const Oracle_js_1 = require("./Oracle.js");
const MsSqlServer_js_1 = require("./MsSqlServer.js");
const PostGreSql_js_1 = require("./PostGreSql.js");
const SQLite_js_1 = require("./SQLite.js");
const Cassandra_js_1 = require("./Cassandra.js");
function getHandler(config) {
    let handler = null;
    switch (config.handler) {
        case bean.HandlerType.mysql:
            handler = new Mysql_js_1.default(config);
            break;
        case bean.HandlerType.oracle:
            handler = new Oracle_js_1.default(config);
            break;
        case bean.HandlerType.postgresql:
            handler = new PostGreSql_js_1.default(config);
            break;
        case bean.HandlerType.mssql:
            handler = new MsSqlServer_js_1.default(config);
            break;
        case bean.HandlerType.sqlite:
            handler = new SQLite_js_1.default(config);
            break;
        case bean.HandlerType.cassandra:
            handler = new Cassandra_js_1.default(config);
            break;
        default:
            throw new Error('No Handler Found');
    }
    return handler;
}
exports.default = getHandler;
//# sourceMappingURL=getHandler.js.map