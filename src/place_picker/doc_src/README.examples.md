### Add a user-entered location as a form input

You can use Place Picker to produce a well formatted address for any user-entered location. This example shows how to add that address to a hidden form field.

```html
<gmpx-place-picker placeholder="Enter a place" id="place-picker" style="width: 100%">
</gmpx-place-picker>

<input name="address" type="hidden" id="selected-address"/>
```

The Place Picker component maintains a [Place instance](https://developers.google.com/maps/documentation/javascript/reference/place#Place) corresponding to the selected location. When the end user has made a selection, this example updates the input field with the Place's address:

```js
const picker = document.getElementById('place-picker');
const addressInput = document.getElementById('selected-address');

picker.addEventListener('gmpx-placechange', () => {
  addressInput.value = picker.value.formattedAddress;
});
```

### Showing information about a user-selected place

Combine a Place Picker with a Place Overview to show details about a user-entered location.

```html
<gmpx-place-picker placeholder="Enter a place" id="place-picker" style="width: 100%">
</gmpx-place-picker>
<gmpx-place-overview id="place-overview"></gmpx-place-overview>
```

Some basic JavaScript is required to connect the two components:

```js
const picker = document.getElementById('place-picker');
const overview = document.getElementById('place-overview');

// When the Place Picker fires a placechange event, update the Place Overview
// component to use the new Place.
picker.addEventListener('gmpx-placechange', () => {
  overview.place = picker.value;
});
```