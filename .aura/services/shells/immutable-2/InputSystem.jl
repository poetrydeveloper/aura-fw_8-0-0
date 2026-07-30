AuraShell(
    id = "ctl_input_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Client",
        "flameworkPattern" => "ControllerMethod",
        "className" => "InputSystem",
        "methodName" => "handleInput",
        "context" => "Перехват локального ввода игрока и трансляция вектора тяги по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "InputSystem", "action" => "Modifies", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["VelocityComponent", "ArchetypeComponent", "CFrameComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["VelocityComponent", "ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 100); # Канон: Строго первой строкой
            
            # Гвард 1: Обрабатываем только архетип игрока 'PLAYER'
            Guard(condition = "archetype.type !== 'PLAYER'");
            
            # Гвард 2: Проверяем, принадлежит ли сущность локальному клиенту Roblox (защита от управления чужими кораблями)
            # В roblox-ts проверяется соответствие сетевого ID или локального плеера
            Guard(condition = "entityId !== this.localPlayerEntityId"); 
            
            # Считываем инпут напрямую через нативный сервис ввода Flamework/Roblox (выражение для TS)
            Calculate(var = "inputDirection", expr = "this.getMovementInputVector()");
            Calculate(var = "maxSpeed", expr = "35"); # Хардкод базовой скорости MVP для стабильности
            Calculate(var = "targetVelocity", expr = "inputDirection.mul(maxSpeed)");
            
            # Если инпута нет и корабль уже неподвижен — досрочно выходим (минимизируем мутации ОЗУ)
            Guard(condition = "targetVelocity.Magnitude === 0 && velocity.value.Magnitude === 0");
            
            # Мутируем локальную скорость для мгновенного отклика интерфейса на клиенте
            Mutate(component = "VelocityComponent", values = Dict("value" => "targetVelocity", "angular" => "velocity.angular"));
            
            # Нативный инжект Luau: отправляем вектор скорости на сервер через сетевой Flamework-евент
            this.inputEvents.VelocityUpdate.fireServer(targetVelocity);
        end
    end
)
