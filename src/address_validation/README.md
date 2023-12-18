[Extended Component Library](../../README.md)

# Address Validation

This documentation helps you use pre-built logic for analyzing the API response from the [Address Validation API](https://developers.google.com/maps/documentation/address-validation?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).

> **The Address Validation API is currently available under the [Experimental](https://developers.google.com/maps/launch-stages?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#experimental) launch stage.** Please be sure to specify `version="alpha"` if using the [API Loader](../api_loader/README.md) component to load the Google Maps JS SDK.

## Prerequisites

* You will need to [enable the Address Validation API](https://developers.google.com/maps/documentation/address-validation/cloud-setup?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#enabling-apis) for your Google Maps Platform project if it is not enabled already.




### `suggestValidationAction(response)`

This is a JavaScript function that analyzes an Address Validation API
response and outputs a single recommended follow-up action you should take
based on the quality of the address.

This function returns an object with a property `suggestedAction`, which can
be one of the following values:

* `'FIX'`: the address returned by the API is low quality. You should prompt
your user for more information.

* `'CONFIRM'`: the address returned by the API is high quality, but the API
had to make significant changes to the input address. You might prompt your
user for confirmation.

* `'ACCEPT'`: the address returned by the API is high quality. There may be
small corrections made by the Address Validation API. You can accept the
address.

* `'ADD_SUBPREMISES'`: The end user entered an address that should have a
subpremises (e.g. apartment number) but did not include one. Your app should
ask the end user for this extra information and try again.

You should call this function after making a call to the Address Validation
API, providing the API response as its argument. Your system should either
accept the address or prompt the user, based on the response from this
function.

The logic for converting the API response into a single recommended action is
based on the principles discussed in the [Build your validation
logic](https://developers.google.com/maps/documentation/address-validation/build-validation-logic?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).
There are many ways to analyze the API response; this function serves as
a suggested implementation.

**Best Practices**

* See [Workflow
overview](https://developers.google.com/maps/documentation/address-validation/build-validation-logic?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components#workflow-overview)
for the recommended behavior your system should have for each recommended
action.

* Allow your system to accept the entered address even if the user does
not respond to prompts to fix the address.

* If you want to make your own modifications to the logic, we recommend
reading through [Build your validation
logic](https://developers.google.com/maps/documentation/address-validation/build-validation-logic?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)
for guidance.

**Returns:** `ValidationSuggestion`

**Parameters:**

| Name       | Optional? | Type                        | Description                                                           |
| ---------- | --------- | --------------------------- | --------------------------------------------------------------------- |
| `response` |           | `AddressValidationResponse` | A response object from the Address Validation API in the Maps JS SDK. |

#### Importing

When loading the library with a &lt;script&gt; tag (referencing the CDN bundle), please refer to the instructions in the root-level Readme. This function will be available in the global namespace.

When bundling your dependencies, import this function:

```
import { suggestValidationAction } from '@googlemaps/extended-component-library/address_validation.js';
```



### Examples

#### Taking a next action in an order form

The `suggestValidationAction()` function works well when dealing with order forms or other types of address entry. You should already have a form for accepting input addresses from your customer. This example uses a simple HTML form as a placeholder for your form:

```html
<gmpx-api-loader key="YOUR_API_KEY" version="alpha"></gmpx-api-loader>
<form>
  <input id="address-line-1"/>
  <input id="address-line-2"/>
  <input id="address-line-3"/>
  <input type="submit"/>
</form>
```

Use the Address Validation API to confirm the entered address before submitting the form.

This example is based on the Maps JS library. It shows you how to call the Address Validation JS API then call `suggestValidationAction()` to provide a recommended next action. In your implementation, you can choose to call the Address Validation API once or multiple times:

* If you want to limit API usage, call the Address Validation API once, then trust the user's confirmed or fixed address is valid.
* If you want greater confidence in submitted addresses, call the Address Validation API every time the user attempts to submit the form.

```js
import { APILoader } from '@googlemaps/extended-component-library/api_loader.js';
import { suggestValidationAction } from '@googlemaps/extended-component-library/address_validation.js';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Make a request to the Address Validation API.
  const {AddressValidation} = await APILoader.importLibrary('addressValidation');
  const request = getRequestFromAddressForm();
  let response;
  try {
    response = await AddressValidation.validateAddress(request);
  } catch (e) {
    console.error('Failed to validate address', e);
    // Depending on your application, you may want to try again, or accept
    // an unvalidated address if the API call fails.
    return;
  }

  // Take a next action based on the response
  const {suggestedAction} = suggestValidationAction(response);
  if (suggestedAction === 'ACCEPT') {
    // Submit the form, passing `response.result.address.formattedAddress` as
    // the cleaned address.
  } else if (suggestedAction === 'CONFIRM') {
    // Prompt the user to confirm the entered address before submitting.
  } else if (suggestedAction === 'FIX') {
    // Ask the user to fix their address and try again.
  } else if (suggestedAction === 'ADD_SUBPREMISES') {
    // Ask the user to enter their apartment or unit number before submitting.
  } else {
    throw new Error(`Unexpected validation action ${suggestedAction}`);
  }
});

// Update this function to use the address form inputs on your own page. The
// returned object is an Address Validation API request.
function getRequestFromAddressForm() {
  const addressLines = [
    document.getElementById('address-line-1').value,
    document.getElementById('address-line-2').value,
    document.getElementById('address-line-3').value,
  ].filter(Boolean);
  return {address: {addressLines}};
}
```




### APIs and Pricing

In addition to the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components), this component relies on the following Google Maps Platform APIs which may incur cost and must be enabled.

#### Address Validation API

The function on this page is designed to be used with the Address Validation API. See the links below for documentation and pricing.

##### Documentation

* [Address Validation API documentation](https://developers.google.com/maps/documentation/address-validation?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)

Please be sure to check this documentation for additional requirements and recommendations regarding your use.

##### Pricing

* [Address Validation API Usage and Billing](https://developers.google.com/maps/documentation/address-validation/usage-and-billing?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components)


