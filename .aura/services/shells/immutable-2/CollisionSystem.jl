AuraShell(
    id = "ecs_galaxy_collision_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CollisionSystem",
        "methodName" => "checkCollisions",
        "uiTrigger" => "Heartbeat",
        "context" => "Raschet vectorov stolknoveniy snaryadov i interceptorov"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CollisionSystem", "action" => "Triggers", "object" => "DamagePayloadComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent", "DamageComponent"], "mutates" => ["DamagePayloadComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent", "DamageComponent"]) do
            Safety(limit = 1000); 
            
            # Root condition assignment
            Guard_if(condition = "archetype.type === 'PLASMA_BOLT'", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            
            # 🔥 НOВЫЙ МОДУЛЬНЫЙ МАКРOС ЦИКЛA: Генерирует стерильный TS-заголовок for...of
            Guard_for_of(target = "ENEMY_INTERCEPTOR", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Guard_if(condition = "isAuraTargetValid", slot = "03805_00003");
            
            #START_CONTENT_03805_00003#
            Guard_if(condition = "cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude < 4", slot = "03805_00004");
            
            #START_CONTENT_03805_00004#
            Mutate(component = "DamagePayloadComponent", values = Dict("value" => "damage.value", "targetEntityId" => "targetEntityId"));
            ctx.world.despawn(entityId);
            #END_CONTENT_03805_00004#
            
            # Каждое условие честно закрывается своим end для идеального зеркального автомата!
            end 
            #END_CONTENT_03805_00003#
            
            end 
            #END_CONTENT_03805_00002#
            
            #END_CONTENT_03805_00001#
        end
    end
)

# AURA_END
