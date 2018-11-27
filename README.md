# Parcel + React

Parcel + React + Glitch = **`BEST.THING.EVER.`**

This is a very simple starter project that uses [Parcel](https://parceljs.org/) to build the client bundle, [Material UI](https://material-ui.com/) as the main React Component library, and [Express](https://expressjs.com/) in the backend.

## How to use this?

You can add more npm libraries in package.json, and use them in both the backend and the frontend. The frontend bundle is built on the fly by Parcel, and it already supports React, JSX, Less, Stylus, CSS etc., so you can focus on writing code instead of configuring your bundler (gone are the days of tweaking webpack.config.js).

If you have the site open on another tab (for example by clicking the `Show` button), you will see that every change you make to the frontend code (files in `frontend/`) is applied immediately on the live site, very quickly. This is possible thanks to the the fact that Parcel integrates Hot Module Reload, which is a shadow websocket server that communicates changes to the client bundle directly to all the open browsers.

On the other hand, changes to the backend code (files in `backend/`) require that you refresh the preview manually.

## Some example...?

Sure! This simple demo shows a custom "circular progress indicator". Click the `Show` button to see it. You might not like the color of this React component. Let's change it!

1) Remix this project
2) Click `Show` to see the current state of the UI
3) Open the file `circular-indicator.js`
4) 