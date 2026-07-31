AuraShell(
    id = "ecs_galaxy_movement_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "MovementSystem",
        "methodName" => "updateMovement",
        "context" => "Serverny raschet fiziki i inercii peremescheniya"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "MovementSystem", "action" => "Updates", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["VelocityComponent", "CFrameComponent", "ArchetypeComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["VelocityComponent", "CFrameComponent", "ArchetypeComponent"]) do
            Safety(limit = 5000); 
            
            # Matrix root slot assignment
            Guard_if(condition = "deltaTime <= 0", slot = "03805_00001");
            
            # =========================================================================
            # MATRICA NAPOLNENIYA
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Guard_if(condition = "archetype.type === 'STATIC_METEOR'", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Calculate(var = "currentVelocity", expr = "velocity.value");
            Calculate(var = "deltaPos", expr = "currentVelocity.mul(deltaTime)");
            Calculate(var = "nextCFrame", expr = "cFrame.value.add(deltaPos)");
            
            Mutate(component = "CFrameComponent", values = Dict("value" => "nextCFrame", "lastUpdated" => "tick()"));
            
            Calculate(var = "logSpeed", expr = "currentVelocity.Magnitude > 100 ? print('[AURA Physics] High speed detected for entity:', entityId) : undefined");
            #END_CONTENT_03805_00002#
            
            #END_CONTENT_03805_00001#
        end
    end
)

# AURA_END
