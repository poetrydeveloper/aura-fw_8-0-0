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
            
            # Root assignment slot
            Guard_if(condition = "health.isInvulnerable === true", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Calculate(var = "currentHp", expr = "health.current");
            Calculate(var = "damageApplied", expr = "damagePayload.value"); 
            Calculate(var = "nextHp", expr = "math.max(0, currentHp - damageApplied)");
            
            Mutate(component = "HealthComponent", values = Dict("current" => "nextHp", "max" => "health.max", "isInvulnerable" => "health.isInvulnerable"));
            
            ctx.world.remove(entityId, "DamagePayloadComponent");
            
            # Nested declarative slot for death verification
            Guard_if(condition = "nextHp > 0", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            ctx.world.despawn(entityId);
            print("[Aura Health] Entity destroyed. Current health is zero for entity: ", entityId);
            #END_CONTENT_03805_00002#
            
            # Honest mirror end statement for nested Guard_if block
            end
            #END_CONTENT_03805_00001#
            
            # Honest mirror end statement for root Guard_if block
            end
        end
    end
)

# AURA_END
