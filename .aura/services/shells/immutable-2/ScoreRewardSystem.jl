AuraShell(
    id = "ecs_galaxy_score_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "ScoreRewardSystem",
        "methodName" => "processRewards",
        "uiTrigger" => "Heartbeat",
        "context" => "Bezopasny monitoring unichtozheniya vragov i nachislenie ochkov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "ScoreRewardSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent", "DamagePayloadComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent", "DamagePayloadComponent"]) do
            Safety(limit = 1000); 
            
            # Root assignment slot
            Guard_if(condition = "archetype.type === 'ENEMY_INTERCEPTOR'", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Guard_if(condition = "(health.current - damagePayload.value) > 0", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            print("[Aura Progress] Enemy destroyed. Reward experience added for entity: ", entityId);
            #END_CONTENT_03805_00002#
            
            # Honest mirror end statement for nested Guard_if block 00002
            end
            #END_CONTENT_03805_00001#
            
            # Honest mirror end statement for root Guard_if block 00001
            end
        end
    end
)

# AURA_END
