/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {Address, AddressComponent, AddressValidationResponse, ConfirmationLevel, Granularity, Verdict} from '../utils/googlemaps_types.js';

import {SuggestedAction, suggestValidationAction} from './suggest_validation_action.js';

const GOOD_VERDICT: Verdict = {
  inputGranularity: Granularity.PREMISE,
  validationGranularity: Granularity.PREMISE,
  geocodeGranularity: Granularity.PREMISE,
  isAddressComplete: true,
  hasUnconfirmedComponents: false,
  hasInferredComponents: false,
  hasReplacedComponents: false,
};

const LOCALITY_COMPONENT: AddressComponent = {
  componentName: {text: 'Mountain View', languageCode: 'en'},
  componentType: 'locality',
  confirmationLevel: null,
  isInferred: false,
  isSpellCorrected: false,
  isReplaced: false,
  isUnexpected: false
};

function makeFakeValidationResponse(
    address: Partial<Address>, verdict: Verdict): AddressValidationResponse {
  return {
    result: {
      verdict,
      address: {
        formattedAddress: null,
        postalAddress: null,
        addressComponents: [],
        ...address
      },
    },
    responseId: ''
  };
}

describe('SuggestValidationAction', () => {
  it('returns FIX when an address is missing a non-subpremise component',
     () => {
       const suggestion = suggestValidationAction(makeFakeValidationResponse(
           {missingComponentTypes: ['locality']}, GOOD_VERDICT));
       expect(suggestion.suggestedAction).toBe(SuggestedAction.FIX);
     });

  it('returns FIX when the validation granularity is OTHER', () => {
    const suggestion = suggestValidationAction(makeFakeValidationResponse(
        {}, {...GOOD_VERDICT, validationGranularity: Granularity.OTHER}));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.FIX);
  });

  it('returns FIX when there is a suspicious component', () => {
    const suggestion = suggestValidationAction(makeFakeValidationResponse(
        {
          addressComponents: [{
            ...LOCALITY_COMPONENT,
            confirmationLevel: ConfirmationLevel.UNCONFIRMED_AND_SUSPICIOUS
          }]
        },
        GOOD_VERDICT));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.FIX);
  });

  it('returns FIX when there is an unresolved token', () => {
    const suggestion = suggestValidationAction(makeFakeValidationResponse(
        {unresolvedTokens: ['foobar']}, GOOD_VERDICT));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.FIX);
  });

  it('returns CONFIRM when there is a non-minor inferred component', () => {
    const suggestion = suggestValidationAction(makeFakeValidationResponse(
        {
          addressComponents: [{
            ...LOCALITY_COMPONENT,
            isInferred: true,
          }]
        },
        GOOD_VERDICT));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.CONFIRM);
  });

  it('returns CONFIRM when there is a replaced component', () => {
    const suggestion = suggestValidationAction(makeFakeValidationResponse(
        {}, {...GOOD_VERDICT, hasReplacedComponents: true}));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.CONFIRM);
  });

  it('returns ADD_SUBPREMISES when a US address doesn\'t have one', () => {
    const suggestion = suggestValidationAction(makeFakeValidationResponse(
        {
          missingComponentTypes: ['subpremise'],
          postalAddress: {regionCode: 'US'}
        },
        GOOD_VERDICT));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.ADD_SUBPREMISES);
  });

  it('returns ACCEPT for a complete verdict without any issues', () => {
    const suggestion =
        suggestValidationAction(makeFakeValidationResponse({}, GOOD_VERDICT));
    expect(suggestion.suggestedAction).toBe(SuggestedAction.ACCEPT);
  });
});
