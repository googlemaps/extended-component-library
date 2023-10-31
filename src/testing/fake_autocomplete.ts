/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

/** Creates a Jasmine spy to replace an Autocomplete object. */
export const makeFakeAutocomplete = () =>
    jasmine.createSpyObj<google.maps.places.Autocomplete>(
        'Autocomplete',
        ['addListener', 'bindTo', 'getBounds', 'getPlace', 'setOptions']);