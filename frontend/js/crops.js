async function loadCropsPage() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Crop Recommendations</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Input Form -->
            <div class="bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Farm Details</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                        <select id="soil-type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="Black">Black Soil</option>
                            <option value="Loamy">Loamy Soil</option>
                            <option value="Clay">Clay Soil</option>
                            <option value="Sandy Loam">Sandy Loam</option>
                            <option value="Alluvial">Alluvial Soil</option>
                            <option value="Red">Red Soil</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <select id="state" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Gujarat">Gujarat</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Farm Size (acres)</label>
                        <input type="number" id="farm-size" value="5" min="0.5" step="0.5" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Budget (₹) - Optional</label>
                        <input type="number" id="budget" value="100000" step="10000" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    
                    <button onclick="getRecommendations()" class="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        Get Recommendations
                    </button>
                </div>
            </div>
            
            <!-- Season Info -->
            <div class="bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Current Season Info</h2>
                <div id="season-info-loading" class="flex justify-center py-4">
                    <div class="spinner"></div>
                </div>
                <div id="season-info" class="space-y-4"></div>
            </div>
        </div>
        
        <!-- Results -->
        <div id="recommendations-result" class="mt-8" style="display: none;">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Recommended Crops</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="crops-list"></div>
        </div>
    `;
    
    await loadSeasonInfo();
}

async function loadSeasonInfo() {
    try {
        const season = await getSeasonInfo();
        if (season.success && season.data) {
            document.getElementById('season-info-loading').style.display = 'none';
            document.getElementById('season-info').innerHTML = `
                <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-lg font-semibold text-green-800">Current Season: ${season.data.current_season}</p>
                    <p class="text-green-600 mt-2">${season.data.season_info}</p>
                </div>
                <div>
                    <h3 class="font-semibold mb-2">Suitable Crops:</h3>
                    <div class="flex flex-wrap gap-2">
                        ${(season.data.suitable_crops || []).map(crop => 
                            `<span class="px-3 py-1 bg-gray-100 rounded-full text-sm">${crop}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading season info:', error);
        document.getElementById('season-info-loading').innerHTML = '<p class="text-red-500">Error loading season info</p>';
    }
}

async function getRecommendations() {
    const soilType = document.getElementById('soil-type').value;
    const state = document.getElementById('state').value;
    const farmSize = document.getElementById('farm-size').value;
    const budget = document.getElementById('budget').value;
    
    document.getElementById('recommendations-result').style.display = 'block';
    document.getElementById('crops-list').innerHTML = '<div class="col-span-3 flex justify-center"><div class="spinner"></div></div>';
    
    try {
        const result = await getCropRecommendations(soilType, state, farmSize, budget);
        if (result.success && result.data && result.data.recommendations) {
            const cropsList = document.getElementById('crops-list');
            cropsList.innerHTML = '';
            
            result.data.recommendations.forEach(crop => {
                cropsList.innerHTML += `
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
                                <span class="text-gray-600">Duration:</span>
                                <span class="font-semibold">${crop.details.duration_days} days</span>
                            </p>
                            <p class="flex justify-between">
                                <span class="text-gray-600">Water Need:</span>
                                <span class="font-semibold">${crop.details.water_requirement}</span>
                            </p>
                            <p class="flex justify-between">
                                <span class="text-gray-600">Expected Profit:</span>
                                <span class="font-semibold text-green-600">₹${crop.financials.expected_profit.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                `;
            });
        } else {
            document.getElementById('crops-list').innerHTML = '<p class="text-red-500 col-span-3">No recommendations found</p>';
        }
    } catch (error) {
        console.error('Error getting recommendations:', error);
        document.getElementById('crops-list').innerHTML = '<p class="text-red-500 col-span-3">Error loading recommendations</p>';
    }
}