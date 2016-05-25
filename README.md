# socket chat room

[Binary & releases](https://github.com/quietshu/socket-chat-room/releases).

![demo](./app-demo.png)

## Definition of the Protocol

### Architecture

```
[server]
  <-- Wrapped TCP Socket -->
[client]
  <-- Wrapped IPC -->
[model/controller]
  <-- Angular.js -->
[view]
```

### Types

1. Request: `client - request -> server - response -> client`
2. Push: `server - push -> client`

### Data on Socket/TCP

```javascript
{
  type
  token
  timestamp
  content
}
```

#### `type`

`['push', 'res']`

#### `token`

The token field of response should be equal to the original request which is a randomly generated integer.

#### `content`

Content field of messages.

### "Segments"

```
JSON data -> stringify -> split to segments -> add No./total header -> binarize -> send
```

### Demo

#### A request from the server (push) or client (request-response)

Stringify the message context:

```
{"type":"push","timestamp":1449345271889,"content":{"type":"msg","data":{"data":"It works.","name":"ds","time":1449345271886}}}
```

Split into segments:

```
{"type":"push","timestamp":1449
345271889,"content":{"type":"ms
g","data":{"data":"It works.","
name":"ds","time":1449345271886
}}}
```

Pre-encode "dots":

```
{"type":"push","timestamp":1449
345271889,"content":{"type":"ms
g","data":{"data":"It works(dot)","
name":"ds","time":1449345271886
}}}
```

Add header info:

```
.1/5.{"type":"push","timestamp":1449
.2/5.345271889,"content":{"type":"ms
.3/5.g","data":{"data":"It works(dot)","
.4/5.name":"ds","time":1449345271886
.5/5.}}}
```

Binarize and TCP transmit.

#### Client

Receive all segments and decode with UTF-8.

Parse header and push segments into a stack:

```
...
5/5 }}}
4/5 name":"ds","time":1449345271886
3/5 g","data":{"data":"It works(dot)","
2/5 345271889,"content":{"type":"ms
1/5 {"type":"push","timestamp":1449
...
```

Pop out the whole message and concat segments, decode dots:

```
{"type":"push","timestamp":1449345271889,"content":{"type":"msg","data":{"data":"It works.","name":"ds","time":1449345271886}}}
```

#### Image

In client we encode the image data with base64, and wrapped as the context of a message.

```
...{"data":"data:image/png;base64,iVB..."}...
```

For the receiver, just parse the base64 string and decode it.

#### Emoji

Send as text like `:xxxxx:`.

## Build

### Requirements

Babel & Electron & Enclose

1. `$ npm i babel -g`
2. `$ npm i electron-prebuilt -g`
3. `$ npm i enclose -g`

### Build Client

1. `$ cd client`
2. `$ npm install`
3. `$ npm run build`
4. `$ npm start`

### Run Server

1. `$ cd server`
2. `$ npm install`
3. `$ npm start`

### Pack Client App

OS X (for darwin and x64):

1. `$ cd client`
2. `$ npm run pack`

Other platforms:

modify `pack` command in `client/package.json`, see electron-packager for more details.

## Acknowledgements

## License

Shu Ding <ds303077135@gmail.com>.

The MIT license.
