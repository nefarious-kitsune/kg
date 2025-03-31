# KG/dev

This is the development branch for [Miku's Shrine](https://kg.kitsune21.com)

## Scripts

To **build** the site, run `npm run build`. The script will build the site
in three stages:
1. Execute all `prebuild.js` commands in [source/](/source/) directory
2. Execute all `build.js` commands in [source/](/source/) directory
3. Process Web content (.html, .css, etc.) and export content to the
[site/](/site/) directory

To **test** the site locally, run `npm run test`. The script will run a
Web server (localhost:9000/) of the exported site content

To **clean** the source files, run `npm run clean`. The script will trim
all trailing whitespace from the source file.
