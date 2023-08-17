[Extended Component Library](../../../README.md) » [Route Building Blocks](../README.md)

# `<gmpx-route-marker>` (as class `RouteMarker`)

Renders a marker indicating the origin or destination of a route.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-route-marker>` on a page:

```
import '@googlemaps/extended-component-library/route_building_blocks/route_marker.js';
```

When bundling your dependencies and you need to access the class `RouteMarker` directly (less common):

```
import { RouteMarker } from '@googlemaps/extended-component-library/route_building_blocks/route_marker.js';
```

## Attributes and properties

| Attribute  | Property             | Property type                        | Description                                                                                                                                                              | Default    | Reflects? |
| ---------- | -------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | --------- |
| `waypoint` | `waypoint`           | `'origin'\|'destination'`            | Which waypoint of the route to position the marker on. For now, this is either "origin" or "destination"; intermediate waypoints are not yet supported.                  | `'origin'` | ✅         |
| `title`    | `title`              | `string`                             | Rollover text for the marker, displayed on mouse hover.                                                                                                                  | `''`       | ✅         |
|            | `zIndex`             | `number\|null \| undefined`          | The z-index of the marker relative to other Advanced Markers.                                                                                                            |            | ❌         |
|            | `innerMarker`        | `AdvancedMarkerElement\|undefined`   | The inner `google.maps.marker.AdvancedMarkerElement` from the Maps JS API. This value is set once `innerMarkerPromise` is resolved.                                      |            | ❌         |
|            | `innerMarkerPromise` | `Promise<AdvancedMarkerElement>`     | Resolves to the inner marker when it's ready. It might not be ready immediately becasue the `AdvancedMarkerElement` class is loaded asynchronously from the Maps JS API. |            | ❌         |
|            | `route`              | `DirectionsRoute\|null \| undefined` | Route data to render, overriding anything provided by context.                                                                                                           |            | ❌         |

## Slots

| Slot name   | Description                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| *(default)* | An element to be used as custom marker content on the map. The element will be detached from the DOM and moved into the map's implementation. |



