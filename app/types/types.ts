export interface Stat {
    name: string;
    value: string;
}

export interface Profile {
    name: string;
    stats: Stat[];
}

export interface Weapon {
    name: string;
    stats: Stat[];
}

export interface Ability {
    name: string;
    description: string;
}

export interface Unit {
    id: string;
    name: string;
    cost: number;
    unitProfiles: Profile[];
    rangedWeapons: Weapon[];
    meleeWeapons: Weapon[];
    abilities: Ability[];
    rules: string[];
}

export interface ArmyList {
    id: string;
    name: string;
    units: Unit[];
    totalPoints: number;
}