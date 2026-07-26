declare const game: any; declare const Enum: any; declare const math: any;
declare const Vector3: any; declare const CFrame: any;
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

export class CollisionSystem {
    constructor() { }

    public checkCollisions(ctx: any, deltaTime: number): void {
        for (const [entityId, [archetype, Archetype, cframe, cFrame, cFrame, CFrame, cframe, cFrame, damage, Damage, cframe, cFrame]] of ctx.world.query(({} as any), ({} as any), ({} as any))) {
            let safetyCounter = 0; if (++safetyCounter > 1000) { warn("Aura Safety Triggered"); break; }
            if (archetype.id !== 'PLASMA_BOLT') { continue; }
            for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query({} as any, {} as any)) {
                if (targetArchetype.id !== "ENEMY_INTERCEPTOR") continue;
                if (cFrame.value.Position.sub(targetCFrame.value.Position).Magnitude < 4) { continue; }
                ctx.world.insert(targetEntityId, ({ value: "damage.value" }));
            }
        }
    }

}

}
