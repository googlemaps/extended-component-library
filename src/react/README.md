# React Support

The Extended Component Library offers React versions of its Web Components to
provide an idiomatic experience for React developers. Follow the instructions
below to leverage these components in your React project.

## Installation

See installation instructions [here](../../README.md#installation).
Please note that React components are not available in the CDN bundle.

## Usage

### Importing

Web Components from this library can be imported as React components of the same
name from `@googlemaps/extended-component-library/react`. Here's an example:

```js
import { APILoader, PlaceDirectionsButton, PlaceOverview } from '@googlemaps/extended-component-library/react';

export default MyComponent = ({ origin }) => (
  <>
    <APILoader apiKey="YOUR_API_KEY" />
    <PlaceOverview size="large" place="ChIJ39Y-tdg1fYcRQcZcBb499do" googleLogoAlreadyDisplayed>
      <PlaceDirectionsButton slot="action" origin={origin} ariaLabel="see directions on Google Maps">
        Directions
      </PlaceDirectionsButton>
    </PlaceOverview>
  </>
);
```

Use the Web Component's property names (e.g. `googleLogoAlreadyDisplayed`)
instead of attribute names (`google-logo-already-displayed`) to pass props
to its React counterpart.

### Handling Events

Every custom event defined by a Web Component has a corresponding React event
handler prop with the `on` prefix. Names of these props can be found under the
Events section of a component's documentation.

```js
<PlacePicker
  onPlaceChange={handlePlaceChange}
  onRequestError={handleRequestError}
/>
```

### Static Methods

Calls to static methods on a React component from this library are forwarded to
the underlying Web Component. The following sample code calls the static
`APILoader.importLibrary()` method to geocode an input address then centers the
map on a marker at that location.

```js
import { useEffect, useRef } from 'react';
import { APILoader } from '@googlemaps/extended-component-library/react';

export default function MyComponent({ address }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const handleAddressChange = async (newAddress) => {
    const {Geocoder} = await APILoader.importLibrary('geocoding');
    const {results} = await new Geocoder.geocode({address: newAddress});
    const location = results[0]?.geometry?.location;
    if (location) {
      mapRef.current.center = location;
      markerRef.current.position = location;
    }
  };

  useEffect(() => handleAddressChange(address), [address]);

  return (
    <>
      <APILoader apiKey="YOUR_API_KEY" />
      <gmp-map ref={mapRef} zoom="11" map-id="DEMO_MAP_ID">
        <gmp-advanced-marker ref={markerRef}></gmp-advanced-marker>
      </gmp-map>
    </>
  );
}
```

Refer to React documentation for information about the
[`useEffect`](https://react.dev/reference/react/useEffect) and
[`useRef`](https://react.dev/reference/react/useRef) React Hooks.

## Examples

See [this directory](../../examples/react_sample_app/) for a React sample app
that demonstrates usage of components from this library.
