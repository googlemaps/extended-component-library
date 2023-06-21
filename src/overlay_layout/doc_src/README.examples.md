### Using an overlay to show more information

An overlay layout is useful to show more details about a particular location. In this example, a UX panel shows a list of places. When a user clicks on one of them, the overlay opens and displays more information about it.

```html
<gmpx-overlay-layout id="layout" style="width: 100%; height: 20em; border: 1px solid black;">
  <ul slot="main">
    <li><button data-place-id="ChIJxeyK9Z3wloAR_gOA7SycJC0">Yosemite National Park</button></li>
    <li><button data-place-id="ChIJVVVVVVXlUVMRu-GPNDD5qKw">Yellowstone National Park</button></li>
    <li><button data-place-id="ChIJFU2bda4SM4cRKSCRyb6pOB8">Grand Canyon National Park</button></li>
  </ul>

  <div slot="overlay">
    <button id="overlay-close" autofocus>Go back</button>
    <gmpx-place-overview id="overlay-overview"></gmpx-place-overview>
  </div>
</gmpx-overlay-layout>
```

Some basic JavaScript is required to implement the open and close actions:

```js
const overlayLayout = document.getElementById("layout");
const placeOverview = document.getElementById("overlay-overview");
const closeButton = document.getElementById("overlay-close");

// Trigger the overlay to open when a user clicks on a list item.
document.querySelectorAll("li > button").forEach((item) => {
  item.addEventListener("click", () => {
    placeOverview.place = item.dataset.placeId;
    overlayLayout.showOverlay()
  });
});

// Implement a close button on the overlay.
closeButton.addEventListener("click", () => {overlayLayout.hideOverlay()});
```