# FixYourPrompts Icons and Favicon Assets

This directory contains all the icon and favicon assets for the FixYourPrompts application.

## Files Created

### Favicon Assets
- `favicon.svg` - Main favicon (32x32, scalable)
- `favicon-16x16.svg` - Optimized for 16x16 display
- `favicon-32x32.svg` - Optimized for 32x32 display

### App Icons
- `icon-192x192.svg` - Standard app icon (192x192)
- `icon-512x512.svg` - Large app icon (512x512)
- `apple-touch-icon.svg` - iOS app icon (180x180)

### PWA Support
- `manifest.json` - Web app manifest for PWA installation

### PNG Conversion Ready
- `icon-192x192.png.svg` - SVG optimized for PNG conversion (192x192)
- `icon-512x512.png.svg` - SVG optimized for PNG conversion (512x512)

## Design Concept

The icons represent the core concept of FixYourPrompts - improving and refining AI prompts:

- **Visual Elements:**
  - Document representation (before/after text)
  - Transformation arrow showing improvement
  - Sparkles indicating enhancement/refinement
  - "FYP" monogram for brand recognition
  - Color scheme: Primary blue (#4F46E5) with accent colors

- **Symbolism:**
  - Gray text lines represent unoptimized prompts
  - Green text lines represent improved prompts
  - Golden sparkles and arrows indicate the transformation process
  - Checkmarks show quality assurance

## Technical Details

- All icons are created as SVG for scalability and crisp rendering
- Uses semantic color coding (red=before, green=after, gold=improvement)
- Optimized for both light and dark backgrounds
- Follows modern icon design principles
- PWA-ready with proper manifest configuration

## Converting to PNG

To convert the SVG files to PNG format for older browser support:

1. Use the `.png.svg` files which are optimized for raster conversion
2. Use any SVG to PNG converter tool
3. Maintain the specified dimensions (192x192, 512x512)
4. Replace the `.svg` extensions in manifest.json with `.png` if using PNG versions

## Browser Support

- Modern browsers: Full SVG icon support
- Older browsers: Will fallback to standard favicon behavior
- iOS devices: Optimized apple-touch-icon
- PWA installations: Full icon support with manifest.json