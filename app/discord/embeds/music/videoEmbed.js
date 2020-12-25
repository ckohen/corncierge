'use strict';

/* eslint-disable-next-line newline-per-chained-call */
module.exports = (comp, video, description) => comp.setThumbnail(video.thumbnail).setColor('videoEmbed').setTitle(video.title).setDescription(description);
