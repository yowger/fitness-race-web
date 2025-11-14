export interface LatLng {
    lat: number
    lng: number
}

export interface MapMatchingResponse {
    type: "FeatureCollection"
    features: MapMatchingFeature[]
    waypoints: MapMatchingWaypoint[]
    mode: string
    time: number
}

export interface MapMatchingFeature {
    type: "Feature"
    geometry: {
        type: "MultiLineString"
        coordinates: [number, number][][]
    }
    properties: {
        distance: number
        time: number
        legs: MapMatchingLeg[]
    }
}

export interface MapMatchingLeg {
    distance: number
    steps: MapMatchingStep[]
}

export interface MapMatchingStep {
    begin_bearing: number
    end_bearing: number
    distance: number
    from_index: number
    to_index: number
    lane_count: number
    name: string
    osm_way_id: number
    road_class: string
    surface: string
    speed: number
    speed_limit: number
    time: number
    roundabout: boolean
    bridge: boolean
    tunnel: boolean
    toll: boolean
    traversability: string
}

export interface MapMatchingWaypoint {
    original_index: number
    location: [number, number]
    original_location: [number, number]
    match_distance: number
    match_type: "matched" | "unmatched"
    leg_index: number
    step_index: number
}
