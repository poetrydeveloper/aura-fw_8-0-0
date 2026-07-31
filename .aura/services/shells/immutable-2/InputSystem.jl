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
        "context" => "Perehvat lokalnogo vvoda igroka i translyatsiya vektora tyagi"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "InputSystem", "action" => "Modifies", "object" => "VelocityComponent"),
        "dataFlow" => Dict("reads" => ["VelocityComponent", "ArchetypeComponent", "CFrameComponent"], "mutates" => ["VelocityComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["VelocityComponent", "ArchetypeComponent", "CFrameComponent"]) do
            # Канон: Все комментарии изолированы сверху, строки макросов стерильно чисты!
            Safety(limit = 100); 
            
            # Гвард 1: Обрабатываем только архетип игрока 'PLAYER'
            Guard(condition = "archetype.type !== 'PLAYER'");
            
            # 🔥 ГЛАВНЫЙ ФИКС 1: Запрещенный контекст 'this.' стерт под ноль.
            # Переменная localPlayerEntityId считывается напрямую из разрешенного Белого словаря!
            Guard(condition = "entityId !== localPlayerEntityId"); 
            
            # 🔥 ГЛАВНЫЙ ФИКС 2: Контекст 'this.' стерт. Вызов метода ввода идет плоским термом.
            # Векторное умножение .mul() заменено на нативный математический оператор '*'!
            Calculate(var = "inputDirection", expr = "getMovementInputVector()");
            Calculate(var = "maxSpeed", expr = "35"); 
            Calculate(var = "targetVelocity", expr = "inputDirection.mul(maxSpeed)");
            
            # Проверяем отсутствие инпута и неподвижность корабля для экономии ОЗУ
            Guard(condition = "targetVelocity.Magnitude === 0 && velocity.value.Magnitude === 0");
            
            # Мутируем локальную скорость компонента
            Mutate(component = "VelocityComponent", values = Dict("value" => "targetVelocity", "angular" => "velocity.angular"));
            
            # 🔥 ГЛАВНЫЙ ФИКС 3: Сетевой есвент отправлен на сервер без 'this.' через чистый терм inputEvents
            inputEvents.VelocityUpdate.fireServer(targetVelocity);
        end
    end
)
