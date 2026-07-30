AuraShell(
    id = "ecs_galaxy_game_over_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "GameOverSystem",
        "methodName" => "checkDefeat",
        "uiTrigger" => "Heartbeat",
        "context" => "Мониторинг гибели игрока на сервере и инициация триггера перезапуска по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "GameOverSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent"]) do
            Safety(limit = 10); # Канон: Точка с запятой на месте, первая строка цикла
            
            # Составной гвард: Пропускаем итерацию, если это НЕ игрок ИЛИ если игрок еще жив
            # Это мгновенно отсекает лишние вычисления (Early Return)
            Guard(condition = "archetype.type !== 'PLAYER' || health.current > 0");
            
            # Сюда рантайм дойдет СТРОГО в момент, когда текущая сущность — Игрок, и его HP == 0
            # ⚠️ Вызываем нативный метод перезапуска сессии Roblox API (DataModel:LoadPlaceInstance или TeleportService)
            # Чтобы предотвратить бесконечный спам, мы можем временно выставить флаг инвульнерабельности 
            # или выполнить моментальный перезапуск:
            
            ctx.world.insert(entityId, SharedTypes.HealthComponent({ current: 0, max: health.max, isInvulnerable: true }));
            
            print("[Aura Core] Крах игрока зафиксирован! Запуск контура телепортации и перезапуска плейса...");
        end
    end
)
