# Pursely Unit Economics Founder Discovery

A static, browser-only form built from `Pursely_Unit_Economics_Founder_Discovery.csv`. Each prompt is shown in plain language with the source-template wording underneath for reference; exported CSVs retain the source wording. It has no server or build step. Answers autosave in the respondent's browser and export as a CSV matching the source template, with respondent and export metadata added at the end.

## Deploy on Vercel

1. Import this repository into Vercel.
2. Set **Root Directory** to `founder-discovery-form`.
3. Leave the framework preset as **Other** and the build command blank.
4. Deploy. Vercel serves `index.html`, `app.js`, and `style.css` as static files. The question data is embedded in `index.html`, so the form does not need a separate data request.

For a quick preview, serve this directory with any static file server (for example, `python3 -m http.server 8000` from this directory) and open `http://localhost:8000`. The form uses `fetch()` to load its field definitions, so it should be served over HTTP rather than opened directly as a `file://` URL.

## Brand styling

The form uses the supplied Pursely logo, a brand-aligned cinematic 2.5D illustration, and the brand guide palette: Pursely Blue, Deep Navy, Soft Blue, Growth Green, Warm Orange, and the specified neutral colors. Sora is used for display headings, Inter for reading, and IBM Plex Sans for labels and metadata.

## Data handling

Form answers and respondent details are stored in local storage in that browser. They are not submitted to Pursely or any backend. Each team member downloads their own CSV and shares it with the CFO/CEO for collation. Use a separate browser profile or clear the form's site data when switching respondents on a shared device.
