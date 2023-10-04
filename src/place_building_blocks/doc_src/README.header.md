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
