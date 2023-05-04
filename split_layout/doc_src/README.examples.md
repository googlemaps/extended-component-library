### Full page map and side panel

Split Layout is a good way to show a map next to conditional content. This example shows how the layout accommodates a map (main panel) and a Place Overview (fixed panel):

```html
<gmpx-split-layout>
  <gmp-map slot="main" center="-25.344,131.031" zoom="4" map-id="DEMO_MAP_ID">
    <gmp-advanced-marker position="-25.344,131.031"></gmp-advanced-marker>
  </gmp-map>
  <div slot="fixed">
    <h3>More information</h3>
    <gmpx-place-overview place="ChIJI1JibStsIysRIV_Fm03NqEM"></gmpx-place-overview>
  </div>
</gmpx-split-layout>
```

The `<gmpx-split-layout>` element, by default, will attempt to fill the height of its container. To make the above example fill the whole screen, place it directly inside the `<body>` tag, and make sure to include the following CSS:

```css
html, body {
  height: 100%;
  margin: 0;
}
```