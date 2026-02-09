# Font Files

Place your Fixel `.woff2` files here following this naming convention:

## Fixel Text (body text, buttons, labels)

```text
FixelText-Regular.woff2
FixelText-Medium.woff2
FixelText-SemiBold.woff2
FixelText-Bold.woff2
FixelText-RegularItalic.woff2
FixelText-MediumItalic.woff2
FixelText-SemiBoldItalic.woff2
FixelText-BoldItalic.woff2
```

## Fixel Display (headings, large text)

```text
FixelDisplay-Regular.woff2
FixelDisplay-Medium.woff2
FixelDisplay-SemiBold.woff2
FixelDisplay-Bold.woff2
```

## Where to get the files

Download from <https://fixel.macpaw.com/> and place the `.woff2` versions here.

If your download only includes `.otf` or `.ttf`, you can convert to `.woff2` using
a tool like <https://cloudconvert.com/ttf-to-woff2> for optimal web performance.

## Adding more weights

If you need additional weights (Thin, ExtraLight, Light, ExtraBold, Black),
add the `.woff2` files here and update `../fonts.css` with matching `@font-face` rules.
