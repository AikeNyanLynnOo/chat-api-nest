## Database Design

![DB Design](https://github.com/AikeNyanLynnOo/chat-api-nest/blob/main/assets/db_design.png?raw=true)

### Topics & Best Practices covered

- NestJS (Service, Module, Controller architecture) ✅
- NestJS pipes, guards, decorators, filters ✅
- Custom filters, JWT guards for secure connection for HTTP & Socket Gateway ✅
- DTOs, TypeORM, Entities for managing tables ✅
- Socket IO, Notify itself & Notify all features ✅
- Chat Direct/Group feature ✅
- Full user authentication feature SignUp, SignIn, SignOut ✅
- Access token, Refresh token ✅

## To improve

- To add a queue system (RabbitMQ or similar) to handle message delivery
- To develop test cases for maintainance & debugging


## How To Test

- HTTP requests can be tested with HTTP request type in [PostMan HTTP Request](https://learning.postman.com/docs/sending-requests/create-requests/request-basics/)
- Sockets can also be tesed with Socket IO request type in [PostMan Socket Request](https://learning.postman.com/docs/sending-requests/websocket/create-a-websocket-request/)


## How to run with NODE

```bash
npm run build
npm run start:prod
```

## How to run with Docker

### Install docker first

- https://docs.docker.com/get-docker/

### Install docker machine in mac (Home Brew should be installed first)

```bash
$ brew install docker-machine docker
```

### Start the docker machine

```bash
$ brew services start docker-machine
```

### Run the docker application in local container, post is defined in docker compose env (3000)

```bash
$ docker compose up --build
```

### To stop the docker

```bash
$ docker compose down
```

## How to build and push to AWS

### Build docker for pushing

```bash
$ docker build -t nest-chat-socket-app .
```

### Tag with AWS repo ()

```bash
$ docker tag app-repo:latest ID.dkr.REGION.amazonaws.com/app-repo:latest
```

ID -> ECR repository ID
REGION -> AWS Region

### Push the tagged image to repository

```bash
$ docker push ID.dkr.REGION.amazonaws.com/app-repo:latest
```

ID -> ECR repository ID
REGION -> AWS Region

So that we can do additional configurations on AWS. Docker image is on AWS now.

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

### createRoom

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"type" : "DIRECT","name": "ABC6","participants" : ["6f208661-ad7b-4da7-8bf7-8336f9cce292"]}
- Emit (Room)

### fetchRoomDetails

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {roomId : ["7fe094c8-0f47-4a5a-adcf-9ffb42a759e8"]}
- Emit (Room, Room.participants, Roo.messages)

### updateRoom

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"7fe094c8-0f47-4a5a-adcf-9ffb42a759e8","name":"updated name", "participants" : ["6f208661-ad7b-4da7-8bf7-8336f9cce292"]}
- Emit (Room)

### deleteRoom

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"7fe094c8-0f47-4a5a-adcf-9ffb42a759e8"}
- Emit (Message with deleted room Id)

### sendMessage

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"2f47a6b3-eb48-448c-8586-555354918fd6", "text" : "Hello"}
- Emit (Message Result{result, count})

### getAllMessages

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId":"2f47a6b3-eb48-448c-8586-555354918fd6", "first" : 0, "rows" : 20, "filter" : "Filter Text"}
- Emit (Message Result{result, count})

### updateMessage

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"messageId":"5ed2f83f-1a7c-454b-999a-0c6b7552fc28","text" : "Update Message"}
- Emit (Message Result{result, count})

### deleteMessage

- Authorization header (eg. authorization - Bear{SPACE}JWT)
- Message Body JSON string
  {"roomId" : "2f47a6b3-eb48-448c-8586-555354918fd6", "messageIds":["5ed2f83f-1a7c-454b-999a-0c6b7552fc28"]}
- Emit { messageIds : [ Here include deleted message IDs]}

### Stay in touch

- Aike - [Aike](aikenyanlynnoo.dev@gmail.com)
