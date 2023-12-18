[Extended Component Library](../../README.md)

# API Loader: `<gmpx-api-loader>` (as class `APILoader`)

The API loader component loads the Google Maps Platform libraries necessary
for Extended Components.

To use this component, make sure you [sign up for Google Maps Platform and
create an API
key](https://console.cloud.google.com/google/maps-apis/start?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).
By default, the API loader component will request the beta version of the
Maps JavaScript API, giving you access to additional components [`<gmp-map>`
and
`<gmp-advanced-marker>`](https://developers.google.com/maps/documentation/javascript/web-components/overview?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).
However, you can set the `version` attribute to select a stable (General
Availability) version of the SDK such as `weekly`.

## Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. You do not need to take additional steps to use this component.

When bundling your dependencies and you want to include `<gmpx-api-loader>` on a page:

```
import '@googlemaps/extended-component-library/api_loader.js';
```

When bundling your dependencies and you need to access the class `APILoader` directly (less common):

```
import { APILoader } from '@googlemaps/extended-component-library/api_loader.js';
```

## Attributes and properties

| Attribute              | Property             | Property type         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Default  | [Reflects?](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) |
| ---------------------- | -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------- |
|                        | `apiKey`             | `string\|undefined`   | An alias for the `key` property. React developers should use this prop to set the API key.                                                                                                                                                                                                                                                                                                                                                                                     |          | ❌                                                                                                              |
| `auth-referrer-policy` | `authReferrerPolicy` | `string \| undefined` | Maps JS customers can configure HTTP Referrer Restrictions in the Cloud Console to limit which URLs are allowed to use a particular API Key. This parameter can limit the amount of data sent to Google Maps when evaluating HTTP Referrer Restrictions. Please see the [documentation](https://developers.google.com/maps/documentation/javascript/dynamic-loading?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#optional_parameters) for more information.                                                                 |          | ✅                                                                                                              |
| `key`                  | `key`                | `string \| undefined` | (Required) A valid Google Maps Platform API key. If you don't have one already [sign up for Google Maps Platform and create an API key](https://console.cloud.google.com/google/maps-apis/start?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).<br/><br/>React developers are encouraged to use the `apiKey` property instead, as `key` is a reserved word.<br/><br/>You can learn more about API keys in the Google Maps Platform [documentation](https://developers.google.com/maps/documentation/javascript/get-api-key?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components). |          | ✅                                                                                                              |
| `language`             | `language`           | `string \| undefined` | The language code; defaults to the user's preferred language setting as specified in the browser when displaying textual information. Read [more on localization](https://developers.google.com/maps/documentation/javascript/localization?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).                                                                                                                                                                                                                                   |          | ✅                                                                                                              |
| `region`               | `region`             | `string \| undefined` | The region code to use. This alters the map's behavior based on a given country or territory. Read [more on region codes](https://developers.google.com/maps/documentation/javascript/localization?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#Region).                                                                                                                                                                                                                                                                    |          | ✅                                                                                                              |
| `solution-channel`     | `solutionChannel`    | `string \| undefined` | To understand usage and ways to improve our solutions, Google includes the `solution_channel` query parameter in API calls to gather information about code usage. You may opt out at any time by setting this attribute to an empty string. Read more in the [documentation](https://developers.google.com/maps/reporting-and-monitoring/reporting?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#solutions-usage).                                                                                                          |          | ✅                                                                                                              |
| `version`              | `version`            | `string`              | The release channel or version numbers. See the [documentation](https://developers.google.com/maps/documentation/javascript/versions?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components) for more information.                                                                                                                                                                                                                                                                                                                    | `'beta'` | ✅                                                                                                              |

## Methods

### `APILoader.importLibrary(library, consumer)` (static method)

Retrieves a reference to the specified Maps JavaScript API library.

Libraries are [loaded dynamically from the Maps JavaScript
API](https://developers.google.com/maps/documentation/javascript/dynamic-loading?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).
If an instance of the API is not already available, one will be configured
and loaded based on a `<gmpx-api-loader>` element in the document.

**Returns:** `Promise<google.maps.CoreLibrary|google.maps.MapsLibrary|
              google.maps.PlacesLibrary|google.maps.GeocodingLibrary|
              google.maps.RoutesLibrary|google.maps.MarkerLibrary|
              google.maps.GeometryLibrary|google.maps.ElevationLibrary|
              google.maps.StreetViewLibrary|
              google.maps.JourneySharingLibrary|
              google.maps.DrawingLibrary|google.maps.VisualizationLibrary>`

**Parameters:**

| Name       | Optional? | Type          | Description                                                                                                                                             |
| ---------- | --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `library`  |           | `string`      | Name of the library. Full list of libraries can be found in the [documentation](https://developers.google.com/maps/documentation/javascript/libraries?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components). |
| `consumer` | optional  | `HTMLElement` | Optionally specify the custom element requesting the library to provide more helpful console warnings when a library cannot be loaded.                  |



## Examples

### Adding an API Loader to your web page

The API Loader component can go anywhere in your web page. For example, you can include it at the beginning of the html `<body>` where it's easy to notice in source code:

```html
<body>
  <gmpx-api-loader key="MY_API_KEY"></gmpx-api-loader>

  <!-- Other page content or components -->
</body>
```





