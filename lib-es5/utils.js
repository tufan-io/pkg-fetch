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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = exports.plusx = exports.hash = exports.downloadUrl = void 0;
var axios_1 = __importDefault(require("axios"));
var crypto_1 = __importDefault(require("crypto"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var util_1 = require("util");
var child_process_1 = require("child_process");
var stream_1 = __importDefault(require("stream"));
var log_1 = require("./log");
function downloadUrl(url, file) {
    return __awaiter(this, void 0, void 0, function () {
        var tempFile, ws;
        return __generator(this, function (_a) {
            log_1.log.enableProgress(path_1.default.basename(file));
            log_1.log.showProgress(0);
            tempFile = file + ".downloading";
            fs_extra_1.default.mkdirpSync(path_1.default.dirname(tempFile));
            ws = fs_extra_1.default.createWriteStream(tempFile);
            log_1.log.info("Downloading " + url);
            return [2 /*return*/, axios_1.default
                    .get(url, { responseType: 'stream' })
                    .then(function (_a) {
                    var data = _a.data, headers = _a.headers;
                    var totalSize = headers['content-length'];
                    var currentSize = 0;
                    data.on('data', function (chunk) {
                        if (totalSize != null && totalSize !== 0) {
                            currentSize += chunk.length;
                            log_1.log.showProgress((currentSize / totalSize) * 100);
                        }
                    });
                    data.pipe(ws);
                    return util_1.promisify(stream_1.default.finished)(ws).then(function () {
                        log_1.log.showProgress(100);
                        log_1.log.disableProgress();
                        fs_extra_1.default.moveSync(tempFile, file);
                    });
                })
                    .catch(function (e) {
                    log_1.log.disableProgress();
                    fs_extra_1.default.rmSync(tempFile);
                    if (e.response) {
                        throw log_1.wasReported("" + e.response.status);
                    }
                    else {
                        throw log_1.wasReported(e.message);
                    }
                })];
        });
    });
}
exports.downloadUrl = downloadUrl;
function hash(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var resultHash = crypto_1.default.createHash('sha256');
                    var input = fs_extra_1.default.createReadStream(filePath);
                    input.on('error', function (e) {
                        reject(e);
                    });
                    input.on('readable', function () {
                        var data = input.read();
                        if (data) {
                            resultHash.update(data);
                        }
                        else {
                            resolve(resultHash.digest('hex'));
                        }
                    });
                })];
        });
    });
}
exports.hash = hash;
function plusx(file) {
    return __awaiter(this, void 0, void 0, function () {
        var s, newMode, base8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_extra_1.default.stat(file)];
                case 1:
                    s = _a.sent();
                    newMode = s.mode | 64 | 8 | 1;
                    if (s.mode === newMode)
                        return [2 /*return*/];
                    base8 = newMode.toString(8).slice(-3);
                    return [4 /*yield*/, fs_extra_1.default.chmod(file, base8)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.plusx = plusx;
function spawn(command, args, options) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            error = child_process_1.spawnSync(command, args, options).error;
            if (error) {
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
exports.spawn = spawn;
//# sourceMappingURL=utils.js.map