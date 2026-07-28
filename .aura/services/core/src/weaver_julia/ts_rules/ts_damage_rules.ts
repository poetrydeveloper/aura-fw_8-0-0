/**
 * ⚡ ИЗОЛИРОВАННОЕ ПРАВИЛО ТИПИЗАЦИИ: TS_DAMAGE_RULES v42.1
 * Гарантия защиты поля value компонента DamageComponent под типы number и string.
 */
export const tsDamageRules = `
declare global {
    interface DamageComponent {
        value: number | string;
    }
}
`;