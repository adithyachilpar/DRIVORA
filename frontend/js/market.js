async function loadMarketPage() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Market Prices</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Search Form -->
            <div class="lg:col-span-1 bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Search Prices</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
                        <select id="market-commodity" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="Tomato">Tomato</option>
                            <option value="Potato">Potato</option>
                            <option value="Onion">Onion</option>
                            <option value="Rice">Rice</option>
                            <option value="Wheat">Wheat</option>
                            <option value="Cotton">Cotton</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <select id="market-state" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Gujarat">Gujarat</option>
                        </select>
                    </div>
                    
                    <button onclick="searchMarketPrices()" class="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        Search Prices
                    </button>
                </div>
            </div>
            
            <!-- Market Summary -->
            <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Price Summary</h2>
                <div id="market-summary" class="text-center py-8 text-gray-500">
                    Select a commodity to view prices
                </div>
            </div>
        </div>
        
        <!-- Price History -->
        <div id="price-history" class="bg-white rounded-lg shadow-md p-6 card" style="display: none;">
            <h2 class="text-xl font-semibold mb-4">Recent Prices</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modal Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody id="price-table-body" class="bg-white divide-y divide-gray-200"></tbody>
                </table>
            </div>
        </div>
    `;
    
    // Load commodities
    await loadCommodities();
}

async function loadCommodities() {
    try {
        const result = await getCommodities();
        if (result.success && result.data && result.data.commodities) {
            const select = document.getElementById('market-commodity');
            select.innerHTML = '';
            result.data.commodities.forEach(commodity => {
                select.innerHTML += `<option value="${commodity}">${commodity}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading commodities:', error);
    }
}

async function searchMarketPrices() {
    const commodity = document.getElementById('market-commodity').value;
    const state = document.getElementById('market-state').value;
    
    document.getElementById('market-summary').innerHTML = '<div class="spinner mx-auto"></div>';
    document.getElementById('price-history').style.display = 'none';
    
    try {
        const result = await getMarketPrices(commodity, state);
        if (result.success && result.data) {
            // Update summary
            document.getElementById('market-summary').innerHTML = `
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Avg Price</p>
                        <p class="text-2xl font-bold text-green-600">₹${result.data.stats?.avg_modal_price || 'N/A'}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Price Range</p>
                        <p class="text-lg font-semibold">₹${result.data.stats?.min_price || 'N/A'} - ₹${result.data.stats?.max_price || 'N/A'}</p>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Trend</p>
                        <p class="text-lg font-semibold ${result.data.stats?.trend === 'up' ? 'text-green-600' : result.data.stats?.trend === 'down' ? 'text-red-600' : 'text-gray-600'}">
                            ${result.data.stats?.trend === 'up' ? '↑ Rising' : result.data.stats?.trend === 'down' ? '↓ Falling' : '→ Stable'}
                        </p>
                    </div>
                </div>
                <p class="mt-4 text-sm bg-blue-50 p-3 rounded-lg">${result.data.advice || 'No advice available'}</p>
            `;
            
            // Show price history
            if (result.data.prices && result.data.prices.length > 0) {
                document.getElementById('price-history').style.display = 'block';
                const tableBody = document.getElementById('price-table-body');
                tableBody.innerHTML = '';
                
                result.data.prices.forEach(price => {
                    tableBody.innerHTML += `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${price.market || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${price.min_price || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${price.max_price || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${price.modal_price || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${price.arrival_date || '-'}</td>
                        </tr>
                    `;
                });
            }
        } else {
            document.getElementById('market-summary').innerHTML = '<p class="text-red-500">No data found</p>';
        }
    } catch (error) {
        console.error('Error searching market prices:', error);
        document.getElementById('market-summary').innerHTML = '<p class="text-red-500">Error loading prices</p>';
    }
}