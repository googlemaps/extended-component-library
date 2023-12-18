[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Boolean Place Field: `<gmpx-place-field-boolean>` (as class `PlaceFieldBoolean`)

Component that conditionally renders content depending on the value of a
boolean field, or the `isOpen()` method which returns a boolean.

Include a child element with `slot="true"` to display content when the
boolean value is true. Likewise, a child element with `slot="false"` will be
displayed when the boolean value is false.

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

| Attribute | Property | Property type                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| --------- | -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| `field`   | `field`  | `BooleanField \| undefined`           | The field to display, formatted as it is on either a `Place` or `PlaceResult`.<br/><br/>Allowed [Place fields](https://developers.google.com/maps/documentation/javascript/reference/place?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components) are `hasCurbsidePickup`, `hasDelivery`, `hasDineIn`, `hasTakeout`, `hasWheelchairAccessibleEntrance`, `isReservable`, `servesBeer`, `servesBreakfast`, `servesBrunch`, `servesDinner`, `servesLunch`, `servesVegetarianFood`, `servesWine`, and `isOpen()`. Please note that only `isOpen()` is supported by the legacy [`PlaceResult` class](https://developers.google.com/maps/documentation/javascript/reference/places-service?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#PlaceResult).<br/><br/>The component also supports the `PlaceResult` field specifier `opening_hours.isOpen()` as an alias for `isOpen()`. |         | ✅                                                                                                              |
|           | `place`  | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |         | ❌                                                                                                              |
| `no-data` | `noData` | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `true`  | ✅                                                                                                              |

## Slots

This component uses [named slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#adding_flexibility_with_slots) to accept custom content. To place content in a named slot, set the content as an HTML child of `<gmpx-place-field-boolean>` and add the attribute `slot="SLOT_NAME"` to it.

| Slot name | Description                                              |
| --------- | -------------------------------------------------------- |
| true      | Content to be displayed when the boolean value is true.  |
| false     | Content to be displayed when the boolean value is false. |



## Examples

### Showing whether a restaurant has delivery

This example uses `<gmpx-place-field-boolean>` to show whether a Place has
delivery. It also takes advantage of the `no-data` attribute to display
a fallback message when the Places API does not have delivery information
available (e.g. when the specified Place is not a restaurant).

```html
<style>
:not([no-data]) + .no-data-fallback {
  display: none;  
}
</style>

<gmpx-place-data-provider place="INSERT_PLACE_ID">
  <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  <gmpx-place-field-boolean field="hasDelivery">
    <span slot="true">has delivery.</span>
    <span slot="false">will not deliver your food.</span>
  </gmpx-place-field-boolean>
  <span class="no-data-fallback">does not have delivery information available.</span>
</gmpx-place-data-provider>
```




