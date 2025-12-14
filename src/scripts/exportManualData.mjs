import fs from 'fs';
import path from 'path';

// Create an empty example family data structure
const emptyFamilyData = {
  "generations": [
    {
      "title": "Example Generation",
      "people": [
        {
          "id": "example-person",
          "name": "Example Name",
          "info": "Example info"
        }
      ]
    }
  ]
};

// Ensure the config directory exists
const configDir = path.join(process.cwd(), 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

// If family-data.json doesn't exist, create an example file
const familyDataPath = path.join(configDir, 'family-data.json');
if (!fs.existsSync(familyDataPath)) {
  fs.writeFileSync(
    familyDataPath, 
    JSON.stringify(emptyFamilyData, null, 2), 
    'utf8'
  );
  console.log(`Jonyari: Created example family data file: ${familyDataPath}`);
} else {
  console.log(`Jonyari: Family data file already exists: ${familyDataPath}`);
}

// Show next steps to the user
console.log('\nConfiguration instructions:');
console.log('1. Edit config/family-data.json and add your family data');
console.log('2. To enable authentication, set NEXT_PUBLIC_REQUIRE_AUTH=true in .env.local');
console.log('3. Set NEXT_PUBLIC_AUTH_MODE to "all" (all family members) or "specific" (specific users)');
console.log('4. If using "specific" mode, set NEXT_PUBLIC_SPECIFIC_NAME in .env.local to the allowed username');