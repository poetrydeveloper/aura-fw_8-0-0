AuraShell(
    id = "ecs_galaxy_ai_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "EnemyAiSystem",
        "methodName" => "updateAi",
        "uiTrigger" => "Heartbeat",
        "context" => "Raschet vectorov dvizheniya AI dlya interceptorov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemyAiSystem", "action" => "Mutates", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "VelocityComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 10); 
            
            # Root declarative slot assignment
            Guard_if(condition = "archetype.type === 'PLAYER'", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Calculate(var = "playerPos", expr = "cFrame.value.Position");
            
            # NEW MODULAR LOOP MACRO: Generates sterile TypeScript header for...of
            Guard_for_of(target = "ENEMY_INTERCEPTOR", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Guard_if(condition = "isAuraTargetValid", slot = "03805_00003");
            
            #START_CONTENT_03805_00003#
            Calculate(var = "enemyPos", expr = "targetCFrame.value.Position");
            Calculate(var = "dirVector", expr = "playerPos.sub(enemyPos).Magnitude > 0 ? playerPos.sub(enemyPos).Unit : new Vector3(0, 0, 0)");
            Calculate(var = "aiSpeed", expr = "25");
            Calculate(var = "calculatedVelocity", expr = "dirVector.mul(aiSpeed)");
            
            Mutate(component = "VelocityComponent", values = Dict("value" => "calculatedVelocity", "targetEntityId" => "targetEntityId"));
            #END_CONTENT_03805_00003#
            
            # Honest mirror end statement for Guard_for_of block
            end
            #END_CONTENT_03805_00002#
            
            #END_CONTENT_03805_00001#
        end
    end
)

# AURA_END
