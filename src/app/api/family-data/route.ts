import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'family-data.json');
    
    // Check whether the family-data.json file exists
    if (!fs.existsSync(configPath)) {
      console.warn('family-data.json not found, returning empty data');
      return NextResponse.json({
        generations: []
      });
    }

    // Read and parse the file
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(fileContent);

    // Normalize older data format that uses `generation` instead of `generations`
    let data: any = parsed;
    if (!Array.isArray(parsed.generations) && Array.isArray(parsed.generation)) {
      data = { generations: parsed.generation };
    }

    // Ensure the response has a `generations` array to match the client expectations
    if (!Array.isArray(data.generations)) {
      data = { generations: [] };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading family data:', error);
    return NextResponse.json(
      { error: 'Failed to load family data' },
      { status: 500 }
    );
  }
} 