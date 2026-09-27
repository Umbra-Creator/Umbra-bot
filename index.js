const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });
const COR = 0x9b59b6;
const db = new Map(); // banco temporário que funciona no Render

const cmds = [
  { name: 'ping', description: 'Ping da Umbra' },
  { name: 'ajuda', description: 'Ajuda da Umbra' },
  { name: 'avatar', description: 'Ver avatar', options: [{ name: 'user', type: 6, required: false, description: 'user' }] },
  { name: 'daily', description: 'Daily 500 sonhos' },
  { name: 'carteira', description: 'Ver carteira' },
  { name: 'work', description: 'Trabalhar' },
  { name: 'ship', description: 'Ship', options: [{ name: 'p1', type: 6, required: true, description: 'p1' }, { name: 'p2', type: 6, required: true, description: 'p2' }] },
  { name: '8ball', description: 'Pergunte', options: [{ name: 'pergunta', type: 3, required: true, description: 'pergunta' }] },
  { name: 'clear', description: 'Limpar chat', options: [{ name: 'qtd', type: 4, required: true, description: 'qtd' }] },
  { name: 'painel', description: 'Criar painel ticket' }
];

client.once('ready', async () => {
  console.log(`Umbra ${client.user.tag} ONLINE`);
  await client.application.commands.set(cmds);
});

client.on('interactionCreate', async inter => {
  try {
    if (inter.isButton() && inter.customId === 'ticket') {
      const ch = await inter.guild.channels.create({
        name: `ticket-${inter.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: inter.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: inter.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
      });
      return inter.reply({ content: `✅ Ticket: ${ch}`, ephemeral: true });
    }
    if (!inter.isChatInputCommand()) return;
    const n = inter.commandName;
    if (n === 'ping') return inter.reply(`🏓 ${client.ws.ping}ms`);
    if (n === 'ajuda') return inter.reply({ embeds: [new EmbedBuilder().setTitle('Umbra 💜').setColor(COR).setDescription('Comandos: /ping, /daily, /carteira, /work, /ship, /8ball, /clear, /painel, /avatar\n\nBot 100% online no Render!')] });
    if (n === 'avatar') { const u = inter.options.getUser('user') || inter.user; return inter.reply({ embeds: [new EmbedBuilder().setImage(u.displayAvatarURL({ size: 1024 })).setTitle(u.username).setColor(COR)] }); }
    if (n === 'daily') { const id = inter.user.id; const last = db.get(`d_${id}`); if (last && Date.now() - last < 86400000) return inter.reply({ content: '⏰ Já pegou daily!', ephemeral: true }); db.set(`s_${id}`, (db.get(`s_${id}`) || 0) + 500); db.set(`d_${id}`, Date.now()); return inter.reply('💜 +500 sonhos!'); }
    if (n === 'carteira') return inter.reply(`💰 Você tem ${db.get(`s_${inter.user.id}`) || 0} sonhos`);
    if (n === 'work') { const q = Math.floor(Math.random() * 300) + 50; db.set(`s_${inter.user.id}`, (db.get(`s_${inter.user.id}`) || 0) + q); return inter.reply(`💼 +${q} sonhos!`); }
    if (n === 'ship') return inter.reply(`💜 ${inter.options.getUser('p1')} + ${inter.options.getUser('p2')} = ${Math.floor(Math.random() * 101)}%`);
    if (n === '8ball') return inter.reply(`🎱 ${['Sim!', 'Não!', 'Talvez'][Math.floor(Math.random() * 3)]}`);
    if (n === 'clear') { await inter.channel.bulkDelete(inter.options.getInteger('qtd'), true); return inter.reply({ content: '🧹 Apagado!', ephemeral: true }); }
    if (n === 'painel') { const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('Abrir Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')); await inter.channel.send({ embeds: [new EmbedBuilder().setTitle('Suporte Umbra').setDescription('Clique para abrir ticket').setColor(COR)], components: [row] }); return inter.reply({ content: '✅ Painel enviado!', ephemeral: true }); }
  } catch (e) { console.error(e); }
});

client.login(process.env.TOKEN);
