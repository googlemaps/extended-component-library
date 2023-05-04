[Extended Component Library](../../README.md) » [Place Building Blocks](../README.md)

# Boolean Place Field: `<gmpx-place-field-boolean>` (as class `PlaceFieldBoolean`)

Component that conditionally renders content depending on the value of a
boolean field, or the `isOpen()` method which returns a boolean.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-field-boolean>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_field_boolean.js';
```

When bundling your dependencies and you need to access the class `PlaceFieldBoolean` directly (less common):

```
import { PlaceFieldBoolean } from '@googlemaps/extended-component-library/place_building_blocks/place_field_boolean.js';
```

## Attributes and properties

| Attribute | Property | Property type                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Default | Reflects? |
| --------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------- |
| `field`   | `field`  | `BooleanField \| undefined`                                                 | The field to display, formatted as it is on either a `Place` or `PlaceResult`.<br/><br/>Allowed [Place fields](https://developers.google.com/maps/documentation/javascript/reference/place?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components) are `hasCurbsidePickup`, `hasDelivery`, `hasDineIn`, `hasTakeout`, `hasWheelchairAccessibleEntrance`, `isReservable`, `servesBeer`, `servesBreakfast`, `servesBrunch`, `servesDinner`, `servesLunch`, `servesVegetarianFood`, `servesWine`, and `isOpen()`. Please note that only `isOpen()` is supported by the legacy [`PlaceResult` class](https://developers.google.com/maps/documentation/javascript/reference/places-service?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#PlaceResult).<br/><br/>The component also supports the `PlaceResult` field specifier `opening_hours.isOpen()` as an alias for `isOpen()`. |         | ✅         |
|           | `place`  | `google.maps.places.Place\|google.maps.places.PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |         | ❌         |
| `no-data` | `noData` | `boolean`                                                                   | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `true`  | ✅         |



