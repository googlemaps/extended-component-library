### Draw an outlined route polyline

You can use two Route Polyline components to draw a polyline with an outlined appearance.

```html
<gmp-map center="37.798,-122.344" zoom="12" map-id="DEMO_MAP_ID">
  <gmpx-route-data-provider
      origin-address="San Francisco, CA"
      destination-address="Oakland, CA">
    <gmpx-route-polyline
        stroke-color="#2565cd"
        stroke-weight="9"
        z-index="0"
        fit-in-viewport>
    </gmpx-route-polyline>
    <gmpx-route-polyline
        stroke-color="#1faefb"
        stroke-weight="5"
        z-index="1">
    </gmpx-route-polyline>
  </gmpx-route-data-provider>
</gmp-map>
```

![Outlined polyline](./doc_src/outlined-polyline.png)
