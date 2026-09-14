/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {LatLng, LatLngAltitude, LatLngAltitudeLiteral, LatLngBounds, LatLngBoundsLiteral, LatLngLiteral} from '../utils/googlemaps_types.js';

/**
 * A fake `LatLng` class for testing purposes, that does not depend on the
 * `google.maps.LatLng` constructor loaded by the API.
 */
export class FakeLatLng implements LatLng {
  constructor(
      private readonly latitude: number,
      private readonly longitude: number,
  ) {}

  lat(): number {
    return this.latitude;
  }
  lng(): number {
    return this.longitude;
  }

  equals(other: LatLng): boolean {
    return this.lat() === other.lat() && this.lng() === other.lng();
  }
  toUrlValue(): string {
    throw new Error('toUrlValue is not implemented');
  }
  toJSON(): LatLngLiteral {
    return {'lat': this.latitude, 'lng': this.longitude};
  }
  toString(): string {
    return `(${this.latitude},${this.longitude})`;
  }
}

/**
 * A fake `LatLngAltitude` class for testing purposes, that does not depend on
 * the `google.maps.LatLngAltitude` constructor loaded by the API.
 */
export class FakeLatLngAltitude implements LatLngAltitude {
  readonly lat: number;
  readonly lng: number;
  readonly altitude: number;

  constructor(
      latOrLiteral: number|LatLngAltitudeLiteral|LatLngLiteral,
      lng: number = 0,
      altitude: number = 0,
  ) {
    if (typeof latOrLiteral === 'number') {
      this.lat = latOrLiteral;
      this.lng = lng;
      this.altitude = altitude;
    } else {
      this.lat = latOrLiteral.lat;
      this.lng = latOrLiteral.lng;
      this.altitude = (latOrLiteral as LatLngAltitudeLiteral).altitude ?? 0;
    }
  }

  equals(other: LatLngAltitude|LatLngAltitudeLiteral|null): boolean {
    if (!other) return false;
    return this.lat === other.lat && this.lng === other.lng &&
        this.altitude === other.altitude;
  }

  toJSON(): LatLngAltitudeLiteral {
    return {lat: this.lat, lng: this.lng, altitude: this.altitude};
  }

  toString(): string {
    return `(${this.lat},${this.lng},${this.altitude})`;
  }
}

function isLatLngBoundsLiteral(bounds: LatLngBounds|LatLngBoundsLiteral):
    bounds is LatLngBoundsLiteral {
  return (typeof (bounds as LatLngBoundsLiteral).north === 'number');
}

/**
 * A fake `LatLngBounds` class for testing purposes, that does not depend on the
 * `google.maps.LatLngBounds` constructor loaded by the API.
 */
export class FakeLatLngBounds implements LatLngBounds {
  constructor(private readonly boundsLiteral: LatLngBoundsLiteral = {
    north: -90,
    south: 90,
    east: -180,
    west: 180
  }) {}

  getNorthEast(): LatLng {
    return new FakeLatLng(this.boundsLiteral.north, this.boundsLiteral.east);
  }
  getSouthWest(): LatLng {
    return new FakeLatLng(this.boundsLiteral.south, this.boundsLiteral.west);
  }
  toJSON(): LatLngBoundsLiteral {
    return this.boundsLiteral;
  }
  union(other: LatLngBounds|LatLngBoundsLiteral): LatLngBounds {
    const {north, south, east, west} = this.boundsLiteral;
    const otherLiteral = isLatLngBoundsLiteral(other) ? other : other.toJSON();
    this.boundsLiteral.north = Math.max(north, otherLiteral.north);
    this.boundsLiteral.south = Math.min(south, otherLiteral.south);
    this.boundsLiteral.east = Math.max(east, otherLiteral.east);
    this.boundsLiteral.west = Math.min(west, otherLiteral.west);
    return this;
  }

  contains(latLng: LatLng|LatLngLiteral): boolean {
    throw new Error('contains is not implemented');
  }
  equals(other: LatLngBounds|LatLngBoundsLiteral): boolean {
    throw new Error('equals is not implemented');
  }
  extend(point: LatLng|LatLngLiteral): LatLngBounds {
    const lat = typeof point.lat === 'function' ? point.lat() : point.lat;
    const lng = typeof point.lng === 'function' ? point.lng() : point.lng;
    return this.union({north: lat, south: lat, east: lng, west: lng});
  }
  getCenter(): LatLng {
    throw new Error('getCenter is not implemented');
  }
  intersects(other: LatLngBounds|LatLngBoundsLiteral): boolean {
    throw new Error('intersects is not implemented');
  }
  isEmpty(): boolean {
    throw new Error('isEmpty is not implemented');
  }
  toSpan(): LatLng {
    throw new Error('toSpan is not implemented');
  }
  toUrlValue(precision?: number): string {
    throw new Error('toUrlValue is not implemented');
  }
}
