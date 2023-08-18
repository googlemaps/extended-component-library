### Use the default marker pin

When the Route Marker has no slotted content, it will appear as the Advanced Marker's default red pin.

```html
<gmp-map map-id="DEMO_MAP_ID">
  <gmpx-route-data-provider
      origin-address="Shinjuku Central Park, Tokyo"
      destination-address="Shinjuku Gyoen, Tokyo"
      travel-mode="walking">
    <gmpx-route-marker waypoint="origin" title="Shinjuku Central Park">
    </gmpx-route-marker>
    <gmpx-route-marker waypoint="destination" title="Shinjuku Gyoen">
    </gmpx-route-marker>
    <gmpx-route-polyline
        stroke-color="steelblue"
        stroke-weight="7"
        stroke-opacity="0.7"
        fit-in-viewport>
    </gmpx-route-polyline>
  </gmpx-route-data-provider>
</gmp-map>
```

![Pin markers](./doc_src/pin-markers.png)

### Render custom marker content

When an element is slotted in the route marker, it will be rendered instead of the default pin. 

Note that the element will be detached from the DOM, so its styling must be self-contained as below.

```html
    <gmpx-route-marker waypoint="origin" title="Shinjuku Central Park">
      <div style="
          background-color: white;
          border: 3px solid black;
          border-radius: 10px;
          height: 10px;
          position: relative;
          top: 8px;
          width: 10px;">
      </div>
    </gmpx-route-marker>
    <gmpx-route-marker waypoint="destination" title="Shinjuku Gyoen">
      <svg width="20" height="20" style="position: relative; top: 13px;">
        <circle cx="10" cy="10" r="7" stroke="black" stroke-width="3" fill="white"/>
        <circle cx="10" cy="10" r="1.8" stroke="black" stroke-width="3" fill="black"/>
      </svg>
    </gmpx-route-marker>
```

![Circle markers](./doc_src/circle-markers.png)
