-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Изолировано в общем контуре
local GALAXY_PLAYER = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "constants").GALAXY_PLAYER
local GameOverSystem
do
	GameOverSystem = setmetatable({}, {
		__tostring = function()
			return "GameOverSystem"
		end,
	})
	GameOverSystem.__index = GameOverSystem
	function GameOverSystem.new(...)
		local self = setmetatable({}, GameOverSystem)
		return self:constructor(...) or self
	end
	function GameOverSystem:constructor()
	end
	function GameOverSystem:checkDefeat(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local archetype = _binding[1]
			local health = _binding[2]
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 10 then
				warn("Aura Safety Triggered")
				break
			end
			local playerHp = health.current
			local archId = archetype.id
			if archId == GALAXY_PLAYER then
				if playerHp == 0 then
					print("[Aura Core] Крах игрока зафиксирован! Запуск контура телепортации и перезапуска плейса...")
				end
			end
		end
	end
end
return {
	GameOverSystem = GameOverSystem,
}
