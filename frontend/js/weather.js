async function loadWeatherPage() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Weather Forecast</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Current Weather -->
            <div class="lg:col-span-1 bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Current Weather</h2>
                <div class="text-center mb-6">
                    <i class="fas fa-cloud-sun text-6xl text-yellow-500 mb-4"></i>
                    <div class="text-4xl font-bold text-gray-900" id="current-temp">--°C</div>
                    <p class="text-gray-600 mt-2" id="current-desc">Loading...</p>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Humidity:</span>
                        <span class="font-semibold" id="current-humidity">--%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Wind Speed:</span>
                        <span class="font-semibold" id="current-wind">-- km/h</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Rainfall:</span>
                        <span class="font-semibold" id="current-rain">-- mm</span>
                    </div>
                </div>
            </div>

            <!-- Forecast -->
            <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">7-Day Forecast</h2>
                <div id="forecast-loading" class="flex justify-center py-8">
                    <div class="spinner"></div>
                </div>
                <div id="forecast-list" class="space-y-4"></div>
            </div>
        </div>

        <!-- Weather Alert -->
        <div id="weather-alert" class="hidden bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700" id="alert-message"></p>
                </div>
            </div>
        </div>
    `;

    await loadWeatherData();
}

async function loadWeatherData() {
    try {
        // Get current weather for farm ID 1
        const weather = await getWeather(1);
        if (weather.success && weather.data) {
            document.getElementById('current-temp').textContent = `${weather.data.temperature}°C`;
            document.getElementById('current-humidity').textContent = `${weather.data.humidity}%`;
            document.getElementById('current-wind').textContent = `${weather.data.wind_speed} km/h`;
            document.getElementById('current-rain').textContent = `${weather.data.precipitation} mm`;
            document.getElementById('current-desc').textContent = 
                weather.data.precipitation > 0 ? 'Rainy' : 'Clear';
        }

        // Get forecast
        const forecast = await getForecast(1, 7);
        if (forecast.success && forecast.data) {
            document.getElementById('forecast-loading').style.display = 'none';
            const forecastList = document.getElementById('forecast-list');
            
            if (forecast.data.daily) {
                const daily = forecast.data.daily;
                const times = daily.time || [];
                const maxTemp = daily.temperature_2m_max || [];
                const minTemp = daily.temperature_2m_min || [];
                const rain = daily.precipitation_sum || [];
                
                forecastList.innerHTML = '';
                for (let i = 0; i < Math.min(7, times.length); i++) {
                    const date = new Date(times[i]).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                    });
                    
                    forecastList.innerHTML += `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span class="font-medium w-24">${date}</span>
                            <span class="text-blue-600">${minTemp[i]}°C - ${maxTemp[i]}°C</span>
                            <span class="text-gray-600">
                                <i class="fas fa-umbrella mr-1"></i>${rain[i]}mm
                            </span>
                        </div>
                    `;
                }
            } else {
                forecastList.innerHTML = '<p class="text-gray-500">No forecast data available</p>';
            }
        }

        // Check for weather alert
        const alertCheck = await getWeatherAlert(1);
        if (alertCheck.success && alertCheck.data && alertCheck.data.alert) {
            document.getElementById('weather-alert').classList.remove('hidden');
            document.getElementById('alert-message').textContent = alertCheck.data.alert;
        }

    } catch (error) {
        console.error('Error loading weather:', error);
        document.getElementById('forecast-loading').innerHTML = '<p class="text-red-500">Error loading weather data</p>';
    }
}