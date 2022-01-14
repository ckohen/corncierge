/**
 * The length of a commercial that can be served to viewers, one of:
 * * 30
 * * 60
 * * 80
 * * 120
 * * 150
 * * 180
 * @typedef {number} CommercialLength
 */

/**
 * Data returned when starting a commercial
 * @typedef {Object} CommercialReturnData
 * @property {CommercialLength} length the length of the triggered commercial
 * @property {string} message an error message, if an error occured
 * @property {number} retryAfter the number of seconds until the next commercial can be served
 */
