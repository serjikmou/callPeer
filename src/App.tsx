/* eslint-disable jsx-a11y/media-has-caption */
import Peer from "peerjs";
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<any>(null);

  const call = (remotePeerId: string) => {
    const getUserMedia = navigator.mediaDevices.getUserMedia;
    getUserMedia({ video: false, audio: true })
      .then((localStream: MediaStream) => {
        if (currentUserVideoRef.current) {
          currentUserVideoRef.current.srcObject = localStream;
          currentUserVideoRef.current.play();
        }
        const peerCall = peerInstance.current.call(remotePeerId, localStream);
        peerCall.on("stream", (remoteStream: MediaStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          }
        });
      })
      .catch((error: any) => {
        console.log("Error accessing media devices:", error);
      });
  };
  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("call", (call) => {
      const getUserMedia = navigator.mediaDevices.getUserMedia;

      getUserMedia({ video: false, audio: true })
        .then((mediaStream) => {
          if (currentUserVideoRef.current) {
            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();
          }
          call.answer(mediaStream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
              remoteVideoRef.current.play();
            }
          });
        })
        .catch((error) => {
          console.log("Error accessing media devices:", error);
        });
    });

    peerInstance.current = peer;
  }, []);
  console.log(peerId);
  return (
    <div className="App">
      <h1>Current user id is {peerId}</h1>
      <input
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
        type="text"
        value={remotePeerIdValue}
      />
      <button onClick={() => call(remotePeerIdValue)}>Call</button>
      <div>
        <video ref={currentUserVideoRef} />
      </div>
      <div>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  );
}
