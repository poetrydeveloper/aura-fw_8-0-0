AuraShell(
    id = "registry_galaxy_debris_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "DebrisSystem",
        "methodName" => "cleanGarbage",
        "uiTrigger" => "Heartbeat",
        "context" => "Автоматический мониторинг координат сущностей и очистка ОЗУ от улетевших за карту объектов"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "DebrisSystem", "action" => "Triggers", "object" => "CFrameComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "CFrameComponent"], "mutates" => ["CFrameComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "CFrameComponent"]) do
            Safety(limit = 1000)
            
            Calculate(var = "currentPos", expr = "cFrame.value.Position")
            Calculate(var = "archId", expr = "archetype.id")
            
if (archId == PLASMA_BOLT)
                if (math.abs(currentPos.X) > 2000)
                    ctx.world.despawn(entityId)
                    print("[Aura Garbage] Снаряд выжжен из ОЗУ сервера по лимиту дистанции.")
                end
            end
            
if (archId == ENEMY_INTERCEPTOR)
                if (math.abs(currentPos.X) > 3000)
                    ctx.world.despawn(entityId)
                    print("[Aura Garbage] Потерянный перехватчик удален из памяти для оптимизации.")
                end
            end
        end
    end
)
