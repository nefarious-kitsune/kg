import http from 'https';

const sourceUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjO1u2_a4bemI376-bkPG9kx6wd8VbXCTEJPOvATTIkYd3jrjOE44JKhoyCFBk8YCFsDAMFQYtPqdD/pub?gid=1519544104&single=true&output=tsv';
let tsvData = '';

http.get(sourceUrl, (response) => {
  response.on('data', function(chunk) {
    tsvData += chunk;
  });
  response.on('end', function() {
    // prints the full CSV file
    console.log(tsvData);
  });
});
