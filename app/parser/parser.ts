import {Ability, ArmyList, Profile, Stat, Unit, Weapon} from "@/app/types/types";

export function parseArmyList(html: string, armyName: string): ArmyList {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const unitElements = doc.querySelectorAll('.unit[type="card"]');

    const units: Unit[] = [];
    let totalPoints = 0;

    // Helper function to find elements with specific text content
    function findElementsWithText(parent: Element, selector: string, text: string): Element[] {
        const elements = Array.from(parent.querySelectorAll(selector));
        return elements.filter(el => el.textContent?.includes(text));
    }

    unitElements.forEach((unitElement, index) => {
        const nameElement = unitElement.querySelector('.name');
        const costElement = unitElement.querySelector('.cost');

        const name = nameElement ? nameElement.textContent || '' : '';
        const costText = costElement ? costElement.textContent || '' : '';
        const cost = parseInt(costText.replace('pts:', '').trim()) || 0;

        totalPoints += cost;

        // Parse unit profiles
        const unitProfiles: Profile[] = [];
        const unitTypeElements = findElementsWithText(unitElement, '.type', 'Unit');
        const profileElements: Element[] = [];

        // Get profiles that follow the Unit type element
        unitTypeElements.forEach(typeEl => {
            let nextEl = typeEl.nextElementSibling;
            while (nextEl && nextEl.classList.contains('profile')) {
                profileElements.push(nextEl);
                nextEl = nextEl.nextElementSibling;
            }
        });

        profileElements.forEach(profileElement => {
            const profileName = profileElement.querySelector(':not(.stat)')?.textContent || '';
            const statElements = profileElement.querySelectorAll('.stat');

            const stats: Stat[] = [];
            statElements.forEach(statElement => {
                const parts = statElement.textContent?.split(' ') || [];
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const value = parts.slice(1).join(' ').replace(/<\/?strong>/g, '').trim();
                    stats.push({ name, value });
                }
            });

            unitProfiles.push({ name: profileName, stats });
        });

        // Parse ranged weapons
        const rangedWeapons: Weapon[] = [];
        const rangedTypeElements = findElementsWithText(unitElement, '.type', 'Ranged Weapons');
        let rangedWeaponElements: Element[] = [];

        // Find the profile elements after the Ranged Weapons type
        rangedTypeElements.forEach(typeEl => {
            const containerDiv = typeEl.nextElementSibling;
            if (containerDiv && containerDiv.tagName === 'DIV') {
                rangedWeaponElements = Array.from(containerDiv.querySelectorAll('.profile'));
            }
        });

        rangedWeaponElements.forEach(weaponElement => {
            const weaponName = weaponElement.querySelector(':not(.stat)')?.textContent || '';
            const statElements = weaponElement.querySelectorAll('.stat');

            const stats: Stat[] = [];
            statElements.forEach(statElement => {
                const statText = statElement.textContent || '';
                const [name, valueWithTags] = statText.split(' ');
                const value = valueWithTags?.replace(/<\/?strong>/g, '') || '';

                stats.push({ name, value });
            });

            rangedWeapons.push({ name: weaponName, stats });
        });

        // Parse melee weapons
        const meleeWeapons: Weapon[] = [];
        const meleeTypeElements = findElementsWithText(unitElement, '.type', 'Melee Weapons');
        let meleeWeaponElements: Element[] = [];

        // Find the profile elements after the Melee Weapons type
        meleeTypeElements.forEach(typeEl => {
            const containerDiv = typeEl.nextElementSibling;
            if (containerDiv && containerDiv.tagName === 'DIV') {
                meleeWeaponElements = Array.from(containerDiv.querySelectorAll('.profile'));
            }
        });

        meleeWeaponElements.forEach(weaponElement => {
            const weaponName = weaponElement.querySelector(':not(.stat)')?.textContent || '';
            const statElements = weaponElement.querySelectorAll('.stat');

            const stats: Stat[] = [];
            statElements.forEach(statElement => {
                const statText = statElement.textContent || '';
                const [name, valueWithTags] = statText.split(' ');
                const value = valueWithTags?.replace(/<\/?strong>/g, '') || '';

                stats.push({ name, value });
            });

            meleeWeapons.push({ name: weaponName, stats });
        });

        // Parse abilities
        const abilities: Ability[] = [];
        const abilityTypeElements = findElementsWithText(unitElement, '.type', 'Abilities');
        let abilityElements: Element[] = [];

        // Find the profile elements after the Abilities type
        abilityTypeElements.forEach(typeEl => {
            const containerDiv = typeEl.nextElementSibling;
            if (containerDiv && containerDiv.tagName === 'DIV') {
                abilityElements = Array.from(containerDiv.querySelectorAll('.profile'));
            }
        });

        abilityElements.forEach(abilityElement => {
            const abilityName = abilityElement.querySelector(':not(.stat)')?.textContent || '';

            // Find the Description stat element
            const statElements = Array.from(abilityElement.querySelectorAll('.stat'));
            const descriptionElement = statElements.find(el => el.textContent?.includes('Description'));

            const description = descriptionElement ?
                descriptionElement.textContent?.replace('Description', '').replace(/<\/?strong>/g, '').trim() || ''
                : '';

            abilities.push({ name: abilityName, description });
        });

        // Parse rules
        const ruleElement = unitElement.querySelector('.rule');
        const rulesContainer = ruleElement ? ruleElement.parentElement : null;
        const rules: string[] = [];

        if (rulesContainer) {
            const ruleElements = rulesContainer.querySelectorAll('.rule');
            ruleElements.forEach(ruleElement => {
                const rule = ruleElement.textContent || '';
                if (rule) rules.push(rule);
            });
        }

        units.push({
            id: `${name}-${index}`,
            name,
            cost,
            unitProfiles,
            rangedWeapons,
            meleeWeapons,
            abilities,
            rules
        });
    });

    return {
        id: Date.now().toString(),
        name: armyName,
        units,
        totalPoints
    };
}

// This function will work in the browser environment
export function createParserForBrowser() {
    if (typeof window !== 'undefined') {
        return (html: string, armyName: string) => parseArmyList(html, armyName);
    }

    // Return a placeholder function for server-side rendering
    return (html: string, armyName: string) => ({
        id: '',
        name: armyName,
        units: [],
        totalPoints: 0
    });
}