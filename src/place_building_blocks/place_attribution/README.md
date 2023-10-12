[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Attribution: `<gmpx-place-attribution>` (as class `PlaceAttribution`)

Component that renders any listing attributions from the Places API.

When displaying data from the Places API, you are [required to
display](https://developers.google.com/maps/documentation/places/web-service/policies?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#other_attribution_requirements)
any attributions present in the response. This component assists in rendering
these listing attributions from a `Place` or `PlaceResult` object.

The Place Data Provider component will automatically insert a Place
Attribution component if you do not include one. Please note that failure to
display this component can result in a violation of the Google Maps Platform
Terms Of Service.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-attribution>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_attribution.js';
```

When bundling your dependencies and you need to access the class `PlaceAttribution` directly (less common):

```
import { PlaceAttribution } from '@googlemaps/extended-component-library/place_building_blocks/place_attribution.js';
```

## Attributes and properties

| Attribute | Property | Property type                         | Description                                                                                                                                                                                                                                                      | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| --------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
|           | `place`  | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |         | ❌                                                                                                              |
| `no-data` | `noData` | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`  | ✅                                                                                                              |

## Styling

This is a low-level component designed to be styled with built-in CSS properties. For most styling purposes, it is equivalent to a `<span>` element.

For example, by default this component will inherit the color of its parent element. However, you can change the color by writing the following CSS:


```css
gmpx-place-attribution {
  color: blue;
}
```



