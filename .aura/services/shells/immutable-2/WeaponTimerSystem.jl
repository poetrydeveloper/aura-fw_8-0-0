AuraShell(
    id = "ecs_galaxy_weapon_timer_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "WeaponTimerSystem",
        "methodName" => "updateWeaponCooldowns",
        "context" => "Серверный апдейт кулдаунов и перезарядки турелей по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "WeaponTimerSystem", "action" => "Updates", "object" => "WeaponStateComponent"),
        "dataFlow" => Dict("reads" => ["WeaponStateComponent", "ArchetypeComponent"], "mutates" => ["WeaponStateComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["WeaponStateComponent", "ArchetypeComponent"]) do
            Safety(limit = 2000); # Канон: Строго первой строкой с точкой с запятой
            
            # Гвард 1 (Early Return): Если оружие НЕ находится в состоянии зарядки/перезарядки — пропускаем итерацию
            Guard(condition = "weaponState.isCharging === false");
            
            # Гвард 2 (Early Return): Если кулдаун УЖЕ завершен (<= 0) — пропускаем, обрабатывать нечего
            Guard(condition = "weaponState.nextTimer <= 0");
            
            # Математический декрет времени (Ткач сгенерирует переменную weaponState в camelCase)
            Calculate(var = "timeDecrement", expr = "deltaTime");
            Calculate(var = "nextCooldown", expr = "math.max(0, weaponState.nextTimer - timeDecrement)");
            
            # Атомарно обновляем таймер в ОЗУ мира. Стрелочки только Джулии =>
            Mutate(
                component = "WeaponStateComponent", 
                values = Dict(
                    "nextTimer" => "nextCooldown", 
                    "isCharging" => "nextCooldown > 0 ? true : false", # Если таймер еще тикает — остаемся в режиме зарядки
                    "ammoCapacity" => "weaponState.ammoCapacity"
                )
            );
            
            # Гвард 3: Если таймер еще не дошел до нуля — выходим из итерации (остальное оружие еще перезаряжается)
            Guard(condition = "nextCooldown > 0");
            
            # Сюда рантайм дойдет ТОЛЬКО в кадр, когдаnextCooldown стал равен 0 (перезарядка завершилась в эту секунду)
            print("[Aura Weapon Grid] Перезарядка орудий завершена для сущности: ", entityId);
        end
    end
)
