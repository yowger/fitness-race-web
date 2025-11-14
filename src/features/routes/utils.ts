export function getDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
) {
    const R = 6371 // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export function getRouteDistance(routePoints: { lat: number; lng: number }[]) {
    let distance = 0
    for (let i = 1; i < routePoints.length; i++) {
        distance += getDistanceKm(
            routePoints[i - 1].lat,
            routePoints[i - 1].lng,
            routePoints[i].lat,
            routePoints[i].lng
        )
    }
    return distance
}
