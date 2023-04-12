import * as sql from '../sql/index.js';
class Converter {
    constructor(option) {
        this.option = null;
        this.option = option || {};
        this.option.ignoreKeys = option.ignoreKeys || [];
    }
    convert(res, ...srcs) {
        let allowKeys = this.option.allowKeys || Object.keys(res);
        allowKeys = allowKeys.filter(key => {
            return !this.option.ignoreKeys.includes(key);
        });
        srcs.forEach(src => {
            Object.keys(src).filter((key) => {
                let resVal = Reflect.get(res, key);
                return allowKeys.includes(key)
                    && src[key] != null
                    && resVal instanceof sql.Field
                    && resVal.get() != src[key];
            }).forEach((key) => {
                let resVal = Reflect.get(res, key);
                let typeFunc = this.option.typeFuncs != null ? this.option.typeFuncs.get(resVal.constructor) : null;
                if (typeFunc && typeof typeFunc == 'function') {
                    resVal.set(typeFunc(src[key]));
                }
                else {
                    resVal.set(src[key]);
                }
            });
        });
        return res;
    }
    reverse(res, ...srcs) {
        let allowKeys = this.option.allowKeys || Object.keys(res);
        allowKeys = allowKeys.filter(key => {
            return !this.option.ignoreKeys.includes(key);
        });
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
}
export default Converter;
