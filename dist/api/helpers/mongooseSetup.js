"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// must be imported before compiling app. only affects dev
mongoose_1.default.set('strictPopulate', false);
mongoose_1.default.plugin(schema => {
    schema.pre('findOneAndUpdate', function () {
        if (!('returnDocument' in this.options)) {
            this.setOptions({ returnDocument: 'after' });
        }
    });
});
