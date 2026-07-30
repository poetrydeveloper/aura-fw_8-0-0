AuraShell(
    id = "ecs_galaxy_movement_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "MovementSystem",
        "methodName" => "updateMovement",
        "context" => "Серверный просчет физики и инерции перемещения объектов Галактики по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "MovementSystem", "action" => "Updates", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["VelocityComponent", "CFrameComponent", "ArchetypeComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["VelocityComponent", "CFrameComponent", "ArchetypeComponent"]) do
            Safety(limit = 5000); # Канон: Теперь строго первой строкой и с точкой с запятой
            
            # Гвард 1: Защита от нулевого дельты времени
            Guard(condition = "deltaTime <= 0");
            
            # Гвард 2: Если объект является статическим метеором — досрочно выходим (он не двигается)
            Guard(condition = "archetype.type === 'STATIC_METEOR'");
            
            # Векторный расчет (Ткач сгенерирует переменные velocity и cFrame строго в camelCase)
            Calculate(var = "currentVelocity", expr = "velocity.value");
            Calculate(var = "deltaPos", expr = "currentVelocity.mul(deltaTime)");
            Calculate(var = "nextCFrame", expr = "cFrame.value.add(deltaPos)");
            
            # Атомарная мутация матрицы трансформации CFrame в ОЗУ мира. На конце строго ;
            Mutate(component = "CFrameComponent", values = Dict("value" => "nextCFrame", "lastUpdated" => "tick()"));
            
            # Инкапсулируем условный логгер в нативный тернарный вызов TypeScript-строкой через Calculate,
            # чтобы не ломать бесскобочный баланс макросов Julia
            Calculate(var = "logSpeed", expr = "currentVelocity.Magnitude > 100 ? print('[AURA Physics] Высокая скорость сущности:', entityId) : null");
        end
    end
)
