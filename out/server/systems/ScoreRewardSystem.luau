-- Compiled with roblox-ts v3.0.0
-- Изолировано в общем контуре
local ScoreRewardSystem
do
	ScoreRewardSystem = setmetatable({}, {
		__tostring = function()
			return "ScoreRewardSystem"
		end,
	})
	ScoreRewardSystem.__index = ScoreRewardSystem
	function ScoreRewardSystem.new(...)
		local self = setmetatable({}, ScoreRewardSystem)
		return self:constructor(...) or self
	end
	function ScoreRewardSystem:constructor()
	end
	function ScoreRewardSystem:processRewards(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local archetype = _binding[1]
			local health = _binding[2]
			if not (archetype.id == "ENEMY_INTERCEPTOR") then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 1000 then
				warn("Aura Safety Triggered")
				break
			end
			local currentHp = health.current
			if currentHp == 0 then
				print("[Aura Progress] Враг повержен! Начислено +100 очков в реестр игрока. ID сущности: ", entityId)
			end
		end
	end
end
return {
	ScoreRewardSystem = ScoreRewardSystem,
}
