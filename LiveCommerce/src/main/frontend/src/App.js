import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  width: 512px;
  height: 368px;
  position: relative; 
  background: white;
  border-radius: 16px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.04);
  margin: 0 auto; 
  margin-top: 100px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
`;


function App() {
  const hostVideoRef = useRef(null);
  function getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const filtered = devices.filter(device => device.kind === type);
          callback(filtered);
        });
  }
  getConnectedDevices('videoinput', cameras => console.log('Cameras found', cameras.length));

  async function playVideoFromCamera() {
    try {
      const constraints = { 'video': true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      hostVideoRef.current.srcObject = stream;

    } catch (error) {
      console.error('Error opening video camera.', error);
    }
  }

  playVideoFromCamera();

  return (
      <>
        <Container>
          <video id="localVideo" ref={hostVideoRef} autoPlay />
        </Container>
      </>
  );
}

export default App;
