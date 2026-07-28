/**
 * ⚡ МОДУЛЬНЫЙ СЛУЖЕБНЫЙ ПРОЦЕССОР ТИПИЗАЦИИ TS v43.1
 * Собирает глобальную шапку контрактов как конструктор LEGO из изолированных файлов правил.
 * Исправлена опечатка дублирования путей импорта ts_rules.
 */

import { tsSpawnRules } from './ts_rules/ts_spawn_rules';
import { tsMovementRules } from './ts_rules/ts_movement_rules'; // <=== ОПЕЧАТКА ИСПРАВЛЕНА
import { tsDamageRules } from './ts_rules/ts_damage_rules';
import { tsGlobalMocks } from './ts_rules/ts_global_mocks';

// Динамически склеиваем матрицу типов из независимых файлов правил
export const globalMocksHeader = `// --- AURA RUNTIME TYPE EMBED CONTOUR v43.1 (LEGO MODULAR MATRIX) ---
import { ArchetypeComponent, VelocityComponent, CFrameComponent, WeaponStateComponent, HealthComponent, ExplosionTriggerComponent } from "../../shared/components.types";

${tsMovementRules}
${tsSpawnRules}
${tsDamageRules}
${tsGlobalMocks}
`;