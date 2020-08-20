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

app.log.out('info', '#', 'Starting...');

app.boot();