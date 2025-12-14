import { Person, Generation, FamilyData } from '@/types/family';
import { SearchFilters } from '@/app/components/SearchBar';

export interface SearchResult {
    person: Person;
    generation: string;
    matchType: 'name' | 'info' | 'year' | 'id';
    matchText?: string;
}
// Simple fuzzy matching helper
// Jonyari note: used to match search input against person fields
function fuzzyMatch(text: string, searchTerm: string): boolean {
    if (!text || !searchTerm) return false;
    
    const normalizedText = text.toLowerCase();
    const normalizedSearchTerm = searchTerm.toLowerCase();
    
    // Full match
    if (normalizedText.includes(normalizedSearchTerm)) {
        return true;
    }
    
    // Split search term to support multi-word partial matches
    const searchWords = normalizedSearchTerm.split(/\s+/);
    return searchWords.every(word => normalizedText.includes(word));
}

// Check whether a year is within the provided range
function isYearInRange(year: number | undefined, start?: number, end?: number): boolean {
    if (!year) return false;
    if (start && year < start) return false;
    if (end && year > end) return false;
    return true;
}

// Check whether a person matches the given search term and filters
function matchesPerson(person: Person, searchTerm: string, filters: SearchFilters): SearchResult | null {
    const { searchInInfo, yearRange } = filters;
    
    // If there's a year range filter, verify birth/death year match
    if (yearRange.start || yearRange.end) {
        const birthMatch = isYearInRange(person.birthYear, yearRange.start, yearRange.end);
        const deathMatch = isYearInRange(person.deathYear, yearRange.start, yearRange.end);
        
        if (!birthMatch && !deathMatch) {
            return null;
        }
        
        // If only years match and there is no search term, return a year match
        if (!searchTerm) {
            return {
                person,
                generation: '',
                matchType: 'year',
                matchText: `${person.birthYear || ''}-${person.deathYear || ''}`
            };
        }
    }
    
    // If no search term and no year filter, default to name match behavior
    if (!searchTerm) {
        return yearRange.start || yearRange.end ? null : {
            person,
            generation: '',
            matchType: 'name'
        };
    }
    
    // Name match
    if (fuzzyMatch(person.name, searchTerm)) {
        return {
            person,
            generation: '',
            matchType: 'name',
            matchText: person.name
        };
    }
    
    // ID match (for exact lookups)
    if (person.id && person.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return {
            person,
            generation: '',
            matchType: 'id',
            matchText: person.id
        };
    }
    
    // Info field match
    if (searchInInfo && person.info && fuzzyMatch(person.info, searchTerm)) {
        // Find the matching snippet
        const lowerInfo = person.info.toLowerCase();
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchIndex = lowerInfo.indexOf(lowerSearchTerm);
        
        let matchText = person.info;
        if (matchIndex !== -1) {
            const start = Math.max(0, matchIndex - 20);
            const end = Math.min(person.info.length, matchIndex + searchTerm.length + 20);
            matchText = (start > 0 ? '...' : '') + 
                       person.info.substring(start, end) + 
                       (end < person.info.length ? '...' : '');
        }
        
        return {
            person,
            generation: '',
            matchType: 'info',
            matchText
        };
    }
    
    // Match by year text in search term
    if (person.birthYear && searchTerm.includes(person.birthYear.toString())) {
        return {
            person,
            generation: '',
            matchType: 'year',
            matchText: person.birthYear.toString()
        };
    }
    
    if (person.deathYear && searchTerm.includes(person.deathYear.toString())) {
        return {
            person,
            generation: '',
            matchType: 'year',
            matchText: person.deathYear.toString()
        };
    }
    
    return null;
}

// Main search function
export function searchFamilyData(familyData: FamilyData, searchTerm: string, filters: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];

    if (!familyData || !Array.isArray(familyData.generations) || familyData.generations.length === 0) {
        return results;
    }
    
    familyData.generations.forEach(generation => {
        // If generation filters are specified, skip non-selected generations
        if (filters.selectedGenerations.length > 0 && 
            !filters.selectedGenerations.includes(generation.title)) {
            return;
        }
        
        generation.people.forEach(person => {
            const match = matchesPerson(person, searchTerm, filters);
            if (match) {
                match.generation = generation.title;
                results.push(match);
            }
        });
    });
    
    // Sort by match type priority: name > id > year > info
    const matchTypePriority = { 'name': 1, 'id': 2, 'year': 3, 'info': 4 };
    results.sort((a, b) => {
        const aPriority = matchTypePriority[a.matchType];
        const bPriority = matchTypePriority[b.matchType];
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }
        // Within same type, sort by person name
        return a.person.name.localeCompare(b.person.name, 'zh-CN');
    });
    
    return results;
}

// Highlight matching text in results
export function highlightMatch(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

// Create a filtered family data structure from search results
export function createFilteredFamilyData(familyData: FamilyData, searchResults: SearchResult[]): FamilyData {
    if (searchResults.length === 0) {
        return { generations: [] };
    }
    
    // Group search results by generation
    const generationMap = new Map<string, Person[]>();
    
    searchResults.forEach(result => {
        const generationTitle = result.generation;
        if (!generationMap.has(generationTitle)) {
            generationMap.set(generationTitle, []);
        }
        generationMap.get(generationTitle)!.push(result.person);
    });
    
    // Build filtered generations list
    const filteredGenerations: Generation[] = [];
    
    // Preserve original generation order
    familyData.generations.forEach(originalGeneration => {
        if (generationMap.has(originalGeneration.title)) {
            filteredGenerations.push({
                title: originalGeneration.title,
                people: generationMap.get(originalGeneration.title)!
            });
        }
    });
    
    return { generations: filteredGenerations };
}