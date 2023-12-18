[Extended Component Library](../../README.md)

# Store Locator: `<gmpx-store-locator>` (as class `StoreLocator`)

The store locator component displays an experience where your website's users
can browse a list of locations, find the nearest one, and view details.

While store locations are the most common use case, you can use this
component to show many nearby points of interest like parks, ATMs, or gas
stations.

To use `<gmpx-store-locator>`, pass it a JavaScript array containing the
locations you want to present. Each location, called a listing, is defined as
an object with the following properties:

```
interface StoreLocatorListing {
  // Name of the location or store
  title: string;

  // Address lines, used when displaying the list.
  addressLines?: string[];

  // Geographic coordinates of the location
  position: LatLng|LatLngLiteral;

  // Place ID for this location, used to retrieve additional details
  placeId?: string;

  // Optional list of additional actions to display with each location
  actions?: StoreLocatorAction[];
}

interface StoreLocatorAction {
  // Button label for this action
  label: string;

  // URI that will be opened in a new tab
  defaultUri?: string;
}
```

See below for a full example.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-store-locator>` on a page:

```
import '@googlemaps/extended-component-library/store_locator.js';
```

When bundling your dependencies and you need to access the class `StoreLocator` directly (less common):

```
import { StoreLocator } from '@googlemaps/extended-component-library/store_locator.js';
```

## Attributes and properties

| Attribute     | Property     | Property type                                  | Description                                                                                                                                                                                                                                                                                                                     | Default                                                                  | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ------------- | ------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `feature-set` | `featureSet` | `FeatureSet`                                   | Chooses the capabilities of this store locator:<br/><br/>* `'basic'` shows a list of locations with pins on a map.<br/><br/>* `'intermediate'` adds a search input so users can find the location closest to them.<br/><br/>* `'advanced'` brings in a Place details view to show photos, hours, and reviews for each location. |                                                                          | ✅                                                                                                              |
| `map-id`      | `mapId`      | `string \| undefined`                          | The Map ID of the map. See the [Map ID documentation](https://developers.google.com/maps/documentation/get-map-id?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components) for more information.                                                                                                                                                                                        |                                                                          | ✅                                                                                                              |
|               | `listings`   | `StoreLocatorListing[] \| undefined`           | List of locations to display in the store locator.                                                                                                                                                                                                                                                                              |                                                                          | ❌                                                                                                              |
|               | `mapOptions` | `Partial<google.maps.MapOptions> \| undefined` | Overrides for the map options. Provide values for `center` and `zoom` to display a map when `listings` is empty.                                                                                                                                                                                                                | `{   mapTypeControl: false,   maxZoom: 17,   streetViewControl: false }` | ❌                                                                                                              |

## Methods

### `configureFromQuickBuilder(configuration)`

Configures the Store Locator component from data generated by the [Quick
Builder
tool](https://console.cloud.google.com/google/maps-apis/build/locator-plus?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)
in the Maps Console.

**Parameters:**

| Name            | Optional? | Type                        | Description                                                   |
| --------------- | --------- | --------------------------- | ------------------------------------------------------------- |
| `configuration` |           | `QuickBuilderConfiguration` | The configuration object generated by the Quick Builder tool. |

## Styling

You can use most built-in CSS properties to control the positioning or display of this component, similar to a `<span>` or `<div>` element. The component also supports the following styling inputs for more customization:

### CSS Custom Properties

| Name                                      | Default                          | Description                                                                                                                                           |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--gmpx-color-surface`                    | `#fff`                           | Background color. 🌎                                                                                                                                  |
| `--gmpx-color-on-surface`                 | `#212121`                        | Main text color. 🌎                                                                                                                                   |
| `--gmpx-color-on-surface-variant`         | `#757575`                        | Color of less important text such as captions. 🌎                                                                                                     |
| `--gmpx-color-primary`                    | `#1976d2`                        | Color of buttons and icons. 🌎                                                                                                                        |
| `--gmpx-color-outline`                    | `#e0e0e0`                        | Button outline and divider color. 🌎                                                                                                                  |
| `--gmpx-fixed-panel-width-row-layout`     | `28.5em`                         | Controls the side panel width when the component is displayed in row direction. The map width will adjust automatically to fill remaining space.      |
| `--gmpx-fixed-panel-height-column-layout` | `65%`                            | Controls the side panel height when the component is displayed in column direction. The map height will adjust automatically to fill remaining space. |
| `--gmpx-font-family-base`                 | `'Google Sans Text', sans-serif` | Font family for regular text. 🌎                                                                                                                      |
| `--gmpx-font-family-headings`             | `--gmpx-font-family-base`        | Font family for headings. 🌎                                                                                                                          |
| `--gmpx-font-size-base`                   | `0.875rem`                       | Text size, sets scale for the component. 🌎                                                                                                           |
| `--gmpx-hours-color-open`                 | `#188038`                        | Opening hours text color when the place is open (`advanced` feature set only).                                                                        |
| `--gmpx-hours-color-closed`               | `#d50000`                        | Opening hours text color when the place is closed (`advanced` feature set only).                                                                      |
| `--gmpx-rating-color`                     | `#ffb300`                        | Color of star rating icons in the details view (`advanced` feature set only).                                                                         |
| `--gmpx-rating-color-empty`               | `#e0e0e0`                        | Background color of star rating icons in the details view (`advanced` feature set only).                                                              |

🌎 _indicates a global style token shared by
                                    multiple components. Please see the library
                                    Readme for more information._



## Examples

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



## APIs and Pricing

In addition to the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components), this component relies on the following Google Maps Platform APIs which may incur cost and must be enabled.


### Maps JavaScript API

Used to display a map.

#### Documentation

[Adding a map to your website with Web Components](https://developers.google.com/maps/documentation/javascript/web-components/overview?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)

#### Pricing

* [SKU: Dynamic Maps](https://developers.google.com/maps/documentation/javascript/usage-and-billing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#dynamic-maps)

### Places API

This component uses the Places API in two ways:

1. Places Autocomplete to help an end user specify their location (intermediate and advanced feature sets only).
2. Place Details to view more information about a selected listing (advanced feature set only).

#### Documentation

* Autocomplete search for the end user's location (intermediate and advanced feature sets only):
  * Places API [Autocomplete documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components). 
* Fetching Places data for the "view details" panel (advanced feature set only):
  * [Place class documentation](https://developers.google.com/maps/documentation/javascript/place?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)
  * Displaying Places photos (advanced feature set only): [Photos documentation](https://developers.google.com/maps/documentation/javascript/places?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#places_photos)

Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

- [SKU: Autocomplete (included with Place Details) – Per Session](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#ac-with-details-session)
- [SKU: Find Place](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#find-place) (fallback query)
- [SKU: Place Details](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#places-details)
- [SKU: Basic Data](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#basic-data)
- [SKU: Contact Data](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#contact-data)
- [SKU: Atmosphere Data](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#atmosphere-data) 
- [SKU: Place Photo](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#places-photo)

### Directions API

Used to display a route from the end user's location to the selected listing, advanced feature set only.

#### Documentation

[Directions API documentation](https://developers.google.com/maps/documentation/javascript/directions?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components). Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

- [SKU: Directions](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#directions)

### Distance Matrix API

Used to sort and display travel times from the end user's location. Intermediate and advanced feature sets only.

#### Documentation

[Distance Matrix API documentation](https://developers.google.com/maps/documentation/javascript/distancematrix?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)

#### Pricing

- [SKU: Distance Matrix](https://developers.google.com/maps/documentation/distance-matrix/usage-and-billing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)



