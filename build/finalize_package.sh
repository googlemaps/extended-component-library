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

# Copy README files to the lib directory and keep file structure.
find . -type f -name 'README.md' -not -path '**/node_modules/**' -not -path '**/.wireit/**' -exec cp --parents {} ./lib \;

find ./lib/base -type f -name 'constants.*' -exec sed -i 's/'GIT'/'NPM'/g' {} \;
find ./lib -type f -name '*.md' -exec sed -i 's/utm_source=github/utm_source=npm/g' {} \;
find ./lib -type f -name '*.js' -exec sed -i 's/utm_source=github/utm_source=npm/g' {} \;

# Overwrite root level README with copy from lib directory.
mv -f ./lib/README.md .
