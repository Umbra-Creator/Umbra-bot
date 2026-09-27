const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  console.log(`Umbra ${client.user.tag} ONLINE`);
  await client.application.commands.set([
    { name: 'ping', description: 'Ver ping' },
    { name: 'umbra', description: 'Umbra está online!' }
  ]);
  console.log('Comandos registrados!');
});

client.on('interactionCreate', async i => {
  if (i.commandName === 'ping') await i.reply(`🏓 ${client.ws.ping}ms`);
  if (i.commandName === 'umbra') await i.reply('💜 Umbra online no Render 24/7!');
});

client.login(process.env.TOKEN);
