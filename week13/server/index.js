'use strict';

const express = require('express');

// init express
const app = new express();
const port = 3001;

// activate the server
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else 
    console.log(`Server listening at http://localhost:${port}`);
}); 
