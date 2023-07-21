# ECL Angular Sample App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.2.

Then, Google Maps features were added by:

1. Installed the Extended Component Library via `npm i @googlemaps/extended-component-library`.
1. (TypeScript only) Installed the Google Maps typings with `npm i --save-dev @types/google.maps`, then opened `tsconfig.app.json` and added `"google.maps"` to `compilerOptions.types`.
1. (TypeScript only) Updated `tsconfig.json` with `moduleResolution: "Node16"`.
1. (TypeScript only) Updated `package.json` with `type: "module"`.
1. Added `CUSTOM_ELEMENTS_SCHEMA` to the schemas defined `app.module.ts`, telling Angular to be aware that Web Components are being used.
1. Imported Extended Component Library components at the top of `app.component.ts`.
1. Used Extended Component Library components, as HTML, in `app.component.html`.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.