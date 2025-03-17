import React from 'react';
import UnitCard from './UnitCard';
import { ArmyList as ArmyListType, Unit } from '../types/types';

interface ArmyListProps {
    armyList: ArmyListType;
    highlightedUnitId: string | null;
    onHighlightUnit: (id: string) => void;
    selectionMode?: 'attack' | 'defend' | null;
    onSelectForDamage?: (unit: Unit) => void;
}

const ArmyList: React.FC<ArmyListProps> = ({
                                               armyList,
                                               highlightedUnitId,
                                               onHighlightUnit,
                                               selectionMode = null,
                                               onSelectForDamage
                                           }) => {
    if (!armyList || !armyList.units || armyList.units.length === 0) {
        return (
            <div className="border border-dashed border-gray-400 rounded p-8 text-center text-gray-500">
                No army list loaded.
            </div>
        );
    }

    return (
        <div className="bg-white rounded shadow">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{armyList.name}</h2>
                    <div className="flex items-center">
                        {selectionMode && (
                            <div className={`px-2 py-1 mr-2 rounded text-sm ${
                                selectionMode === 'attack' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {selectionMode === 'attack' ? 'Select Attacker' : 'Select Defender'}
                            </div>
                        )}
                        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">
              {armyList.totalPoints} pts
            </span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {armyList.units.map((unit) => (
                    <UnitCard
                        key={unit.id}
                        unit={unit}
                        highlightedUnitId={highlightedUnitId}
                        onHighlight={onHighlightUnit}
                        selectionMode={selectionMode}
                        onSelectForDamage={onSelectForDamage}
                    />
                ))}
            </div>
        </div>
    );
};

export default ArmyList;