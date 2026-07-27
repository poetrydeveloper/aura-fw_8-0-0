export interface ArchetypeComponent {
    id: string;
    faction: string;
    mass: number;
}

export interface VelocityComponent {
    value: Vector3;
    angular: Vector3;
}

export interface CFrameComponent {
    value: CFrame;
    lastUpdated: number;
}

export interface WeaponStateComponent {
    isCharging: boolean;
    nextTimer: number;
    ammoCapacity: number;
}

export interface HealthComponent {
    current: number;
    max: number;
    isInvulnerable: boolean;
}

export interface ExplosionTriggerComponent {
    radius: number;
    force: number;
    active: boolean;
}

