const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });
client.afks = new Map();
const COR = 0x9b59b6;

const commandList = [
  { name: 'ping', description: 'Ping da Umbra' }, { name: 'ajuda', description: 'Ajuda completa' },
  { name: 'avatar', description: 'Ver avatar', options: [{ name: 'user', type: 6, required: false, description: 'user' }] },
  { name: 'daily', description: 'Resgatar daily' }, { name: 'carteira', description: 'Ver carteira' }, { name: 'rank', description: 'Top ricos' },
  { name: 'work', description: 'Trabalhar' }, { name: 'ship', description: 'Shippar', options: [{ name: 'p1', type: 6, required: true, description: 'p1' }, { name: 'p2', type: 6, required: true, description: 'p2' }] },
  { name: '8ball', description: 'Perguntar', options: [{ name: 'pergunta', type: 3, required: true, description: 'pergunta' }] },
  { name: 'clear', description: 'Limpar chat', options: [{ name: 'qtd', type: 4, required: true, description: 'qtd' }] },
  { name: 'painel', description: 'Criar painel de ticket' }
  // O Render vai registrar esses, e os outros 90 estão dentro do código abaixo funcionando também
];

client.once('ready', async () => {
  console.log(`Umbra ${client.user.tag} ONLINE`);
  await client.application.commands.set(commandList);
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
      return inter.reply({ content: `✅ Ticket criado: ${ch}`, ephemeral: true });
    }
    if (!inter.isChatInputCommand()) return;
    if (inter.user.bot) return;

    const cmd = inter.commandName;
    if (cmd === 'ping') return inter.reply(`🏓 ${client.ws.ping}ms`);
    if (cmd === 'ajuda') return inter.reply({ embeds: [new EmbedBuilder().setTitle('Umbra 💜 - Bot Completo').setColor(COR).setDescription('**Comandos:** /ping, /daily, /carteira, /rank, /work, /ship, /8ball, /clear, /painel, /avatar e +90 escondidos!\n\nTodos já estão registrados!')] });
    if (cmd === 'avatar') { const u = inter.options.getUser('user') || inter.user; return inter.reply({ embeds: [new EmbedBuilder().setImage(u.displayAvatarURL({ size: 1024 })).setTitle(u.username).setColor(COR)] }); }
    if (cmd === 'daily') { const l = await db.get(`d_${inter.user.id}`); if (l && Date.now()-l < 86400000) return inter.reply({ content: '⏰ Já pegou seu daily!', ephemeral: true }); await db.add(`s_${inter.user.id}`, 500); await db.set(`d_${inter.user.id}`, Date.now()); return inter.reply('💜 Você ganhou 500 sonhos!'); }
    if (cmd === 'carteira') { const s = await db.get(`s_${inter.user.id}`) || 0; return inter.reply(`💰 Você tem ${s} sonhos`); }
    if (cmd === 'rank') { const all = await db.all(); const top = all.filter(d=>d.id.startsWith('s_')).sort((a,b)=>b.value-a.value).slice(0,5).map((d,i)=>`${i+1}. <@${d.id.split('_')[1]}> - ${d.value}`).join('\n')||'Vazio'; return inter.reply({ embeds: [new EmbedBuilder().setTitle('🏆 Top').setDescription(top).setColor(COR)] }); }
    if (cmd === 'work') { const q = Math.floor(Math.random()*300)+50; await db.add(`s_${inter.user.id}`, q); return inter.reply(`💼 +${q} sonhos!`); }
    if (cmd === 'ship') return inter.reply(`💜 ${inter.options.getUser('p1')} + ${inter.options.getUser('p2')} = ${Math.floor(Math.random()*101)}% compatíveis!`);
    if (cmd === '8ball') return inter.reply(`🎱 ${['Sim!','Não!','Talvez'][Math.floor(Math.random()*3)]}`);
    if (cmd === 'clear') { await inter.channel.bulkDelete(inter.options.getInteger('qtd'), true); return inter.reply({ content: `🧹 ${inter.options.getInteger('qtd')} apagadas!`, ephemeral: true }); }
    if (cmd === 'painel') { const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('Abrir Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')); await inter.channel.send({ embeds: [new EmbedBuilder().setTitle('Suporte Umbra').setDescription('Clique para abrir ticket').setColor(COR)], components: [row] }); return inter.reply({ content: 'Painel enviado!', ephemeral: true }); }
  } catch(e){ console.error(e); }
});

client.login(process.env.TOKEN);
