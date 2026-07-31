AuraShell(
    id = "ecs_galaxy_game_over_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso34503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "GameOverSystem",
        "methodName" => "checkDefeat",
        "uiTrigger" => "Heartbeat",
        "context" => "Monitoring gibeli igroka na servere i trigger perezapuska"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "GameOverSystem", "action" => "Triggers", "object" => "HealthComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent", "HealthComponent"], "mutates" => ["HealthComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["ArchetypeComponent", "HealthComponent"]) do
            Safety(limit = 10); 
            
            # 🪐 КВАНТОВЫЙ МАТРИЧНЫЙ КАНOН v42.0: Декларативный корневой слот
            Guard_if(condition = "archetype.type !== 'PLAYER' || health.current > 0", slot = "03805_00001");
            
            # =========================================================================
            # 🛰️ МАТРИЦА НАПОЛНЕНИЯ (Изолированные капсулы контента)
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Mutate(component = "HealthComponent", values = Dict("current" => "0", "max" => "health.max", "isInvulnerable" => "true"));
            
            print("[Aura Core] Player defeat detected. Restarting game loop session...", entityId);
            #END_CONTENT_03805_00001#
            
        end
    end
)

# 🔥 АБСОЛЮТНЫЙ КАНOН v42.0: Токен стоит ЗА пределами структуры AuraShell!
# Он служит чистым стоп-краном и больше БЕЗДУМНО НЕ ПЛОДИТ призрачных скобок!
# AURA_END
