declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class CleanerSystem {
    constructor() { }

    public cleanOutOfBounds(ctx: any, deltaTime: number): void {
        for (const [entityId, [cFrame, archetype]] of ctx.world.query(({} as any), ({} as any))) {
            if (!(archetype.id == 'STATIONARY_OBJECT')) { continue; }
            if (!(math.abs(cFrame.value.Position.X) < 2000 && math.abs(cFrame.value.Position.Z) < 2000)) { continue; }
            if (!(math.abs(cFrame.value.Position.Y) < 500)) { continue; }
            let safetyCounter = 0; if (++safetyCounter > 500) { warn("Aura Safety Triggered"); break; }

            ctx.world.despawn(entityId)
            print("[Aura Garbage Collector] Сущность стерта из ОЗУ мира по космическим границам: ", entityId)
        }
    }

}
