# socket chat room (draft)

## Definition of the Protocol (draft)

### Types

- `client - request -> server - response -> client`
- `server - push -> client`

### Data

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

...

### Segment (sending)

```
JSON data -> stringify -> split to segments -> add No./total header -> binarize -> send
```

## Details (draft)

```
[lowdb]
  <-- Node.js -->
[server]
  <-- Wrapped TCP Socket -->
[client]
  <-- Wrapped IPC -->
[model/controller]
  <-- Angular.js -->
[view]
```

### Requirements

Babel & Electron

1. `$ npm i babel -g`
2. `$ npm i electron -g`

### Build Client

1. `$ cd client`
2. `$ npm install`
3. `$ npm run build`
4. `$ npm start`

### Run Server

1. `$ cd server`
2. `$ npm install`
3. `$ npm start`
