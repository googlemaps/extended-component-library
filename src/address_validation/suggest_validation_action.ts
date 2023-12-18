/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Address, AddressValidationResponse, Granularity, ValidationResult} from '../utils/googlemaps_types.js';


/** Suggested action to take for this validation result. */
export enum SuggestedAction {
  ACCEPT = 'ACCEPT',
  CONFIRM = 'CONFIRM',
  FIX = 'FIX',
  ADD_SUBPREMISES = 'ADD_SUBPREMISES'
}

interface ValidationSuggestion {
  suggestedAction: SuggestedAction;
}

// Some referenced area types.
const ADMINISTRATIVE_AREA_LEVEL_1 = 'administrative_area_level_1';
const ADMINISTRATIVE_AREA_LEVEL_2 = 'administrative_area_level_2';
const ADMINISTRATIVE_AREA_LEVEL_3 = 'administrative_area_level_3';
const POSTAL_CODE = 'postal_code';
const POSTAL_CODE_SUFFIX = 'postal_code_suffix';
const COUNTRY = 'country';
const SUBPREMISE = 'subpremise';

function isUSA(address: Address): boolean {
  return address.postalAddress?.regionCode === 'US';
}

function isMissingNonSubpremiseComponent(result: ValidationResult): boolean {
  const missingComponents = result.address.missingComponentTypes || [];
  return (missingComponents.length > 1) ||
      ((missingComponents.length === 1) &&
       (missingComponents[0] !== SUBPREMISE));
}

/**
 * Returns true if the validation granularity is `OTHER`, i.e. worse than
 * `ROUTE` level. `PREMISE`, `SUBPREMISE`, and `PREMISE_PROXIMITY` are all
 * considered as good as `ROUTE` or better.
 */
function hasValidationGranularityOther(result: ValidationResult): boolean {
  return !result.verdict?.validationGranularity ||
      result.verdict.validationGranularity === Granularity.OTHER;
}

function hasSuspiciousComponent(result: ValidationResult): boolean {
  return result.address.addressComponents.some(
      c => c.confirmationLevel === 'UNCONFIRMED_AND_SUSPICIOUS');
}

function hasUnresolvedToken(result: ValidationResult): boolean {
  return (result.address.unresolvedTokens || []).length > 0;
}

/**
 * Returns true if the result has an inference for a component other than the
 * postal code, administrative area (1, 2, or 3), or country.
 */
function hasMajorInference(result: ValidationResult): boolean {
  const minorComponents = new Set([
    POSTAL_CODE, POSTAL_CODE_SUFFIX, ADMINISTRATIVE_AREA_LEVEL_1,
    ADMINISTRATIVE_AREA_LEVEL_2, ADMINISTRATIVE_AREA_LEVEL_3, COUNTRY
  ]);
  return result.address.addressComponents.some(
      c => c.isInferred && !minorComponents.has(c.componentType));
}

function hasReplacement(result: ValidationResult): boolean {
  return !!result.verdict?.hasReplacedComponents;
}

/**
 * Returns true if this is a US address that is missing a subpremise component
 * (and nothing else).
 */
function isMissingExactlyUSASubpremise(result: ValidationResult): boolean {
  return isUSA(result.address) &&
      (result.address.missingComponentTypes?.length === 1) &&
      (result.address.missingComponentTypes[0] === SUBPREMISE);
}

/**
 * This is a JavaScript function that analyzes an Address Validation API
 * response and outputs a single recommended follow-up action you should take
 * based on the quality of the address.
 *
 * This function returns an object with a property `suggestedAction`, which can
 * be one of the following values:
 *
 * * `'FIX'`: the address returned by the API is low quality. You should prompt
 * your user for more information.
 *
 * * `'CONFIRM'`: the address returned by the API is high quality, but the API
 * had to make significant changes to the input address. You might prompt your
 * user for confirmation.
 *
 * * `'ACCEPT'`: the address returned by the API is high quality. There may be
 * small corrections made by the Address Validation API. You can accept the
 * address.
 *
 * * `'ADD_SUBPREMISES'`: The end user entered an address that should have a
 * subpremises (e.g. apartment number) but did not include one. Your app should
 * ask the end user for this extra information and try again.
 *
 * You should call this function after making a call to the Address Validation
 * API, providing the API response as its argument. Your system should either
 * accept the address or prompt the user, based on the response from this
 * function.
 *
 * The logic for converting the API response into a single recommended action is
 * based on the principles discussed in the [Build your validation
 * logic](https://developers.google.com/maps/documentation/address-validation/build-validation-logic).
 * There are many ways to analyze the API response; this function serves as
 * a suggested implementation.
 *
 * **Best Practices**
 *
 * * See [Workflow
 * overview](https://developers.google.com/maps/documentation/address-validation/build-validation-logic#workflow-overview)
 * for the recommended behavior your system should have for each recommended
 * action.
 *
 * * Allow your system to accept the entered address even if the user does
 * not respond to prompts to fix the address.
 *
 * * If you want to make your own modifications to the logic, we recommend
 * reading through [Build your validation
 * logic](https://developers.google.com/maps/documentation/address-validation/build-validation-logic)
 * for guidance.
 *
 * @param response - A response object from the Address Validation API in the
 *     Maps JS SDK.
 */
export function suggestValidationAction(response: AddressValidationResponse):
    ValidationSuggestion {
  const result = response.result;
  if (isMissingNonSubpremiseComponent(result) ||
      hasValidationGranularityOther(result) || hasSuspiciousComponent(result) ||
      hasUnresolvedToken(result)) {
    return {suggestedAction: SuggestedAction.FIX};
  } else if (hasMajorInference(result) || hasReplacement(result)) {
    return {suggestedAction: SuggestedAction.CONFIRM};
  } else if (isMissingExactlyUSASubpremise(result)) {
    return {suggestedAction: SuggestedAction.ADD_SUBPREMISES};
  } else {
    return {suggestedAction: SuggestedAction.ACCEPT};
  }
}