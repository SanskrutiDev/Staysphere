// document.addEventListener("DOMContentLoaded", function () {
//     const map = L.map('map').setView([19.0760, 72.8777], 13); // Set initial location (Mumbai in this case)

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//     }).addTo(map);

//     // Optional: Add a default marker
//     L.marker([19.0760, 72.8777]).addTo(map)
//         .bindPopup(`${listing.title},${listing.description}`)
//         .openPopup();
//  });
document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map and set a default view
    const map = L.map('map').setView([0, 0], 13); // Default view

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Function to handle success callback for geolocation
    function onLocationFound(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const title = listing.title;

        console.log(`Latitude: ${lat}, Longitude: ${lon}, title:${title}`); // Debugging line

        // Center the map on the user's location
        map.setView([lat, lon], 13);

        // Add a marker for the user's location
        L.marker([lat, lon]).addTo(map)
        .bindPopup(`${listing.location}`)
        .openPopup();
    }

    // Function to handle error callback for geolocation
    function onLocationError(error) {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location.');
    }

    // Check if the browser supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationFound, onLocationError);
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});


