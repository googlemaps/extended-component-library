# Extended Component Library

Google Maps Platform’s Extended Component Library is a set of Web Components that helps developers build better maps faster, and with less effort. It encapsulates boilerplate code, best practices, and responsive design, reducing complex map UIs into what is effectively a single HTML element.  

Ultimately, these components make it easier to read, learn, customize, and maintain maps-related code.

![](https://raw.githubusercontent.com/googlemaps/extended-component-library/main/doc_src/gmpx-header.png)

## Installation

### Loading the library

#### For applications that bundle their code

For best performance, use a package manager and import only the components you need. This package is listed on NPM as 
[@googlemaps/extended-component-library](https://www.npmjs.com/package/@googlemaps/extended-component-library). Install it with:

```bash
npm i @googlemaps/extended-component-library
```

Then import any components you use in your application:

```js
import '@googlemaps/extended-component-library/overlay_layout.js';
```

#### To load all components

Alternatively, we provide a CDN-hosted bundle that you can include directly in your HTML file as a [module script](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#applying_the_module_to_your_html):

```html
<script type="module" src="https://unpkg.com/@googlemaps/extended-component-library"></script>
```

When using the CDN-hosted bundle, all components are available globally, and don’t require further imports. *Please note that unpkg is unaffiliated with Google Maps Platform and using their CDN may come with its own terms and expectations.*

### Getting your API key

The components in this library make use of Google Maps Platform APIs. To start, you'll need to [sign up for Google Maps Platform and create an API key](https://console.cloud.google.com/google/maps-apis/start). Then, place an API Loader element somewhere in the root of your app's HTML, specifying your API key:

```html
<gmpx-api-loader key="YOUR_API_KEY"></gmpx-api-loader>
```

When you sign up, by default, all APIs will be enabled, but you can opt to enable only the APIs needed for each component by referencing the “APIs and pricing" section in that component's documentation. 

## Usage

This library contains a set of [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components), usable anywhere in the HTML of your web app. Web components are supported in all modern browsers and expose a framework-agnostic mechanism for encapsulating UI and functionality.

This example shows how to display information about a particular place, purely in HTML:

```html
<!-- Please note unpkg.com is unaffiliated with Google Maps Platform -->
<script type="module" src="https://unpkg.com/@googlemaps/extended-component-library"></script>

<!-- Configure and load the Maps JS SDK with your API key -->
<gmpx-api-loader key="YOUR_API_KEY"></gmpx-api-loader>

<gmpx-split-layout>
  <gmpx-place-overview slot="fixed" place="ChIJ39Y-tdg1fYcRQcZcBb499do"></gmpx-place-overview>
  <gmp-map slot="main" center="43.880,-103.459" zoom="10" map-id="DEMO_MAP_ID">
    <gmp-advanced-marker position="43.880,-103.459"></gmp-advanced-marker>
  </gmp-map>
</gmpx-split-layout>
```

Web Components are also designed to be used with JavaScript. Here’s an example showing how you can add a pan-to-marker action:

```html
<!-- Please note unpkg.com is unaffiliated with Google Maps Platform -->
<script type="module" src="https://unpkg.com/@googlemaps/extended-component-library"></script>

<!-- Configure and load the Maps JS SDK with your API key -->
<gmpx-api-loader key="YOUR_API_KEY"></gmpx-api-loader>

<gmp-map id="my-map" center="33.15,-96.20" zoom="10" map-id="DEMO_MAP_ID">
  <gmp-advanced-marker class="pannable" gmp-clickable position="33.15,-96.20"></gmp-advanced-marker>
  <!-- Some more markers ... -->
</gmp-map>

<script>
window.addEventListener('load', () => {
  const mapElement = document.getElementById('my-map');
  const markers = document.querySelectorAll('gmp-advanced-marker.pannable');
  markers.forEach((marker) => {
    marker.addEventListener('gmp-click', () => {
      mapElement.innerMap.panTo(marker.position);
    });
  });
});
</script>
```

### Frameworks

Web Components work well with most popular frontend frameworks such as Angular, React, or Vue.js. Refer to your framework’s documentation for instructions on how to use custom elements.

**React**: The Extended Component Library ships with native React components for easy integration. Please see [React Support](src/react/README.md) to get started, then refer to the [example app](examples/react_sample_app).

**Angular**: Angular works well with Web Components. See the Angular [example app](examples/angular_sample_app) to get started. 

## Components available with Maps JS SDK

Map and marker components can be used with the Extended Component Library, or on their own. See the [guide](https://developers.google.com/maps/documentation/web-components/overview) for more information on Web Components in the Maps JS SDK.

| Component               | Description                                    |
| ----------------------- | ---------------------------------------------- |
| [`<gmp-map>`](https://developers.google.com/maps/documentation/javascript/reference/map#MapElement)             | The map component displays a map on a webpage, and can wrap other map-related components such as markers inside the map component in HTML. |
| [`<gmp-advanced-marker>`](https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElement) | The marker component displays a pin on the map at specified coordinates. |

## Inventory of components