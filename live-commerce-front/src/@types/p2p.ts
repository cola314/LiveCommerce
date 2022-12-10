export interface JoinRoomMessage {
  room: string
  userId: string
}

export interface ExitUserMessage {
  userId: string
}

export const SocketEvents = {
  JoinRoom: 'join_room',
  RoomFull: 'room_full',
  OtherUsersInRoom: 'other_users_in_room',
  ExitUser: 'ext_user',

  Offer: 'offer',
  Answer: 'answer',
  Candidate: 'candidate',
  GetOffer: 'get_offer',
  GetAnswer: 'get_answer',
  GetCandidate: 'get_candidate',
}

export interface User {
  socketId: string
  userId: string
}
