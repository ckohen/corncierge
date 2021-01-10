'use strict';

/* eslint-disable-next-line newline-per-chained-call */
module.exports = (comp, video, description) => comp.setThumbnail(video.thumbnail).setColor('RED').setTitle(video.title).setDescription(description);
