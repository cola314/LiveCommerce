import { useRef } from 'react'

export default function Home() {
  const video = useRef<HTMLVideoElement>(null)
  return (
    <div>
      <h1>Realtime communication with WebRTC</h1>
      <video autoPlay={true} ref={video}></video>
    </div>
  )
}
