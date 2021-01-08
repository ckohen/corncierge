/*
 * Corncierge
 */

'use strict';

// Environment
require('dotenv').config();

// Run
let app = require('./app');

// Get Configuration
const config = require('./config');

app = app(config);

app.log('#', 'Starting...');

app.boot();
