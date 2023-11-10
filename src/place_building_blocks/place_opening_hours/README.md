[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Opening Hours: `<gmpx-place-opening-hours>` (as class `PlaceOpeningHours`)

Component that renders a summary of the place’s current opening status and an
accordion that shows the weekly opening hours when expanded.

This component will display content only if there is sufficient data to
calculate the place’s opening status (unless the place is not operational, in
which case it will render the place’s business status instead). A place’s
opening status is determined by its business status, opening hours periods,
and UTC offset minutes.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-opening-hours>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_opening_hours.js';
```

When bundling your dependencies and you need to access the class `PlaceOpeningHours` directly (less common):

```
import { PlaceOpeningHours } from '@googlemaps/extended-component-library/place_building_blocks/place_opening_hours.js';
```

## Attributes and properties

| Attribute      | Property      | Property type                         | Description                                                                                                                                                                                                                                                      | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| -------------- | ------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `summary-only` | `summaryOnly` | `boolean`                             | Render only the summary line, without the accordion containing weekly opening hours.                                                                                                                                                                             | `false` | ✅                                                                                                              |
|                | `place`       | `Place\|PlaceResult\|null\|undefined` | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |         | ❌                                                                                                              |
| `no-data`      | `noData`      | `boolean`                             | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`  | ✅                                                                                                              |

## Styling

You can use most built-in CSS properties to control the positioning or display of this component, similar to a `<span>` or `<div>` element. The component also supports the following styling inputs for more customization:

### CSS Custom Properties

| Name                        | Default   | Description                                    |
| --------------------------- | --------- | ---------------------------------------------- |
| `--gmpx-hours-color-open`   | `#188038` | Text color when the place is currently open.   |
| `--gmpx-hours-color-closed` | `#d50000` | Text color when the place is currently closed. |



