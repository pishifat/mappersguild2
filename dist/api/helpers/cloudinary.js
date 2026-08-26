"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const config_json_1 = __importDefault(require("../../config.json"));
cloudinary_1.v2.config({
    cloud_name: config_json_1.default.cloudinary.cloudName,
    api_key: config_json_1.default.cloudinary.apiKey,
    api_secret: config_json_1.default.cloudinary.apiSecret,
});
exports.default = cloudinary_1.v2;
