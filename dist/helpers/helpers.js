"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function canFail(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch((error) => {
            console.log(error.message);
            return next(error);
        });
    };
}
exports.canFail = canFail;
exports.defaultErrorMessage = { error: 'Something went wrong!' };
