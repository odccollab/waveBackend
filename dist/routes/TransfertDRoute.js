"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Middleware_1 = __importDefault(require("../middlewares/Middleware"));
const TransfertDiopController_1 = __importDefault(require("../controllers/TransfertDiopController"));
const router = (0, express_1.Router)();
router.post('/retrait-code', Middleware_1.default.verifyToken, Middleware_1.default.verifySessionToken, TransfertDiopController_1.default.retrait1);
router.post('/retrait', Middleware_1.default.verifyToken, Middleware_1.default.verifySessionToken, TransfertDiopController_1.default.retrait2);
exports.default = router;
