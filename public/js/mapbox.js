

export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiaWtlbm5hLWRldmVsb3BlciIsImEiOiJjbGJ5bDRidGQxNmR0M3htcnI0MmNsbzM1In0.GJrO2d4rT2ftU6oIYQiazA';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ikenna-developer/clbymdd2g000314o7xg8vkqhm',
        scrollZoom: false

    });

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach((location) => {
        //Create marker
        const element = document.createElement("div")
        element.className = "marker"
        // Add marker
        new mapboxgl.Marker({
            element: element,
            anchor: "bottom"
        }).setLngLat(location.coordinates).addTo(map)

        // Extend map bounds to include locations
        bounds.extend(location.coordinates)

        //Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(location.coordinates)
            .setHTML(`<p>
    Day ${location.day}: ${location.description}
    </p>`).addTo(map)
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100

        }
    })

}
