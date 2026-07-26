declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class MovementSystem {
    constructor() { }

    public updateMovement(ctx: any, deltaTime: number): void {
        for (const [entityId, [velocity, Velocity, cframe, cFrame, cFrame, CFrame, cframe, cFrame]] of ctx.world.query(({} as any), ({} as any))) {
            if (deltaTime <= 0) { continue; }
            let safetyCounter = 0; if (++safetyCounter > 5000) { warn("Aura Safety Triggered"); break; }
            const deltaPos = velocity.value.mul(deltaTime);
            ctx.world.insert(entityId, ({ value: "cFrame.value.add(deltaPos)" }));
        }

    }

}
