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
            Safety(limit = 100); 
            
            # 🪐 КВАНТОВЫЙ МАТРИЧНЫЙ КАНOН v42.0: Корневой декларативный слот
            Guard_if(condition = "archetype.type !== 'PLAYER'", slot = "03805_00001");
            
            # =========================================================================
            # 🛰️ МАТРИЦА НАПОЛНЕНИЯ (Изолированные капсулы контента)
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Guard_if(condition = "entityId !== localPlayerEntityId", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Calculate(var = "inputDirection", expr = "getMovementInputVector()");
            Calculate(var = "maxSpeed", expr = "35"); 
            Calculate(var = "targetVelocity", expr = "inputDirection.mul(maxSpeed)");
            
            Guard_if(condition = "targetVelocity.Magnitude === 0 && velocity.value.Magnitude === 0", slot = "03805_00003");
            
            #START_CONTENT_03805_00003#
            Mutate(component = "VelocityComponent", values = Dict("value" => "targetVelocity", "angular" => "velocity.angular"));
            inputEvents.VelocityUpdate.fireServer(targetVelocity);
            #END_CONTENT_03805_00003#
            
            #END_CONTENT_03805_00002#
            #END_CONTENT_03805_00001#
        end
    end
)

# 🔥 АБСОЛЮТНЫЙ КАНOН v42.0: Токен стоит ЗА пределами структуры AuraShell!
# Он служит чистым стоп-краном и больше БЕЗДУМНО НЕ ПЛОДИТ призрачных скобок!
# AURA_END
