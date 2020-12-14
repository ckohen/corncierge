module.exports = (comp, video, description) => comp
      .setThumbnail(video.thumbnail)
      .setColor('videoEmbed')
      .setTitle(video.title)
      .setDescription(description);