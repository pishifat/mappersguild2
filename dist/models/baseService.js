"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers/helpers");
class BaseService {
    constructor(model, defaultSort, defaultPopulate) {
        this.model = model;
        this.defaultSort = defaultSort;
        this.defaultPopulate = defaultPopulate;
    }
    queryOne(queryData) {
        let query = this.model.findOne(queryData.query);
        query = this.generateQuery(queryData, query);
        return this.executeQuery(query);
    }
    queryOneOrFail(queryData, message) {
        let query = this.model.findOne(queryData.query);
        query = this.generateQuery(queryData, query);
        return this.executeQueryOrThrow(query, message);
    }
    queryById(id, queryData = {}) {
        let query = this.model.findById(id);
        query = this.generateQuery(queryData, query);
        return this.executeQuery(query);
    }
    queryByIdOrFail(id, queryData = {}, message) {
        let query = this.model.findById(id);
        query = this.generateQuery(queryData, query);
        return this.executeQueryOrThrow(query, message);
    }
    queryAll(queryData) {
        let query = this.model.find(queryData.query);
        query = this.generateQuery(queryData, query);
        return this.executeQuery(query);
    }
    queryAllOrFail(queryData, message) {
        let query = this.model.find(queryData.query);
        query = this.generateQuery(queryData, query);
        return this.executeQueryOrThrow(query, message);
    }
    update(id, update) {
        const query = this.model.findByIdAndUpdate(id, update, { new: true });
        return this.executeQuery(query);
    }
    updateOrFail(id, update, message) {
        const query = this.model.findByIdAndUpdate(id, update, { new: true });
        return this.executeQueryOrThrow(query, message);
    }
    remove(id) {
        const query = this.model.findByIdAndRemove(id);
        return this.executeQueryOrThrow(query);
    }
    removeOrFail(id, message) {
        const query = this.model.findByIdAndRemove(id);
        return this.executeQueryOrThrow(query, message);
    }
    save(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield obj.save();
            }
            catch (error) {
                return helpers_1.defaultErrorMessage;
            }
        });
    }
    saveOrFail(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield obj.save();
            }
            catch (error) {
                throw new Error('Something went wrong while saving!');
            }
        });
    }
    generateQuery(queryData, query) {
        if (queryData.select) {
            query.select(queryData.select);
        }
        if (queryData.defaultPopulate || queryData.useDefaults) {
            if (queryData.populate) {
                queryData.populate = [...this.defaultPopulate, ...queryData.populate];
            }
            else {
                queryData.populate = this.defaultPopulate;
            }
        }
        if (queryData.populate) {
            for (let i = 0; i < queryData.populate.length; i++) {
                query.populate(queryData.populate[i]);
            }
        }
        if (queryData.defaultSort || queryData.useDefaults) {
            query.sort(this.defaultSort);
        }
        if (queryData.sort) {
            query.sort(queryData.sort);
        }
        if (queryData.limit) {
            query.limit(queryData.limit);
        }
        if (queryData.skip) {
            query.skip(queryData.skip);
        }
        return query;
    }
    executeQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield query.exec();
            }
            catch (error) {
                console.log(error);
                return { error: error._message };
            }
        });
    }
    executeQueryOrThrow(query, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield query.exec();
            if (!result || (Array.isArray(result) && result.length < 1)) {
                throw new Error(message || 'Records not found');
            }
            return result;
        });
    }
    isError(basicError) {
        return basicError.error !== undefined;
    }
}
exports.default = BaseService;
