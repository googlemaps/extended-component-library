/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {LocalizationController} from '../../base/localization_controller.js';
import type {Place} from '../../utils/googlemaps_types.js';
import {PlaceDataConsumer} from '../place_data_consumer.js';


/**
 * Supported field names for `PlaceFieldText`, formatted as `Place` fields.
 */
export const PLACE_TEXT_FIELDS = [
  'businessStatus',
  'displayName',
  'formattedAddress',
  'id',
  'internationalPhoneNumber',
  'location',
  'location.lat',
  'location.lng',
  'nationalPhoneNumber',
  'plusCode.compoundCode',
  'plusCode.globalCode',
  'rating',
  'types',
  'userRatingCount',
] as const;

/**
 * Supported field names for `PlaceFieldText`, formatted as `PlaceResult`
 * fields.
 */
export const PLACE_RESULT_TEXT_FIELDS = [
  'business_status',
  'name',
  'formatted_address',
  'place_id',
  'international_phone_number',
  'geometry.location',
  'geometry.location.lat',
  'geometry.location.lng',
  'formatted_phone_number',
  'plus_code.compound_code',
  'plus_code.global_code',
  'rating',
  'types',
  'user_ratings_total',
] as const;

type PlaceTextField = typeof PLACE_TEXT_FIELDS[number];
type PlaceResultTextField = typeof PLACE_RESULT_TEXT_FIELDS[number];
/**
 * String union type of all supported field names for `PlaceFieldText`.
 */
export type TextField = PlaceTextField|PlaceResultTextField;

/**
 * Place types that can be rendered by PlaceFieldText. These are the "Table 1"
 * place types documented at:
 *
 * https://developers.google.com/maps/documentation/places/web-service/supported_types
 */
const ALLOWED_PLACE_TYPES = new Set([
  'accounting',
  'airport',
  'amusement_park',
  'aquarium',
  'art_gallery',
  'atm',
  'bakery',
  'bank',
  'bar',
  'beauty_salon',
  'bicycle_store',
  'book_store',
  'bowling_alley',
  'bus_station',
  'cafe',
  'campground',
  'car_dealer',
  'car_rental',
  'car_repair',
  'car_wash',
  'casino',
  'cemetery',
  'church',
  'city_hall',
  'clothing_store',
  'convenience_store',
  'courthouse',
  'dentist',
  'department_store',
  'doctor',
  'drugstore',
  'electrician',
  'electronics_store',
  'embassy',
  'fire_station',
  'florist',
  'funeral_home',
  'furniture_store',
  'gas_station',
  'gym',
  'hair_care',
  'hardware_store',
  'hindu_temple',
  'home_goods_store',
  'hospital',
  'insurance_agency',
  'jewelry_store',
  'laundry',
  'lawyer',
  'library',
  'light_rail_station',
  'liquor_store',
  'local_government_office',
  'locksmith',
  'lodging',
  'meal_delivery',
  'meal_takeaway',
  'mosque',
  'movie_rental',
  'movie_theater',
  'moving_company',
  'museum',
  'night_club',
  'painter',
  'park',
  'parking',
  'pet_store',
  'pharmacy',
  'physiotherapist',
  'plumber',
  'police',
  'post_office',
  'primary_school',
  'real_estate_agency',
  'restaurant',
  'roofing_contractor',
  'rv_park',
  'school',
  'secondary_school',
  'shoe_store',
  'shopping_mall',
  'spa',
  'stadium',
  'storage',
  'store',
  'subway_station',
  'supermarket',
  'synagogue',
  'taxi_stand',
  'tourist_attraction',
  'train_station',
  'transit_station',
  'travel_agency',
  'university',
  'veterinary_care',
  'zoo',
]);

function toPlaceTextField(field: TextField): PlaceTextField {
  switch (field) {
    case 'business_status':
      return 'businessStatus';
    case 'name':
      return 'displayName';
    case 'formatted_address':
      return 'formattedAddress';
    case 'place_id':
      return 'id';
    case 'international_phone_number':
      return 'internationalPhoneNumber';
    case 'geometry.location':
      return 'location';
    case 'geometry.location.lat':
      return 'location.lat';
    case 'geometry.location.lng':
      return 'location.lng';
    case 'formatted_phone_number':
      return 'nationalPhoneNumber';
    case 'plus_code.compound_code':
      return 'plusCode.compoundCode';
    case 'plus_code.global_code':
      return 'plusCode.globalCode';
    case 'rating':
      return 'rating';
    case 'user_ratings_total':
      return 'userRatingCount';
    default:
      return field;
  }
}

function getTopLevelPlaceField(field: TextField): keyof Place {
  return toPlaceTextField(field).split('.')[0] as keyof Place;
}

/**
 * Component that renders a string or numeric field of a `Place` or
 * `PlaceResult` as text. It can also render the field "types", in which case it
 * will show only the most applicable place type, if available.
 */
@customElement('gmpx-place-field-text')
export class PlaceFieldText extends PlaceDataConsumer {
  /**
   * The field to display, formatted as it is on either a `Place` or
   * `PlaceResult`.
   *
   * Allowed [`Place`
   * fields](https://developers.google.com/maps/documentation/javascript/reference/place)
   * are: `businessStatus`, `displayName`, `formattedAddress`, `id`,
   * `internationalPhoneNumber`, `location`, `location.lat`, `location.lng`,
   * `nationalPhoneNumber`, `plusCode.compoundCode`, `plusCode.globalCode`,
   * `rating`, `types`, and `userRatingCount`.
   *
   * You may also specify one of the equivalent [`PlaceResult` field
   * names](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceResult):
   * `business_status`, `name`, `formatted_address`, `place_id`,
   * `international_phone_number`, `geometry.location`, `geometry.location.lat`,
   * `geometry.location.lng`, `formatted_phone_number`,
   * `plus_code.compound_code`, `plus_code.global_code`, `rating`, `types`,
   * and `user_ratings_total`.
   */
  @property({type: String, reflect: true}) field?: TextField;

  protected readonly getMsg = LocalizationController.buildLocalizer(this);

  protected override render() {
    return html`<span>${this.getDisplayText()}</span>`;
  }

  /** @ignore */
  getRequiredFields(): Array<keyof Place> {
    return this.field ? [getTopLevelPlaceField(this.field)] : [];
  }

  protected override placeHasData(place: Place): boolean {
    return !!(this.field && this.getFieldValue(place, this.field) != null);
  }

  private getDisplayText(): string {
    const place = this.getPlace();
    if (!place || !this.field) return '';
    return this.getFieldValue(place, this.field) ?? '';
  }

  private getFieldValue(place: Place, field: TextField): string|null|undefined {
    switch (toPlaceTextField(field)) {
      case 'businessStatus':
        return this.renderBusinessStatus(place.businessStatus);
      case 'displayName':
        return place.displayName;
      case 'formattedAddress':
        return place.formattedAddress;
      case 'id':
        return place.id;
      case 'internationalPhoneNumber':
        return place.internationalPhoneNumber;
      case 'location':
        return place.location?.toString();
      case 'location.lat':
        return place.location?.lat().toString();
      case 'location.lng':
        return place.location?.lng().toString();
      case 'nationalPhoneNumber':
        return place.nationalPhoneNumber;
      case 'plusCode.compoundCode':
        return place.plusCode?.compoundCode;
      case 'plusCode.globalCode':
        return place.plusCode?.globalCode;
      case 'rating':
        return place.rating?.toString();
      case 'types':
        return place.types && this.getDisplayType(place.types);
      case 'userRatingCount':
        return place.userRatingCount?.toString();
      default:
        return undefined;
    }
  }

  private renderBusinessStatus(status: google.maps.places.BusinessStatus|null|
                               undefined): string|null|undefined {
    if (!status) return status;
    switch (status) {
      case 'CLOSED_PERMANENTLY' as google.maps.places.BusinessStatus:
        return this.getMsg('PLACE_CLOSED_PERMANENTLY');
      case 'CLOSED_TEMPORARILY' as google.maps.places.BusinessStatus:
        return this.getMsg('PLACE_CLOSED_TEMPORARILY');
      case 'OPERATIONAL' as google.maps.places.BusinessStatus:
        return this.getMsg('PLACE_OPERATIONAL');
      default:
        return undefined;
    }
  }

  /**
   * From a list of multiple place types, returns the formatted type to be
   * rendered by PlaceFieldText.
   *
   * @param placeTypes - A list of place types
   * @return The first allowed place type in the list, formatted for display,
   *     or null if there is no allowed type.
   */
  private getDisplayType(placeTypes: string[]): string|null {
    for (const placeType of placeTypes) {
      if (ALLOWED_PLACE_TYPES.has(placeType)) {
        return this.getMsg('PLACE_TYPE', placeType);
      }
    }
    return null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gmpx-place-field-text': PlaceFieldText;
  }
}
