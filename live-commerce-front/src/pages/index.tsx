import { useEffect, useRef } from 'react'
import * as SocketIOClient from 'socket.io-client'
import { JoinRoomMessage, SocketEvents, User } from '../@types/p2p'

export default function Home() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  }
  useEffect((): any => {
    const peerConnection = new RTCPeerConnection(pcConfig)
    const socket = SocketIOClient.connect({
      path: '/api/websocket/socketio',
    })

    socket.on(SocketEvents.OtherUsersInRoom, (message: User[]) => {
      if (message.length > 0) {
        peerConnection
          .createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          .then((sdp) => {
            peerConnection.setLocalDescription(new RTCSessionDescription(sdp))
            socket.emit(SocketEvents.Offer, sdp)
          })
          .catch((err) => console.error(err))
      }
    })

    socket.on(SocketEvents.GetOffer, (sdp: RTCSessionDescription) => {
      peerConnection
        .setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          peerConnection
            .createAnswer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            })
            .then((sdpAnswer) => {
              peerConnection.setLocalDescription(sdpAnswer)
              socket.emit(SocketEvents.Answer, sdpAnswer)
            })
            .catch((err) => console.error(err))
        })
    })

    socket.on(SocketEvents.GetAnswer, (sdp: RTCSessionDescription) => {
      peerConnection.setRemoteDescription(sdp)
    })

    socket.on(SocketEvents.GetCandidate, (candidate: RTCIceCandidateInit) => {
      console.log(candidate)
      peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .then(() => console.log('candidate add success'))
    })

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream)
        })

        peerConnection.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit(SocketEvents.Candidate, e.candidate)
          }
        }
        peerConnection.ontrack = (e) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0]
          }
        }

        const message: JoinRoomMessage = {
          room: '1234',
          userId: 'myuser',
        }
        socket.emit(SocketEvents.JoinRoom, message)
      })
      .catch((e) => console.error(e))

    if (socket) return () => socket.disconnect()
  }, [])

  return (
    <div>
      <h1>Realtime communication with WebRTC</h1>
      <video autoPlay={true} ref={localVideoRef}></video>
      <video autoPlay={true} ref={remoteVideoRef}></video>
    </div>
  )
}
