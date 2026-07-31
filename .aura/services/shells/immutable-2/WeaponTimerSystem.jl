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
            
            # 🔥 БЛOЧНЫЙ КАНOН: Каскад гвардов раскрывается через вложенные do-блоки
            Guard(condition = "weaponState.isCharging === false") do
                Guard(condition = "weaponState.nextTimer <= 0") do
                    
                    Calculate(var = "timeDecrement", expr = "deltaTime");
                    Calculate(var = "nextCooldown", expr = "math.max(0, weaponState.nextTimer - timeDecrement)");
                    
                    Mutate(component = "WeaponStateComponent", values = Dict("nextTimer" => "nextCooldown", "isCharging" => "nextCooldown > 0 ? true : false", "ammoCapacity" => "weaponState.ammoCapacity"));
                    
                    Guard(condition = "nextCooldown > 0") do
                        
                        print("[Aura Weapon Grid] Weapon reload complete for entity: ", entityId);
                        
                    end
                end
            end
        end
    end
)
