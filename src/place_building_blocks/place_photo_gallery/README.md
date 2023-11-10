[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Photo Gallery: `<gmpx-place-photo-gallery>` (as class `PlacePhotoGallery`)

Component that displays photos of this place as tiles, with a lightbox view
when a photo is clicked. The lightbox includes proper photo attribution.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-photo-gallery>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_photo_gallery.js';
```

When bundling your dependencies and you need to access the class `PlacePhotoGallery` directly (less common):

```
import { PlacePhotoGallery } from '@googlemaps/extended-component-library/place_building_blocks/place_photo_gallery.js';
```

## Attributes and properties

| Attribute   | Property   | Property type                         | Description                                                                                                                                                                                                                                                      | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ----------- | ---------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `max-tiles` | `maxTiles` | `number \| undefined`                 | The maximum number of photos to display as tiles. If undefined, all available photos from the Place object will be displayed.<br/><br/>Note that the Places API can fetch up to ten photos of a place.                                                           |         | ✅                                                                                                              |
|             | `place`    | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |         | ❌                                                                                                              |
| `no-data`   | `noData`   | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`  | ✅                                                                                                              |

## Styling

You can use most built-in CSS properties to control the positioning or display of this component, similar to a `<span>` or `<div>` element. The component also supports the following styling inputs for more customization:

### CSS Custom Properties

| Name                          | Default                          | Description                                        |
| ----------------------------- | -------------------------------- | -------------------------------------------------- |
| `--gmpx-font-family-base`     | `'Google Sans Text', sans-serif` | Font family used for captions in the lightbox. 🌎  |
| `--gmpx-font-family-headings` | `--gmpx-font-family-base`        | Font family of the place title in the lightbox. 🌎 |
| `--gmpx-font-size-base`       | `0.875rem`                       | Used to scale the component. 🌎                    |

🌎 _indicates a global style token shared by
                                    multiple components. Please see the library
                                    Readme for more information._

### CSS Parts

| Name   | Description                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `tile` | Styles each individual photo tile, including border radius, width/height, margin, background color before image is loaded, etc. |



## APIs and Pricing

In addition to the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components), this component relies on the following Google Maps Platform APIs which may incur cost and must be enabled.

### Places Photos API

In addition to any APIs used by the Place Data Provider component, Photo Gallery relies on the Places Photos API to load image content for images associated with a Place.

#### Documentation

Places API [Photos documentation](https://developers.google.com/maps/documentation/javascript/places?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#places_photos). Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

- [SKU: Place Photo](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#places-photo)

