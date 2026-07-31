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
            
            # Гвард 1: Защита от нулевой дельты времени
            Guard(condition = "deltaTime <= 0");
            
            # Гвард 2: Если объект является статическим метеором — досрочно выходим
            Guard(condition = "archetype.type === 'STATIC_METEOR'");
            
            # 🔥 КАНOН ROBLOX-TS: Векторный расчет физики строго через методы .mul() и .add()
            # Это полностью исключает ошибки типов на этапе npm run build!
            Calculate(var = "currentVelocity", expr = "velocity.value");
            Calculate(var = "deltaPos", expr = "currentVelocity.mul(deltaTime)");
            Calculate(var = "nextCFrame", expr = "cFrame.value.add(deltaPos)");
            
            Mutate(component = "CFrameComponent", values = Dict("value" => "nextCFrame", "lastUpdated" => "tick()"));
            
            Calculate(var = "logSpeed", expr = "currentVelocity.Magnitude > 100 ? print('[AURA Physics] High speed detected for entity:', entityId) : undefined");
        end
    end
)
