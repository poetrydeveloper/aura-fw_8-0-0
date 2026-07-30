AuraShell(
    id = "ecs_galaxy_health_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "HealthSystem",
        "methodName" => "updateHealth",
        "uiTrigger" => "Heartbeat",
        "context" => "Безопасный просчет изменения очков здоровья сущностей при получении урона по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "HealthSystem", "action" => "Mutates", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["HealthComponent", "DamagePayloadComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["HealthComponent", "DamagePayloadComponent"]) do
            Safety(limit = 2000); # Канон: Строго первой строкой
            
            # Проверяем гвард инвульнерабельности (например, для мертвого игрока в GameOverSystem)
            Guard(condition = "health.isInvulnerable === true"); 
            
            Calculate(var = "currentHp", expr = "health.current");
            Calculate(var = "damageApplied", expr = "damagePayload.value"); # camelCase 'damagePayload' из Query контракта
            Calculate(var = "nextHp", expr = "math.max(0, currentHp - damageApplied)");
            
            # Атомарно обновляем здоровье сущности
            Mutate(component = "HealthComponent", values = Dict("current" => "nextHp", "max" => "health.max", "isInvulnerable" => "health.isInvulnerable"));
            
            # ⚠️ СТРОГИЙ КАНОН ECS: Очищаем входящую дельту урона, чтобы сущность не умирала вечно на каждом тике!
            ctx.world.remove(entityId, SharedTypes.DamagePayloadComponent);
            
            # Заворачиваем логику уничтожения в гвард. Если сущность еще жива — досрочно выходим из итерации
            Guard(condition = "nextHp > 0");
            
            # Сюда рантайм дойдет ТОЛЬКО если nextHp === 0. Выполняем деспавн
            ctx.world.despawn(entityId);
            print("[Aura Health] Сущность уничтожена, здоровье равно нулю: ", entityId);
        end
    end
)
