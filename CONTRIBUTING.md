# Contributing to ~pupdates-editor 🐶

The contribution workflow for ~pupdates-editor is similar to the workflow we use for ~community:

## Making Changes
[Remix ~pupdates-editor](https://glitch.com/edit/#!/remix/pupdates-editor) and make your changes in the remix.

## First Time Setup

On your local machine, clone the [FogCreek/Pupdates-CMS](https://github.com/FogCreek/Pupdates-CMS) repository from Github:

```bash
git clone git@github.com:FogCreek/Pupdates-CMS.git
```

Then on your machine, run the setup script to add a remote endpoint for the live pupdates editor:

```bash
 sh sh/setup.sh
```

## Making a Pull Request

Run `sh sh/setup.sh my-remix`.

## Updating a Pull Request

Run `sh sh/update.sh my-remix`.

## Merging a Pull Request

Once your pull request is approved, merge it into `master`. Then run `git pull` in the editor console for `pupdates-editor`.
