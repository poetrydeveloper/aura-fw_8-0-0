AuraShell(
    id = "ecs_galaxy_debris_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "DebrisSystem",
        "methodName" => "cleanGarbage",
        "uiTrigger" => "Heartbeat",
        "context" => "Автоматический мониторинг координат и очистка ОЗУ от улетевших объектов по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "DebrisSystem", "action" => "Triggers", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 1000); # Канон: Точка с запятой на месте
            
            # Вся условная логика вынесена в детерминированные TypeScript-строки макросов Guard
            # Ветка А: Очистка плазменных снарядов игрока/врагов
            Guard(condition = "archetype.type === 'PLASMA_BOLT' && math.abs(cFrame.value.Position.X) > 2000");
            Calculate(var = "isBolt", expr = "archetype.type === 'PLASMA_BOLT'");
            
            # Нативный инжект Luau-кода деспавна, если сработал гвард снаряда
            # Так как Guard выполняет Early Return (continue), до этой строки дойдут только те, кто прошел условия
            # Для MVP-реализации раздельных условий мы можем использовать нативный условный блок, валидный в TS:
            
            # Чтобы Ткач сгенерировал чистый код без каскада if-оберток, используем свойства Guard:
            Guard(condition = "(archetype.type === 'PLASMA_BOLT' && math.abs(cFrame.value.Position.X) > 2000) || (archetype.type === 'ENEMY_INTERCEPTOR' && math.abs(cFrame.value.Position.X) > 3000)");
            
            ctx.world.despawn(entityId);
            print("[Aura Garbage] Сущность стерта из ОЗУ по лимиту дистанции DebrisSystem: ", entityId);
        end
    end
)
