# TCH Studio tools
Used by the TCH Studio scheduled agents. Not linked from the website.
- `render_mockups.js` + `mock.html`: batch hoodie mockups from the site's own mockup engine (serve the repo root on port 8777 first).
- `frames-example.html`: example layouts for 1080x1350 carousel slides and 1080x1920 reel frames (navy #1F2A44, gold #C9A35A, cream #FBF8F2, Poppins). Screenshot each element with Playwright.
- `make_reel.sh out.mp4 img1.png:2.2 img2.png:1.0 ...`: stills to a 30fps reel with a slow push-in and a silent audio track.
Public media goes in `/media/studio/` and is served at https://thecustomizedhouse.com/media/studio/<file>.
