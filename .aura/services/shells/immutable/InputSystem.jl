# .aura/services/shells/immutable/InputSystem.jl
AuraShell(
    id = "ctl_input_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Client",
        "flameworkPattern" => "ControllerMethod",
        "className" => "InputSystem",
        "methodName" => "handleInput",
        "context" => "Перехват локального ввода игрока и трансляция вектора тяги"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "InputSystem", "action" => "Modifies", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["VelocityComponent", "ArchetypeComponent", "CFrameComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["VelocityComponent", "ArchetypeComponent", "CFrameComponent"]) do
            Guard(condition = "ctx.isLocalPlayer == false")
            Guard(condition = "archetype.id != 'GALAXY_PLAYER'")
            Safety(limit = 100)
            
            Calculate(var = "inputDirection", expr = "ctx.getPlatformInputVector()")
            Calculate(var = "maxSpeed", expr = "ctx.getBaseSpeed('GALAXY_PLAYER')")
            Calculate(var = "targetVelocity", expr = "inputDirection.mul(maxSpeed)")
            
            Guard(condition = "targetVelocity.Magnitude == 0 && velocity.value.Magnitude == 0")
            Mutate(component = "VelocityComponent", values = Dict("value" => "targetVelocity"))
            
            ctx.inputDispatcher.fireAccelerationHeartbeat(targetVelocity)
        end
    end
)
