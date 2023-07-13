#!/bin/bash

# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

# Make a local copy of the Extended Component Library CDN bundle where
# Web Dev Server can access it.
cp ../../dist/index.min.js src/extended_component_library.min.js

# Replace the reference to the CDN bundle with the local file.
sed -i 's|https://unpkg.com/@googlemaps/extended-component-library|extended_component_library.min.js|' src/index.html

# Replace the API key attribute with an environment variable.
sed -i "s|gmpx-api-loader key=\"[^\"]*\"|gmpx-api-loader key=\"$MAPS_API_KEY\"|" src/index.html
