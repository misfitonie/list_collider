import { Stat, Profile, Weapon, Ability } from '@/app/types/types';

// Safe text content extraction with fallback
export function getTextContent(element: Element | null): string {
    return element?.textContent?.trim() || '';
}

// Parse a stat element into a name/value pair
export function parseStat(statElement: Element): Stat {
    const text = getTextContent(statElement);
    const matches = text.match(/^(\w+)\s+(.+)$/);

    if (matches && matches.length >= 3) {
        return {
            name: matches[1],
            value: matches[2].replace(/<\/?strong>/g, '').trim()
        };
    }

    // Fallback if the regex doesn't match
    const parts = text.split(' ');
    return {
        name: parts[0] || '',
        value: parts.slice(1).join(' ').replace(/<\/?strong>/g, '').trim()
    };
}

// Parse a unit profile from an element
export function parseProfile(profileElement: Element): Profile {
    const nameElement = profileElement.querySelector(':not(.stat)');
    const profileName = getTextContent(nameElement);

    const statElements = profileElement.querySelectorAll('.stat');
    const stats: Stat[] = Array.from(statElements).map(parseStat);

    return {
        name: profileName,
        stats
    };
}

// Parse a weapon profile from an element
export function parseWeapon(weaponElement: Element): Weapon {
    const nameElement = weaponElement.querySelector(':not(.stat)');
    const weaponName = getTextContent(nameElement);

    const statElements = weaponElement.querySelectorAll('.stat');
    const stats: Stat[] = Array.from(statElements).map(parseStat);

    return {
        name: weaponName,
        stats
    };
}

// Parse an ability from an element
export function parseAbility(abilityElement: Element): Ability {
    const nameElement = abilityElement.querySelector(':not(.stat)');
    const abilityName = getTextContent(nameElement);

    const descriptionElement = abilityElement.querySelector('.stat:has(strong)');
    const description = descriptionElement
        ? getTextContent(descriptionElement).replace(/Description\s+/i, '')
        : '';

    return {
        name: abilityName,
        description
    };
}

// Parse rules from a container element
export function parseRules(container: Element | null): string[] {
    if (!container) return [];

    const ruleElements = container.querySelectorAll('.rule');
    return Array.from(ruleElements).map(getTextContent).filter(Boolean);
}

// Extract cost value from cost text
export function parseCost(costText: string): number {
    const matches = costText.match(/(\d+)/);
    return matches ? parseInt(matches[1]) : 0;
}

// Find elements by their text content
export function findElementByText(container: Element, selector: string, text: string): Element | null {
    const elements = container.querySelectorAll(selector);
    return Array.from(elements).find(el => getTextContent(el) === text) || null;
}

// Find the container for a specific section (Unit, Weapons, Abilities)
export function findSectionContainer(unitElement: Element, sectionName: string): Element | null {
    const containers = unitElement.querySelectorAll('.indent');

    for (const container of Array.from(containers)) {
        const typeElement = container.querySelector('.type');
        if (typeElement && getTextContent(typeElement) === sectionName) {
            return container;
        }
    }

    return null;
}