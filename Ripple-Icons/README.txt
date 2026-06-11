RIPPLE — APP ICON PACKAGE
=========================
"One good action. Infinite impact."

Brand mark: concentric ripple rings radiating from a center dot,
white on a blue->teal gradient (#208AEF -> #00C9A7).

----------------------------------------------------------------
iOS  —  ios/AppIcon.appiconset/
----------------------------------------------------------------
Drop the whole "AppIcon.appiconset" folder into your Xcode project's
Assets.xcassets (replace the existing AppIcon set), or in Xcode:
Assets.xcassets > drag the folder in.

It uses the modern single-size (1024x1024) format with three
appearances — Xcode generates every other size automatically:
  • AppIcon-1024.png         Light / default (no alpha)
  • AppIcon-Dark-1024.png    Dark appearance (teal glow)
  • AppIcon-Tinted-1024.png  Tinted appearance (grayscale; iOS
                             applies the user's hue + dark backdrop)
Requires Xcode 15+ / iOS 18 for dark & tinted. Older Xcode still
reads the 1024 light icon fine.

----------------------------------------------------------------
Android  —  android/app/src/main/res/
----------------------------------------------------------------
Merge the "res" folder into your app module
(app/src/main/res). It contains:
  • mipmap-anydpi-v26/ic_launcher.xml + ic_launcher_round.xml
        Adaptive icon (background + foreground + monochrome layers).
  • mipmap-{mdpi…xxxhdpi}/
        ic_launcher.png / ic_launcher_round.png   (legacy < API 26)
        ic_launcher_foreground / _background       (adaptive layers)
        ic_launcher_monochrome                     (themed icon, API 33+)
No manifest changes needed if you already reference
@mipmap/ic_launcher (the default).

play_store_512.png — 512x512 listing icon for the Play Console.

----------------------------------------------------------------
Web / PWA  —  web/
----------------------------------------------------------------
  • favicon-16/32/48.png
  • icon-192.png, icon-512.png (any-purpose)
  • maskable-512.png (extra padding for maskable PWA contexts)
  • manifest.json

Add to your <head>:
  <link rel="icon" type="image/png" sizes="32x32" href="web/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="web/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="...AppIcon-180.png">
  <link rel="manifest" href="web/manifest.json">
