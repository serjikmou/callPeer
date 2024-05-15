/* eslint-disable jsx-a11y/media-has-caption */
import Peer from "peerjs";
import React, { useEffect, useRef, useState } from "react";

export function stopTracks(mediaStream: MediaStream) {
  mediaStream.getTracks().forEach((track) => track.stop());
}
export default function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  let remoteStreamRef = useRef<MediaStream | null>(null);
  let currentUserStreamRef = useRef<MediaStream | null>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<any>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(peerId);
    } catch (error) {
      console.log(error);
    }
  };
  const hangUp = () => {
    peerInstance.current.destroy();
    if (remoteStreamRef.current) stopTracks(remoteStreamRef.current);
    if (currentUserStreamRef.current) stopTracks(currentUserStreamRef.current);
  };
  const call = (remotePeerId: string) => {
    const getUserMedia = navigator.mediaDevices.getUserMedia;
    getUserMedia({ video: false, audio: true })
      .then((localStream: MediaStream) => {
        if (currentUserVideoRef.current) {
          currentUserStreamRef.current = localStream;
          currentUserVideoRef.current.srcObject = localStream;
          currentUserVideoRef.current.play();
        }
        const peerCall = peerInstance.current.call(remotePeerId, localStream);
        peerCall.on("stream", (remoteStream: MediaStream) => {
          if (remoteVideoRef.current) {
            remoteStreamRef.current = remoteStream;
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
            currentUserStreamRef.current = mediaStream;
            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();
          }
          call.answer(mediaStream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteStreamRef.current = remoteStream;
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
  console.log(peerInstance.current);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        height: "100vh",
        padding: 10,
      }}
      className="App"
    >
      <div style={{ border: "2px solid red" }}>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          className="App"
        >
          <h6>SerjikMou</h6>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          className="App"
        >
          <h6>{peerId ? peerId : "Please Wait..."}</h6>{" "}
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          className="App"
        >
          <button onClick={handleCopy}>کپی</button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 2,
            width: "100%",
          }}
        >
          <input
            onChange={(e) => setRemotePeerIdValue(e.target.value)}
            type="text"
            value={remotePeerIdValue}
            style={{ width: "90%" }}
          />
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          className="App"
        >
          <button onClick={() => call(remotePeerIdValue)}>تماس</button>
          <button style={{ marginLeft: 2 }} onClick={hangUp}>
            قطع{" "}
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 2,
            padding: 10,
          }}
        >
          <h5>
            روی کپی بزنید و آیدی خود را به طرف مقابل ارسال کنید تا با شما تماس
            بگیرد
          </h5>
        </div>
        <div>
          <video muted ref={currentUserVideoRef} />
        </div>
        <div>
          <video ref={remoteVideoRef} />
        </div>
      </div>
    </div>
  );
}
