
var map;

var defaultCoordinates = [{
    "lat": -23.56996189423875,
    "lng": -46.65141653365975
}, {
    "lat": -23.57997497987705,
    "lng": -46.6491940773286
}, {
    "lat": -23.581153,
    "lng": -46.663667
}, {
    "lat": -23.581645286215887,
    "lng": -46.64944620296468
}];


function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        // draggable: true,
        suppressMarkers: true
    });
    var mapCenter = new google.maps.LatLng(defaultCoordinates[defaultCoordinates.length - 1].lat, defaultCoordinates[defaultCoordinates.length - 1].lng);
    var mapOptions = {
        zoom: 15,
        center: mapCenter
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
}