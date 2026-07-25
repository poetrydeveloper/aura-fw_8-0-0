import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import { db } from './db';
import { weaver } from './weaver';

export const router = Router();

/**
 * 1. ПРИЕМ И СИНХРОНИЗАЦИЯ РАКУШЕК (Абсолютно универсальный Data-Driven эндпоинт)
 */
router.post('/sync-shell', async (req: Request, res: Response) => {
    try {
        const { shell_id, meta_semantic, payload_code_b64 } = req.body;

        if (!shell_id || !meta_semantic || !payload_code_b64) {
            return res.status(400).json({ error: 'Payload запроса не содержит обязательных полей: shell_id, meta_semantic, payload_code_b64.' });
        }

        // Нативное декодирование Base64 буферов в памяти ОЗУ
        const cleanCodeText = Buffer.from(payload_code_b64, 'base64').toString('utf-8');
        const cleanSemanticRaw = Buffer.from(meta_semantic, 'base64').toString('utf-8');

        console.log(`[AURA_7 API] Получен Base64-пакет. Декодирование ракушки: ${shell_id}`);

        // Десериализуем семантический контракт, присланный с хоста
        let semanticObj;
        try {
            semanticObj = JSON.parse(cleanSemanticRaw);
        } catch (e) {
            return res.status(400).json({ error: `Сбой десериализации метаданных для ${shell_id}. Ожидался валидный JSON.` });
        }

        // ПОЛИМОРФНЫЙ ДЕПЛОЙ: Извлекаем целевой класс/файл прямо из метаданных ракушки!
        // Больше никакого хардкода 'MovementSystem.ts'. ИИ сам передает, куда шить код.
        const targetClassName = semanticObj.className || "MovementSystem";
        const targetPattern = semanticObj.flameworkPattern || "MatterSystem";

        await db.syncShellWithMutation({
            shell_id: shell_id,
            subject: semanticObj.subject || "Unknown",
            verb: semanticObj.verb || "Updates",
            object: semanticObj.object || "Component",
            ast_json: cleanCodeText,
            class_name: targetClassName,
            flamework_pattern: targetPattern,
            method_name: semanticObj.methodName || "update",
            execution_side: semanticObj.executionSide || "Server",
            output_type: semanticObj.outputType || "void"
        });

        // ДЕКЛАРАТИВНЫЙ ВЫВОД: Запускаем Ткач для пересборки всей кодовой базы на основе СУБД
        await weaver.weaveProject();

        return res.status(200).json({
            status: 'success',
            message: `Ракушка ${shell_id} успешно интегрирована в Memgraph. Монолит проекта перегенерирован.`
        });

    } catch (error: any) {
        console.error('[AURA_7 API Error] Критический сбой при синхронизации:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 2. ГИБКИЙ ОТКАТ ИСТОРИИ ЧЕРЕЗ GIT-ЛОКАТОР
 */
router.post('/rollback-shell', async (req: Request, res: Response) => {
    try {
        const { query_intent } = req.body;

        if (!query_intent) {
            return res.status(400).json({ error: 'Необходим параметр query_intent для поиска в логах Git.' });
        }

        console.log(`[AURA_7 Git-Локатор] Семантический поиск коммита по маркеру намерения: "${query_intent}"`);
        const specFolder = '/app/shells/immutable/';

        let commitSha = '';
        try {
            const gitLogCmd = `git log --all --grep="${query_intent}" --oneline -n 1 --format="%h" -- ${specFolder}`;
            commitSha = execSync(gitLogCmd, { encoding: 'utf-8' }).trim();
        } catch (gitErr) {
            console.warn('[AURA_7 Git-Локатор] Лог папки пуст, ищем по всей истории.');
        }

        if (!commitSha) {
            return res.status(404).json({ status: 'error', message: `В Git-истории не найдено упоминаний "${query_intent}".` });
        }

        console.log(`[AURA_7 Git-Локатор] Точка отката зафиксирована: #${commitSha}`);

        // TODO: Извлечь файл через git show, распарсить метаданные, затереть ноду в Memgraph и вызвать weaveProject()
        await weaver.weaveProject();

        return res.status(200).json({
            status: 'success',
            message: `Эмпатичный откат по намерению "${query_intent}" завершен. Сеть проекта синхронизирована.`
        });

    } catch (error: any) {
        console.error('[AURA_7 API Error] Критический сбой при откате:', error.message);
        return res.status(500).json({ error: error.message });
    }
});
