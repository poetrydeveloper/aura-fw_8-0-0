"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const db_1 = require("./db"); // <=== ДОБАВИТЬ
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json({ limit: '50mb' }));
app.use('/', routes_1.router);
// Асинхронно накатываем индексы Memgraph
db_1.db.initConstraints().then(() => {
    app.listen(PORT, () => {
        console.log(`[AURA_7 Бэкенд] Успешно запущен на порту ${PORT}`);
    });
});
