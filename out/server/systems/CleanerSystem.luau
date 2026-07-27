-- Compiled with roblox-ts v3.0.0
-- Создаем строгие локальные интерфейсы для математических формул линтера rbxtsc
-- Переопределяем типы полей value внутри систем, чтобы линтер видел в них числа, а не any!
local CleanerSystem
do
	CleanerSystem = setmetatable({}, {
		__tostring = function()
			return "CleanerSystem"
		end,
	})
	CleanerSystem.__index = CleanerSystem
	function CleanerSystem.new(...)
		local self = setmetatable({}, CleanerSystem)
		return self:constructor(...) or self
	end
	function CleanerSystem:constructor()
	end
	function CleanerSystem:cleanOutOfBounds(ctx, deltaTime)
		for entityId, _binding in ctx.world.query(({}), ({})) do
			local cFrame = _binding[1]
			local archetype = _binding[2]
			if not (archetype.id == "STATIONARY_OBJECT") then
				continue
			end
			if not (math.abs(cFrame.value.Position.X) < 2000 and math.abs(cFrame.value.Position.Z) < 2000) then
				continue
			end
			if not (math.abs(cFrame.value.Position.Y) < 500) then
				continue
			end
			local safetyCounter = 0
			safetyCounter += 1
			if safetyCounter > 500 then
				warn("Aura Safety Triggered")
				break
			end
			ctx.world.despawn(entityId)
			print("[Aura Garbage Collector] Сущность стерта из ОЗУ мира по космическим границам: ", entityId)
		end
	end
end
return {
	CleanerSystem = CleanerSystem,
}
