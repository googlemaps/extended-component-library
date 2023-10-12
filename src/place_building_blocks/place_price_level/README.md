[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Price Level: `<gmpx-place-price-level>` (as class `PlacePriceLevel`)

Renders a symbolic representation of a place's price level (e.g. $$$).

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-price-level>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_price_level.js';
```

When bundling your dependencies and you need to access the class `PlacePriceLevel` directly (less common):

```
import { PlacePriceLevel } from '@googlemaps/extended-component-library/place_building_blocks/place_price_level.js';
```

## Attributes and properties

| Attribute | Property | Property type                         | Description                                                                                                                                                                                                                                                      | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| --------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `symbol`  | `symbol` | `string`                              | The currency symbol (such as $) to use.                                                                                                                                                                                                                          | `'$'`   | ✅                                                                                                              |
|           | `place`  | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |         | ❌                                                                                                              |
| `no-data` | `noData` | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`  | ✅                                                                                                              |

## Styling

This is a low-level component designed to be styled with built-in CSS properties. For most styling purposes, it is equivalent to a `<span>` element.

For example, by default this component will inherit the color of its parent element. However, you can change the color by writing the following CSS:


```css
gmpx-place-price-level {
  color: blue;
}
```



