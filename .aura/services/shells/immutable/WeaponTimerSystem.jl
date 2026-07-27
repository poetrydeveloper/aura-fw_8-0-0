# .aura/services/shells/immutable/WeaponTimerSystem.jl
AuraShell(
    id = "ecs_galaxy_weapon_timer_v1",
    status = "active",
    version = 1,
    vocabularyContract = "Aura_Galaxy_Vocabulary_v7.0",
    
    meta = Dict(
        "executionSide" => "Server",
        "flameworkPattern" => "MatterSystem",
        "className" => "WeaponTimerSystem",
        "methodName" => "updateWeaponCooldowns",
        "context" => "Серверный апдейт кулдаунов и перезарядки турелей"
    ),
    
    perspectives = Dict(
        "semanticSvo" => Dict("subject" => "WeaponTimerSystem", "action" => "Updates", "object" => "WeaponStateComponent"),
        "dataFlow" => Dict("reads" => ["WeaponStateComponent", "ArchetypeComponent"], "mutates" => ["WeaponStateComponent"])
    ),
    
    render = function(ctx)
        Query(components = ["WeaponStateComponent", "ArchetypeComponent"]) do
            Guard(condition = "weaponState.isCharging == true")
            Guard(condition = "weaponState.nextTimer <= 0")
            Safety(limit = 2000)
            
            Calculate(var = "timeDecrement", expr = "deltaTime")
            Calculate(var = "nextTimer", expr = "math.max(0, weaponState.nextTimer - timeDecrement)")
            
            Guard(condition = "nextTimer == 0")
            Mutate(component = "WeaponStateComponent", values = Dict("nextTimer" => "0", "isCharging" => "false"))
            
            print("[Aura Weapon Grid] Перезарядка орудий завершена для сущности: ", entityId)
        end
    end
)
