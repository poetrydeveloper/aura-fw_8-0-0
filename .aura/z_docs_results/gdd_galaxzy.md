GAME DESIGN DOCUMENT (GDD) v7.0 — GALAXY🎯 1. Core Loop (Игровой цикл сессии)Рендеринг кадра ➔ Считывание инпутов игрока (WASD / Клик) ➔ Мутация вектора скорости ➔ Валидация космических границ мира ➔ Расчет дельты CFrame перемещения кораблей ➔ Проверка наложения хитбоксов (Коллизии) ➔ Вычитание здоровья (Health) ➔ Триггер спавна взрыва и частиц ➔ Утилизация мертвых ID сущностей через CleanerSystem ➔ Heartbeat-тик завершен.🟢 2. КОНТУР А: Семантическая карта ODD (ISO 34503)Слой 1: Геометрия среды (Scenery Geometry)BoundarySystem ➔ Restricts ➔ CFrameComponent: Ограничение перемещения космических кораблей по осям X и Z в пределах игровой зоны (размер карты 200x200 studs), удерживающее игрока на поле боя.Слой 2: Инфраструктура и Объекты (Infrastructure Objects)AssetFactory ➔ Binds ➔ ArchetypeComponent: Связывание числовых ID сущностей ECS со строковыми идентификаторами моделей Roblox (GALAXY_PLAYER, ENEMY_INTERCEPTOR, PLASMA_BOLT), стримящимися из облака.Слой 3: Временные изменения (Temporal Events)InputSystem ➔ Modifies ➔ VelocityComponent: Перевод нажатий клавиш управления хост-игрока в мгновенный импульс направления движения.WeaponTimerSystem ➔ Increments ➔ WeaponCooldownComponent: Накапливание тика времени перезарядки плазменных орудий между выстрелами.Слой 4: Агенты и Субъекты (Dynamic Actors)MovementSystem ➔ Updates ➔ CFrameComponent: Пошаговое смещение пространственной матрицы корабля в ОЗУ на основе текущего вектора скорости и deltaTime.EnemyAiSystem ➔ Directs ➔ VelocityComponent: Просчет вектора преследования ИИ-перехватчиками позиции игрока.Слой 5: Глобальные правила (Global Rules)CollisionSystem ➔ Triggers ➔ DamageComponent: Поиск пересечений хитбоксов плазменных снарядов и корпусов кораблей.DamageSystem ➔ Mutates ➔ HealthComponent: Вычитание очков прочности корабля при успешном попадании.ExplosionSystem ➔ Spawns ➔ FXComponent: Инициализация визуального взрыва при падении здоровья сущности до нуля.📊 3. Проектирование Компонентов (Matter ECS Структуры)typescript// src/shared/types/components.types.ts

export type GalaxyArchetype = "GALAXY_PLAYER" | "ENEMY_INTERCEPTOR" | "PLASMA_BOLT";
export type WeaponState = "READY" | "COOLDOWN";

export interface ArchetypeComponent {
    id: GalaxyArchetype;
}

export interface CFrameComponent {
    value: CFrame;
}

export interface VelocityComponent {
    value: Vector3;
}

export interface HealthComponent {
    current: number;
    max: number;
}

export interface WeaponCooldownComponent {
    state: WeaponState;
    currentTimer: number;
    rateOfFire: number;
}

export interface DamageComponent {
    value: number;
}
Используйте код с осторожностью.⚙️ 4. Проектирование Логики (Атомарные системы под TSX-ракушки)InputSystem ( side: "Client", trigger: "Heartbeat" )ODD Слой: 3Guard: if (ctx.isLocalPlayer === false) continue;Query: ["VelocityComponent", "ArchetypeComponent"]Safety: 100Mutate / Calculate: Считать инпут через UserInputService. Расчитать moveVector (X и Z оси). Записать дельту в VelocityComponent.value с множителем базовой скорости корабля игрока.MovementSystem ( side: "Server", trigger: "Heartbeat" )ODD Слой: 4Guard: if (deltaTime <= 0) continue;Query: ["VelocityComponent", "CFrameComponent"]Safety: 5000Calculate: const deltaPos = velocity.value.mul(deltaTime);Mutate: CFrameComponent ➔ values={{ value: "cframe.value.add(deltaPos)" }}BoundarySystem ( side: "Server", trigger: "Heartbeat" )ODD Слой: 1Guard: if (math.abs(cframe.value.X) < 100 && math.abs(cframe.value.Z) < 100) continue;Query: ["CFrameComponent", "VelocityComponent"]Safety: 5000Calculate: Ограничить координаты через math.clamp.Mutate: Вернуть корабль в допустимые рамки карты и обнулить VelocityComponent на векторе вылета.WeaponTimerSystem ( side: "Server", trigger: "Heartbeat" )ODD Слой: 3Guard: if (weaponCooldown.state === 'READY') continue;Query: ["WeaponCooldownComponent"]Safety: 2000Calculate: const nextTimer = weaponCooldown.currentTimer + deltaTime;Mutate: Если nextTimer >= weaponCooldown.rateOfFire, переключить state в "READY" и обнулить currentTimer. Иначе обновить currentTimer = nextTimer.CollisionSystem ( side: "Server", trigger: "Heartbeat" )ODD Слой: 5Guard: if (archetype.id !== 'PLASMA_BOLT') continue;Query: ["ArchetypeComponent", "CFrameComponent", "DamageComponent"]Safety: 1000NestedQuery: target="ENEMY_INTERCEPTOR"Guard: if (cframe.value.Position.sub(targetCFrame.value.Position).Magnitude > 4) continue;Mutate: Наложить на сущность цели компонент-индикатор DamagePayloadComponent с уроном из снаряда. Уничтожить id снаряда через ctx.world.despawn(entityId).DamageSystem ( side: "Server", trigger: "Heartbeat" )ODD Слой: 5Guard: if (!ctx.world.has(entityId, SharedTypes.DamagePayloadComponent)) continue;Query: ["HealthComponent", "DamagePayloadComponent"]Safety: 2000Calculate: const finalHealth = math.max(0, health.current - damagePayload.value);Mutate: Обновить HealthComponent.current = finalHealth. Удалить временный DamagePayloadComponent с сущности.🔵 5. КОНТУР Б: Валидационные Предикаты GDL (Тест-кейсы)Механика: Расчет смещения корабля по оси X (MovementSystem)pre_condition: { "CFrameComponent": { "value": "new CFrame(0, 0, 0)" }, "VelocityComponent": { "value": "new Vector3(50, 0, 0)" } }mock_input: deltaTime = 0.1post_condition_expected: { "CFrameComponent": { "value": "new CFrame(5, 0, 0)" } }Механика: Обработка критического урона (DamageSystem)pre_condition: { "HealthComponent": { "current": 20, "max": 100 }, "DamagePayloadComponent": { "value": 30 } }mock_input: tickpost_condition_expected: { "HealthComponent": { "current": 0, "max": 100 } }🔗 6. Жизненный цикл и Очистка памяти (CleanerSystem)Правило деспавна снарядов: Система-Уборщик CleanerSystem (side: Server) запрашивает все сущности с ArchetypeComponent.id === "PLASMA_BOLT". Если math.abs(cframe.value.Z) > 150 studs (снаряд улетел за видимый радиус арены боевых действий), CleanerSystem принудительно вызывает ctx.world.despawn(entityId), предотвращая утечку ID и очищая оперативную память сервера Roblox.Правило деспавна кораблей: Если HealthComponent.current === 0, CleanerSystem деспавнит сущность корабля, накладывая на её координаты кратковременный визуальный ассет взрыва.