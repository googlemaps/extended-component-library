### Showing whether a restaurant has delivery

This example uses `<gmpx-place-field-boolean>` to show whether a Place has
delivery. It also takes advantage of the `no-data` attribute to display
a fallback message when the Places API does not have delivery information
available (e.g. when the specified Place is not a restaurant).

```html
<style>
:not([no-data]) + .no-data-fallback {
  display: none;  
}
</style>

<gmpx-place-data-provider place="INSERT_PLACE_ID">
  <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  <gmpx-place-field-boolean field="hasDelivery">
    <span slot="true">has delivery.</span>
    <span slot="false">will not deliver your food.</span>
  </gmpx-place-field-boolean>
  <span class="no-data-fallback">does not have delivery information available.</span>
</gmpx-place-data-provider>
```
