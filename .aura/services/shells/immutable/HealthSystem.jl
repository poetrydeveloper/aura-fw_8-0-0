AuraShell(
    id = "ecs_galaxy_health_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "HealthSystem",
        "methodName" => "updateHealth",
        "uiTrigger" => "Heartbeat",
        "context" => "Просчет изменения очков здоровья сущностей при получении урона"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "HealthSystem", "action" => "Mutates", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["HealthComponent", "DamageComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["HealthComponent", "DamageComponent"]) do
            Safety(limit = 2000)
            
            Calculate(var = "currentHp", expr = "health.current")
            Calculate(var = "damageApplied", expr = "damage.value as number")
            Calculate(var = "nextHp", expr = "math.max(0, currentHp - damageApplied)")
            
            Mutate(component = "HealthComponent", values = Dict("current" => "nextHp"))
            
if nextHp == 0
                ctx.world.despawn(entityId)
                print("[Aura Health] Сущность уничтожена, здоровье равно нулю: ", entityId)
            end
        end
    end
)