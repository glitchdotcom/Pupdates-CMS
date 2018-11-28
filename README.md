# Parcel + React = :heart:

This is a simple starter project that uses [Parcel](https://parceljs.org/) to build the client bundle, [Material UI](https://material-ui.com/) as the main React Component library, and [Express](https://expressjs.com/) in the backend. It also uses [Babel](https://babeljs.io/) and [ESLint](https://eslint.org/).

As always in Glitch, you can decide what to keep and what to remove. For example, you might not want Material UI. Later in this document it is explained how to get rid of it.


## How to use this?

First of all, remix it ;)

You can edit and create more files in the `backend/` folder to modify the backend behavior. For the frontend, use the files in `frontend/`. The frontend bundle is built on the fly by Parcel, and it already supports React, JSX, Less, Stylus, CSS etc., so you can focus on writing code instead of configuring your bundler (gone are the days of tweaking webpack.config.js).

You can add more npm libraries in package.json, and use them in both the backend and the frontend.

If you have the app open on another tab (if not, click the `Show` button), you will see that every change you make to the frontend code (files in `frontend/`) is applied immediately on the app, very quickly. This is possible thanks to the Parcel watcher and Hot Module Replacement, which is a background process that communicates bundle updates to all the connected browsers.

On the other hand, changes to the backend code (files in `backend/`) require that you refresh the app tab manually.


## Can you make an example?

Sure! This simple demo shows a custom "circular progress indicator". Click the `Show` button to see it. You might want to make it bigger. Let's change it!

1) If you didn't already, remix this project
2) Click `Show` to open the app on a new tab
3) Go to the file `frontend/index.js`
4) At line 8, change the size parameter to 400.

Here you go! You should now see a bigger indicator in the app tab.


## I don't like Material UI, can I remove it?

Of course you can!


## How does it work?

### Parcel

Parcel is doing the heavylifting here. If you don't know what it is, it's probably good that you check out its [website](https://parceljs.org/), but I'll try to describe it quickly here. Parcel is a "bundler", that is: it takes as input a bunch of JS, CSS, HTML files (and more!), and figures out how to create a set of output files (a "bundle") that browsers know how to use.

Parcel collects input files one at a time. It starts with `frontend/index.html`. There, it sees that a script called `index.js` is required. So it adds `index.js` to its input files, and then goes on and parses it. In `index.js`, it sees some `import` statements, so it adds those to its list of input files. And so on...

At a certain point, it will have collected all the inputs: it then does a few advanced transformations of the source code (it "transpiles" the source), merge it all together, creates a big `bundle.js` file, and places it in a folder named `dist/`. You don't see this folder in the editor because it is listed in `.gitignore`.

At last, Parcel creates a new `index.html` file, with exactly the same content as the original but that references the `bundle.js` instead of `index.js`, and places it in the `dist/` folder too.

If you check `backend/server.js`, you'll see that it serves the content of the `dist/` folder (line 17) and you can also spot a reference to `dist/index.html` :)

### Parcel watcher

Parcel also has a very cool feature, which is a "watcher": it is a process that runs in the background and updates the bundle when an input file is changed. This allows updates to be applied very quickly! If you check the Logs (in the `Status` pane) after you make a change, you'll notice that Parcel says "Built in 24ms." Or something like that. It is able to update the whole bundle in just a few milliseconds!

Another thing that the Parcel watcher does for us is telling all the connected browsers when the bundle has changed. It does so by using Hot Module Replacement (HMR): it sends bundle updates through a websocket. In order to make this specific thing work on Glitch, we need a special "HMR proxy": it is defined in `backend/utils.js` and used in `backend/server.js`.

### watch.json

By default, Glitch restarts _the entire_ user app when a js file is changed (also json files and a few other file types). This means that the Parcel watcher and HMR would be restarted too :( this would slow down bundle updates quite a bit, and require the developer to manually refresh the app tab after every change.

Gladly, this behavior can be customised with a file called `watch.json`. If you look at it in this project, this is exactly what it is doing: it is telling Glitch to only restart the user app when _backend_ files are changed, or `.env` (the file where you can store your secrets without showing them to the world, even if your project is public).

Additionally, it is telling Glitch to run the install step (npm install) when you change package.json (since you want to get new dependencies if you add them there!).

There is also another setting: `noSavedEvents: true`. By default, Glitch refreshes the app tab when a change happens, even if it doesn't trigger a restart or an install. But we don't want that, because the HMR is updating the page for us. That's why we disable the "saved" events, which are the events that cause the app tab to be refreshed. You are right... we might probably rename the setting to `autoRefresh: false` ;)

### The `prestart` script in package.json

You're very curious! You noticed that we have a strange `prestart` command in `package.json`. What is it? You don't even see it in the editor!

First, the easy part: you don't see it because it is inside a directory that starts with a dot, and that's a Unix/Linux convention to indicate an "hidden" directory. The editor doesn't show hidden directories. We decided to do so because you don't really need to see or change that file to use this project. But you can still see (and change!) it using the Console.

The `prestart` script runs before the `start` script. If you check the file that it invokes, `.tools/watch.sh`, you'll see that this file is used to start the Parcel watcher! Here you go: before we start the server (the backend), we start the Parcel watcher :) The script also does some Glitch-specific things to make the HMR work on Glitch, and to make Parcel use less memory, because Glitch only provides 512MB of RAM.

You might have also noticed that the `prestart` script ends with a `&`: it means "run this command in the background": yes, because we don't want the Parcel watcher to "finish" before we start the server! We want the watcher to run _while_ the server is running.
