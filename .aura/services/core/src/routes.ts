// .aura/services/core/src/routes.ts
import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import { db } from './db';
import { weaver } from './weaver';
// Подключаем наш каскад безопасности (Побитовый отсев + Линейный алфавитный контроль)
import { verifyPipelinePayload, validateSemanticContract } from './security'; 

export const router = Router();

/**
 * 🛰️ 1. ПРИЕМ И СИНХРОНИЗАЦИЯ РАКУШЕК
 * Универсальный Data-Driven эндпоинт с 3 кругами защиты рантайма
 */
router.post('/sync-shell', async (req: Request, res: Response) => {
    try {
        // =========================================================================
        // ⚡ КРУГ 1 И 2 БЕЗОПАСНОСТИ: МНОГОУРОВНЕВЫЙ КАСКАДНЫЙ ТРАНСПОРТНЫЙ ФИЛЬТР
        // =========================================================================
        const checkResult = verifyPipelinePayload(req.body);
        if (!checkResult.isValid) {
            console.error(`| 🚨 [AURA_7 API SECURITY BLOCK]: Крах пакета на этапе: ${checkResult.errorStage}`);
            return res.status(400).json({ error: `Критический сбой безопасности транспорта: ${checkResult.errorStage}` });
        }

        const { shell_id, meta_semantic, payload_code_b64 } = req.body;

        // Безопасное декодирование из ОЗУ (Пакет гарантированно чистый от ReDoS-зависаний)
        const cleanCodeText = Buffer.from(payload_code_b64, 'base64').toString('utf-8');
        const cleanSemanticRaw = Buffer.from(meta_semantic, 'base64').toString('utf-8');

        console.log(`[AURA_7 API] Первичные круги безопасности пройдены. Обработка ракушки: ${shell_id}`);

        let semanticObj;
        try {
            semanticObj = JSON.parse(cleanSemanticRaw);
        } catch (e) {
            return res.status(400).json({ error: `🚨 Сбой десериализации метаданных для ${shell_id}. Ожидался валидный JSON.` });
        }

        // =========================================================================
        // 📦 КРУГ 3 БЕЗОПАСНОСТИ: ВАЛИДАЦИЯ СЕМАНТИЧЕСКОГО КОНТРАКТА ДЛЯ СУБД
        // =========================================================================
        const isContractValid = validateSemanticContract({
            subject: semanticObj.subject || "Unknown",
            verb: semanticObj.verb || "Updates",
            object: semanticObj.object || "Component"
        });

        if (!isContractValid) {
            console.error(`| 🚨 [AURA_7 API SECURITY BLOCK]: Ракушка ${shell_id} нарушила алфавитный паттерн SVO-матрицы.`);
            return res.status(400).json({ error: '🚨 Критический сбой безопасности: Поля SVO (subject, verb, object) содержат запрещенные спецсимволы!' });
        }

        // Вычисляем полиморфный деплой систем на основе метаданных
        const targetClassName = semanticObj.className || "MovementSystem";
        const targetPattern = semanticObj.flameworkPattern || "MatterSystem";
       // Синхронизируем мутацию ракушки в Memgraph СУБД (Защищено параметризацией Cypher)
        await db.syncShellWithMutation({
            shell_id: shell_id,
            subject: semanticObj.subject || "Unknown",
            verb: semanticObj.verb || "Updates",
            object: semanticObj.object || "Component",
            ast_json: cleanCodeText, // Сырое «мясо» Julia-логики сохраняется в базу
            class_name: targetClassName,
            flamework_pattern: targetPattern,
            method_name: semanticObj.methodName || "update",
            execution_side: semanticObj.executionSide || "Server",
            output_type: semanticObj.outputType || "void"
        });

        // ДЕКЛАРАТИВНЫЙ ВЫЗОВ: Полная атомарная пересборка всей кодовой базы TypeScript из графа СУБД
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
 * 🕒 2. ГИБКИЙ ОТКАТ ИСТОРИИ ЧЕРЕЗ СЕМАНТИЧЕСКИЙ GIT-ЛОКАТОР
 * Находит хэш коммита в репозитории по маркеру намерения и извлекает старый код «из пепла»
 */
router.post('/rollback-shell', async (req: Request, res: Response) => {
    try {
        const { query_intent, shell_id } = req.body;

        if (!query_intent || !shell_id) {
            return res.status(400).json({ error: 'Необходимы параметры query_intent и shell_id для целевого отката.' });
        }

        // ВЫРАВНИВАЕМ РЕЛЬСЫ: Путь строго на нашу новую идеальную папку проекта хоста
        const specFolder = '.aura/services/shells/immutable-2';
        const targetFileName = `${shell_id}.jl`;
        const relativeFilePath = `${specFolder}/${targetFileName}`;

        console.log(`[AURA_7 Git-Локатор] Археологический поиск коммита для файла: ${targetFileName}`);

        let commitSha = '';
        try {
            // Находим хэш коммита, где упоминалось намерение, применительно к конкретному .jl файлу
            const gitLogCmd = `git log --all --grep="${query_intent}" --oneline -n 1 --format="%h" -- /app/${relativeFilePath}`;
            commitSha = execSync(gitLogCmd, { cwd: '/app', encoding: 'utf-8' }).trim();
        } catch (gitErr: any) {
            console.warn('[AURA_7 Git-Локатор] Лог папки пуст или Git не инициализирован:', gitErr.message);
        }

        if (!commitSha) {
            return res.status(404).json({ status: 'error', message: `В Git-истории файла не найдено намерение "${query_intent}".` });
        }

        console.log(`[AURA_7 Git-Локатор] Точка отката найдена: #${commitSha}. Извлечение старого AST...`);

        // ИЗВЛЕЧЕНИЕ ИЗ ПЕПЛА: Вытаскиваем старое тело Julia-кода напрямую из коммита Git
        let oldJuliaCode = '';
        try {
            const gitShowCmd = `git show ${commitSha}:${relativeFilePath}`;
            oldJuliaCode = execSync(gitShowCmd, { cwd: '/app', encoding: 'utf-8' });
        } catch (showErr: any) {
            return res.status(500).json({ error: `Не удалось извлечь файл из коммита #${commitSha}: ${showErr.message}` });
        }

        // Накатываем извлеченный старый код Julia в Memgraph, временно сбрасывая SVO-матрицу для отката
        await db.syncShellWithMutation({
            shell_id: shell_id,
            subject: "Rollback", verb: "Restores", object: "PreviousVersion",
            ast_json: oldJuliaCode, // Возвращаем старый текст Джулии в базу
            class_name: shell_id,
            flamework_pattern: "MatterSystem",
            method_name: "update",
            execution_side: "Server",
            output_type: "void"
        });

        // Пересобираем физические файлы игры TypeScript из уже откатнутого состояния Memgraph
        await weaver.weaveProject();

        return res.status(200).json({
            status: 'success',
            message: `Эмпатичный откат ракушки ${shell_id} по намерению "${query_intent}" успешно выполнен. Код извлечен из коммита #${commitSha}.`
        });

    } catch (error: any) {
        console.error('[AURA_7 API Error] Критический сбой при откате коммита:', error.message);
        return res.status(500).json({ error: error.message });
    }
});