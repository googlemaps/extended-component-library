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