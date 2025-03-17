import React from 'react';
import { Unit } from '../types/types';
import Tooltip from './Tooltip';

interface UnitCardProps {
    unit: Unit;
    highlightedUnitId: string | null;
    onHighlight: (id: string) => void;
    selectionMode?: 'attack' | 'defend' | null;
    onSelectForDamage?: (unit: Unit) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({
                                               unit,
                                               selectionMode = null,
                                               onSelectForDamage
                                           }) => {

    const handleClick = () => {
        // Only perform actions when in selection mode
        if (selectionMode && onSelectForDamage) {
            onSelectForDamage(unit);
        }
        // Removed the else clause that called onHighlight
    };

    // Determine card style based on selection mode
    let cardStyle = 'border border-gray-400 rounded p-4 mb-4 transition-all';

    // No longer add highlight styles even if isHighlighted is true
    if (selectionMode === 'attack') {
        cardStyle += ' cursor-pointer hover:bg-red-50 hover:border-red-300';
    } else if (selectionMode === 'defend') {
        cardStyle += ' cursor-pointer hover:bg-green-50 hover:border-green-300';
    } else {
        cardStyle += ' hover:bg-gray-50';
    }
    return (
        <div
            className={cardStyle}
            onClick={handleClick}
        >
            <div className="mb-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{unit.name}</h3>
                    <span className="bg-gray-200 px-2 py-1 rounded-full text-sm font-medium ml-2 flex-shrink-0">
            {unit.cost} pts
          </span>
                </div>

                {/* Compact unit profile */}
                {unit.unitProfiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {unit.unitProfiles[0].stats.map((stat) => (
                            <span key={stat.name} className="inline-flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-sm">
                <span className="font-medium text-gray-600">{stat.name}</span>
                <span className="ml-1 font-semibold text-gray-800">{stat.value}</span>
              </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Unit Profile - Removed as we're now showing compact stats next to the name */}

            {/* Ranged Weapons */}
            {unit.rangedWeapons.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-1 text-gray-700">Ranged Weapons</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                {unit.rangedWeapons[0].stats.map((stat) => (
                                    <th key={stat.name} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {stat.name}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {unit.rangedWeapons.map((weapon) => (
                                <tr key={weapon.name}>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {weapon.name}
                                    </td>
                                    {weapon.stats.map((stat) => {
                                        // Check if this is a Keywords stat which might have multiple keywords
                                        if (stat.name === 'Keywords' && stat.value !== '-') {
                                            const keywords = stat.value.split(', ');
                                            return (
                                                <td key={stat.name} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex flex-wrap gap-1">
                                                        {keywords.map(keyword => {
                                                            // Common keywords descriptions
                                                            const KEYWORD_DESCRIPTIONS: Record<string, string> = {
                                                                "Lethal Hits": "Critical Hits automatically wound the target",
                                                                "Devastating Wounds": "Critical Wounds cause mortal wounds equal to damage value",
                                                                "Blast": "Min. 3 attacks vs 6+ models, max attacks vs 11+ models",
                                                                "Torrent": "Automatically hits target",
                                                                "Ignores Cover": "Target cannot claim cover benefits",
                                                                "Extra Attacks": "Adds additional attacks, not replacing existing ones",
                                                                "Psychic": "Enemy cannot use rules that ignore wounds"
                                                            };

                                                            const description = KEYWORD_DESCRIPTIONS[keyword] || "";

                                                            return description ? (
                                                                <Tooltip
                                                                    key={keyword}
                                                                    content={
                                                                        <div className="max-w-xs">
                                                                            <div className="font-bold mb-1">{keyword}</div>
                                                                            <div>{description}</div>
                                                                        </div>
                                                                    }
                                                                    position="top"
                                                                >
                                    <span className="bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                      {keyword}
                                    </span>
                                                                </Tooltip>
                                                            ) : (
                                                                <span key={keyword} className="bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                    {keyword}
                                  </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={stat.name} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                                {stat.value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Melee Weapons */}
            {unit.meleeWeapons.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-1 text-gray-700">Melee Weapons</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                {unit.meleeWeapons[0].stats.map((stat) => (
                                    <th key={stat.name} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {stat.name}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {unit.meleeWeapons.map((weapon) => (
                                <tr key={weapon.name}>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {weapon.name}
                                    </td>
                                    {weapon.stats.map((stat) => {
                                        // Check if this is a Keywords stat which might have multiple keywords
                                        if (stat.name === 'Keywords' && stat.value !== '-') {
                                            const keywords = stat.value.split(', ');
                                            return (
                                                <td key={stat.name} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex flex-wrap gap-1">
                                                        {keywords.map(keyword => {
                                                            // Common keywords descriptions
                                                            const KEYWORD_DESCRIPTIONS: Record<string, string> = {
                                                                "Lethal Hits": "Critical Hits automatically wound the target",
                                                                "Devastating Wounds": "Critical Wounds cause mortal wounds equal to damage value",
                                                                "Blast": "Min. 3 attacks vs 6+ models, max attacks vs 11+ models",
                                                                "Torrent": "Automatically hits target",
                                                                "Ignores Cover": "Target cannot claim cover benefits",
                                                                "Extra Attacks": "Adds additional attacks, not replacing existing ones",
                                                                "Psychic": "Enemy cannot use rules that ignore wounds"
                                                            };

                                                            const description = KEYWORD_DESCRIPTIONS[keyword] || "";

                                                            return description ? (
                                                                <Tooltip
                                                                    key={keyword}
                                                                    content={
                                                                        <div className="max-w-xs">
                                                                            <div className="font-bold mb-1">{keyword}</div>
                                                                            <div>{description}</div>
                                                                        </div>
                                                                    }
                                                                    position="top"
                                                                >
                                    <span className="bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                      {keyword}
                                    </span>
                                                                </Tooltip>
                                                            ) : (
                                                                <span key={keyword} className="bg-gray-100 text-gray-800 text-xs px-1 py-0.5 rounded">
                                    {keyword}
                                  </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={stat.name} className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                                {stat.value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Abilities */}
            {unit.abilities.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-1 text-gray-700">Abilities</h4>
                    <div className="flex flex-wrap gap-1">
                        {unit.abilities.map((ability) => (
                            <Tooltip
                                key={ability.name}
                                content={
                                    <div className="max-w-xs">
                                        <div className="font-bold mb-1">{ability.name}</div>
                                        <div>{ability.description}</div>
                                    </div>
                                }
                                maxWidth="20rem"
                                position="top"
                            >
                <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">
                  {ability.name}
                </span>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}

            {/* Rules */}
            {unit.rules.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-1 text-gray-700">Rules</h4>
                    <div className="flex flex-wrap gap-1">
                        {unit.rules.map((rule) => {
                            // Common rules descriptions
                            const COMMON_RULES: Record<string, string> = {
                                "Deep Strike": "During the Reinforcements step of your Movement phase, you can set up this unit anywhere on the battlefield that is more than 9\" away from any enemy models.",
                                "Lethal Hits": "Each time an attack is made with this weapon, a Critical Hit automatically wounds the target.",
                                "Psychic": "Each time a Psychic weapon or ability successfully wounds an enemy unit, that enemy unit cannot use any rules that ignore wounds.",
                                "Devastating Wounds": "Each time an attack is made with this weapon, a Critical Wound inflicts a number of mortal wounds equal to the attack's normal damage value, and the attack sequence ends.",
                                "Torrent": "Each time an attack is made with a Torrent weapon, that attack automatically hits its target.",
                                "Ignores Cover": "Each time an attack is made with this weapon, the target cannot claim the benefits of cover against that attack.",
                                "The Shadow of Chaos": "In your Command phase, if a unit from your army with this ability is within your army's Shadow of Chaos, it gains the following benefit until the start of your next Command phase, depending on which Chaos God it is dedicated to.",
                                "Infiltrators": "During deployment, you can set up this unit anywhere on the battlefield that is more than 9\" away from the enemy deployment zone and any enemy models.",
                                "Leader": "This unit can be attached to a specified unit type to provide bonuses or abilities to that unit.",
                                "Scouts": "After both sides have deployed, this unit can make a Scout move before the first turn begins. This unit can move a number of inches up to the value listed after this rule.",
                                "Deadly Demise": "When this model is destroyed, roll a D6. On a 4+, each unit within range suffers a number of mortal wounds as indicated.",
                                "Extra Attacks": "The weapon with this ability grants additional attacks on top of the model's normal attack profile.",
                                "Blast": "Each time this weapon targets a unit containing 6+ models, it makes a minimum of 3 attacks. When targeting a unit with 11+ models, it makes the maximum number of attacks.",
                                "Indirect Fire": "This weapon can target units that are not visible to the firing model. Units hit by Indirect Fire cannot claim the benefits of Dense Cover."
                            };

                            const description = COMMON_RULES[rule] || "No description available. Refer to your rulebook for details.";

                            return (
                                <Tooltip
                                    key={rule}
                                    content={
                                        <div className="max-w-xs">
                                            <div className="font-bold mb-1">{rule}</div>
                                            <div>{description}</div>
                                        </div>
                                    }
                                    maxWidth="20rem"
                                    position="top"
                                >
                  <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                    {rule}
                  </span>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitCard;