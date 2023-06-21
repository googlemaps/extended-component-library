### Display an icon button

You can use an Icon Button just like a typical HTML `<button>` element:

```html
<gmpx-icon-button icon="takeout_dining" variant="filled" id="order-button">
  Begin order
</gmpx-icon-button>
```

Then, attach an event listener to the button using JavaScript:

```js
document.getElementById("order-button").addEventListener("click", () => beginOrderFlow());
```
