import { FamilyData, Person } from '@/types/family';

// Core algorithm to build family tree structure
// Jonyari note: preserves parent-child relationships using fatherId
export function buildFamilyTree(familyData: FamilyData): FamilyData {
  if (!familyData || !Array.isArray(familyData.generations) || familyData.generations.length === 0) {
    return {
      generations: [
        {
          title: "Jonyari Family Tree",
          people: []
        }
      ]
    };
  }

  try {
    // Create a map for quick person lookup - O(n)
    const personMap = new Map<string, Person & { children: Person[] }>();
    
    // First, add all people into the map
    familyData.generations.forEach(generation => {
      generation.people.forEach(person => {
        if (person.id) {
          personMap.set(person.id, { ...person, children: [] });
        }
      });
    });
    
    // Establish parent-child relationships by fatherId - O(n)
    familyData.generations.forEach(generation => {
      generation.people.forEach(person => {
        if (person.fatherId && personMap.has(person.fatherId)) {
          const father = personMap.get(person.fatherId);
          const child = personMap.get(person.id!);
          if (father && child) {
            father.children.push(child);
          }
        }
      });
    });
    
    // Find root generation people (those without fatherId)
    const rootPeople: Person[] = [];
    if (familyData.generations[0]) {
      familyData.generations[0].people.forEach(person => {
        const personWithChildren = personMap.get(person.id!);
        if (personWithChildren) {
          rootPeople.push(personWithChildren);
        }
      });
    }
    
    return {
      generations: [
        {
          title: "Jonyari Family Tree",
          people: rootPeople
        }
      ]
    };
  } catch (error) {
    console.error('Error building tree structure:', error);
    // Return an empty safe structure on error
    return {
      generations: [
        {
          title: "Jonyari Family Tree",
          people: []
        }
      ]
    };
  }
}

// Build optimized search indexes to improve lookup performance
export interface SearchIndex {
  nameIndex: Map<string, Person[]>;
  infoIndex: Map<string, Person[]>;
  yearIndex: Map<number, Person[]>;
}

export function buildSearchIndex(familyData: FamilyData): SearchIndex {
  const nameIndex = new Map<string, Person[]>();
  const infoIndex = new Map<string, Person[]>();
  const yearIndex = new Map<number, Person[]>();

  if (!familyData || !Array.isArray(familyData.generations) || familyData.generations.length === 0) {
    return { nameIndex, infoIndex, yearIndex };
  }

  familyData.generations.forEach(generation => {
    generation.people.forEach(person => {
      // Build name index by splitting into characters
      const nameChars = person.name.toLowerCase().split('');
      nameChars.forEach(char => {
        if (!nameIndex.has(char)) {
          nameIndex.set(char, []);
        }
        nameIndex.get(char)!.push(person);
      });

      // Build info index by splitting into words
      if (person.info) {
        const infoWords = person.info.toLowerCase().split(/\s+/);
        infoWords.forEach(word => {
          if (word.length > 1) { // ignore single characters
            if (!infoIndex.has(word)) {
              infoIndex.set(word, []);
            }
            infoIndex.get(word)!.push(person);
          }
        });
      }

      // Build year index for birth/death years
      if (person.birthYear) {
        if (!yearIndex.has(person.birthYear)) {
          yearIndex.set(person.birthYear, []);
        }
        yearIndex.get(person.birthYear)!.push(person);
      }
      if (person.deathYear) {
        if (!yearIndex.has(person.deathYear)) {
          yearIndex.set(person.deathYear, []);
        }
        yearIndex.get(person.deathYear)!.push(person);
      }
    });
  });

  return { nameIndex, infoIndex, yearIndex };
}