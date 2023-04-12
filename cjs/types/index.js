"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkArray = exports.LinkObject = exports.String = exports.BigInt = exports.Number = exports.Json = exports.Binary = exports.Date = exports.Boolean = void 0;
const BooleanType_js_1 = require("./BooleanType.js");
exports.Boolean = BooleanType_js_1.default;
const DateType_js_1 = require("./DateType.js");
exports.Date = DateType_js_1.default;
const BinaryType_js_1 = require("./BinaryType.js");
exports.Binary = BinaryType_js_1.default;
const ObjectType_js_1 = require("./ObjectType.js");
exports.Json = ObjectType_js_1.default;
const NumberType_js_1 = require("./NumberType.js");
exports.Number = NumberType_js_1.default;
const BigIntType_js_1 = require("./BigIntType.js");
exports.BigInt = BigIntType_js_1.default;
const StringType_js_1 = require("./StringType.js");
exports.String = StringType_js_1.default;
const LinkObjectType_js_1 = require("./LinkObjectType.js");
exports.LinkObject = LinkObjectType_js_1.default;
const LinkArrayType_js_1 = require("./LinkArrayType.js");
exports.LinkArray = LinkArrayType_js_1.default;
exports.default = {
    Boolean: BooleanType_js_1.default,
    Date: DateType_js_1.default,
    Binary: BinaryType_js_1.default,
    Json: ObjectType_js_1.default,
    Number: NumberType_js_1.default,
    BigInt: BigIntType_js_1.default,
    String: StringType_js_1.default,
    LinkObject: LinkObjectType_js_1.default,
    LinkArray: LinkArrayType_js_1.default
};
//# sourceMappingURL=index.js.map