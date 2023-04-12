"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cassandra = exports.SqlLite = exports.PostGreSql = exports.OracleDb = exports.Mysql = exports.MsSqlServer = void 0;
const MsSqlServer_js_1 = require("./MsSqlServer.js");
exports.MsSqlServer = MsSqlServer_js_1.default;
const Mysql_js_1 = require("./Mysql.js");
exports.Mysql = Mysql_js_1.default;
const Oracle_js_1 = require("./Oracle.js");
exports.OracleDb = Oracle_js_1.default;
const PostGreSql_js_1 = require("./PostGreSql.js");
exports.PostGreSql = PostGreSql_js_1.default;
const SQLite_js_1 = require("./SQLite.js");
exports.SqlLite = SQLite_js_1.default;
const Cassandra_js_1 = require("./Cassandra.js");
exports.Cassandra = Cassandra_js_1.default;
exports.default = {
    MsSqlServer: MsSqlServer_js_1.default,
    Mysql: Mysql_js_1.default,
    OracleDb: Oracle_js_1.default,
    PostGreSql: PostGreSql_js_1.default,
    SqlLite: SQLite_js_1.default,
    Cassandra: Cassandra_js_1.default
};
//# sourceMappingURL=index.js.map