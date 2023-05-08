### Show information about a specific Place

```html
<gmpx-place-overview place="ChIJN1t_tDeuEmsRUsoyG83frY4">
</gmpx-place-overview>
```

### (Angular) add travel time, directions, and "order now" button

> This example is written for Angular, but can be trivially modified for other frameworks or vanilla JS.

On the Angular component, create and populate a variable `userLocation` to store the end user's location. This value could be set by another component such as `<gmpx-place-picker>`.

Also on the Angular component, create a method `beginOrder()` to define a custom order flow (the Extended Component Library does not provide this action).

Then, in the Angular template, include the following:

```html
<gmpx-place-overview
    place="ChIJN1t_tDeuEmsRUsoyG83frY4"
    size="medium"
    [travelOrigin]="userLocation">
  
  <gmpx-icon-button
      slot="action"
      variant="filled"
      icon="restaurant"
      (click)="beginOrder()">
    Order Online
  </gmpx-icon-button>
  
  <gmpx-place-directions-button
      slot="action"
      [origin]="userLocation">
  </gmpx-place-directions-button>
  
</gmpx-place-overview>
```

### (Vue.js) Show information for an existing `Place` or `PlaceResult`

> This example is written for Vue.js, but can be trivially modified for other frameworks or vanilla JS.

If your app already fetches data from a Places API, you can still use Place Overview to display it.

```html
<gmpx-place-overview :place="myPlaceResult" size="small"> 
</gmpx-place-overview>
```
