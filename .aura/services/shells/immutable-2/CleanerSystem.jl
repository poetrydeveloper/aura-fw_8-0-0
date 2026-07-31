AuraShell(
    id = "ecs_galaxy_cleaner_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "CleanerSystem",
        "methodName" => "cleanOutOfBounds",
        "uiTrigger" => "Heartbeat",
        "context" => "Despawn uletevshih obfektov Galaktiki po standartu"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CleanerSystem", "action" => "Removes", "object" => "Entity"),
        "dataFlow" => Dict("reads" => ["CFrameComponent", "ArchetypeComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["CFrameComponent", "ArchetypeComponent"]) do
            Safety(limit = 500); 
            
            # 🪐 КВАНТОВЫЙ МАТРИЧНЫЙ КАНOН v42.0: Декларативные слоты-мишени
            Guard_if(condition = "archetype.type === 'STATIONARY_OBJECT'", slot = "03805_00001");
            
            # =========================================================================
            # 🛰️ МАТРИЦА НАПОЛНЕНИЯ (Изолированные капсулы контента)
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Guard_if(condition = "math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Guard_if(condition = "math.abs(cFrame.value.Position.Y) < 500", slot = "03805_00003");
            
            #START_CONTENT_03805_00003#
            ctx.world.despawn(entityId);
            print("[Aura Garbage Collector] Entity removed out of bounds: ", entityId);
            #END_CONTENT_03805_00003#
            
            #END_CONTENT_03805_00002#
            #END_CONTENT_03805_00001#
            
        end
    end
)

# 🔥 АБСОЛЮТНЫЙ КАНOН v42.0: Токен стоит ЗА пределами структуры AuraShell!
# Он служит чистым стоп-краном и больше БЕЗДУМНО НЕ ПЛОДИТ призрачных скобок!
# AURA_END
