[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Rating: `<gmpx-place-rating>` (as class `PlaceRating`)

Renders a place's star rating in either full (4.9 ★★★★★) or condensed
(4.9 ★) form.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-rating>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_rating.js';
```

When bundling your dependencies and you need to access the class `PlaceRating` directly (less common):

```
import { PlaceRating } from '@googlemaps/extended-component-library/place_building_blocks/place_rating.js';
```

## Attributes and properties

| Attribute   | Property    | Property type                         | Description                                                                                                                                                                                                                                                      | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ----------- | ----------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `condensed` | `condensed` | `boolean`                             | Render a condensed star rating (4.9 ★) instead of the full format (4.9 ★★★★★).                                                                                                                                                                                   | `false` | ✅                                                                                                              |
|             | `place`     | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |         | ❌                                                                                                              |
| `no-data`   | `noData`    | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`  | ✅                                                                                                              |

## Styling

You can use most built-in CSS properties to control the positioning or display of this component, similar to a `<span>` or `<div>` element. The component also supports the following styling inputs for more customization:

### CSS Custom Properties

| Name                        | Default   | Description                                |
| --------------------------- | --------- | ------------------------------------------ |
| `--gmpx-rating-color`       | `#ffb300` | Color of the stars in a star rating.       |
| `--gmpx-rating-color-empty` | `#e0e0e0` | Color of the empty stars in a star rating. |



