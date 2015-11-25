# socket chat room (draft)

## Definition of the Protocol (draft)

```javascript
{
  type
  token
  timestamp
  content
}
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

`$ npm i babel -g`
`$ npm i electron -g`

### Build Client

`$ cd client`
`$ npm install`
`$ npm run build`
`$ npm start`

### Run Server

`$ cd server`
`$ npm install`
`$ npm start`
