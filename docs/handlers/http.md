# Built-in HTTP request handlers

Corncierge comes with a few built-in request handlers that deal with other noteable features.

The built in request handlers do not respond with any data as they are meant to be an API.

## Streaming Requests

These paths are all prefixed by `/streaming`

* `/streamstart`: when sent the correct data, will trigger a discord notification as set up in the database
* `/streamstop`: when sent the correct data, will trigger a discord message edit as set up in the database
