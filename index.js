const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

// ESSA PARTE ARRUMA O ERRO DA PORTA
app.get('/', (req, res) => res.send('Umbra online 💜'));
app.listen(process.env.PORT || 3000, () => console.log('Porta aberta!'));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  console.log(`Umbra ${client.user.tag} ONLINE`);
  await client.application.commands.set([
    { name: 'ping', description: 'Ver ping' },
    { name: 'umbra', description: 'Umbra está online!' }
  ]);
});

client.on('interactionCreate', async i => {
  if (i.commandName === 'ping') await i.reply(`🏓 ${client.ws.ping}ms`);
  if (i.commandName === 'umbra') await i.reply('💜 Umbra 24/7 no Render!');
});

client.login(process.env.TOKEN);
