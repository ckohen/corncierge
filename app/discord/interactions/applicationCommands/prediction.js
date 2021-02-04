'use strict';

const { MessageEmbed, Constants } = require('discord.js');
const cache = require('memory-cache');

module.exports = {
  name: 'prediction',
  description: 'prediction annoucments',
  usage: [
    'start [title] [option1] [option2]',
    'end <result> [predictionID]',
    'set <title|option1|option2> [predictionID]',
    'stats <odds1|odds2|total> [predictionID]',
    'stucture',
    'bastion',
    'win',
  ],

  async run(socket, interaction, args) {
    let responded = false;
    setTimeout(() => {
      if (!responded) {
        interaction.reply('Prediction action recieved, but is taking a while. If there are any errors, I will DM you!', { hideSource: true, ephemeral: true });
        responded = true;
      }
    }, 1500);

    const predictionChannel = '756336572835823746';
    const predictionRole = '756321825654439996';
    const ratelimit = 2 * 60 * 1000;
    const ratelimited = ['start', 'structure', 'bastion', 'win'];
    const startAlias = ['structure', 'bastion', 'win'];
    let method = args[0].name;
    args = args[0].options;

    // Rate limit prediction Creation
    const lastCreation = cache.get(`discord.twitch.prediction.create`);
    if (ratelimited.includes(method) && lastCreation) {
      respondPrivate(interaction, 'Another prediction was created very recently, please wait a bit before creating another!', responded);
      responded = true;
      return;
    }

    let lastPredictionID = cache.get(`discord.twitch.prediction.id`);
    let predictions;
    // Fetch messages in channel and filter to known predictions (fingers crossed)
    if (!lastPredictionID || !ratelimited.includes(method)) {
      const channelMessages = await interaction.client.channels.cache.get(predictionChannel).messages.fetch({ limit: 7 });
      predictions = channelMessages.filter(message => message.author.id === message.client.user.id && message.embeds.length > 0);
      await predictions.sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp);
    }

    // If the last prediction id wasn't in cache, get it from the predictions list
    if (!lastPredictionID) {
      lastPredictionID = getPredictionId(predictions.last()) ?? 0;
    }

    // Variables for use in switch
    let predictionID = lastPredictionID;
    let create;
    let toEdit;
    let newEmbed;
    let title;
    let option1;
    let option2;
    let odds1;
    let odds2;
    let total;
    let oldText;
    let oldArray;

    // Use start method for predefined
    if (startAlias.includes(method)) {
      switch (method) {
        case 'structure':
          title = 'Which Nether structure will Ant enter next?';
          option1 = 'Bastion';
          option2 = 'Fortress';
          break;
        case 'bastion':
          title = 'Which Type of Bastion will Ant enter next?';
          option1 = 'Housing / Stables';
          option2 = 'Treasure / Bridge';
          break;
        case 'win':
          title = 'Will Ant win the next round?';
          option1 = 'Yes';
          option2 = 'No';
          break;
      }
      method = 'start';
    }

    switch (method) {
      // Create a new prediction
      case 'start':
        create = true;
        newEmbed = new MessageEmbed().setColor('RANDOM').setFooter(`Prediction #${lastPredictionID + 1}`);
        if (!title) {
          title = getArg(args, 'title') ?? 'New Prediction, who knows what it is?';
        }
        newEmbed.setTitle(title);
        if (!option1) {
          option1 = getArg(args, 'option1') ?? '👍';
        }
        newEmbed.addField('First Option', option1, true);
        if (!option2) {
          option2 = getArg(args, 'option2') ?? '👎';
        }
        newEmbed.addField('Second Option', option2, true);

        // Handle worst case purple embed due to its use for checking ended
        if (newEmbed.color === Constants.Colors.PURPLE) {
          newEmbed.setColor('BLURPLE');
        }
        if (!responded) {
          interaction.reply('Prediction Started!', { hideSource: true, ephemeral: true });
          responded = true;
        }
        break;
      // Basically just a fancy handler for set
      case 'end':
        if (getArg(args, 'predictionID')) {
          predictionID = getArg(args, 'predictionID');
        }
        toEdit = getPrediction(predictions, predictionID);
        newEmbed = toEdit?.embeds[0];
        if (!newEmbed) {
          respondPrivate(interaction, `Unable to end prediction ${predictionID}, it may be too old!`, responded);
          responded = true;
          return;
        }
        if (checkEnded(newEmbed)) {
          respondPrivate(interaction, `Prediction ${predictionID} has already been ended`, responded);
          responded = true;
          return;
        }
        newEmbed.setColor('PURPLE').setDescription('*This prediction has ended*');
        newEmbed.fields[args.find(arg => arg.name === 'result').value].name += ' ✅';
        if (!responded) {
          interaction.reply(`Prediction ${predictionID} ended!`, { hideSource: true, ephemeral: true });
          responded = true;
        }
        break;
      // Set some properties
      case 'set':
        if (getArg(args, 'predictionID')) {
          predictionID = getArg(args, 'predictionID');
        }
        toEdit = getPrediction(predictions, predictionID);
        newEmbed = toEdit?.embeds[0];
        if (!newEmbed) {
          respondPrivate(interaction, `Unable to edit prediction ${predictionID}, it may be too old!`, responded);
          responded = true;
          return;
        }
        if (checkEnded(newEmbed)) {
          respondPrivate(interaction, `Prediction ${predictionID} has already been ended, you can no longer edit this property!`, responded);
          responded = true;
          return;
        }
        if (args.length === 0 || (args.length === 1 && getArg(args, 'predictionID'))) {
          respondPrivate(interaction, 'Please specify at least one parameter to edit!', responded);
          responded = true;
          return;
        }
        title = getArg(args, 'title');
        option1 = getArg(args, 'option1');
        option2 = getArg(args, 'option2');
        if (title) {
          newEmbed.setTitle(title);
        }
        if (option1) {
          oldText = newEmbed.fields[0].value;
          oldArray = oldText.split('\n');
          oldArray[0] = option1;
          newEmbed.fields[0].value = oldArray.join('\n');
        }
        if (option2) {
          oldText = newEmbed.fields[1].value;
          oldArray = oldText.split('\n');
          oldArray[0] = option2;
          newEmbed.fields[1].value = oldArray.join('\n');
        }
        if (!responded) {
          interaction.reply(`Updated prediction ${predictionID}!`, { hideSource: true, ephemeral: true });
          responded = true;
        }
        break;
      // Set some stats
      case 'stats':
        if (getArg(args, 'predictionID')) {
          predictionID = getArg(args, 'predictionID');
        }
        toEdit = getPrediction(predictions, predictionID);
        newEmbed = toEdit?.embeds[0];
        if (!newEmbed) {
          respondPrivate(interaction, `Unable to edit prediction ${predictionID}, it may be too old!`, responded);
          responded = true;
          return;
        }
        if (args.length === 0 || (args.length === 1 && getArg(args, 'predictionID'))) {
          respondPrivate(interaction, 'Please specify at least one parameter to edit!', responded);
          responded = true;
          return;
        }
        odds1 = getArg(args, 'odds1');
        odds2 = getArg(args, 'odds2');
        total = getArg(args, 'total');
        if (total) {
          newEmbed.fields[2] = {
            name: 'Total Points Spent',
            value: total,
          };
        }
        if (odds1) {
          oldText = newEmbed.fields[0].value;
          oldArray = oldText.split('\n');
          if (oldArray.length > 1) {
            oldArray[2] = odds1;
          } else {
            oldArray[1] = '**Odds**:';
            oldArray[2] = odds1;
          }
          newEmbed.fields[0].value = oldArray.join('\n');
        }
        if (odds2) {
          oldText = newEmbed.fields[1].value;
          oldArray = oldText.split('\n');
          if (oldArray.length > 1) {
            oldArray[2] = odds2;
          } else {
            oldArray[1] = '**Odds**:';
            oldArray[2] = odds2;
          }
          newEmbed.fields[1].value = oldArray.join('\n');
        }
        if (!responded) {
          interaction.reply(`Prediction ${predictionID} updated!`, { hideSource: true, ephemeral: true });
        }
        break;
    }

    if (create) {
      await interaction.client.channels.cache.get(predictionChannel).send(`<@&${predictionRole}> A Prediction has been started!`, newEmbed);
      cache.put(`discord.twitch.prediction.create`, 'trigger', ratelimit);
      cache.put(`discord.twitch.prediction.id`, lastPredictionID + 1);
    } else {
      await toEdit.edit(newEmbed);
    }
  },
};

function checkEnded(predictionEmbed) {
  return predictionEmbed.color === Constants.Colors.PURPLE;
}

function getArg(args, argName) {
  let foundArg = args?.find(arg => arg.name.toLowerCase() === argName.toLowerCase());
  return foundArg?.value ?? null;
}

function getPredictionId(message) {
  let id = message?.embeds[0]?.footer?.text?.split('#')[1];
  return id ? Number(id) : null;
}

function getPrediction(predictions, id) {
  predictions = predictions.filter(prediction => getPredictionId(prediction) === id);
  return predictions.size > 0 ? predictions.first() : null;
}

function respondPrivate(interaction, message, alreadyResponded) {
  if (alreadyResponded) {
    interaction.member.send(message);
  } else {
    interaction.reply(message, { hideSource: true, ephemeral: true });
  }
}

// Command Structure
/* eslint-disable-next-line no-unused-vars */
const command = {
  name: 'prediction',
  description: 'Manage Predictions',
  options: [
    {
      type: 1,
      name: 'start',
      description: 'Starts a new prediction',
      options: [
        {
          type: 3,
          name: 'title',
          description: 'the title of this prediction',
        },
        {
          type: 3,
          name: 'option1',
          description: 'the outcome for Blue to win',
        },
        {
          type: 3,
          name: 'option2',
          description: 'the outcome for Pink to win',
        },
      ],
    },
    {
      type: 1,
      name: 'structure',
      description: 'Starts a new structure prediction',
    },
    {
      type: 1,
      name: 'bastion',
      description: 'Starts a new bastion prediction',
    },
    {
      type: 1,
      name: 'win',
      descriptions: 'Starts a new basic "win" prediction',
    },
    {
      type: 1,
      name: 'end',
      description: 'Ends a prediction (newest by default)',
      options: [
        {
          type: 4,
          name: 'result',
          description: 'the outcome of the prediction',
          choices: [
            {
              name: 'Blue wins (option 1)',
              value: 0,
            },
            {
              name: 'Pink wins (option 2)',
              value: 1,
            },
          ],
          required: true,
        },
        {
          type: 4,
          name: 'predictionID',
          description: 'The ID of the prediction to end (default is newest prediction)',
        },
      ],
    },
    {
      type: 1,
      name: 'set',
      description: 'Change details of a running prediction (newest by default)',
      options: [
        {
          type: 3,
          name: 'title',
          description: 'the title for this prediction',
        },
        {
          type: 3,
          name: 'option1',
          description: 'the outcome for Blue to win',
        },
        {
          type: 3,
          name: 'option2',
          description: 'the outcome for Pink to win',
        },
        {
          type: 4,
          name: 'predictionID',
          description: 'The ID of the prediction to edit (default is newest prediction)',
        },
      ],
    },
    {
      type: 1,
      name: 'stats',
      description: 'Change statistics of a prediction (newest by defaullt)',
      options: [
        {
          type: 3,
          name: 'odds1',
          description: 'the odds for Blue to win',
        },
        {
          type: 3,
          name: 'odds2',
          description: 'the odds for Pink to win',
        },
        {
          type: 3,
          name: 'total',
          description: 'the total number of points spent',
        },
        {
          type: 4,
          name: 'predictionID',
          description: 'The ID of the prediction to edit (default is newest prediction)',
        },
      ],
    },
  ],
};
