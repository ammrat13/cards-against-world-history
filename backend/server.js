// Imports ---------------------------------------------------------------------

// Express.js
const express = require('express');
const app = express();


// Configuration ---------------------------------------------------------------

// What port to listen on
// If PORT <= 1024, then sudo is required
const PORT = 80;


// Static Files ----------------------------------------------------------------

app.use(express.static("../frontend"));


// Listen ----------------------------------------------------------------------

app.listen(PORT, () => console.log("Listening on port " + PORT));