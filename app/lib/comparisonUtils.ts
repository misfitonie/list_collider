import { Unit, ArmyList } from '../types/types';

// Group units by their name
export function groupUnitsByName(armyList: ArmyList): Record<string, Unit[]> {
    return armyList.units.reduce((groups, unit) => {
        // Normalize the unit name to handle slight variations (like "(x3)" or "(x10)")
        const normalizedName = unit.name.replace(/\s*\(\w+\)\s*$/, '');

        if (!groups[normalizedName]) {
            groups[normalizedName] = [];
        }

        groups[normalizedName].push(unit);
        return groups;
    }, {} as Record<string, Unit[]>);
}

// Count the number of units by type
export function countUnitsByType(armyList: ArmyList): Record<string, number> {
    const counters: Record<string, number> = {};

    for (const unit of armyList.units) {
        // Extract unit type (usually the name without any quantity indicators)
        const unitType = unit.name.replace(/\s*\(\w+\)\s*$/, '');

        if (!counters[unitType]) {
            counters[unitType] = 0;
        }

        counters[unitType] += 1;
    }

    return counters;
}

// Find similar units between two army lists
export function findSimilarUnits(armyList1: ArmyList, armyList2: ArmyList): Record<string, Unit[][]> {
    const groups1 = groupUnitsByName(armyList1);
    const groups2 = groupUnitsByName(armyList2);

    const similarUnits: Record<string, Unit[][]> = {};

    // Find unit types that appear in both armies
    for (const unitType in groups1) {
        if (groups2[unitType]) {
            similarUnits[unitType] = [groups1[unitType], groups2[unitType]];
        }
    }

    return similarUnits;
}

// Get all unique unit types across both armies
export function getAllUnitTypes(armyList1: ArmyList, armyList2: ArmyList): string[] {
    const types = new Set<string>();

    for (const unit of [...armyList1.units, ...armyList2.units]) {
        const unitType = unit.name.replace(/\s*\(\w+\)\s*$/, '');
        types.add(unitType);
    }

    return Array.from(types).sort();
}

// Get a breakdown of points by unit type
export function getPointsBreakdown(armyList: ArmyList): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const unit of armyList.units) {
        const unitType = unit.name.replace(/\s*\(\w+\)\s*$/, '');

        if (!breakdown[unitType]) {
            breakdown[unitType] = 0;
        }

        breakdown[unitType] += unit.cost;
    }

    return breakdown;
}

// Find units by a search term
export function searchUnits(armyList: ArmyList, searchTerm: string): Unit[] {
    if (!searchTerm) return [];

    const term = searchTerm.toLowerCase();

    return armyList.units.filter(unit => {
        // Check name
        if (unit.name.toLowerCase().includes(term)) return true;

        // Check abilities
        if (unit.abilities.some(ability =>
            ability.name.toLowerCase().includes(term) ||
            ability.description.toLowerCase().includes(term)
        )) return true;

        // Check rules
        if (unit.rules.some(rule => rule.toLowerCase().includes(term))) return true;

        // Check weapons
        if (unit.rangedWeapons.some(weapon => weapon.name.toLowerCase().includes(term))) return true;
        if (unit.meleeWeapons.some(weapon => weapon.name.toLowerCase().includes(term))) return true;

        return false;
    });
}