declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class MovementSystem {
    constructor() { }

    public updateMovement(ctx: any, deltaTime: number): void {
        for (const [entityId, [velocity, Velocity, cFrame, CFrame, archetype, Archetype]] of ctx.world.query(({} as any), ({} as any), ({} as any))) {
            if (deltaTime <= 0) { continue; }
            if (archetype.id === 'STATIC_METEOR') { continue; }
            let safetyCounter = 0; if (++safetyCounter > 5000) { warn("Aura Safety Triggered"); break; }
            const currentVelocity = velocity.value;
            const deltaPos = currentVelocity.mul(deltaTime);
            const nextCFrame = cFrame.value.add(deltaPos);
            ctx.world.insert(entityId, ({ value: "nextCFrame" }));

        }

    }
