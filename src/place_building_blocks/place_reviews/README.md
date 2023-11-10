[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Reviews: `<gmpx-place-reviews>` (as class `PlaceReviews`)

Renders a list of user-generated place reviews.

Reviews are displayed in an order corresponding to the default behavior of
the [Place
API](https://developers.google.com/maps/documentation/javascript/reference/place?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#Place).

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-reviews>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_reviews.js';
```

When bundling your dependencies and you need to access the class `PlaceReviews` directly (less common):

```
import { PlaceReviews } from '@googlemaps/extended-component-library/place_building_blocks/place_reviews.js';
```

## Attributes and properties

| Attribute     | Property     | Property type                         | Description                                                                                                                                                                                                                                                      | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ------------- | ------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `max-reviews` | `maxReviews` | `number \| undefined`                 | The maximum number of reviews to display. If undefined, displays all reviews returned by the Places API, which provides at most 5.                                                                                                                               |         | ✅                                                                                                              |
|               | `place`      | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |         | ❌                                                                                                              |
| `no-data`     | `noData`     | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`  | ✅                                                                                                              |

## Styling

You can use most built-in CSS properties to control the positioning or display of this component, similar to a `<span>` or `<div>` element. The component also supports the following styling inputs for more customization:

### CSS Custom Properties

| Name                        | Default   | Description                                 |
| --------------------------- | --------- | ------------------------------------------- |
| `--gmpx-rating-color`       | `#ffb300` | Color of the star rating icons when filled. |
| `--gmpx-rating-color-empty` | `#e0e0e0` | Color of the star rating icons when empty.  |
| `--gmpx-color-outline`      | `#e0e0e0` | Divider color. 🌎                           |

🌎 _indicates a global style token shared by
                                    multiple components. Please see the library
                                    Readme for more information._



