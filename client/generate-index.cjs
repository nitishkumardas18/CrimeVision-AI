const fs = require('fs');
const files = fs.readdirSync('.output/public/assets');
const js = files.find(f => f.startsWith('index') && f.endsWith('.js'));
const css = files.find(f => f.startsWith('styles') && f.endsWith('.css'));
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CrimeVision AI — Karnataka State Police</title>
    <meta name="description" content="AI-powered crime analytics, prediction and intelligence dashboard for Karnataka State Police." />
    <meta property="og:title" content="CrimeVision AI — Karnataka State Police" />
    <meta property="og:description" content="AI-powered crime analytics, prediction and intelligence dashboard." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="stylesheet" href="/app/assets/${css}">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  </head>
  <body>
    <script type="module" src="/app/assets/${js}"></script>
  </body>
</html>`;
fs.writeFileSync('.output/public/index.html', html);
console.log('Wrote index.html with JS:', js);
