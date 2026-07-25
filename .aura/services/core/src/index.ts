import express from 'express';
import { router as syncRouter } from './routes';
import { db } from './db'; // <=== ДОБАВИТЬ

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use('/', syncRouter);

// Асинхронно накатываем индексы Memgraph
db.initConstraints().then(() => {
    app.listen(PORT, () => {
        console.log(`[AURA_7 Бэкенд] Успешно запущен на порту ${PORT}`);
    });
});
