import path from "path"; // Importing the 'path' module to handle file paths
import fs from "fs/promises"; // Importing the 'fs/promises' module to work with the file system using promises
import { v4 as uuidv4 } from 'uuid'; // Importing the 'uuid' package to generate unique identifiers
import { fileURLToPath } from "node:url"; // Importing 'fileURLToPath' to convert a URL to a file path

// Getting the current filename and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Define a City class with name and id properties
class City {
  constructor(public name: string, public id: string) { } // Constructor to initialize the city name and id
}

// TODO: Complete the HistoryService class
class HistoryService {
  private filePath = path.join(__dirname, "../../db/db.json"); // Defining the path to the JSON file that stores search history

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8"); // Reading the file content
      const cities = JSON.parse(data); // Parsing the JSON data into an array of cities
      // Mapping the parsed data to an array of City objects
      return cities.map((city: { name: string; id: string }) => new City(city.name, city.id));
    } catch (error) {
      console.error(error); // Logging any errors that occur during file reading
      return []; // Returning an empty array in case of an error
    }
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      const data = JSON.stringify(cities, null, 2); // Converting the cities array to a JSON string
      await fs.writeFile(this.filePath, data); // Writing the JSON string to the file
    } catch (error) {
      console.error('Error writing file', error); // Logging any errors that occur during file writing
    }
  }

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return await this.read(); // Calling the read method to get the cities
  }

  // TODO: Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string): Promise<void> {
    const cities = await this.getCities(); // Getting the current cities
    const newCity = new City(city, this.generateId()); // Creating a new City object with a unique id
    cities.push(newCity); // Adding the new city to the array
    await this.write(cities); // Writing the updated array back to the file
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities(); // Getting the current cities
    const updatedCities = cities.filter(city => city.id !== id); // Filtering out the city with the specified id
    await this.write(updatedCities); // Writing the updated array back to the file
  }

  // Method to generate a unique id for a city
  private generateId(): string {
    return uuidv4(); // Using the uuid package to generate a unique identifier
  }
}

// Exporting an instance of HistoryService for use in other parts of the application
export default new HistoryService();
