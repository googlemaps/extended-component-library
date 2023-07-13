/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as GMPX from '@googlemaps/extended-component-library/react';
import React from 'react';

import './App.css';
import {CollegePicker} from './CollegePicker';

const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
const DEFAULT_CENTER = '45,-98';
const DEFAULT_ZOOM = 4;
const DEFAULT_ZOOM_WITH_LOCATION = 16;

/**
 * Sample app that helps users locate a college on the map, with place info such
 * as ratings, photos, and reviews displayed on the side.
 */
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {college: undefined};
    this.overlayLayoutRef = React.createRef();
  }

  render() {
    // Converts the location LatLng object to a string in "lat,lng" format.
    // Note that (as of React 18) Web Components in JSX accept data only as
    // string attributes and not as properties.
    const location = this.state.college?.location?.toString().slice(1, -1);

    return (
      <div className="App">
        <GMPX.APILoader apiKey={API_KEY} />
        <GMPX.SplitLayout rowReverse rowLayoutMinWidth="700">
          <GMPX.OverlayLayout ref={this.overlayLayoutRef} slot="fixed">
            <div className="MainContainer" slot="main">
              <CollegePicker
                className="CollegePicker"
                forMap="gmap"
                onCollegeChange={(college) => this.setState({college})}
              />
              <GMPX.PlaceOverview
                size="large"
                place={this.state.college}
                googleLogoAlreadyDisplayed
              >
                <GMPX.IconButton
                  slot="action"
                  variant="filled"
                  onClick={() => this.overlayLayoutRef.current?.showOverlay()}
                >
                  See Reviews
                </GMPX.IconButton>
                <GMPX.PlaceDirectionsButton slot="action" variant="filled">
                  Directions
                </GMPX.PlaceDirectionsButton>
              </GMPX.PlaceOverview>
            </div>
            <div slot="overlay">
              <GMPX.IconButton
                autofocus
                className="CloseButton"
                onClick={() => this.overlayLayoutRef.current?.hideOverlay()}
              >
                Close
              </GMPX.IconButton>
              <GMPX.PlaceDataProvider place={this.state.college}>
                <GMPX.PlaceReviews />
              </GMPX.PlaceDataProvider>
            </div>
          </GMPX.OverlayLayout>
          <gmp-map
            id="gmap"
            slot="main"
            map-id="DEMO_MAP_ID"
            center={location ?? DEFAULT_CENTER}
            zoom={location ? DEFAULT_ZOOM_WITH_LOCATION : DEFAULT_ZOOM}
          >
            {location && (
              <gmp-advanced-marker position={location}></gmp-advanced-marker>
            )}
          </gmp-map>
        </GMPX.SplitLayout>
      </div>
    );
  }
}
