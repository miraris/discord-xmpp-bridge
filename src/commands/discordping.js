exports.run = async function ping(msg, args) {
  const reply = await msg.channel.createMessage('Ping..');
  reply.edit(`Pong! Latency is ${reply.timestamp - msg.timestamp}ms.`);
};
