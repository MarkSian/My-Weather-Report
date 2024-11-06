import { Router, type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const cityName = req.body.city; // Get the city name from the request body

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // TODO: GET weather data from city name
    const weatherData = await WeatherService.getWeather(cityName);

    // TODO: save city to search history
    await HistoryService.saveCity(cityName);

    return res.status(200).json(weatherData);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await HistoryService.getSearchHistory(); // Fetch the search history
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const cityId = req.params.id; // Get the city ID from the URL

  try {
    await HistoryService.deleteCity(cityId); // Remove the city from search history
    return res.status(204).send(); // No content to return
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;