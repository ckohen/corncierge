'use strict';

module.exports = (comp, vidNameArr) =>
  comp
    .setColor('music')
    .setTitle('Choose a song by commenting a number between 1 and 5')
    .addField('Song 1', vidNameArr[0])
    .addField('Song 2', vidNameArr[1])
    .addField('Song 3', vidNameArr[2])
    .addField('Song 4', vidNameArr[3])
    .addField('Song 5', vidNameArr[4])
    .addField('Exit', 'exit');
