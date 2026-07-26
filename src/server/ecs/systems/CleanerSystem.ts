declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class CleanerSystem {
    constructor() { }

    public cleanupMemory(ctx: any, deltaTime: number): void {
        for (const [entityId, [archetype, Archetype, cframe, cFrame, cFrame, CFrame, cframe, cFrame]] of ctx.world.query(({} as any), ({} as any))) {
            let safetyCounter = 0; if (++safetyCounter > 5000) { warn("Aura Safety Triggered"); break; }
            if (archetype.id === 'PLASMA_BOLT' && math.abs(cFrame.value.Z) > 150) { continue; }
        }

    }

}
