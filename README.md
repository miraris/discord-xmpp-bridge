# discord-xmpp-bridge

Simple fast dirty discord xmpp bridge with user/avatar spoofing support

### Installation

##### Requirements:

- docker
- docker-compose

#### Usage

Simply rename `credentials.env.example` to `credentials.env`, edit accordingly
and start it up using `docker-compose up`.

To run it without Docker, uncomment and set the `REDIS_URL` variable in `credentials.env`,
then start - `node bridge.js`

You can also use the bridge as a module, `require` it in your project and pass the `credentials` and `options` objects
to the constructor.

```js
new Bot(
  {
    discord: "discord token",
    redis: "redis url",
    xmpp: {
      service: "domain",
      username: "username",
      password: "pass"
    },
    pomf: {
      url: "pomf url",
      key: "pomf key (optional)",
      host: "pomf host name (to build the image url)"
    }
  },
  { owner: "discord owner id" }
);
```

### TODO

1. A command to send messages from channel to channel?
