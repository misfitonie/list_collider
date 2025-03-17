'use client';

import React, { useState, useEffect } from 'react';
import {Unit} from "@/app/types/types";
import useArmyLists from "@/app/hooks/useArmyLists";
import ArmyListUploader from "@/app/components/ArmyListUploader";
import DamagePanel from "@/app/components/DamagePanel";
import ArmyList from "@/app/components/ArmyList";


export default function Home() {
  const [view, setView] = useState<'upload' | 'compare'>('upload');
  const [isClient, setIsClient] = useState(false);

  // Damage calculation states
  const [damageCalcMode, setDamageCalcMode] = useState<'selecting-attacker' | 'selecting-defender' | null>(null);
  const [attackingUnit, setAttackingUnit] = useState<Unit | null>(null);
  const [defendingUnit, setDefendingUnit] = useState<Unit | null>(null);

  const {
    armyLists,
    highlightedUnitId,
    handleArmyListUpload,
    handleHighlightUnit,
    resetArmyLists
  } = useArmyLists();

  // Function to start damage calculation
  const startDamageCalculation = () => {
    setDamageCalcMode('selecting-attacker');
    setAttackingUnit(null);
    setDefendingUnit(null);
  };

  // Function to handle unit selection for damage calculation
  const handleSelectUnitForDamage = (unit: Unit) => {
    if (damageCalcMode === 'selecting-attacker') {
      setAttackingUnit(unit);
      setDamageCalcMode('selecting-defender');
    } else if (damageCalcMode === 'selecting-defender') {
      setDefendingUnit(unit);
      setDamageCalcMode(null);
    }
  };

  // Reset damage calculation
  const resetDamageCalculation = () => {
    setDamageCalcMode(null);
    setAttackingUnit(null);
    setDefendingUnit(null);
  };

  // This ensures hydration issues are avoided
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Switch to compare view only when both lists are loaded
  useEffect(() => {
    if (armyLists.length === 0) {
      setView('upload');
    } else if (armyLists.length === 2) {
      setView('compare');
    }
  }, [armyLists]);

  const handleReset = () => {
    resetArmyLists();
    setView('upload');
  };

  if (!isClient) {
    return null; // Prevent hydration issues
  }

  return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Warhammer 40K Army Comparison</h1>
          </div>
        </header>

        <main className="container mx-auto text-gray-800 py-8 px-4">
          {view === 'upload' ? (
              <>
                <div className="mb-8 bg-white shadow rounded p-6">
                  <h2 className="text-xl font-bold mb-4">Instructions</h2>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Upload HTML files containing your Warhammer 40K army lists</li>
                    <li>Give each army a name to help identify it</li>
                    <li>Once you&apos;ve uploaded two army lists, you can compare them side by side</li>
                    <li>Use the damage calculator to predict combat outcomes between units</li>
                  </ol>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <ArmyListUploader
                      onUpload={(html, name) => handleArmyListUpload(html, name, 0)}
                      index={0}
                      isUploaded={Boolean(armyLists[0])}
                  />
                  <ArmyListUploader
                      onUpload={(html, name) => handleArmyListUpload(html, name, 1)}
                      index={1}
                      isUploaded={Boolean(armyLists[1])}
                  />
                </div>

                {armyLists.length > 0 && (
                    <div className="mt-6 text-center">
                      <button
                          onClick={() => armyLists.length === 2 ? setView('compare') : null}
                          className={`px-6 py-2 rounded-md shadow-sm ${
                              armyLists.length === 2
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {armyLists.length === 2
                            ? 'Compare Armies'
                            : 'Upload a second army to compare'
                        }
                      </button>
                    </div>
                )}
              </>
          ) : (
              <>
                <div className="mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Army Comparison</h2>
                    <div className="flex gap-2">
                      <button
                          onClick={startDamageCalculation}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          disabled={armyLists.length < 2 || !armyLists[0] || !armyLists[1]}
                      >
                        Calculate Damage
                      </button>
                      <button
                          onClick={handleReset}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Damage Calculation Instructions */}
                  {damageCalcMode && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold">
                              {damageCalcMode === 'selecting-attacker'
                                  ? 'Select Attacking Unit'
                                  : 'Select Defending Unit'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {damageCalcMode === 'selecting-attacker'
                                  ? 'Click on a unit from either army to select it as the attacker'
                                  : 'Click on a unit from either army to select it as the defender'}
                            </p>
                            {attackingUnit && (
                                <p className="text-sm font-medium mt-1">
                                  Attacking Unit: {attackingUnit.name}
                                </p>
                            )}
                          </div>
                          <button
                              onClick={resetDamageCalculation}
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                  )}

                  {/* Damage Calculation Results */}
                  {attackingUnit && defendingUnit && (
                      <DamagePanel
                          attackingUnit={attackingUnit}
                          defendingUnit={defendingUnit}
                          onClose={resetDamageCalculation}
                      />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {armyLists[0] && (
                      <ArmyList
                          armyList={armyLists[0]}
                          highlightedUnitId={highlightedUnitId}
                          onHighlightUnit={handleHighlightUnit}
                          selectionMode={damageCalcMode === 'selecting-attacker' ? 'attack' :
                              damageCalcMode === 'selecting-defender' ? 'defend' : null}
                          onSelectForDamage={handleSelectUnitForDamage}
                      />
                  )}

                  {armyLists[1] ? (
                      <ArmyList
                          armyList={armyLists[1]}
                          highlightedUnitId={highlightedUnitId}
                          onHighlightUnit={handleHighlightUnit}
                          selectionMode={damageCalcMode === 'selecting-attacker' ? 'attack' :
                              damageCalcMode === 'selecting-defender' ? 'defend' : null}
                          onSelectForDamage={handleSelectUnitForDamage}
                      />
                  ) : (
                      <div className="border border-dashed border-gray-400 rounded p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                        <p className="mb-4">You need to upload a second army to compare</p>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reset
                        </button>
                      </div>
                  )}
                </div>
              </>
          )}
        </main>

        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>Warhammer 40K Army List Comparison Tool</p>
            <p className="text-sm text-gray-400 mt-1">
              This tool allows you to compare two Warhammer 40K army lists side by side.
            </p>
          </div>
        </footer>
      </div>
  );
}