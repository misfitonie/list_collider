import React, { useState, useMemo } from 'react';
import { ArmyList } from '../types/types';

interface RulesReferenceProps {
    armyLists: ArmyList[];
}

const COMMON_RULES: Record<string, string> = {
    "Deep Strike": "During the Reinforcements step of your Movement phase, you can set up this unit anywhere on the battlefield that is more than 9\" away from any enemy models.",
    "Lethal Hits": "Each time an attack is made with this weapon, a Critical Hit automatically wounds the target.",
    "Psychic": "Each time a Psychic weapon or ability successfully wounds an enemy unit, that enemy unit cannot use any rules that ignore wounds.",
    "Devastating Wounds": "Each time an attack is made with this weapon, a Critical Wound inflicts a number of mortal wounds equal to the attack's normal damage value, and the attack sequence ends.",
    "Torrent": "Each time an attack is made with a Torrent weapon, that attack automatically hits its target.",
    "Ignores Cover": "Each time an attack is made with this weapon, the target cannot claim the benefits of cover against that attack.",
    "The Shadow of Chaos": "In your Command phase, if a unit from your army with this ability is within your army's Shadow of Chaos (see Codex), it gains the following benefit until the start of your next Command phase, depending on which Chaos God it is dedicated to: Khorne +1 to Strength, Tzeentch +1 to Save, Nurgle Feel No Pain 5+, Slaanesh +1 to Attacks.",
    "Infiltrators": "During deployment, you can set up this unit anywhere on the battlefield that is more than 9\" away from the enemy deployment zone and any enemy models.",
    "Leader": "This unit can be attached to a specified unit type to provide bonuses or abilities to that unit.",
    "Scouts": "After both sides have deployed, this unit can make a Scout move before the first turn begins. This unit can move a number of inches up to the value listed after this rule, provided it does not end up within 9\" of enemy models.",
    "Deadly Demise": "When this model is destroyed, roll a D6. On a 4+, each unit within range suffers a number of mortal wounds as indicated, typically shown as 'Deadly Demise X' where X is the number of mortal wounds inflicted.",
    "Extra Attacks": "The weapon with this ability grants additional attacks on top of the model's normal attack profile, not replacing its existing attacks.",
    "Blast": "Each time this weapon targets a unit containing 6+ models, it makes a minimum of 3 attacks. When targeting a unit with 11+ models, it makes the maximum number of attacks.",
    "Indirect Fire": "This weapon can target units that are not visible to the firing model. Units hit by Indirect Fire cannot claim the benefits of Dense Cover."
};

const RulesReference: React.FC<RulesReferenceProps> = ({ armyLists }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Extract all unique rules from both army lists
    const uniqueRules = useMemo(() => {
        const rulesSet = new Set<string>();

        armyLists.forEach(armyList => {
            if (!armyList) return;

            armyList.units.forEach(unit => {
                unit.rules.forEach(rule => {
                    rulesSet.add(rule);
                });
            });
        });

        return Array.from(rulesSet).sort();
    }, [armyLists]);

    // Filter rules based on search term
    const filteredRules = useMemo(() => {
        if (!searchTerm) return uniqueRules;
        return uniqueRules.filter(rule =>
            rule.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [uniqueRules, searchTerm]);

    return (
        <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-bold mb-4">Rules Reference</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
            </div>

            <div className="space-y-2">
                {filteredRules.map(rule => (
                    <div key={rule} className="border border-gray-200 rounded p-3">
                        <h3 className="font-semibold">{rule}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {COMMON_RULES[rule] || "No description available. Refer to your rulebook for details."}
                        </p>
                    </div>
                ))}

                {filteredRules.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                        No rules found matching &quot;{searchTerm}&quot;
                    </div>
                )}
            </div>
        </div>
    );
};

export default RulesReference;