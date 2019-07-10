# Glitch Community Home Editor

_A "micro-CMS" for the glitch.com homepage_

## How to update the home page

- Log into community-home-editor.glitch.me using your glitch.com account.
- Update the fields for the section you're changing.
- Preview your updates at glitch.com/index/preview (you will need to refresh after each change).
- When you're satisfied with your updates, click "Publish" on the preview page.


### Justin's Intro
A guide to the glitch community 'micro CMS'

the content of the home page is managed by a separate glitch project, ~community-home-editor. I built it this way as an experiment: ~community is already too big to run in a normal-sized container -- could new, mostly-independent pages run in separate projects? The answer is a resounding "kinda".

There are a couple of weird aspects to how ~community-home-editor works; some of these are fixable (but were out of scope for the homepage launch), while others are inherent to how its set up.

    ⁃ Currently, you must log into ~community-home-editor separately from glitch.com, and you must do so with email + token.** I think this can be resolved, but its a low priority.
    ⁃ Anyone with a glitch account can _see_ the CMS, but only glitch team members can _edit_ with it.** This is similar to how we used to edit the home page (i.e. anyone can see ~community in the editor, but only team members can edit it) but there's currently nothing in the UI that indicates if you have edit rights or not.
    ⁃ The UI doesn't look like the rest of Glitch.** This will be resolved when we have a shared component library.
    ⁃ There's no notion of multiple drafts or history.** The goals of the MVP were to make it possible to update the home page atomically, with a GUI interface and a live preview; any other features that one would expect from a CMS will come later.
    
This is how the community home editor works.

~community and ~community-home-editor both have copies of a file called `home.json` -- community has the **production data**, community-home-editor has the **working draft**.

    ⁃ when the user visits glitch.com, that page is using the production data.
    ⁃ when the user visits community-home-editor.glitch.me, it displays the working draft, which it  it GETs  from`/home.json`.
    ⁃ when the user updates a field on community-home-editor.glitch.me, that update is POSTed to `/home.json`, and it updates the working draft on disk.
    ⁃ when the user previews their change on glitch.com/index/preview, that page GETs the working draft from `community-home-editor.glitch.me/home.json`.
    ⁃ if the user resets all changes, then community-home-editor will GET the production data from glitch.com/api/home, and reset the working draft to match the production data.
    ⁃ if the user saves their changes, it will POST the working draft to glitch.com/api/home, and update the production data to match the working draft. 
