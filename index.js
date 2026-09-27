// ARRUMA A PORTA DO RENDER - TEM QUE SER A PRIMEIRA LINHA
const http = require('http');
http.createServer((req, res) => res.writeHead(200).end('Umbra 24/7 💜')).listen(process.env.PORT || 3000, () => console.log('Porta aberta!'));

const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

const COR = 0x9b59b6;
const db = new Map();
const get = (k) => db.get(k) || 0;
const set = (k, v) => db.set(k, v);

client.once('ready', async () => {
  console.log(`Umbra ${client.user.tag} ONLINE 24/7`);
  await client.application.commands.set([
    { name: 'ping', description: 'Ping' },
    { name: 'ajuda', description: 'Menu da Umbra' },
    { name: 'avatar', description: 'Avatar', options: [{ name: 'user', type: 6, required: false, description: 'usuário' }] },
    { name: 'daily', description: 'Pegue seu daily' },
    { name: 'carteira', description: 'Ver sonhos' },
    { name: 'work', description: 'Trabalhar' },
    { name: 'rank', description: 'Rank de sonhos' },
    { name: 'ship', description: 'Ship', options: [{ name: 'p1', type: 6, required: true }, { name: 'p2', type: 6, required: true }] },
    { name: '8ball', description: '8ball', options: [{ name: 'pergunta', type: 3, required: true }] },
    { name: 'clear', description: 'Limpar', options: [{ name: 'qtd', type: 4, required: true }] },
    { name: 'ban', description: 'Banir', options: [{ name: 'user', type: 6, required: true }] },
    { name: 'painel', description: 'Painel ticket' }
  ]);
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
      ch.send(`Olá ${inter.user}, suporte da Umbra! 💜`);
      return inter.reply({ content: `✅ Seu ticket: ${ch}`, ephemeral: true });
    }
    if (!inter.isChatInputCommand()) return;
    const n = inter.commandName;

    if (n === 'ping') return inter.reply(`🏓 ${client.ws.ping}ms - Umbra 24/7!`);
    if (n === 'ajuda') return inter.reply({ embeds: [new EmbedBuilder().setTitle('Umbra 💜 24/7').setColor(COR).setDescription('**Economia:** /daily, /carteira, /work, /rank\n**Diversão:** /ship, /8ball, /avatar\n**Mod:** /clear, /ban\n**Ticket:** /painel\n\nBot online no Render!')] });
    if (n === 'avatar') { const u = inter.options.getUser('user') || inter.user; return inter.reply({ embeds: [new EmbedBuilder().setImage(u.displayAvatarURL({size:1024})).setTitle(u.username).setColor(COR)] }); }
    if (n === 'daily') { const id = inter.user.id; const last = db.get(`d_${id}`); if (last && Date.now() - last < 86400000) return inter.reply({content:'⏰ Daily já pego!', ephemeral:true}); set(`s_${id}`, get(`s_${id}`)+500); set(`d_${id}`, Date.now()); return inter.reply('💜 +500 sonhos!'); }
    if (n === 'carteira') return inter.reply(`💰 ${inter.user} tem ${get(`s_${inter.user.id}`)} sonhos`);
    if (n === 'work') { const q = Math.floor(Math.random()*300)+50; set(`s_${inter.user.id}`, get(`s_${inter.user.id}`)+q); return inter.reply(`💼 Trabalhou e ganhou ${q} sonhos!`); }
    if (n === 'rank') { const top = [...db.entries()].filter(([k])=>k.startsWith('s_')).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v],i)=>`**${i+1}.** <@${k.slice(2)}> - ${v}`).join('\n'); return inter.reply({ embeds: [new EmbedBuilder().setTitle('Rank Sonhos').setDescription(top||'Ninguém ainda').setColor(COR)] }); }
    if (n === 'ship') { const p1=inter.options.getUser('p1'); const p2=inter.options.getUser('p2'); return inter.reply(`💜 ${p1} + ${p2} = ${Math.floor(Math.random()*101)}% de compatibilidade!`); }
    if (n === '8ball') { const r=['Sim!', 'Não!', 'Com certeza!', 'Talvez...', 'Pergunte depois']; return inter.reply(`🎱 ${r[Math.floor(Math.random()*r.length)]}`); }
    if (n === 'clear') { const q=inter.options.getInteger('qtd'); if(!inter.member.permissions.has(PermissionFlagsBits.ManageMessages)) return inter.reply({content:'Sem permissão', ephemeral:true}); await inter.channel.bulkDelete(q,true); return inter.reply({content:`🧹 ${q} apagadas!`, ephemeral:true}); }
    if (n === 'ban') { const u=inter.options.getUser('user'); if(!inter.member.permissions.has(PermissionFlagsBits.BanMembers)) return inter.reply({content:'Sem permissão', ephemeral:true}); await inter.guild.members.ban(u).catch(()=>{}); return inter.reply(`${u} banido!`); }
    if (n === 'painel') { const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket').setLabel('Abrir Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')); await inter.channel.send({ embeds: [new EmbedBuilder().setTitle('Suporte Umbra 💜').setDescription('Clique no botão abaixo para abrir um ticket!').setColor(COR)], components:[row] }); return inter.reply({content:'✅ Painel enviado!', ephemeral:true}); }
  } catch(e){ console.error(e); }
});

client.login(process.env.TOKEN);
