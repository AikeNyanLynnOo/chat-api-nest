## Database Design

https://github.com/AikeNyanLynnOo/chat-api-nest
![DB Design](https://github.com/AikeNyanLynnOo/chat-api-nest/blob/main/assets/db_design.png?raw=true)

## WebSocket Message Events

| Message Event      | Emit Type            | Notification Scope      |
| ------------------ | -------------------- | ----------------------- |
| `createRoom`       | `roomCreated`        | Notify All Participants |
| `fetchRoomDetails` | `roomDetailsFetched` | Notify itself           |
| `updateRoom`       | `roomUpdated`        | Notify All Participants |
| `deleteRoom`       | `roomDeleted`        | Notify All Participants |
| `sendMessage`      | `messageSent`        | Notify All Participants |
| `getAllMessages`   | `allMessages`        | Notify itself           |
| `updateMessage`    | `messageUpdated`     | Notify All Participants |
| `deleteMessage`    | `messageDeleted`     | Notify All Participants |

## createRoom

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"type" : "DIRECT","name": "ABC6","participants" : ["6f208661-ad7b-4da7-8bf7-8336f9cce292"]}
- Emit (Room)

## fetchRoomDetails

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {roomId : ["7fe094c8-0f47-4a5a-adcf-9ffb42a759e8"]}
- Emit (Room, Room.participants, Roo.messages)

## updateRoom

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"7fe094c8-0f47-4a5a-adcf-9ffb42a759e8","name":"updated name", "participants" : ["6f208661-ad7b-4da7-8bf7-8336f9cce292"]}
- Emit (Room)

## deleteRoom

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"7fe094c8-0f47-4a5a-adcf-9ffb42a759e8"}
- Emit (Message with deleted room Id)

## sendMessage

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"2f47a6b3-eb48-448c-8586-555354918fd6", "text" : "Hello"}
- Emit (Message Result{result, count})

## getAllMessages

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"2f47a6b3-eb48-448c-8586-555354918fd6", "first" : 0, "rows" : 20, "filter" : "Filter Text"}
- Emit (Message Result{result, count})

## updateMessage

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"messageId":"5ed2f83f-1a7c-454b-999a-0c6b7552fc28","text" : "Update Message"}
- Emit (Message Result{result, count})

## deleteMessage

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId" : "2f47a6b3-eb48-448c-8586-555354918fd6", "messageIds":["5ed2f83f-1a7c-454b-999a-0c6b7552fc28"]}
- Emit { messageIds : [ Here include deleted message IDs]}
