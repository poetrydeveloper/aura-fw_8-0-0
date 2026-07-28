-- Compiled with roblox-ts v3.0.0
-- Изолировано в общем контуре
local WeaponTimerSystem
do
	WeaponTimerSystem = setmetatable({}, {
		__tostring = function()
			return "WeaponTimerSystem"
		end,
	})
	WeaponTimerSystem.__index = WeaponTimerSystem
	function WeaponTimerSystem.new(...)
		local self = setmetatable({}, WeaponTimerSystem)
		return self:constructor(...) or self
	end
	function WeaponTimerSystem:constructor()
	end
	function WeaponTimerSystem:updateWeaponCooldowns(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local weaponState = _binding[1]
			local archetype = _binding[2]
			if not (weaponState.isCharging == true) then
				continue
			end
			if not (weaponState.nextTimer <= 0) then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 2000 then
				warn("Aura Safety Triggered")
				break
			end
			local timeDecrement = deltaTime
			local nextTimer = math.max(0, weaponState.nextTimer - timeDecrement)
			if not (nextTimer == 0) then
				continue
			end
			ctx.world.insert(entityId, ({
				nextTimer = 0,
				isCharging = false,
			}))
			print("[Aura Weapon Grid] Перезарядка орудий завершена для сущности: ", entityId)
		end
	end
end
return {
	WeaponTimerSystem = WeaponTimerSystem,
}
