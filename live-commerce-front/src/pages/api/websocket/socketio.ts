import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'
import {
  ExitUserMessage,
  JoinRoomMessage,
  SocketEvents,
  User,
} from '../../../@types/p2p'
import { NextApiResponseServerIO } from '../../../@types/socketio'

export const config = {
  api: {
    bodyParser: false,
  },
}

function initServer(io: ServerIO) {
  let users = new Map<string, User[]>()
  let socketToRoomName = new Map<string, string>()
  const MAX_ROOM_SIZE = 2

  io.on('connect', (socket) => {
    console.log('connected', socket.id)
    socket.on(SocketEvents.JoinRoom, (data: JoinRoomMessage) => {
      if (!users.has(data.room)) {
        users.set(data.room, [])
      }
      const room = users.get(data.room)!!
      if (room.length === MAX_ROOM_SIZE) {
        socket.to(socket.id).emit(SocketEvents.RoomFull)
        return
      }
      room.push({
        socketId: socket.id,
        userId: data.userId,
      })
      socketToRoomName.set(socket.id, data.room)

      socket.join(data.room)

      const otherUsers = room.filter((u) => u.socketId !== socket.id)
      socket.emit(SocketEvents.OtherUsersInRoom, otherUsers)
    })

    socket.on(SocketEvents.Offer, (sdp) => {
      console.log('offer', socket.id)
      socket.broadcast.emit(SocketEvents.GetOffer, sdp)
    })

    socket.on(SocketEvents.Answer, (candidate) => {
      console.log('answer', socket.id)
      socket.broadcast.emit(SocketEvents.GetAnswer, candidate)
    })

    socket.on(SocketEvents.Candidate, (candidate) => {
      console.log('candidate', socket.id)
      socket.broadcast.emit(SocketEvents.GetCandidate, candidate)
    })

    socket.on('disconnect', () => {
      const roomName = socketToRoomName.get(socket.id)
      if (!roomName) return
      const room = users.get(roomName)
      if (!room) return
      const user = room.find((u) => u.socketId === socket.id)
      if (!user) return

      users.set(
        roomName,
        room.filter((u) => u.socketId !== socket.id),
      )

      const message: ExitUserMessage = {
        userId: user.userId,
      }
      socket.broadcast.to(roomName).emit(SocketEvents.ExitUser, message)
    })
  })
}

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('New Socket.io server...✅')

    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/websocket/socketio',
    })

    initServer(io)

    res.socket.server.io = io
  }

  res.end()
}
