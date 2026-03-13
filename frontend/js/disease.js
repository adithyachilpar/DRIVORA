function loadDiseasePage() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Disease Detection</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Upload Form -->
            <div class="bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Upload Plant Image</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Plant Name (Optional)</label>
                        <input type="text" id="plant-name" placeholder="e.g., Tomato, Potato, Rice" value="Tomato" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                        <input type="file" id="disease-image" accept="image/*" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    
                    <div id="image-preview" class="hidden mt-4">
                        <img id="preview-img" class="max-h-64 mx-auto rounded-lg shadow-md" alt="Preview">
                    </div>
                    
                    <div id="upload-progress" class="hidden">
                        <div class="flex justify-center">
                            <div class="spinner"></div>
                        </div>
                        <p class="text-center text-gray-600 mt-2">Analyzing image with AI...</p>
                    </div>
                    
                    <button onclick="detectDisease()" class="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        Detect Disease
                    </button>
                </div>
            </div>
            
            <!-- Results -->
            <div class="bg-white rounded-lg shadow-md p-6 card">
                <h2 class="text-xl font-semibold mb-4">Diagnosis Result</h2>
                <div id="disease-result" class="min-h-[200px] text-center text-gray-500 py-8">
                    Upload an image to see diagnosis
                </div>
            </div>
        </div>
        
        <!-- Common Diseases -->
        <div class="mt-8 bg-white rounded-lg shadow-md p-6 card">
            <h2 class="text-xl font-semibold mb-4">Common Diseases</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="common-diseases">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-semibold text-gray-900">Early Blight</h3>
                    <p class="text-sm text-gray-600 mt-1">Dark spots with concentric rings on leaves</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-semibold text-gray-900">Late Blight</h3>
                    <p class="text-sm text-gray-600 mt-1">Water-soaked spots, white fungal growth</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-semibold text-gray-900">Powdery Mildew</h3>
                    <p class="text-sm text-gray-600 mt-1">White powdery growth on leaves</p>
                </div>
            </div>
        </div>
    `;
    
    // Image preview
    document.getElementById('disease-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('preview-img').src = e.target.result;
                document.getElementById('image-preview').classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });
}

async function detectDisease() {
    const fileInput = document.getElementById('disease-image');
    const plantName = document.getElementById('plant-name').value;
    const resultDiv = document.getElementById('disease-result');
    const progressDiv = document.getElementById('upload-progress');
    
    if (!fileInput.files[0]) {
        alert('Please select an image');
        return;
    }
    
    // Show progress
    progressDiv.classList.remove('hidden');
    resultDiv.innerHTML = '';
    
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    if (plantName) {
        formData.append('plant_name', plantName);
    }
    
    try {
        console.log('Sending image to backend...');
        
        const response = await fetch('http://localhost:8000/api/disease/detect', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        // Hide progress
        progressDiv.classList.add('hidden');
        
        if (response.ok && result.success) {
            // Format the diagnosis nicely
            let diagnosisHtml = '';
            
            if (result.diagnosis) {
                // Convert markdown-style formatting to HTML
                diagnosisHtml = result.diagnosis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');
            }
            
            resultDiv.innerHTML = `
                <div class="text-left">
                    <div class="bg-${result.confidence === 'High' ? 'green' : result.confidence === 'Medium' ? 'yellow' : 'red'}-50 p-4 rounded-lg mb-4">
                        <h3 class="font-semibold text-lg">${result.disease_name || 'Diagnosis'}</h3>
                        <p class="text-sm mt-1">Confidence: ${result.confidence || 'Medium'}</p>
                    </div>
                    <div class="prose max-w-none text-gray-700">
                        ${diagnosisHtml || 'No diagnosis available'}
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="text-left text-red-600">
                    <p class="font-semibold">Error: ${result.error || 'Unknown error'}</p>
                    <p class="text-sm mt-2">${result.message || 'Please try again'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error detecting disease:', error);
        progressDiv.classList.add('hidden');
        resultDiv.innerHTML = `
            <div class="text-left text-red-600">
                <p class="font-semibold">Connection Error</p>
                <p class="text-sm mt-2">${error.message}</p>
                <p class="text-sm mt-4">Make sure backend is running at http://localhost:8000</p>
            </div>
        `;
    }
}