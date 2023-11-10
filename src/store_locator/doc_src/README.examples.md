### Configuring and displaying a locator for National Parks

Start by adding a store locator component to your page's HTML. If you haven't already, add an [API loader](../api_loader/README.md) to initialize the Maps JavaScript SDK.

```html
<gmpx-api-loader key="MY_API_KEY"></gmpx-api-loader>
<gmpx-store-locator map-id="DEMO_MAP_ID"></gmpx-store-locator>
```

Next, use JavaScript to configure a list of park locations. This could be in a short `<script>` tag or part of your website's JS bundle:

```js
document.addEventListener('DOMContentLoaded', () => {
  const locator = document.querySelector('gmpx-store-locator');
  locator.listings = [
    {
      title: 'Bryce Canyon National Park',
      addressLines: ['Utah', 'USA'],
      position: {'lat': 37.6404, 'lng': -112.1696},
      placeId: 'ChIJLevDAsZrNYcRBm2svvvY6Ws',
      actions: [{
        label: 'Website',
        defaultUri:
            'https://www.nps.gov/brca/index.htm'
      }]
    },
    {
      title: 'Everglades National Park',
      addressLines: ['Florida', 'USA'],
      position: {'lat': 25.3952, 'lng': -80.5831},
      placeId: 'ChIJ2wVsejCo0IgRlzEvdlY-4A8',
      actions: [{
        label: 'Website',
        defaultUri:
            'https://www.nps.gov/ever/index.htm'
      }]
    }
  ];
});
```

Finally, use CSS to customize the size and appearance of the store locator:

```css
gmpx-store-locator {
  width: 100%;
  height: 40em;
  --gmpx-color-surface: #fdfaf2;
  --gmpx-color-on-surface: ##355034;
  --gmpx-color-on-surface-variant: #8f8f8f;
  --gmpx-color-primary: #3f7843;
  --gmpx-font-family-base: "Times", serif;
  --gmpx-font-family-headings: "Roboto", sans-serif;
}
```