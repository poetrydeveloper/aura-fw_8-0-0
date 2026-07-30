-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Изолировано в общем контуре
local _constants = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "constants")
local ENEMY_INTERCEPTOR = _constants.ENEMY_INTERCEPTOR
local PLASMA_BOLT = _constants.PLASMA_BOLT
local DebrisSystem
do
	DebrisSystem = setmetatable({}, {
		__tostring = function()
			return "DebrisSystem"
		end,
	})
	DebrisSystem.__index = DebrisSystem
	function DebrisSystem.new(...)
		local self = setmetatable({}, DebrisSystem)
		return self:constructor(...) or self
	end
	function DebrisSystem:constructor()
	end
	function DebrisSystem:cleanGarbage(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local archetype = _binding[1]
			local cFrame = _binding[2]
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 1000 then
				warn("Aura Safety Triggered")
				break
			end
			local currentPos = cFrame.value.Position
			local archId = archetype.id
			if (archId == PLASMA_BOLT) then
				if (math.abs(currentPos.X) > 2000) then
					ctx.world.despawn(entityId)
					print("[Aura Garbage] Снаряд выжжен из ОЗУ сервера по лимиту дистанции.")
				end
			end
			if (archId == ENEMY_INTERCEPTOR) then
				if (math.abs(currentPos.X) > 3000) then
					ctx.world.despawn(entityId)
					print("[Aura Garbage] Потерянный перехватчик удален из памяти для оптимизации.")
				end
			end
		end
	end
end
return {
	DebrisSystem = DebrisSystem,
}
