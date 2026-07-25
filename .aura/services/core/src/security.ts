/**
 * 🔒 СЛОЙ ИНФРАСТРУКТУРНОЙ БЕЗОПАСНОСТИ И ВАЛИДАЦИИ КОНТУРА AURA_7
 */

/**
 * Валидация структуры входящего Base64 бронепакета ракушки
 * Проверяет наличие обязательных полей верхнего уровня до начала десериализации
 */
export function isValidTransportPayload(body: any): boolean {
    if (!body || typeof body !== 'object') return false;
    
    // Проверка жесткого контракта Base64 транспорта
    if (!body.shell_id || typeof body.shell_id !== 'string') return false;
    if (!body.meta_semantic || typeof body.meta_semantic !== 'string') return false;
    if (!body.payload_code_b64 || typeof body.payload_code_b64 !== 'string') return false;

    // Регулярное выражение для проверки валидности кодировки Base64
    const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (!base64Regex.test(body.meta_semantic) || !base64Regex.test(body.payload_code_b64)) {
        return false;
    }

    return true;
}

/**
 * Валидация семантического паспорта (SVO), присланного ИИ-Архитектором.
 * Гарантирует корректность именования нод для предотвращения краша Memgraph СУБД.
 */
export function validateSemanticContract(semantic: any): boolean {
    if (!semantic || typeof semantic !== 'object') return false;
    
    const namePattern = /^[a-zA-Z0-9_]+$/;
    
    // Субъект, Действие (Глагол) и Объект обязаны быть чистыми алфавитно-цифровыми строками
    if (!semantic.subject || !namePattern.test(semantic.subject)) return false;
    if (!semantic.verb || !namePattern.test(semantic.verb)) return false;
    if (!semantic.object || !namePattern.test(semantic.object)) return false;

    return true;
}

/**
 * Валидация токенов авторизации для прохождения Nginx-шлюза (если используется зашифрованный доступ)
 */
export function validateSecurityToken(token: string | undefined): boolean {
    if (!token || token.length < 16) return false;
    // Разрешены только надежные алфавитно-цифровые токены
    const tokenPattern = /^[a-zA-Z0-9]{16,64}$/;
    return tokenPattern.test(token);
}
