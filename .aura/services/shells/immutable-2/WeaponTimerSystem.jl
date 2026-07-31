AuraShell(
    id = "ecs_galaxy_weapon_timer_v38_5",
    status = "active",
    version = 2,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "WeaponTimerSystem",
        "methodName" => "updateWeaponCooldowns",
        "context" => "Serverny update cooldownov i perezaryadki tureley"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "WeaponTimerSystem", "action" => "Updates", "object" => "WeaponStateComponent"),
        "dataFlow" => Dict("reads" => ["WeaponStateComponent", "ArchetypeComponent"], "mutates" => ["WeaponStateComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["WeaponStateComponent", "ArchetypeComponent"]) do
            Safety(limit = 2000); 
            
            # 🪐 КВАНТОВЫЙ МАТРИЧНЫЙ КАНOН v42.0: Корневой декларативный слот
            Guard_if(condition = "weaponState.isCharging === false", slot = "03805_00001");
            
            # =========================================================================
            # 🛰️ МАТРИЦА НАПОЛНЕНИЯ (Изолированные капсулы контента)
            # =========================================================================
            
            #START_CONTENT_03805_00001#
            Guard_if(condition = "weaponState.nextTimer <= 0", slot = "03805_00002");
            
            #START_CONTENT_03805_00002#
            Calculate(var = "timeDecrement", expr = "deltaTime");
            Calculate(var = "nextCooldown", expr = "math.max(0, weaponState.nextTimer - timeDecrement)");
            
            Mutate(component = "WeaponStateComponent", values = Dict("nextTimer" => "nextCooldown", "isCharging" => "nextCooldown > 0 ? true : false", "ammoCapacity" => "weaponState.ammoCapacity"));
            
            Guard_if(condition = "nextCooldown > 0", slot = "03805_00003");
            
            #START_CONTENT_03805_00003#
            print("[Aura Weapon Grid] Weapon reload complete for entity: ", entityId);
            #END_CONTENT_03805_00003#
            
            #END_CONTENT_03805_00002#
            #END_CONTENT_03805_00001#
        end
    end
)

# 🔥 АБСОЛЮТНЫЙ КАНOН v42.0: Токен стоит ЗА пределами структуры AuraShell!
# Он служит чистым стоп-краном и больше БЕЗДУМНО НЕ ПЛОДИТ призрачных скобок!
# AURA_END
