### Show a route on a map

To show a driving route between two locations, simply place a Route Overview inside a `<gmp-map>` element with origin and destination attributes set. The Route Overview will automatically set the map's viewport to show the route, so there's no need to set the `center` or `zoom` on the map element.

```html
<gmp-map map-id="DEMO_MAP_ID">
  <gmpx-route-overview origin-address="Amsterdam" destination-address="Berlin">
  </gmpx-route-overview>
</gmp-map>
```

![Route overview](./doc_src/route-overview.png)

### Use a Place ID, lat/lng coordinates, and custom travel mode

```html
<gmp-map map-id="DEMO_MAP_ID">
  <gmpx-route-overview
      origin-lat-lng="37.77,-122.42"
      destination-place-id="ChIJj61dQgK6j4AR4GeTYWZsKWw"
      travel-mode="transit">
  </gmpx-route-overview>
</gmp-map>
```
