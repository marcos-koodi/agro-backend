const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost/',
    'http://localhost:8080/',
    'http://localhost:8100/',
    ''
  ];

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