export const getBoundsFromCoords = (coords: [number, number][]) => {
    let minLng = coords[0][0]
    let minLat = coords[0][1]
    let maxLng = coords[0][0]
    let maxLat = coords[0][1]

    coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng)
        minLat = Math.min(minLat, lat)
        maxLng = Math.max(maxLng, lng)
        maxLat = Math.max(maxLat, lat)
    })

    return [
        [minLng, minLat],
        [maxLng, maxLat],
    ] as [[number, number], [number, number]]
}

export function clampToBounds(
    map: maplibregl.Map,
    lng: number,
    lat: number,
    padding = 24
): [number, number] {
    const canvas = map.getCanvas()
    const width = canvas.width
    const height = canvas.height

    const point = map.project([lng, lat])

    const clampedX = Math.min(Math.max(point.x, padding), width - padding)

    const clampedY = Math.min(Math.max(point.y, padding), height - padding)

    return map.unproject([clampedX, clampedY]).toArray()
}
