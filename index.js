/*
 * Wildfire
 */

'use strict';

// Environment
require('dotenv').config();

// Configuration
const config = require('./config');

// Run
const app = require('./app')(config);

app.log('#', 'Starting...');

app.boot();