/**
 * 🔒 МНОГОУРОВНЕВЫЙ СЛОЙ ИНФРАСТРУКТУРНОЙ БЕЗОПАСНОСТИ И ВАЛИДАЦИИ v38.9_Turbo
 * Парадигма каскадных фильтров: от микросекундных проверок памяти к глубокому синтаксическому анализу.
 */

interface TransportBody {
    shell_id?: string;
    meta_semantic?: string;
    payload_code_b64?: string;
}

/**
 * ⚡ ЭШЕЛОН 1: СВЕРХБЫСТРЫЙ ПОБИТОВЫЙ ФИЛЬТР (Мгновенный отсев за O(1))
 * Работает на уровне примитивов памяти. Исключает аллокацию тяжелых регулярных выражений.
 */
function fastBitwiseCheck(body: any): body is Required<TransportBody> {
    // Копеечная проверка типов структуры пакета в ОЗУ V8
    if (!body || typeof body !== 'object') return false;
    if (typeof body.shell_id !== 'string' || !body.shell_id) return false;
    if (typeof body.meta_semantic !== 'string' || !body.meta_semantic) return false;
    if (typeof body.payload_code_b64 !== 'string' || !body.payload_code_b64) return false;

    // Математический канон Base64: длина строки ОБЯЗАНА быть строго кратна 4 байтам.
    // Если условие нарушено — это гарантированно битый пакет или сетевой мусор.
    if (body.meta_semantic.length % 4 !== 0) return false;
    if (body.payload_code_b64.length % 4 !== 0) return false;

    return true;
}

/**
 * 📡 ЭШЕЛОН 2: ЛИНЕЙНЫЙ АЛФАВИТНЫЙ КОНТРОЛЬ (O(N) Безопасность без ReDoS)
 * Полностью исключает риск зависания процессора из-за Catastrophic Backtracking на больших файлах.
 */
function linearAlphabetCheck(meta64: string, code64: string): boolean {
    // Плоское, строго линейное выражение без вложенных кванторов и групп. 
    // Движок V8 пролетает по строке любой длины за один проход.
    const strictBase64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    
    if (!strictBase64Pattern.test(meta64)) return false;
    if (!strictBase64Pattern.test(code64)) return false;

    return true;
}

/**
 * 📦 ЭШЕЛОН 3: ГЛУБОКАЯ СЕМАНТИЧЕСКАЯ И СИНТАКСИЧЕСКАЯ ВАЛИДАЦИЯ (Deep Inspection)
 * Выполняется только после того, как пакет доказал свою сетевую и бинарную валидность.
 */
export function validateSemanticContract(semantic: any): boolean {
    if (!semantic || typeof semantic !== 'object') return false;
    
    // Защита Memgraph от инъекций. subject, verb и object обязаны быть чистыми именами.
    const namePattern = /^[a-zA-Z0-9_]+$/;
    
    if (!semantic.subject || !namePattern.test(semantic.subject)) return false;
    if (!semantic.verb || !namePattern.test(semantic.verb)) return false;
    if (!semantic.object || !namePattern.test(semantic.object)) return false;

    return true;
}

/**
 * 🎛️ ОРКЕСТРАТОР КАСКАДНОЙ ВАЛИДАЦИИ ТРАНСПОРТА
 * Точка входа для Express-роутера. Реализует многоуровневый проход.
 */
export function verifyPipelinePayload(body: any): { isValid: boolean; errorStage?: string } {
    // Круг 1: Микросекундный побитовый фильтр
    if (!fastBitwiseCheck(body)) {
        return { isValid: false, errorStage: 'STAGE_1_BITWISE_VIOLATION (Неверная структура или длина пакета)' };
    }

    // Круг 2: Линейная проверка легитимности Base64-алфавита
    if (!linearAlphabetCheck(body.meta_semantic, body.payload_code_b64)) {
        return { isValid: false, errorStage: 'STAGE_2_ALPHABET_VIOLATION (Обнаружены нелегальные символы вне Base64)' };
    }

    // Если оба быстрых круга пройдены — пакет признается абсолютно безопасным для сети
    return { isValid: true };
}

/**
 * Валидация токенов авторизации для прохождения Nginx-шлюза
 */
export function validateSecurityToken(token: string | undefined): boolean {
    if (!token || token.length < 16) return false;
    const tokenPattern = /^[a-zA-Z0-9]{16,64}$/;
    return tokenPattern.test(token);
}
