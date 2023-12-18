[Extended Component Library](../../../README.md) » [Place Building Blocks](../README.md)

# Place Data Provider: `<gmpx-place-data-provider>` (as class `PlaceDataProvider`)

Provides place data to child components as context.

This component can fetch place data from the Places API, or forward a Place
or PlaceResult object provided elsewhere in code. By default, this component
will only request fields from the Places API which are required to render
child components. The component will locally cache place data to avoid
redundant API requests.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-place-data-provider>` on a page:

```
import '@googlemaps/extended-component-library/place_building_blocks/place_data_provider.js';
```

When bundling your dependencies and you need to access the class `PlaceDataProvider` directly (less common):

```
import { PlaceDataProvider } from '@googlemaps/extended-component-library/place_building_blocks/place_data_provider.js';
```

## Attributes and properties

| Attribute             | Property            | Property type                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Default | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| --------------------- | ------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `auto-fetch-disabled` | `autoFetchDisabled` | `boolean`                                 | If `place` is provided with a `Place` or `PlaceResult` instance, but does not contain fields required by child components, this element will make a request to the Place API to retrieve the missing data. Set `auto-fetch-disabled` to prevent the component from performing these requests.                                                                                                                                                                                                                                                                                                                                     | `false` | ✅                                                                                                              |
| `fields`              | `fields`            | `string[] \| undefined`                   | Manually specify the fields to request from the Places API.<br/><br/>If unspecified, the component will request only fields used by child components.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |         | ✅                                                                                                              |
| `place`               | `place`             | `string\|Place\|PlaceResult \| undefined` | The place to be displayed by this component. Provide a [Place ID](https://developers.google.com/maps/documentation/places/web-service/place-id?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components) as a string to have the component look up and display details from the Place API. The component will not make further API requests if child components are added at a later time. If required, explicitly request a data fetch by re-setting `place` to the same Place ID as before.<br/><br/>Alternatively, assign a `Place` or `PlaceResult` object to the `place` property to render it directly (note that the attribute, on the other hand, only accepts a Place ID string). |         | ❌                                                                                                              |

## Slots

This component uses [named slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#adding_flexibility_with_slots) to accept custom content. To place content in a named slot, set the content as an HTML child of `<gmpx-place-data-provider>` and add the attribute `slot="SLOT_NAME"` to it.

| Slot name       | Description                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *(default)*     | Elements to receive Places data.                                                                                                                                                |
| initial-loading | If specified, display this content when the component is initially loading Places data. Content in this slot will receive Places data, but some or all fields may be undefined. |
| error           | If specified, display this content when there was any error loading data from the Places API.                                                                                   |

## Events

| Name                | React Prop       | Type                | Description                                                                    |
| ------------------- | ---------------- | ------------------- | ------------------------------------------------------------------------------ |
| `gmpx-requesterror` | `onRequestError` | `RequestErrorEvent` | Indicates an error condition in an underlying Google Maps JavaScript API call. |



## APIs and Pricing

In addition to the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components), this component relies on the following Google Maps Platform APIs which may incur cost and must be enabled.

### Places API

Used when fetching Places data for the place specified via attribute/property.

#### Documentation

* When using the Maps JavaScript API beta version (default): [Place class documentation](https://developers.google.com/maps/documentation/javascript/place?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)
* When using the Maps JavaScript API GA version: [Place details documentation](https://developers.google.com/maps/documentation/javascript/examples/place-details?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)

Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

Note that the SKUs below are only triggered if this component has one or more Place Building Blocks as children that consume Basic/Contact/Atmosphere data. In addition, the SKUs are not triggered if you provide a `Place` or `PlaceResult` object to this component that contains all the data fields necessary to render children's content, or if this component has the `auto-fetch-disabled` attribute.

- [SKU: Place Details](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#places-details)
- [SKU: Basic Data](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#basic-data)
- [SKU: Contact Data](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#contact-data)
- [SKU: Atmosphere Data](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#atmosphere-data)


