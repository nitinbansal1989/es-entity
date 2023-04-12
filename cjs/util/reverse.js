"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require("../sql/index.js");
function reverse(res, ...srcs) {
    let allowKeys = Object.keys(res);
    srcs.forEach(src => {
        Object.keys(src).filter((key) => {
            let resVal = Reflect.get(res, key);
            return allowKeys.includes(key)
                && src[key] instanceof sql.Field
                && resVal != src[key].get();
        }).forEach((key) => {
            Reflect.set(res, key, src[key].get());
        });
    });
    return res;
}
exports.default = reverse;
//# sourceMappingURL=reverse.js.map