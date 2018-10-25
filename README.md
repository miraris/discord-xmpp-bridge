# discord-xmpp-bridge
Simple fast dirty discord xmpp bridge with user/avatar spoofing support

### Installation

##### Requirements:

* docker
* docker-compose

Then simply rename `credentials.env.example` to `credentials.env`, edit accordingly
and start it up using `docker-compose up`.


### TODO
1. More native integrations - attachments, better duplex emoji support, some embeds?
2. Multi-channel support, same with rooms
3. Modularize the lib
4. Less env variables and some kind of config constructor
5. Maybe some kind of channel mapping?
