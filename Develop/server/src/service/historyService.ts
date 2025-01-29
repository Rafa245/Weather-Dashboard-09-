import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs/promises';

const FILE_PATH = 'db/searchHistory.json';

// Define a City class
class City {
  name: string;
  id: string;

  constructor(name: string) {
    this.name = name;
    this.id = uuidv4();
  }
}

// Define the HistoryService class
class HistoryService {
  constructor() {}

  // Read from the JSON file
  private async read(): Promise<string> {
    try {
      return await fs.readFile(FILE_PATH, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, create it
        await this.write([]);
        return '[]'; // Return an empty JSON array
      }
      throw error; // If another error, rethrow it
    }
  }

  // Write to the JSON file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(cities, null, 2));
  }

  // Get all cities from the file
  async getCities(): Promise<City[]> {
    try {
      const history: City[] = JSON.parse(await this.read());
      return history;
    } catch (error) {
      console.error('Error reading the JSON file:', error);
      return [];
    }
  }

  // Add a new city to the history
  async addCity(city: string): Promise<void> {
    const cities: City[] = await this.getCities();
    const index = cities.findIndex(
      (cityObj) => cityObj.name.toLowerCase() === city.toLowerCase()
    );

    if (index === -1) {
      const newCity = new City(city);
      cities.push(newCity);
      await this.write(cities);
    }
  }

  // Remove a city from history by ID
  async removeCity(id: string): Promise<void> {
    const cities: City[] = await this.getCities();
    const index = cities.findIndex((city) => city.id === id);

    if (index !== -1) {
      cities.splice(index, 1);
      console.log('City deleted:', id);
      await this.write(cities);
    } else {
      console.log('City not found:', id);
    }
  }
}

export default new HistoryService();
