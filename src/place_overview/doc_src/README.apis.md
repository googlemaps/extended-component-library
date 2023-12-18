### Places API

Used when fetching Places data for the place specified via attribute/property.

#### Documentation

* Fetching Places data:
    * Maps JavaScript API beta version (default): [Place class documentation](https://developers.google.com/maps/documentation/javascript/place)
    * Maps JavaScript API GA version: [Place details documentation](https://developers.google.com/maps/documentation/javascript/examples/place-details)
* Displaying Places photos (used in medium, large, and x-large sizes): [Photos documentation](https://developers.google.com/maps/documentation/javascript/places#places_photos)

Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

Note that the SKUs below (except Place Photo) are not triggered if you provide a `Place` or `PlaceResult` object to this component that contains all the data fields necessary to render its overview content, or if this component has the `auto-fetch-disabled` attribute.

- [SKU: Place Details](https://developers.google.com/maps/billing-and-pricing/pricing#places-details) (all sizes)
- [SKU: Basic Data](https://developers.google.com/maps/billing-and-pricing/pricing#basic-data) (all sizes)
- [SKU: Contact Data](https://developers.google.com/maps/billing-and-pricing/pricing#contact-data) (all sizes except `x-small`)
- [SKU: Atmosphere Data](https://developers.google.com/maps/billing-and-pricing/pricing#atmosphere-data) (all sizes)
- [SKU: Place Photo](https://developers.google.com/maps/billing-and-pricing/pricing#places-photo) (all sizes except `x-small` and `small`)

### Directions API

Used when computing travel distance/duration from an origin.

#### Documentation

[Directions API documentation](https://developers.google.com/maps/documentation/javascript/directions). Please be sure to check this documentation for additional requirements and recommendations regarding your use.

#### Pricing

Note that the SKU below is only triggered if you specify a travel origin, and whenever the origin or travel mode changes.

- [SKU: Directions](https://developers.google.com/maps/billing-and-pricing/pricing#directions) (all sizes)
