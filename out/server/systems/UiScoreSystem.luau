-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Изолировано в общем контуре
local GALAXY_PLAYER = TS.import(script, game:GetService("ReplicatedStorage"), "TS", "constants").GALAXY_PLAYER
local UiScoreSystem
do
	UiScoreSystem = setmetatable({}, {
		__tostring = function()
			return "UiScoreSystem"
		end,
	})
	UiScoreSystem.__index = UiScoreSystem
	function UiScoreSystem.new(...)
		local self = setmetatable({}, UiScoreSystem)
		return self:constructor(...) or self
	end
	function UiScoreSystem:constructor()
	end
	function UiScoreSystem:updateDisplay(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local archetype = _binding[1]
			local weaponState = _binding[2]
			if not (archetype.id == GALAXY_PLAYER) then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 10 then
				warn("Aura Safety Triggered")
				break
			end
			local currentScore = weaponState.ammo
			if currentScore >= 0 then
				print("[Aura UI] Интерфейс обновлен. Текущий счет галактической сессии: ", currentScore)
			end
		end
	end
end
return {
	UiScoreSystem = UiScoreSystem,
}
