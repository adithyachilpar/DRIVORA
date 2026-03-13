// Page navigation
function showPage(pageName) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(`link-${pageName}`).classList.add('active');

    // Load page content
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'weather':
            loadWeatherPage();
            break;
        case 'crops':
            loadCropsPage();
            break;
        case 'disease':
            loadDiseasePage();
            break;
        case 'market':
            loadMarketPage();
            break;
    }
}

// Load dashboard by default
document.addEventListener('DOMContentLoaded', () => {
    showPage('dashboard');
});