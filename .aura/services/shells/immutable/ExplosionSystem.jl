AuraShell(
    id = "ecs_galaxy_explosion_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ExplosionSystem",
        "methodName" => "emitParticles",
        "uiTrigger" => "Heartbeat",
        "context" => "Генерация визуальных эффектов взрыва частиц на сервере при уничтожении кораблей"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ExplosionSystem", "action" => "Triggers", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "HealthComponent"], "mutates" => ["ArchetypeComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "HealthComponent"]) do
            Guard(condition = "archetype.id == ENEMY_INTERCEPTOR")
            Safety(limit = 100)
            
            Calculate(var = "currentHp", expr = "health.current")
            Calculate(var = "deathPos", expr = "cFrame.value.Position")
            
if currentHp == 0
                print("[Aura Visual] Визуальная вспышка частиц сгенерирована в точке: ", deathPos.X)
            end
        end
    end
)