import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import server from "../environment";
import styles from "../styles/videoComponent.module.css";

const server_url = server;
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState(false);
  let [screen, setScreen] = useState(false);
  let [showModal, setModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoAvailable(true);
        videoPermission.getTracks().forEach((t) => t.stop());
      }
    } catch {
      setVideoAvailable(false);
    }

    try {
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) {
        setAudioAvailable(true);
        audioPermission.getTracks().forEach((t) => t.stop());
      }
    } catch {
      setAudioAvailable(false);
    }

    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (userMediaStream) {
        window.localStream = userMediaStream;
        if (localVideoref.current) localVideoref.current.srcObject = userMediaStream;
      }
    } catch (error) {
      console.log("Could not get initial media:", error);
    }
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
        }).catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {}

          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
              }).catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
        }).catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {}
          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;
          getUserMedia();
        })
    );
  };

  let getDislayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(getDislayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
  }, [screen]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
              }).catch((e) => console.log(e));
            }).catch((e) => console.log(e));
          }
        }).catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find((video) => video.socketId === socketListId);

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try { connections[id2].addStream(window.localStream); } catch (e) {}
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
              }).catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    const newVal = !video;
    setVideo(newVal);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => { track.enabled = newVal; });
    }
  };

  let handleAudio = () => {
    const newVal = !audio;
    setAudio(newVal);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => { track.enabled = newVal; });
    }
  };

  let handleScreen = () => { setScreen(!screen); };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    if (socketRef.current) socketRef.current.disconnect();
    window.location.href = "/home";
  };

  let handleMessage = (e) => { setMessage(e.target.value); };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  let sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  let connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);
    getMedia();
  };

  const roomCode = window.location.pathname.split("/").pop();

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyLeft}>
            <div className={styles.lobbyBrand}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#0ea5e9" />
                <path d="M7 10h14M7 14h10M7 18h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="21" cy="18" r="3" fill="white" />
              </svg>
              <span>Talksy</span>
            </div>
            <h2>Ready to join?</h2>
            <p>Room: <strong>{roomCode}</strong></p>
            <div className={styles.lobbyInputWrap}>
              <input
                className={styles.lobbyInput}
                type="text"
                placeholder="Your display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") connect(); }}
                autoFocus
              />
              <button
                className={styles.lobbyJoinBtn}
                onClick={connect}
                disabled={!username.trim()}
              >
                Join call
              </button>
            </div>
          </div>
          <div className={styles.lobbyVideoPreview}>
            <video ref={localVideoref} autoPlay muted className={styles.lobbyVideo} />
            <div className={styles.lobbyVideoLabel}>Preview</div>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {/* Chat */}
          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <span>Chat</span>
                  <button className={styles.chatClose} onClick={() => setModal(false)}>✕</button>
                </div>
                <div className={styles.chattingDisplay}>
                  {messages.length === 0 ? (
                    <p className={styles.noMessages}>No messages yet…</p>
                  ) : (
                    messages.map((item, index) => (
                      <div className={styles.messageItem} key={index}>
                        <p className={styles.messageSender}>{item.sender}</p>
                        <p className={styles.messageText}>{item.data}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.chattingArea}>
                  <input
                    className={styles.chatInput}
                    value={message}
                    onChange={handleMessage}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                  />
                  <button
                    className={styles.chatSendBtn}
                    onClick={sendMessage}
                    disabled={!message.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={styles.buttonContainers}>
            <button
              className={`${styles.controlBtn} ${!video ? styles.controlBtnOff : ""}`}
              onClick={handleVideo}
              title={video ? "Turn off camera" : "Turn on camera"}
            >
              {video ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#f87171">
                  <path d="M21 21L3 3M10.24 10.24A3 3 0 0012 15a3 3 0 002.76-4.76M6 6H4a1 1 0 00-1 1v10a1 1 0 001 1h12c.17 0 .34-.04.5-.1M8 5h8a1 1 0 011 1v2.31L21 6v12l-2-2M16 16v1a1 1 0 01-1 1H8" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              )}
            </button>

            <button
              className={styles.endCallBtn}
              onClick={handleEndCall}
              title="End call"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
              </svg>
            </button>

            <button
              className={`${styles.controlBtn} ${!audio ? styles.controlBtnOff : ""}`}
              onClick={handleAudio}
              title={audio ? "Mute" : "Unmute"}
            >
              {audio ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.95-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V20h-2v-4.07z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#f87171">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              )}
            </button>

            {screenAvailable && (
              <button
                className={`${styles.controlBtn} ${screen ? styles.controlBtnActive : ""}`}
                onClick={handleScreen}
                title={screen ? "Stop sharing" : "Share screen"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={screen ? "#4ade80" : "white"}>
                  <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
                </svg>
              </button>
            )}

            <button
              className={`${styles.controlBtn} ${showModal ? styles.controlBtnActive : ""}`}
              onClick={() => { setModal(!showModal); if (!showModal) setNewMessages(0); }}
              title="Toggle chat"
              style={{ position: "relative" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              {newMessages > 0 && (
                <span className={styles.chatBadge}>{newMessages > 9 ? "9+" : newMessages}</span>
              )}
            </button>
          </div>

          {/* Local video */}
          <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted />

          {/* Remote videos */}
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId} className={styles.remoteVideoWrapper}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => { if (ref && video.stream) ref.srcObject = video.stream; }}
                  autoPlay
                  playsInline
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
