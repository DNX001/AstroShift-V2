# Technical notes — three-workspace polish

## Architecture

`AppShell` owns one `ObservationProvider` around the routed workspace and the one persistent `AstroBotDrawer` instance. The provider keeps a successful FITS registration result available when the user navigates from Observatory to Science Lab or AstroBot.

`AppShell` also owns the AstroBot draft string and passes `setAstroBotDraft` to `AstroBotWorkspace` through React Router's outlet context. Starter prompt buttons therefore prefill the same shared composer rather than creating a second chat implementation.

## Current API contract used

- `GET /api/health`
- `POST /api/chat` with `{ message, history, dataset_context? }`
- `POST /api/blink-data` multipart fields `file_a` and `file_b`

The service continues accepting either `response` or `reply` as the assistant output field.

## Known boundary

The team backend source also defines `POST /api/analytics/delta`, which accepts two 2D matrices. The current browser upload flow only receives rendered PNG data URIs and FITS metadata. It does not receive matrices. Do not pass normalized PNG pixel values as a substitute for calibrated FITS arrays: the backend renderer normalizes frames for display, so those display pixels are not a scientifically faithful input to the delta endpoint.

## Session lifecycle

- Successful upload: result and metadata are stored in React memory.
- Route navigation: result remains available.
- Selecting a new file or clearing the comparison: prior result is cleared.
- Browser refresh: result is cleared.
- AstroBot request: current frame metadata and an explicit interpretation-limit note are attached; image bytes are not sent.
