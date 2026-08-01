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
        "context" => "Ochistka pamyati servera po kosmicheskim granitsam"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "DebrisSystem", "action" => "Triggers", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 1000);
            
            if archetype.type === "PLASMA_BOLT"
                # Isolated slot assignment for plasma bolts
                Guard_if(condition = "math.abs(cFrame.value.Position.X) > 2000", slot = "03805_00001");
            end
            
            if archetype.type === "ENEMY_INTERCEPTOR"
                # Isolated slot assignment for interceptors
                Guard_if(condition = "math.abs(cFrame.value.Position.X) > 3000", slot = "03805_00002");
            end
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            ctx.world.despawn(entityId);
            print("[Aura Garbage Collector] Entity removed out of bounds: ", entityId);
            #END_CONTENT_03805_00001#
            
            #START_CONTENT_03805_00002#
            ctx.world.despawn(entityId);
            print("[Aura Garbage Collector] Entity removed out of bounds: ", entityId);
            #END_CONTENT_03805_00002#
            
        end
    end
)

# AURA_END
