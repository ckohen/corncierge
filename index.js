/*
 * Wildfire
 */

'use strict';

// Environment
require('dotenv').config();

// Run
const app = require('./app')(config);

// Configuration
const config = require('./config');

app.log('#', 'Starting...');

app.boot();
