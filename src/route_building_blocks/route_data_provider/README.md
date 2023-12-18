[Extended Component Library](../../../README.md) » [Route Building Blocks](../README.md)

# `<gmpx-route-data-provider>` (as class `RouteDataProvider`)

Provides route data to child components as context.

This component can fetch route data from the Directions API, or forward a
`DirectionsRoute` object provided from elsewhere in code. The component will
locally cache route data to avoid redundant API requests.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-route-data-provider>` on a page:

```
import '@googlemaps/extended-component-library/route_building_blocks/route_data_provider.js';
```

When bundling your dependencies and you need to access the class `RouteDataProvider` directly (less common):

```
import { RouteDataProvider } from '@googlemaps/extended-component-library/route_building_blocks/route_data_provider.js';
```

## Attributes and properties

| Attribute              | Property             | Property type                        | Description                                                                                                                                                 | Default     | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ---------------------- | -------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `destination-lat-lng`  | `destinationLatLng`  | `LatLng\|LatLngLiteral \| undefined` | The destination of the directions request as a lat/lng. When setting the destination, only one of lat/lng, Place ID, or address should be specified.        |             | ✅                                                                                                              |
| `destination-place-id` | `destinationPlaceId` | `string \| undefined`                | The destination of the directions request as a Place ID. When setting the destination, only one of lat/lng, Place ID, or address should be specified.       |             | ✅                                                                                                              |
| `destination-address`  | `destinationAddress` | `string \| undefined`                | The destination of the directions request as an address query. When setting the destination, only one of lat/lng, Place ID, or address should be specified. |             | ✅                                                                                                              |
| `origin-lat-lng`       | `originLatLng`       | `LatLng\|LatLngLiteral \| undefined` | The origin of the directions request as a lat/lng. When setting the origin, only one of lat/lng, Place ID, or address should be specified.                  |             | ✅                                                                                                              |
| `origin-place-id`      | `originPlaceId`      | `string \| undefined`                | The origin of the directions request as a Place ID. When setting the origin, only one of lat/lng, Place ID, or address should be specified.                 |             | ✅                                                                                                              |
| `origin-address`       | `originAddress`      | `string \| undefined`                | The origin of the directions request as an address query. When setting the origin, only one of lat/lng, Place ID, or address should be specified.           |             | ✅                                                                                                              |
|                        | `route`              | `DirectionsRoute \| undefined`       | Route data to be provided to consumers directly, instead of making an API call.                                                                             |             | ❌                                                                                                              |
| `travel-mode`          | `travelMode`         | `Lowercase<google.maps.TravelMode>`  | The travel mode of the directions request.                                                                                                                  | `'driving'` | ✅                                                                                                              |

## Slots

| Slot name   | Description                     |
| ----------- | ------------------------------- |
| *(default)* | Elements to receive route data. |

## Events

| Name                | React Prop       | Type                | Description                                                                    |
| ------------------- | ---------------- | ------------------- | ------------------------------------------------------------------------------ |
| `gmpx-requesterror` | `onRequestError` | `RequestErrorEvent` | Indicates an error condition in an underlying Google Maps JavaScript API call. |



## APIs and Pricing

In addition to the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components), this component relies on the following Google Maps Platform APIs which may incur cost and must be enabled.

### Directions API

Used when computing a route from the component's origin, destination, and travel mode properties.

#### Documentation

[Directions API documentation](https://developers.google.com/maps/documentation/javascript/directions?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components). Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

Note that the SKU below is not triggered if you provide a `DirectionsRoute` object for the component to render directly.

- [SKU: Directions](https://developers.google.com/maps/billing-and-pricing/pricing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#directions)


