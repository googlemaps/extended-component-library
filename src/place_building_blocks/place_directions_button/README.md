[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Directions Button: `<gmpx-place-directions-button>` (as class `PlaceDirectionsButton`)

Component that opens a new tab with directions to this place in Google Maps.

> This component is designed to work with a Place Data Provider; please see [Place Building Blocks](../README.md) for more information.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-directions-button>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_directions_button.js';
```

When bundling your dependencies and you need to access the class `PlaceDirectionsButton` directly (less common):

```
import { PlaceDirectionsButton } from '@googlemaps/extended-component-library/place_building_blocks/place_directions_button.js';
```

## Attributes and properties

| Attribute    | Property    | Property type                                                       | Description                                                                                                                                                                                                                                                      | Default      | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ------------ | ----------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `aria-label` | `ariaLabel` | `null`                                                              | A description that gets read by assistive devices. In the case of icon-only buttons, you should always include an ARIA label for optimal accessibility.                                                                                                          | `null`       | ✅                                                                                                              |
| `condensed`  | `condensed` | `boolean`                                                           | Whether to render the button in a condensed layout, where the label appears below the icon.                                                                                                                                                                      | `false`      | ✅                                                                                                              |
|              | `origin`    | `google.maps.LatLng\|google.maps.LatLngLiteral\|Place \| undefined` | Optionally specify the starting location or Place. Otherwise Google Maps will ask for or estimate the user’s starting location.                                                                                                                                  |              | ❌                                                                                                              |
| `reversed`   | `reversed`  | `boolean`                                                           | Get directions from destination to origin instead.                                                                                                                                                                                                               | `false`      | ✅                                                                                                              |
| `variant`    | `variant`   | `'outlined'\|'filled'`                                              | Specifies the display style of the button.                                                                                                                                                                                                                       | `'outlined'` | ✅                                                                                                              |
|              | `place`     | `Place\|PlaceResult\|null\|undefined`                               | Place data to render, overriding anything provided by context.                                                                                                                                                                                                   |              | ❌                                                                                                              |
| `no-data`    | `noData`    | `boolean`                                                           | This read-only property and attribute indicate whether the component has the required Place data to display itself.<br/><br/>Use the attribute to target CSS rules if you wish to hide this component, or display alternate content, when there's no valid data. | `true`       | ✅                                                                                                              |

## Slots

| Slot name   | Description                               |
| ----------- | ----------------------------------------- |
| *(default)* | Content to display as the button’s label. |

## Styling

You can use most built-in CSS properties to control the positioning or display of this component, similar to a `<span>` or `<div>` element. The component also supports the following styling inputs for more customization:

### CSS Custom Properties

| Name                          | Default                          | Description                                                                                          |
| ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `--gmpx-color-primary`        | `#1976d2`                        | Button text and outline color in the `outlined` variant, or background color in `filled` variant. 🌎 |
| `--gmpx-color-on-primary`     | `#fff`                           | Button text color in `filled` variant. 🌎                                                            |
| `--gmpx-font-size-base`       | `0.875rem`                       | Font size for the button. 🌎                                                                         |
| `--gmpx-font-family-headings` | `--gmpx-font-family-base`        | Font face for the button, except for condensed mode. 🌎                                              |
| `--gmpx-font-family-base`     | `'Google Sans Text', sans-serif` | Font face used when the button is in condensed mode. 🌎                                              |

🌎 _indicates a global style token shared by
                                    multiple components. Please see the library
                                    Readme for more information._



