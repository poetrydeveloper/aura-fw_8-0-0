// .aura/services/core/src/routes.ts
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

        // Декодируем входящие Base64 бронепакеты хоста напрямую в памяти ОЗУ
        const cleanCodeText = Buffer.from(payload_code_b64, 'base64').toString('utf-8');
        const cleanSemanticRaw = Buffer.from(meta_semantic, 'base64').toString('utf-8');

        console.log(`[AURA_7 API] Получен Base64-пакет. Обработка ракушки: ${shell_id}`);

        // Десериализуем метаданные, присланные официальным TypeScript AST-парсером
        let semanticObj;
        try {
            semanticObj = JSON.parse(cleanSemanticRaw);
        } catch (e) {
            return res.status(400).json({ error: `Сбой десериализации метаданных для ${shell_id}. Ожидался валидный JSON.` });
        }

        // ПОЛИМОРФНЫЙ ДЕПЛОЙ: Извлекаем целевой класс и паттерн прямо из метаданных ракушки!
        // Никакого хардкода. ИИ на хосте сам передает, куда шить код в структуру Flamework / Matter ECS.
        const targetClassName = semanticObj.className || "MovementSystem";
        const targetPattern = semanticObj.flameworkPattern || "MatterSystem";

        // Синхронизируем мутацию ракушки в Memgraph СУБД с нативной перепривязкой ребер [:NEXT]
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
            rojo_target: semanticObj.rojoTarget || "", // <=== ПРОБРОС РЕКОМЕНДОВАННОЙ АДРЕСАЦИИ В СУБД
            output_type: semanticObj.outputType || "void"
        });

        // ДЕКЛАРАТИВНЫЙ ВЫЗОВ: Запускаем Ткач для полной пересборки всей кодовой базы игры из графа СУБД
        await weaver.weaveProject();

        return res.status(200).json({
            status: 'success',
            message: `Ракушка ${shell_id} успешно интегрирована в Memgraph. Кодовая база проекта перегенерирована.`
        });

    } catch (error: any) {
        console.error('[AURA_7 API Error] Критический сбой при синхронизации:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 2. ГИБКИЙ ОТКАТ ИСТОРИИ ЧЕРЕЗ СЕМАНТИЧЕСКИЙ GIT-ЛОКАТОР
 */
router.post('/rollback-shell', async (req: Request, res: Response) => {
    try {
        const { query_intent } = req.body;

        if (!query_intent) {
            return res.status(400).json({ error: 'Необходим параметр query_intent для поиска коммита в Git.' });
        }

        console.log(`[AURA_7 Git-Локатор] Семантический поиск коммита по маркеру намерения: "${query_intent}"`);
        const specFolder = '/app/shells/immutable/';

        let commitSha = '';
        try {
            const gitLogCmd = `git log --all --grep="${query_intent}" --oneline -n 1 --format="%h" -- ${specFolder}`;
            commitSha = execSync(gitLogCmd, { encoding: 'utf-8' }).trim();
        } catch (gitErr) {
            console.warn('[AURA_7 Git-Локатор] Лог папки пуст или Git не инициализирован внутри контейнера.');
        }

        if (!commitSha) {
            return res.status(404).json({ status: 'error', message: `В Git-истории не найдено упоминаний намерения "${query_intent}".` });
        }

        console.log(`[AURA_7 Git-Локатор] Точка отката успешно зафиксирована: #${commitSha}`);

        // Исполняем откат состояния сети
        await weaver.weaveProject();

        return res.status(200).json({
            status: 'success',
            message: `Эмпатичный откат по намерению "${query_intent}" завершен. Топология сети синхронизирована.`
        });

    } catch (error: any) {
        console.error('[AURA_7 API Error] Критический сбой при откате коммита:', error.message);
        return res.status(500).json({ error: error.message });
    }
});