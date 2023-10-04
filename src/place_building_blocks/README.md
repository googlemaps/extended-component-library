[Extended Component Library](../../README.md)

# Place building blocks

The place data provider component, along with individual place details components, lets you choose how to display Google Maps place information like opening hours, star reviews, and photos in a new, custom view.

> In many cases, you can use the [Place Overview](../place_overview/README.md) component to easily display Places data in a ready-made layout. Place building blocks let you go beyond Place Overview to define your own custom representations of Places data.

![](./doc_src/place-building-blocks.gif)

To build your own custom representation for a Place object, you'll want to combine the following:

* A [Place data provider](./place_data_provider/README.md) component to fetch data from the Places API.
* One or more Place details components from the inventory table below, e.g. [Place rating](./place_rating/README.md).

The data provider component must wrap any of the Place details components in your HTML. For example,

```html
<gmpx-place-data-provider place="INSERT_PLACE_ID">
  <h2>
    <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  </h2>
  <p>
    Rating: <gmpx-place-rating></gmpx-place-rating>
  </p>
  <gmpx-place-photo-gallery max-tiles="1"></gmpx-place-photo-gallery>
</gmpx-place-data-provider>
```

The above example renders the name, rating, and photos for a given Place ID. You can use HTML and CSS to define and customize the resulting UI.


## Data provider

| Component                                                     | Description                                         |
| ------------------------------------------------------------- | --------------------------------------------------- |
| [`<gmpx-place-data-provider>`](place_data_provider/README.md) | Provides place data to child components as context. |

## Details components

| Component                                                             | Description                                                                                                                                                                                                 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`<gmpx-place-attribution>`](place_attribution/README.md)             | Component that renders any listing attributions from the Places API.                                                                                                                                        |
| [`<gmpx-place-directions-button>`](place_directions_button/README.md) | Component that opens a new tab with directions to this place in Google Maps.                                                                                                                                |
| [`<gmpx-place-field-boolean>`](place_field_boolean/README.md)         | Component that conditionally renders content depending on the value of a boolean field, or the `isOpen()` method which returns a boolean.                                                                   |
| [`<gmpx-place-field-link>`](place_field_link/README.md)               | Component that renders an anchor tag to one of this place's URLs: `websiteURI` or `googleMapsURI`. By default, renders a link to `websiteURI` with the URL's domain as the text.                            |
| [`<gmpx-place-field-text>`](place_field_text/README.md)               | Component that renders a string or numeric field of a `Place` or `PlaceResult` as text. It can also render the field "types", in which case it will show only the most applicable place type, if available. |
| [`<gmpx-place-opening-hours>`](place_opening_hours/README.md)         | Component that renders a summary of the place’s current opening status and an accordion that shows the weekly opening hours when expanded.                                                                  |
| [`<gmpx-place-photo-gallery>`](place_photo_gallery/README.md)         | Component that displays photos of this place as tiles, with a lightbox view when a photo is clicked. The lightbox includes proper photo attribution.                                                        |
| [`<gmpx-place-price-level>`](place_price_level/README.md)             | Renders a symbolic representation of a place's price level (e.g. $$$).                                                                                                                                      |
| [`<gmpx-place-rating>`](place_rating/README.md)                       | Renders a place's star rating in either full (4.9 ★★★★★) or condensed (4.9 ★) form.                                                                                                                         |
| [`<gmpx-place-reviews>`](place_reviews/README.md)                     | Renders a list of user-generated place reviews.                                                                                                                                                             |



## Examples

### Displaying alternate content if the requested Place does not exist

Use the `error` slot on the Place Data Provider component to specify fallback content, including when the requested Place doesn't exist:

```html
<gmpx-place-data-provider place="PLACE_ID_HERE">
  <gmpx-place-field-text field="displayName"></gmpx-place-field-text>

  <!-- This content will display when a Place cannot be found -->
  <div slot="error">
    Unable to display information for this place!
  </div>
</gmpx-place-data-provider>
```

### Displaying alternate content when the Places API doesn't have all data fields

Individual Place details components expose a `no-data` attribute that can be used for CSS styling. This example shows how you could display alternate content if the Places API does not have photos for a given place:

```html
<style>
:not([no-data]) + .no-data-fallback {
  display: none;  
}
</style>

<gmpx-place-data-provider place="PLACE_ID_HERE">
  <gmpx-place-photo-gallery></gmpx-place-photo-gallery>
  <div class="no-data-fallback">
    <!-- This content displays when there are no Place photos. -->
  </div>
</gmpx-place-data-provider>
```

