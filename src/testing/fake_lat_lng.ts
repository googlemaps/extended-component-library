/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type LatLng = google.maps.LatLng;
type LatLngLiteral = google.maps.LatLngLiteral;
type LatLngBounds = google.maps.LatLngBounds;
type LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral;

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
