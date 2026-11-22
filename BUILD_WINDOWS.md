# Windows build — v0.5.16

Requires Windows 10/11 and Node.js 22 with internet access for npm dependencies.

In PowerShell, change directory to `Windows`, run `npm install`, then `npm run dist:win`. The installer appears in `Windows/dist`. Alternatively use the `Windows installer (development)` GitHub Actions workflow and download its artifact.

This is an unsigned development build. Export your JSON accounting backup before migrating. Windows stores data separately from the browser and Android app.
