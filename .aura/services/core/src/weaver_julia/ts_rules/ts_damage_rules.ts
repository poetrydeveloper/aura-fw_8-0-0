/**
 * ⚡ МОДЕРНИЗИРОВАННОЕ ПРАВИЛО ТИПИЗАЦИИ: TS_DAMAGE_RULES v38.9 (JULIA SYNCHRONIZED)
 * Гарантия защиты полей value для DamageComponent и DamagePayloadComponent без конфликтов деклараций.
 */
export const tsDamageRules = `
// Защита и расширение типов боевого контура урона Галактики
// Благодаря нативному импорту в ts_post_processor, интерфейсы бесшовно дополняются свойствами:

interface DamageComponent {
    value: number | string;
}

interface DamagePayloadComponent {
    value: number;
    targetEntityId: number;
}
`;
