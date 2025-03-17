import React, { useState } from 'react';
import { Unit } from '../types/types';
import { calculateDamage } from '../lib/damageCalculator';

interface DamagePanelProps {
    attackingUnit: Unit | null;
    defendingUnit: Unit | null;
    onClose: () => void;
}

// Helper function to determine wounding threshold based on S and T
const getWoundThreshold = (strength: number, toughness: number): string => {
    if (strength >= toughness * 2) return "2+";
    if (strength > toughness) return "3+";
    if (strength === toughness) return "4+";
    if (strength * 2 <= toughness) return "6+";
    return "5+";
};

// Helper function to extract weapon count from weapon name
const extractWeaponCount = (weaponName: string): { cleanName: string, count: number } => {
    const countMatch = weaponName.match(/\(x(\d+)\)$/);
    if (countMatch) {
        const count = parseInt(countMatch[1]);
        const cleanName = weaponName.replace(/\s*\(x\d+\)$/, '');
        return { cleanName, count };
    }
    return { cleanName: weaponName, count: 1 };
};

// Helper function to calculate the save fail rate
const calculateSaveFailRate = (saveValue: number): number => {
    if (saveValue >= 7) return 1.0; // No save, so 100% fail rate
    const failOutcomes = saveValue - 1;
    return failOutcomes / 6;
};

const DamagePanel: React.FC<DamagePanelProps> = ({
                                                     attackingUnit,
                                                     defendingUnit,
                                                     onClose
                                                 }) => {
    const [activeTab, setActiveTab] = useState<'tables' | 'charts'>('tables');

    if (!attackingUnit || !defendingUnit) {
        return null;
    }

    const damageResult = calculateDamage(attackingUnit, defendingUnit);
    const { meleeResults, rangedResults } = damageResult;

    // Get the defending unit's toughness
    const toughness = defendingUnit.unitProfiles[0]?.stats.find(s => s.name === 'T')?.value;
    const defenderToughness = toughness ? parseInt(toughness) : 0;

    // Get the defending unit's save
    const armorSave = defendingUnit.unitProfiles[0]?.stats.find(s => s.name === 'SV')?.value;

    // Look for invulnerable save ability
    let invulnSave = '';
    for (const ability of defendingUnit.abilities) {
        if (ability.name.includes('Invulnerable Save')) {
            const matches = ability.description.match(/(\d)\+/);
            if (matches) {
                invulnSave = matches[1] + '+';
                break;
            }
        }
    }

    return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Damage Analysis</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4">
                <div>
                    <span className="text-sm font-semibold text-gray-500">Attacking:</span>
                    <span className="ml-2 font-medium">{attackingUnit.name}</span>
                </div>

                <div>
                    <span className="text-sm font-semibold text-gray-500">Defending:</span>
                    <span className="ml-2 font-medium">{defendingUnit.name}</span>
                </div>

                <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-500">Target Save:</span>
                    <span className="ml-2 font-medium">
                        {armorSave} armor
                        {invulnSave && <span className="ml-1">/ {invulnSave.replace('+', '++')} invuln</span>}
                    </span>
                </div>
            </div>

            {/* Tables View */}
            {activeTab === 'tables' && (
                <>
                    {/* Melee Weapons Table */}
                    {meleeResults.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-2 bg-gray-100 p-1">Melee Weapons</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left font-medium text-gray-500">Weapon</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Attacks</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Hits</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Wounds</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Save</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Damage</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {meleeResults.map((result, index) => {
                                        // Extract weapon details and count
                                        const { cleanName, count } = extractWeaponCount(result.weaponName);

                                        // Extract weapon stats
                                        const weapon = attackingUnit.meleeWeapons.find(w =>
                                            w.name === result.weaponName || w.name === cleanName);
                                        const hitSkillStat = weapon?.stats.find(s => s.name === 'WS')?.value || '';
                                        const strengthStat = weapon?.stats.find(s => s.name === 'S')?.value || '';
                                        const apStat = weapon?.stats.find(s => s.name === 'AP')?.value || '';
                                        const damageStat = weapon?.stats.find(s => s.name === 'D')?.value || '';
                                        const keywordsStat = weapon?.stats.find(s => s.name === 'Keywords')?.value || '';

                                        // Determine hit threshold
                                        const hitThreshold = keywordsStat.includes('Torrent') ? 'Auto' : hitSkillStat;

                                        // Determine wound threshold
                                        const strength = parseInt(strengthStat) || 0;
                                        const woundThreshold = getWoundThreshold(strength, defenderToughness);

                                        // Calculate modified save
                                        const apValue = parseInt(apStat.replace('-', '')) || 0;
                                        let effectiveSave = '';
                                        let effectiveSaveValue = 7; // Default to no save (7+)

                                        if (armorSave && invulnSave) {
                                            // Parse save values
                                            const armorValue = parseInt(armorSave.replace('+', ''));
                                            const invulnValue = parseInt(invulnSave.replace('+', ''));

                                            // Modified armor save (AP makes save worse by increasing the number)
                                            const modifiedArmorValue = Math.min(6, armorValue + apValue);

                                            // Use the better of the two saves (lower number is better)
                                            if (invulnValue < modifiedArmorValue) {
                                                // Invuln is better
                                                effectiveSave = `${invulnValue}++`;
                                                effectiveSaveValue = invulnValue;
                                            } else {
                                                // Modified armor is better or equal
                                                effectiveSave = `${modifiedArmorValue}+`;
                                                effectiveSaveValue = modifiedArmorValue;
                                            }
                                        } else if (armorSave) {
                                            // Just modify armor save
                                            const armorValue = parseInt(armorSave.replace('+', ''));
                                            const modifiedArmorValue = Math.min(6, armorValue + apValue);
                                            effectiveSave = `${modifiedArmorValue}+`;
                                            effectiveSaveValue = modifiedArmorValue;
                                        }

                                        // Calculate save fail rate (correctly)
                                        const failSaveRate = calculateSaveFailRate(effectiveSaveValue);

                                        // Adjust attack count based on number of weapons
                                        const adjustedAttacks = result.attacks * count;
                                        const adjustedHits = result.hits * count;
                                        const adjustedWounds = result.wounds * count;

                                        // Calculate unsaved wounds based on correct fail rate
                                        const unsavedWounds = adjustedWounds * failSaveRate;

                                        // Calculate final damage
                                        const damageValue = parseInt(damageStat) || 1;
                                        const finalDamage = unsavedWounds * damageValue;

                                        return (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-2 py-1 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {cleanName}
                                                        {count > 1 && <span className="text-gray-600"> (×{count})</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        S:{strengthStat} AP:{apStat} D:{damageStat}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {result.lethalHits && 'Lethal Hits'} {result.devastatingWounds && 'Devastating Wounds'}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div>{adjustedAttacks.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {count > 1 ? `${result.attacks.toFixed(1)} × ${count} weapons` : 'per attack sequence'}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div>{adjustedHits.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Hit on {hitThreshold === 'Auto' ? 'Auto' : hitThreshold}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div>{adjustedWounds.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Wound on {woundThreshold}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div className="text-sm font-medium">{effectiveSaveValue === 7 ? "None" : effectiveSave}</div>
                                                    <div className="text-xs italic text-gray-500">
                                                        {unsavedWounds.toFixed(1)} unsaved
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div className="font-medium">{finalDamage.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {unsavedWounds.toFixed(1)} × {damageValue} damage
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Ranged Weapons Table */}
                    {rangedResults.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm mb-2 bg-gray-100 p-1">Ranged Weapons</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-1 text-left font-medium text-gray-500">Weapon</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Attacks</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Hits</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Wounds</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Save</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-500">Damage</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {rangedResults.map((result, index) => {
                                        // Extract weapon details and count
                                        const { cleanName, count } = extractWeaponCount(result.weaponName);

                                        // Extract weapon stats
                                        const weapon = attackingUnit.rangedWeapons.find(w =>
                                            w.name === result.weaponName || w.name === cleanName);
                                        const hitSkillStat = weapon?.stats.find(s => s.name === 'BS')?.value || '';
                                        const strengthStat = weapon?.stats.find(s => s.name === 'S')?.value || '';
                                        const apStat = weapon?.stats.find(s => s.name === 'AP')?.value || '';
                                        const damageStat = weapon?.stats.find(s => s.name === 'D')?.value || '';
                                        const keywordsStat = weapon?.stats.find(s => s.name === 'Keywords')?.value || '';

                                        // Determine hit threshold
                                        const hitThreshold = keywordsStat.includes('Torrent') ? 'Auto' : hitSkillStat;

                                        // Determine wound threshold
                                        const strength = parseInt(strengthStat) || 0;
                                        const woundThreshold = getWoundThreshold(strength, defenderToughness);

                                        // Calculate modified save
                                        const apValue = parseInt(apStat.replace('-', '')) || 0;
                                        let effectiveSave = '';
                                        let effectiveSaveValue = 7; // Default to no save (7+)

                                        if (armorSave && invulnSave) {
                                            // Parse save values
                                            const armorValue = parseInt(armorSave.replace('+', ''));
                                            const invulnValue = parseInt(invulnSave.replace('+', ''));

                                            // Modified armor save
                                            const modifiedArmorValue = Math.min(6, armorValue + apValue);

                                            // Use the better of the two saves
                                            if (invulnValue < modifiedArmorValue) {
                                                effectiveSave = `${invulnValue}++`;
                                                effectiveSaveValue = invulnValue;
                                            } else {
                                                effectiveSave = `${modifiedArmorValue}+`;
                                                effectiveSaveValue = modifiedArmorValue;
                                            }
                                        } else if (armorSave) {
                                            // Just modify armor save
                                            const armorValue = parseInt(armorSave.replace('+', ''));
                                            const modifiedArmorValue = Math.min(6, armorValue + apValue);
                                            effectiveSave = `${modifiedArmorValue}+`;
                                            effectiveSaveValue = modifiedArmorValue;
                                        }

                                        // Calculate save fail rate (correctly)
                                        const failSaveRate = calculateSaveFailRate(effectiveSaveValue);

                                        // Adjust attack count based on number of weapons
                                        const adjustedAttacks = result.attacks * count;
                                        const adjustedHits = result.hits * count;
                                        const adjustedWounds = result.wounds * count;

                                        // Calculate unsaved wounds based on correct fail rate
                                        const unsavedWounds = adjustedWounds * failSaveRate;

                                        // Calculate final damage
                                        const damageValue = parseInt(damageStat) || 1;
                                        const finalDamage = unsavedWounds * damageValue;

                                        return (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-2 py-1 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {cleanName}
                                                        {count > 1 && <span className="text-gray-600"> (×{count})</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        S:{strengthStat} AP:{apStat} D:{damageStat}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {result.lethalHits && 'Lethal Hits'} {result.devastatingWounds && 'Devastating Wounds'}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div>{adjustedAttacks.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {count > 1 ? `${result.attacks.toFixed(1)} × ${count} weapons` : 'per attack sequence'}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div>{adjustedHits.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Hit on {hitThreshold === 'Auto' ? 'Auto' : hitThreshold}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div>{adjustedWounds.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Wound on {woundThreshold}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div className="text-sm font-medium">{effectiveSaveValue === 7 ? "None" : effectiveSave}</div>
                                                    <div className="text-xs italic text-gray-500">
                                                        {unsavedWounds.toFixed(1)} unsaved
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-center">
                                                    <div className="font-medium">{finalDamage.toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {unsavedWounds.toFixed(1)} × {damageValue} damage
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DamagePanel;