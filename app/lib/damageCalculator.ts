import { Unit, Weapon, Stat } from '../types/types';

interface AttackResult {
    weaponName: string;
    attacks: number;
    hits: number;
    wounds: number;
    unsavedWounds: number;
    damage: number;
    lethalHits: boolean;
    devastatingWounds: boolean;
}

interface DamageCalculation {
    attackingUnit: Unit;
    defendingUnit: Unit;
    meleeResults: AttackResult[];
    rangedResults: AttackResult[];
    totalDamage: number;
    averageWoundsPerRound: number;
    turnsToKill: number;
}

// Get value from stat or return default
const getStatValue = (stats: Stat[], name: string, defaultValue: string = '0'): string => {
    const stat = stats.find(s => s.name === name);
    return stat ? stat.value : defaultValue;
};

// Convert mixed dice notation to average value (e.g. "D6+3" => 6.5)
const parseAttacks = (attacksStr: string): number => {
    if (!attacksStr) return 0;

    // Handle static numbers
    if (!isNaN(Number(attacksStr))) {
        return Number(attacksStr);
    }

    // Handle dice notation like "D6", "D3", "2D6", etc.
    let total = 0;

    // D6
    if (attacksStr.includes('D6')) {
        const diceCount = attacksStr.split('D6')[0] || '1';
        const count = diceCount === '' ? 1 : parseInt(diceCount);
        total += count * 3.5; // Average of D6 is 3.5
    }

    // D3
    if (attacksStr.includes('D3')) {
        const diceCount = attacksStr.split('D3')[0] || '1';
        const count = diceCount === '' ? 1 : parseInt(diceCount);
        total += count * 2; // Average of D3 is 2
    }

    // Add static modifier
    const plusMatch = attacksStr.match(/\+(\d+)/);
    if (plusMatch) {
        total += parseInt(plusMatch[1]);
    }

    // Subtract static modifier
    const minusMatch = attacksStr.match(/\-(\d+)/);
    if (minusMatch) {
        total -= parseInt(minusMatch[1]);
    }

    return total;
};

// Calculate hit probability based on BS/WS
const calculateHitProbability = (hitSkill: string): number => {
    // Handle values like "2+" or "3+"
    const match = hitSkill.match(/(\d)\+/);
    if (match) {
        const requiredRoll = parseInt(match[1]);
        return (7 - requiredRoll) / 6; // Probability of rolling requiredRoll or higher on a D6
    }

    return 0; // Default if format is not recognized
};

// Calculate wound probability based on strength vs toughness
const calculateWoundProbability = (strength: number, toughness: number): number => {
    if (strength >= toughness * 2) return 5/6; // Wounds on 2+
    if (strength > toughness) return 4/6;      // Wounds on 3+
    if (strength === toughness) return 3/6;    // Wounds on 4+
    if (strength * 2 <= toughness) return 1/6; // Wounds on 6+
    return 2/6;                               // Wounds on 5+
};

// Calculate armor save probability
const calculateSaveProbability = (armorSave: string, ap: string): number => {
    // Parse armor save value (e.g. "3+")
    const saveMatch = armorSave.match(/(\d)\+/);
    if (!saveMatch) return 0;

    let saveValue = parseInt(saveMatch[1]);

    // Apply AP
    const apValue = parseInt(ap.replace('-', '')) || 0;
    saveValue += apValue;

    // Capped at 6+
    if (saveValue > 6) return 0;

    return (7 - saveValue) / 6; // Probability of making the save
};

// Calculate invulnerable save probability
const calculateInvulnSaveProbability = (invulnSave: string): number => {
    // Parse invuln save value (e.g. "4++")
    const saveMatch = invulnSave.match(/(\d)\+/);
    if (!saveMatch) return 0;

    const saveValue = parseInt(saveMatch[1]);
    return (7 - saveValue) / 6; // Probability of making the save
};

// Calculate damage for a weapon against a unit
const calculateWeaponDamage = (
    weapon: Weapon,
    attackingUnit: Unit,
    defendingUnit: Unit
): AttackResult => {
    // Get weapon stats
    const attacksStat = getStatValue(weapon.stats, 'A');
    const strengthStat = getStatValue(weapon.stats, 'S');
    const apStat = getStatValue(weapon.stats, 'AP');
    const damageStat = getStatValue(weapon.stats, 'D');
    const hitSkillStat = weapon.stats.find(s => s.name === 'BS')
        ? getStatValue(weapon.stats, 'BS')
        : getStatValue(weapon.stats, 'WS');
    const keywordsStat = getStatValue(weapon.stats, 'Keywords', '-');

    // Get target unit stats
    const toughnessStat = getStatValue(defendingUnit.unitProfiles[0].stats, 'T');
    const armorSaveStat = getStatValue(defendingUnit.unitProfiles[0].stats, 'SV');
    //const woundsStat = getStatValue(defendingUnit.unitProfiles[0].stats, 'W');

    // Look for invulnerable save ability
    let invulnSaveStat = '';
    for (const ability of defendingUnit.abilities) {
        if (ability.name.includes('Invulnerable Save')) {
            const matches = ability.description.match(/(\d)\+/);
            if (matches) {
                invulnSaveStat = matches[1] + '+';
                break;
            }
        }
    }

    // Parse values
    const attacks = parseAttacks(attacksStat);
    const strength = parseInt(strengthStat) || 0;
    const ap = apStat;
    const damage = parseAttacks(damageStat);
    const toughness = parseInt(toughnessStat) || 0;

    // Special rules
    const hasLethalHits = keywordsStat.includes('Lethal Hits');
    const hasDevastatingWounds = keywordsStat.includes('Devastating Wounds');
    const torrentWeapon = keywordsStat.includes('Torrent');

    // Calculate probabilities
    const hitProb = torrentWeapon ? 1 : calculateHitProbability(hitSkillStat);
    const woundProb = calculateWoundProbability(strength, toughness);
    const armorSaveProb = calculateSaveProbability(armorSaveStat, ap);
    const invulnSaveProb = invulnSaveStat ? calculateInvulnSaveProbability(invulnSaveStat) : 0;

    // Use the best save (the one with highest probability)
    const effectiveSaveProb = Math.max(armorSaveProb, invulnSaveProb);

    // Apply Lethal Hits (6s to hit auto-wound)
    // This is a simplification - in real 40k, you'd roll for each attack
    const lethalHitsProb = hasLethalHits ? 1/6 : 0;
    const autoWounds = attacks * hitProb * lethalHitsProb;

    // Regular hits that need to wound
    const hits = attacks * hitProb;
    const normalWounds = (hits - autoWounds) * woundProb + autoWounds;

    // Devastating Wounds (6s to wound cause mortal wounds)
    // This is a simplification
    const devastatingWoundsProb = hasDevastatingWounds ? 1/6 : 0;
    const mortalWounds = hits * woundProb * devastatingWoundsProb * damage;

    // Normal damage from regular wounds
    const unsavedWounds = normalWounds * (1 - effectiveSaveProb);
    const normalDamage = unsavedWounds * damage;

    // Total damage
    const totalDamage = normalDamage + mortalWounds;

    return {
        weaponName: weapon.name,
        attacks,
        hits,
        wounds: normalWounds,
        unsavedWounds,
        damage: totalDamage,
        lethalHits: hasLethalHits,
        devastatingWounds: hasDevastatingWounds
    };
};

// Calculate total damage one unit would do to another
export const calculateDamage = (
    attackingUnit: Unit,
    defendingUnit: Unit
): DamageCalculation => {
    // Calculate damage for all melee weapons
    const meleeResults = attackingUnit.meleeWeapons.map(weapon =>
        calculateWeaponDamage(weapon, attackingUnit, defendingUnit)
    );

    // Calculate damage for all ranged weapons
    const rangedResults = attackingUnit.rangedWeapons.map(weapon =>
        calculateWeaponDamage(weapon, attackingUnit, defendingUnit)
    );

    // Sum up total damage
    const totalMeleeDamage = meleeResults.reduce((sum, result) => sum + result.damage, 0);
    const totalRangedDamage = rangedResults.reduce((sum, result) => sum + result.damage, 0);
    const totalDamage = totalMeleeDamage + totalRangedDamage;

    // Target wounds
    const targetWounds = parseInt(getStatValue(defendingUnit.unitProfiles[0].stats, 'W')) || 1;

    // Average wounds per round (melee + ranged in a single round)
    const averageWoundsPerRound = totalDamage;

    // Turns to kill (rounded up)
    const turnsToKill = Math.ceil(targetWounds / averageWoundsPerRound) || Infinity;

    return {
        attackingUnit,
        defendingUnit,
        meleeResults,
        rangedResults,
        totalDamage,
        averageWoundsPerRound,
        turnsToKill
    };
};