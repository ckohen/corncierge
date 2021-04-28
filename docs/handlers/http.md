# Built-in HTTP request handlers

Corncierge comes with a few built-in request handlers that deal with other noteable features.

The built in request handlers do not respond with any data as they are meant to be an API.

## Streaming Requests

These paths are all prefixed by `/streaming`

* `/streamstart`: when sent the correct data, will trigger a discord notification as set up in the database
* `/streamstop`: when sent the correct data, will trigger a discord message edit as set up in the database

## Generic Requests

These paths have no prefix

* `/success`: a generic success page

## API Requests

These paths are all prefixed by `/api`

* `/twitch/auth`: a redirect uri for twitch oauth, only takes authorization codes, not token