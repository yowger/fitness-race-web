declare module "togpx" {
    import type { FeatureCollection } from "geojson"

    interface TogpxOptions {
        creator?: string
        metadata?: Record<string, string>
    }

    function togpx(geojson: FeatureCollection, options?: TogpxOptions): string

    export = togpx
}
