# .aura/services/shells/immutable/MovementSystem.jl
AuraShell(
    id = "ecs_move_02_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "MovementSystem",
        "methodName" => "updateMovement",
        "context" => "Серверный просчет физики и инерции перемещения объектов Галактики"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "MovementSystem", "action" => "Updates", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["VelocityComponent", "CFrameComponent", "ArchetypeComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["VelocityComponent", "CFrameComponent", "ArchetypeComponent"]) do
            Guard(condition = "deltaTime <= 0")
            Guard(condition = "archetype.id == 'STATIC_METEOR'")
            Safety(limit = 5000)
            
            Calculate(var = "currentVelocity", expr = "velocity.value")
            Calculate(var = "deltaPos", expr = "currentVelocity.mul(deltaTime)")
            Calculate(var = "nextCFrame", expr = "cFrame.value.add(deltaPos)")
            
            Mutate(component = "CFrameComponent", values = Dict("value" => "nextCFrame"))
            
            if currentVelocity.Magnitude > 100
                print("[AURA Physics] Обнаружено высокоскоростное перемещение объекта: ", entityId)
            end
        end
    end
)
