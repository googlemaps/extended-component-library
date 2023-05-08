[Extended Component Library](../../README.md) » [Place Building Blocks](../README.md)

# Place Link: `<gmpx-place-field-link>` (as class `PlaceFieldLink`)

Component that renders an anchor tag to one of this place's URLs:
`websiteURI` or `googleMapsURI`. By default, renders a link to `websiteURI`
with the URL's domain as the text.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-field-link>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_field_link.js';
```

When bundling your dependencies and you need to access the class `PlaceFieldLink` directly (less common):

```
import { PlaceFieldLink } from '@googlemaps/extended-component-library/place_building_blocks/place_field_link.js';
```

## Attributes and properties

| Attribute    | Property    | Property type                                                               | Description                                                                                                                                                                                                                                                      | Default        | Reflects? |
| ------------ | ----------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------- |
| `href-field` | `hrefField` | `LinkField`                                                                 | The field to link to, formatted as it is on either a `Place` or `PlaceResult`.<br/><br/>Allowed fields are: `googleMapsURI` or `url` for a link to this place on Google Maps; `websiteURI` or `website` for a link to this place's website.                      | `'websiteURI'` | ✅         |
|              | `place`     | `google.maps.places.Place\|google.maps.places.PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |                | ❌         |
| `no-data`    | `noData`    | `boolean`                                                                   | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`         | ✅         |

## Styling

This is a low-level component designed to be styled with built-in CSS properties. For most styling purposes, it is equivalent to a `<span>` element.

For example, by default this component will inherit the color of its parent element. However, you can change the color by writing the following CSS:


```css
gmpx-place-field-link {
  color: blue;
}
```


