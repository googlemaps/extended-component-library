## Styling and theming

To change the look and feel of components, you’ll use [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*). Each component’s documentation will indicate which CSS custom properties it supports for styling.

For example, the Place Picker component exposes the `--gmpx-color-surface` property to adjust the background color of the text input. You could use the following CSS to set this color to blue for all Place Pickers on the page:

```css
body {
  --gmpx-color-surface: blue;
}
```

Global theming options let you consistently customize the color and typography for components in your application. You can choose a font and color scheme to match your brand, or default to the look of Google Maps. These are available as *global style tokens*, applicable across multiple components. This table lists the global style tokens used in the library: these are a good starting point to consistently adjust the look and feel of components on your page.

| CSS custom property                 | Default         | Description           | 
| ----------------------------------- | --------------- | --------------------- |
| `--gmpx-color-surface`              | `#fff`          | Surface theme color, used as a background. |
| `--gmpx-color-on-surface`           | `#212121`       | Color used for text and other elements placed on top of the surface color. |
| `--gmpx-color-on-surface-variant`   | `#757575`       | Color used for supporting metadata and other elements placed on top of the surface color. |
| `--gmpx-color-primary`              | `#1e88e5`       | Primary theme color used for interactive text and elements, like buttons and icons. Also used to highlight an active or selected state like in a focused text field’s border. |
| `--gmpx-color-on-primary`           | `#fff`          | Color used for text or icons on top of a `--gmpx-color-primary` background. |
| `--gmpx-font-family-base`           | `'Google Sans Text', sans-serif` | Typeface for body text, captions, and labels. |
| `--gmpx-font-family-headings`       | `'Google Sans Text', sans-serif` | Typeface for headings. |
| `--gmpx-font-size-base`             | `0.875rem`      | Baseline font size, from which other text elements in a component are scaled. For most users with default settings, this will be 14px. |

## Terms of Service

The Extended Component Library uses Google Maps Platform services, and any use of Google Maps Platform is subject to the [Terms of Service](https://cloud.google.com/maps-platform/terms?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).

For clarity, the Extended Component Library, and each underlying component, is not a Google Maps Platform Core Service. 

## Attribution

As a reminder, you must comply with all applicable attribution requirements for the Google Maps Platform API(s) and SDK(s) used by the Extended Component Library.

## Support

This library is community supported, with sponsorship from Google to maintain and ensure a base level of quality. It is not governed by the Google Maps Platform [Technical Support Services Guidelines](https://cloud.google.com/maps-platform/terms/tssg?utm_source=github&utm_medium=documentation&utm_campaign=&utm_content=web_components).

Google will make efforts to support the public and protected surface of the library and maintain backwards compatibility in the future; however, while the library is in version 0.x, Google reserves the right to make backwards-incompatible changes. If Google does remove some functionality (typically because better functionality exists or if the feature proved infeasible), the intention is to deprecate the functionality and give developers adequate time to update their code.