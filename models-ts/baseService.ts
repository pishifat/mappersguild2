import { Model, QueryPopulateOptions, Document, DocumentQuery } from 'mongoose';
import { defaultErrorMessage, BasicError } from '../helpers/helpers';

export interface QueryData<> {
    query?: object;
    populate?: QueryPopulateOptions[];
    sort?: object;
    defaultSort?: boolean;
    defaultPopulate?: boolean;
    withDefaults?: boolean;
}

export default class BaseService<T extends Document> {

    constructor(
        private model: Model<T, {}>,
        private defaultSort: object,
        private defaultPopulate: QueryPopulateOptions[]
    ) {}

    queryOne(queryData: QueryData): Promise<T | null | BasicError> {
        let query = this.model.findOne(queryData.query);

        query = this.generateQuery(queryData, query);

        return this.executeQuery(query);
    }

    /** Will throw if result is null, basically will return "{ error: /message/ }" */
    queryOneOrFail(queryData: QueryData, message?: string): Promise<Extract<T | T[], T>> { // return type is dumb, help
        let query = this.model.findOne(queryData.query);

        query = this.generateQuery(queryData, query);

        return this.executeQueryOrThrow(query, message);
    }

    queryById(id: T['_id'], queryData: Omit<QueryData, 'query'> = {}): Promise<T | null | BasicError> {
        let query = this.model.findById(id);

        query = this.generateQuery(queryData, query);

        return this.executeQuery(query);
    }

    /** Will throw if result is null, basically will return "{ error: /message/ }" */
    queryByIdOrFail(id: T['_id'], queryData: Omit<QueryData, 'query'> = {}, message?: string): Promise<Extract<T | T[], T>> { // return type is dumb, help
        let query = this.model.findById(id);

        query = this.generateQuery(queryData, query);

        return this.executeQueryOrThrow(query, message);
    }

    queryAll(queryData: QueryData): Promise<T[] | BasicError> {
        let query = this.model.find(queryData.query);

        query = this.generateQuery(queryData, query);

        return this.executeQuery(query);
    }

    /** Will throw if array is empty [], basically will return "{ error: /message/ }" */
    queryAllOrFail(queryData: QueryData, message?: string): Promise<T[]> {
        let query = this.model.find(queryData.query);

        query = this.generateQuery(queryData, query);

        return this.executeQueryOrThrow(query, message);
    }

    update(id: string, update: object): Promise<T | BasicError | null> {
        const query = this.model.findByIdAndUpdate(id, update, { new: true });

        return this.executeQuery(query);
    }

    /** Will throw if result is null, basically will return "{ error: /message/ }" */
    updateOrFail(id: string, update: object, message?: string): Promise<Extract<T | T[], T>> {
        const query = this.model.findByIdAndUpdate(id, update, { new: true });

        return this.executeQueryOrThrow(query, message);
    }

    remove(id: string): Promise<T | BasicError | null> {
        const query = this.model.findByIdAndRemove(id);

        return this.executeQueryOrThrow(query);
    }

    /** Will throw if result is null, basically will return "{ error: /message/ }" */
    removeOrFail(id: string, message?: string): Promise<Extract<T | T[], T>> {
        const query = this.model.findByIdAndRemove(id);

        return this.executeQueryOrThrow(query, message);
    }

    async save(obj: T): Promise<T | BasicError> {
        try {
            return await obj.save();
        } catch (error) {
            return defaultErrorMessage;
        }
    }

    async saveOrFail(obj: T): Promise<T> {
        try {
            return await obj.save();
        } catch (error) {
            throw new Error('Something went wrong while saving!');
        }
    }

    generateQuery<U>(
        queryData: QueryData,
        query: DocumentQuery<Extract<T | T[] | null, U>, T>
    ): DocumentQuery<Extract<T | T[] | null, U>, T> {
        if (queryData.defaultPopulate || queryData.withDefaults) {
            if (queryData.populate) {
                queryData.populate = [...this.defaultPopulate, ...queryData.populate];
            } else {
                queryData.populate = this.defaultPopulate;
            }
        }

        if (queryData.populate) {
            for (let i = 0; i < queryData.populate.length; i++) {
                query.populate(queryData.populate[i]);
            }
        }

        if (queryData.defaultSort || queryData.withDefaults) {
            query.sort(this.defaultSort);
        }

        if (queryData.sort) {
            query.sort(queryData.sort);
        }

        return query;
    }

    async executeQuery<U>(
        query: DocumentQuery<Extract<T | T[] | null, U>, T>
    ): Promise<Extract<T | T[] | null, U> | BasicError> {
        try {
            return await query.exec();
        } catch (error) {
            console.log(error);

            // logs.service.create(null, error, null, 'error');
            return { error: error._message };
        }
    }

    /** Will throw if object is null (for findOne(), findById()) or if array is empty (for find()) */
    async executeQueryOrThrow<U>(
        query: DocumentQuery<Extract<T | T[] | null, U>, T>,
        message?: string
    ): Promise<Extract<T | T[], U>> {
        const result = await query.exec();

        if (!result || (Array.isArray(result) && result.length < 1)) {
            throw new Error(message || 'Records not found');
        }

        return result;
    }

    isError(basicError: T | T[] | BasicError): basicError is BasicError {
        return (basicError as BasicError).error !== undefined;
    }
}