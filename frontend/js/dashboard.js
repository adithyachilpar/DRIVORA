async function loadDashboard() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6 card">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-blue-500 p-3 rounded-lg">
                        <i class="fas fa-cloud-sun text-white text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold" id="weather-temp">--°C</span>
                </div>
                <h3 class="text-lg font-semibold">Weather</h3>
                <p class="text-sm text-gray-600" id="weather-humidity">--% Humidity</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 card">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-green-500 p-3 rounded-lg">
                        <i class="fas fa-seedling text-white text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold" id="top-crop">--</span>
                </div>
                <h3 class="text-lg font-semibold">Top Crop</h3>
                <p class="text-sm text-gray-600" id="crop-match">--% Match</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 card">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-yellow-500 p-3 rounded-lg">
                        <i class="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold" id="market-price">₹--</span>
                </div>
                <h3 class="text-lg font-semibold">Market Price</h3>
                <p class="text-sm text-gray-600" id="market-crop">Tomato</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 card">
                <div class="flex items-center justify-between mb-4">
                    <div class="bg-red-500 p-3 rounded-lg">
                        <i class="fas fa-leaf text-white text-xl"></i>
                    </div>
                    <span class="text-2xl font-bold" id="disease-status">0</span>
                </div>
                <h3 class="text-lg font-semibold">Disease Alerts</h3>
                <p class="text-sm text-gray-600" id="disease-desc">No issues</p>
            </div>
        </div>

        <!-- Quick Actions -->
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div onclick="showPage('crops')" class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white cursor-pointer card">
                <h3 class="text-xl font-semibold mb-2">🌱 Get Crop Recommendations</h3>
                <p class="text-green-100 mb-4">Find the best crops for your farm based on soil and season</p>
                <span class="inline-flex items-center">
                    Try Now <i class="fas fa-arrow-right ml-2"></i>
                </span>
            </div>

            <div onclick="showPage('disease')" class="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white cursor-pointer card">
                <h3 class="text-xl font-semibold mb-2">🍃 Detect Plant Disease</h3>
                <p class="text-red-100 mb-4">Upload a photo of your crop and get instant diagnosis</p>
                <span class="inline-flex items-center">
                    Upload Now <i class="fas fa-arrow-right ml-2"></i>
                </span>
            </div>
        </div>

        <!-- Loading indicator -->
        <div id="dashboard-loading" class="flex justify-center">
            <div class="spinner"></div>
        </div>

        <!-- Recommendations Section -->
        <div id="recommendations-section" style="display: none;">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Recommended Crops</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="recommendations-list"></div>
        </div>
    `;

    // Load data
    await loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Get weather for farm ID 1
        const weather = await getWeather(1);
        if (weather.success && weather.data) {
            document.getElementById('weather-temp').textContent = `${weather.data.temperature}°C`;
            document.getElementById('weather-humidity').textContent = `${weather.data.humidity}% Humidity`;
        }

        // Get crop recommendations for farm ID 1
        const crops = await getFarmRecommendations(1);
        if (crops.success && crops.data && crops.data.recommendations) {
            document.getElementById('top-crop').textContent = crops.data.recommendations[0].crop_name;
            document.getElementById('crop-match').textContent = `${crops.data.recommendations[0].compatibility_score}% Match`;
            
            // Show recommendations
            const recommendationsList = document.getElementById('recommendations-list');
            recommendationsList.innerHTML = '';
            
            crops.data.recommendations.slice(0, 3).forEach(crop => {
                recommendationsList.innerHTML += `
                    <div class="bg-white rounded-lg shadow-md p-6 card">
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">${crop.crop_name}</h3>
                        <div class="mb-4">
                            <div class="flex justify-between text-sm mb-1">
                                <span>Compatibility</span>
                                <span>${crop.compatibility_score}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-green-600 rounded-full h-2" style="width: ${crop.compatibility_score}%"></div>
                            </div>
                        </div>
                        <div class="space-y-2 text-sm">
                            <p class="flex justify-between">
                                <span class="text-gray-600">Expected Profit:</span>
                                <span class="font-semibold text-green-600">₹${crop.financials.expected_profit.toLocaleString()}</span>
                            </p>
                            <p class="flex justify-between">
                                <span class="text-gray-600">Duration:</span>
                                <span class="font-semibold">${crop.details.duration_days} days</span>
                            </p>
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('recommendations-section').style.display = 'block';
        }

        // Get market prices for Tomato
        const market = await getMarketPrices('Tomato', 'Maharashtra');
        if (market.success && market.data) {
            document.getElementById('market-price').textContent = `₹${market.data.stats?.avg_modal_price || '--'}`;
        }

        // Hide loading
        document.getElementById('dashboard-loading').style.display = 'none';

    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('dashboard-loading').innerHTML = '<p class="text-red-500">Error loading data</p>';
    }
}