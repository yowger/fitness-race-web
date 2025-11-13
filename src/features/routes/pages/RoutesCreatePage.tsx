import { Map } from "@vis.gl/react-maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

const MAP_STYLE =
    "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

const CreateRoutesPage = () => {
    return (
        <div>
            <Map
                attributionControl={false}
                initialViewState={{
                    longitude: -100,
                    latitude: 40,
                    zoom: 3.5,
                }}
                style={{ width: 600, height: 400 }}
                mapStyle={MAP_STYLE}
            />
            ;
        </div>
    )
}

export default CreateRoutesPage
