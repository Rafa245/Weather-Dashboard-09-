import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const city = req.body.cityName;

  try {
    // GET weather data from city name
    const weatherService = new WeatherService(city);
    const weatherData = await weatherService.getWeatherForCity();
    console.log(weatherData);

    // Save city to search history
    await HistoryService.addCity(city);

    // Send response with weather data and confirmation message
    res.json(weatherData);
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    res.status(500).json({ message: "An error occurred", error: errorMessage });
  }
});


// TODO: GET search history
router.get('/history', async (_req, res) => {
  const cities = await HistoryService.getCities()
  console.log(cities)
  res.json(cities)
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  HistoryService.removeCity(req.params.id)
  res.json({ message: `search deleted` })
});

export default router;