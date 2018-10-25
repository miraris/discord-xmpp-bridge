const buildDiscordMsg = (msg) => {
  if (msg.attachments.length === 0) {
    return msg.cleanContent;
  }

  return `${msg.cleanContent} ${msg.attachments.map(a => a.url).join(',')}`;
};

module.exports = {
  buildDiscordMsg,
};
