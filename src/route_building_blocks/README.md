[Extended Component Library](../../README.md)

# Route Building Blocks

The route data provider component, along with the route marker and polyline components, lets you choose how to display a route on a map using custom markers and polyline styles.

> In many cases, you can use the [Route Overview](../route_overview/README.md) component to easily display a route with a ready-made, familiar appearance. Route building blocks let you go beyond the Route Overview to create your own custom appearance of the markers and polylines.

To build your own custom rendering of a route, you'll want to combine the following:

* A [Route Data Provider](./route_data_provider/README.md) component to fetch data from the Directions API.
* One or more [Route Marker](./route_marker/README.md) or [Route Polyline](./route_polyline/README.md) building block components.

The building block components must be wrapped in both a data provider and a `<gmp-map>` component in your HTML. For example,

```html
<gmp-map center="37.5,-122.1" zoom="11" map-id="DEMO_MAP_ID">
  <gmpx-route-data-provider
      origin-address="San Francisco, CA"
      destination-address="Mountain View, CA">
    <gmpx-route-marker waypoint="origin"></gmpx-route-marker>
    <gmpx-route-marker waypoint="destination"></gmpx-route-marker>
    <gmpx-route-polyline></gmpx-route-polyline>
  </gmpx-route-data-provider>
</gmp-map>
```

The above example renders markers at the origin and destination of the route, and a basic polyline indicating the route path.


## Data provider

| Component                                                     | Description                                         |
| ------------------------------------------------------------- | --------------------------------------------------- |
| [`<gmpx-route-data-provider>`](route_data_provider/README.md) | Provides route data to child components as context. |

## Building block components

| Component                                           | Description                                                       |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| [`<gmpx-route-marker>`](route_marker/README.md)     | Renders a marker indicating the origin or destination of a route. |
| [`<gmpx-route-polyline>`](route_polyline/README.md) | Renders a polyline indicating the path of a route.                |



