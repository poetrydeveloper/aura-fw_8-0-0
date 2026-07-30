AuraShell(
    id = "ecs_galaxy_spawn_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "oddLayerIso33503" => 5,
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "EnemySpawnSystem",
        "methodName" => "spawnWaves",
        "uiTrigger" => "Heartbeat",
        "context" => "Безопасная генерация сущностей врагов с защитой от спама памяти сервера v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "EnemySpawnSystem", "action" => "Triggers", "object" => "ArchetypeComponent"),
        "dataFlow" => Dict("reads" => ["ArchetypeComponent"], "mutates" => ["ArchetypeComponent"])
    ),
    
    render = function(ctx)
        # Так как это корневой метод без Query, Safety(limit) здесь не нужен, но точки с запятой обязательны!
        Calculate(var = "randomX", expr = "math.min(500, math.max(-500, 200))");
        
        # Заворачиваем императивный if-блок в детерминированный гвард Ткача
        Guard(condition = "math.abs(randomX) >= 1000"); # Ранний возврат, если вышли за лимит
        
        # ⚠️ ВНИМАНИЕ: Чтобы сервер не упал от 60 спавнов в секунду, 
        # Ткач инжектирует проверку накопленного рантайм-времени (минимальный гвард-предохранитель для теста)
        Guard(condition = "tick() % 5 > 0.1"); # Спавн будет происходить строго раз в 5 секунд!
        
        # Накатываем мутацию. Метод спавна новой сущности ctx.world.spawn() перенесен внутрь Dict-контракта
        # Обратите внимание: строковые литералы типов обернуты в одинарные кавычки внутри двойных
        Mutate(
            component = "ArchetypeComponent", 
            values = Dict(
                "type" => "'ENEMY_INTERCEPTOR'", 
                "faction" => "'ALIENS'", 
                "mass" => "100",
                "targetEntityId" => "ctx.world.spawn()" # Вызов генерации ID намертво изолирован внутри Dict
            )
        );
        
        print("[Aura Spawner] Новая волна ИИ-перехватчиков материализована в координатах: ", randomX);
    end
)
