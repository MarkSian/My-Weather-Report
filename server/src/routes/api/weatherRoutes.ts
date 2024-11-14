import { Router } from 'express'; // Import the Router from express to create API routes
const router = Router(); // Create a new router instance

import HistoryService from '../../service/historyService.js'; // Import HistoryService for managing search history
import WeatherService from '../../service/weatherService.js'; // Import WeatherService for fetching weather data

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  console.log('Request body:', req.body); // Log the request body for debugging
  const cityName = req.body.cityName; // Extract city name from the request body

  // Validate the city name: check if it exists, is a string, and is not empty
  if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
    return res.status(400).json({ error: 'Invalid city name' }); // Return a 400 error if validation fails
  }

  try {
    // TODO: GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName); // Fetch weather data for the city
    // TODO: save city to search history
    await HistoryService.addCity(cityName); // Save the city name to the search history
    // Return weather data as a response
    return res.json(weatherData); // Send the fetched weather data back to the client
  } catch (error) {
    console.error(error); // Log any errors that occur during the process
    return res.status(500).json({ error: 'An error occurred while fetching weather data' }); // Return a 500 error if an exception occurs
  }
});

// TODO: GET search history
router.get('/history', async (_, res) => {
  try {
    // Retrieve search history
    const history = await HistoryService.getCities(); // Fetch the list of cities from the search history
    res.json(history); // Send the search history back to the client
  } catch (error) {
    console.error(error); // Log any errors that occur during the process
    res.status(500).json({ error: 'An error occurred while fetching search history' }); // Return a 500 error if an exception occurs
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const cityId = req.params.id; // Get city id from request params

  try {
    // Delete city from search history
    await HistoryService.removeCity(cityId); // Remove the city from the search history using its ID
    res.status(204).send(); // Send no content status (204) to indicate successful deletion
  } catch (error) {
    console.error(error); // Log any errors that occur during the process
    res.status(500).json({ error: 'An error occurred while deleting city from search history' }); // Return a 500 error if an exception occurs
  }
});

export default router; // Export the router for use in other parts of the application