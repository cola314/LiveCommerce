import { useEffect, useRef, useState } from 'react'
import * as SocketIOClient from 'socket.io-client'
import { JoinRoomMessage, SocketEvents, User } from '../@types/p2p'
import SockJS from 'sockjs-client'
import StompJs, { Stomp } from '@stomp/stompjs'

export default function Kurento() {
  const [username, setUsername] = useState('')
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
    ],
  }
  const onPresenterStart = () => {
    const peerConnection = new RTCPeerConnection(pcConfig)
    const socket = new SockJS('http://localhost:8080/ws')
    const client = Stomp.over(socket)

    client.connect({}, async () => {
      client.subscribe('/topic/webrtc/candidate/' + username, (response) => {
        console.log(response.body)
        const candidateJson = JSON.parse(response.body).candidate
        const candidate = JSON.parse(candidateJson)
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log('candidate add success'))
      })
      client.subscribe('/topic/webrtc/answer/' + username, (response) => {
        const res = JSON.parse(response.body)

        peerConnection.setRemoteDescription({
          type: 'answer',
          sdp: res.answer,
        })
      })

      peerConnection.onicecandidate = (e) => {
        if (e.candidate) {
          client.publish({
            destination: '/app/webrtc/onIceCandidate/' + username,
            body: JSON.stringify({
              candidate: e.candidate.candidate,
              sdpMid: e.candidate.sdpMid,
              sdpMLineIndex: e.candidate.sdpMLineIndex,
            }),
          })
        }
      }
      peerConnection.ontrack = (e) => {
        console.log('================')
        console.log(remoteVideoRef.current)
        console.log(e.streams)
        if (remoteVideoRef.current) {
          console.log('------------')
          remoteVideoRef.current.srcObject = e.streams[0]
        }
      }

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      peerConnection.setLocalDescription(new RTCSessionDescription(offer))
      client.publish({
        destination: '/app/webrtc/viewer',
        body: JSON.stringify({
          userId: username,
          offer: offer.sdp,
        }),
      })
    })
  }

  return (
    <div>
      <h1>Realtime communication with WebRTC</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={() => onPresenterStart()}>Start Presenter</button>
      <video autoPlay={true} ref={remoteVideoRef}></video>
    </div>
  )
}
