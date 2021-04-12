const express = require('express');
const route = require('./route');
const cors = require('cors');
const app = express();

const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost/',
    'http://localhost:8080/',
    'http://localhost:8100/',
    ''
  ];

  
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
    callback(null, true);
    } else {
    callback(new Error('Origin not allowed by CORS'));
    }
}
}

// Enable preflight requests for all routes
app.options('', cors(corsOptions));

app.use(cors());

app.use(route);

app.listen(process.env.PORT  || 3000,()=>
    console.log("Start servidor")
)