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
        "context" => "Bezopasny raschet ochkov zdorovya suschnostey"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "HealthSystem", "action" => "Mutates", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["HealthComponent", "DamagePayloadComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["HealthComponent", "DamagePayloadComponent"]) do
            Safety(limit = 2000); 
            
            # 🔥 БЛOЧНЫЙ КАНOН: Первый Guard открывает контекст вычислений
            Guard(condition = "health.isInvulnerable === true") do
                
                Calculate(var = "currentHp", expr = "health.current");
                Calculate(var = "damageApplied", expr = "damagePayload.value"); 
                Calculate(var = "nextHp", expr = "math.max(0, currentHp - damageApplied)");
                
                Mutate(component = "HealthComponent", values = Dict("current" => "nextHp", "max" => "health.max", "isInvulnerable" => "health.isInvulnerable"));
                
                ctx.world.remove(entityId, "DamagePayloadComponent");
                
                # 🔥 БЛOЧНЫЙ КАНOН: Второй Guard оборачивает финальный деспавн
                Guard(condition = "nextHp > 0") do
                    
                    ctx.world.despawn(entityId);
                    print("[Aura Health] Entity destroyed. Current health is zero for entity: ", entityId);
                    
                end
            end
        end
    end
)
