import { useState, useCallback } from 'react';
import { ArmyList } from '@/app/types/types';
import * as parseUtils from '../parser/parseUtils';

export default function useArmyLists() {
    const [armyLists, setArmyLists] = useState<ArmyList[]>([]);
    const [highlightedUnitId, setHighlightedUnitId] = useState<string | null>(null);

    const parseArmyList = useCallback((html: string, name: string): ArmyList | null => {
        if (typeof window === 'undefined') return null;

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Parse units
            const unitElements = doc.querySelectorAll('.unit[type="card"]');
            const units = Array.from(unitElements).map((unitElement, unitIndex) => {
                // Name and cost
                const nameElement = unitElement.querySelector('.name');
                const costElement = unitElement.querySelector('.cost');

                const unitName = parseUtils.getTextContent(nameElement);
                const costText = parseUtils.getTextContent(costElement);
                const cost = parseUtils.parseCost(costText);

                // Unit profiles
                const unitProfileContainer = parseUtils.findSectionContainer(unitElement, 'Unit');
                const unitProfiles = unitProfileContainer
                    ? Array.from(unitProfileContainer.querySelectorAll('.profile')).map(parseUtils.parseProfile)
                    : [];

                // Ranged weapons
                const rangedWeaponsContainer = parseUtils.findSectionContainer(unitElement, 'Ranged Weapons');
                const rangedWeapons = rangedWeaponsContainer
                    ? Array.from(rangedWeaponsContainer.querySelectorAll('.profile')).map(parseUtils.parseWeapon)
                    : [];

                // Melee weapons
                const meleeWeaponsContainer = parseUtils.findSectionContainer(unitElement, 'Melee Weapons');
                const meleeWeapons = meleeWeaponsContainer
                    ? Array.from(meleeWeaponsContainer.querySelectorAll('.profile')).map(parseUtils.parseWeapon)
                    : [];

                // Abilities
                const abilitiesContainer = parseUtils.findSectionContainer(unitElement, 'Abilities');
                const abilities = abilitiesContainer
                    ? Array.from(abilitiesContainer.querySelectorAll('.profile')).map(parseUtils.parseAbility)
                    : [];

                // Rules
                const ruleElement = unitElement.querySelector('.rule');
                const rulesContainer = ruleElement ? ruleElement.parentElement : null;
                const rules = parseUtils.parseRules(rulesContainer);

                return {
                    id: `${unitName}-${unitIndex}`,
                    name: unitName,
                    cost,
                    unitProfiles,
                    rangedWeapons,
                    meleeWeapons,
                    abilities,
                    rules
                };
            });

            // Calculate total points
            const totalPoints = units.reduce((sum, unit) => sum + unit.cost, 0);

            // Create army list
            return {
                id: `army-${Date.now()}`,
                name,
                units,
                totalPoints
            };
        } catch (error) {
            console.error('Error parsing army list:', error);
            return null;
        }
    }, []);

    const handleArmyListUpload = useCallback((html: string, name: string, index: number) => {
        const parsedList = parseArmyList(html, name);

        if (parsedList) {
            setArmyLists(prev => {
                const updated = [...prev];
                updated[index] = parsedList;
                return updated;
            });
        }
    }, [parseArmyList]);

    const handleHighlightUnit = useCallback((unitId: string) => {
        setHighlightedUnitId(prevId => prevId === unitId ? null : unitId);
    }, []);

    const resetArmyLists = useCallback(() => {
        setArmyLists([]);
        setHighlightedUnitId(null);
    }, []);

    return {
        armyLists,
        highlightedUnitId,
        handleArmyListUpload,
        handleHighlightUnit,
        resetArmyLists
    };
}