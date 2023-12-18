[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Textual Place Field: `<gmpx-place-field-text>` (as class `PlaceFieldText`)

Component that renders a string or numeric field of a `Place` or
`PlaceResult` as text. It can also render the field "types", in which case it
will show only the most applicable place type, if available.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-field-text>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_field_text.js';
```

When bundling your dependencies and you need to access the class `PlaceFieldText` directly (less common):

```
import { PlaceFieldText } from '@googlemaps/extended-component-library/place_building_blocks/place_field_text.js';
```

## Attributes and properties

| Attribute | Property | Property type                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| --------- | -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `field`   | `field`  | `TextField \| undefined`              | The field to display, formatted as it is on either a `Place` or `PlaceResult`.<br/><br/>Allowed [`Place` fields](https://developers.google.com/maps/documentation/javascript/reference/place?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components) are: `businessStatus`, `displayName`, `formattedAddress`, `id`, `internationalPhoneNumber`, `location`, `location.lat`, `location.lng`, `nationalPhoneNumber`, `plusCode.compoundCode`, `plusCode.globalCode`, `rating`, `types`, and `userRatingCount`.<br/><br/>You may also specify one of the equivalent [`PlaceResult` field names](https://developers.google.com/maps/documentation/javascript/reference/places-service?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#PlaceResult): `business_status`, `name`, `formatted_address`, `place_id`, `international_phone_number`, `geometry.location`, `geometry.location.lat`, `geometry.location.lng`, `formatted_phone_number`, `plus_code.compound_code`, `plus_code.global_code`, `rating`, `types`, and `user_ratings_total`. |         | ✅                                                                                                              |
|           | `place`  | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |         | ❌                                                                                                              |
| `no-data` | `noData` | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `true`  | ✅                                                                                                              |

## Styling

This is a low-level component designed to be styled with built-in CSS properties. For most styling purposes, it is equivalent to a `<span>` element.

For example, by default this component will inherit the color of its parent element. However, you can change the color by writing the following CSS:


```css
gmpx-place-field-text {
  color: blue;
}
```



