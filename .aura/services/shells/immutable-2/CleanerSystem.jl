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
        "context" => "Инженерный Luau-деспавн улетевших или уничтоженных сущностей Галактики по стандарту v38.5"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "CleanerSystem", "action" => "Removes", "object" => "Entity"),
        "dataFlow" => Dict("reads" => ["CFrameComponent", "ArchetypeComponent"], "mutates" => [])
    ),
    
    render = function(ctx)
        Query(components = ["CFrameComponent", "ArchetypeComponent"]) do
            Safety(limit = 500); # Канон: Теперь строго первой строкой и с точкой с запятой
            
            Guard(condition = "archetype.type === 'STATIONARY_OBJECT'"); # Исправлено под .type и строгий camelCase
            Guard(condition = "math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000"); # Добавлены знаки ;
            Guard(condition = "math.abs(cFrame.value.Position.Y) < 500");
            
            # Нативный инжект Luau-кода деспавна текущей сущности
            ctx.world.despawn(entityId);
            print("[Aura Garbage Collector] Сущность стерта из ОЗУ мира по космическим границам: ", entityId);
        end
    end
)
