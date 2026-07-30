AuraShell(
    id = "ecs_galaxy_explosion_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ExplosionSystem",
        "methodName" => "emitParticles",
        "uiTrigger" => "Heartbeat",
        "context" => "Безопасная генерация эффектов взрыва частиц при смерти врагов по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ExplosionSystem", "action" => "Triggers", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "HealthComponent"], "mutates" => ["ArchetypeComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "HealthComponent"]) do
            Safety(limit = 100); # Канон: Строго первой строкой с точкой с запятой
            
            # Гвард 1: Обрабатываем только вражеские перехватчики
            Guard(condition = "archetype.type === 'ENEMY_INTERCEPTOR'");
            
            # Гвард 2: Проверяем смерть. Если здоровье больше нуля — досрочно выходим из итерации
            Guard(condition = "health.current > 0");
            
            # Кэшируем позицию смерти (Ткач сгенерирует cFrame с большой 'F')
            Calculate(var = "deathPos", expr = "cFrame.value.Position");
            
            # ⚠️ ЗАЩИТА ОТ БЕЗКОНЕЧНОГО СПАВНА ЧАСТИЦ: 
            # Нативно вызываем деспавн сущности из мира прямо в момент фиксации взрыва,
            # чтобы этот мертвый корабль не взрывался повторно на следующем кадре.
            ctx.world.despawn(entityId);
            
            print("[Aura Visual] Корабль уничтожен. Вспышка частиц сгенерирована в точке: ", deathPos.X);
        end
    end
)
