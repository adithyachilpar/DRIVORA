// API configuration
const API_BASE_URL = 'http://localhost:8000';

// Helper function for API calls
async function callAPI(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Weather APIs
async function getWeather(farmId = 1) {
    return await callAPI(`/api/weather/current/${farmId}`);
}

async function getForecast(farmId = 1, days = 7) {
    return await callAPI(`/api/weather/forecast/${farmId}?days=${days}`);
}

async function getWeatherAlert(farmId = 1) {
    return await callAPI(`/api/weather/alert/${farmId}`);
}

// Crop APIs
async function getCropRecommendations(soilType, state, farmSize, budget = null) {
    let url = `/api/crops/recommend?soil_type=${soilType}&state=${state}&farm_size=${farmSize}`;
    if (budget) url += `&budget=${budget}`;
    return await callAPI(url);
}

async function getFarmRecommendations(farmId = 1) {
    return await callAPI(`/api/crops/recommend/${farmId}`);
}

async function getSeasonInfo() {
    return await callAPI('/api/crops/season-info');
}

async function getCropDetails(cropName) {
    return await callAPI(`/api/crops/details/${cropName}`);
}

// Market APIs
async function getMarketPrices(commodity, state = null) {
    let url = `/api/market/prices?commodity=${commodity}`;
    if (state) url += `&state=${state}`;
    return await callAPI(url);
}

async function getCommodities() {
    return await callAPI('/api/market/commodities');
}

async function getPriceTrend(commodity, days = 30) {
    return await callAPI(`/api/market/prices/${commodity}/trend?days=${days}`);
}