import { io } from "socket.io-client";
import { useRef, useEffect, useState } from "react";
import { FiVideo, FiVideoOff, FiMic, FiMicOff } from "react-icons/fi";

const configuration = 
{
    iceServers: 
    [
        {
            urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};
const socket = io("http://localhost:3000", { transports: ["websocket"] });

let pc;
let localStream;
let startButton;
let hangupButton;
let muteAudButton;
let remoteVideo;
let localVideo;

socket.on("message", (e) => 
{
    if (!localStream)
    {
        console.log("Local Stream Not Ready Yet to Start Chatting");
        return;
    }

    switch (e.type) 
    {
        case "offer":
            handleOffer(e);
            break;
        case "answer":
            handleAnswer(e);
            break;
        case "candidate":
            handleCandidate(e);
            break;
        case "ready":
            // A second tab joined. This tab will initiate a call unless in a call already.
            if (pc)
            {
                console.log("Already in a Chat, Ignoring the recevied event");
            }
            else
            {
                makeOffer();
            }
            break;
        case "bye":
            if(pc) 
            {
                hangup();
            }
            break;
        default:
            console.log("Received Unknown Event, Can't be handled", e);
            break;
    }
});

async function makeOffer() 
{
    try
    {
        pc = new RTCPeerConnection(configuration);
        pc.onicecandidate = (e) => 
        {
            const message = 
            {
                type: "candidate",
                candidate: null,
            };
            if(e.candidate)
            {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            socket.emit("message", message);
        };

        pc.ontrack = (receivedStream) => (remoteVideo.current.srcObject = receivedStream.streams[0]);
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

        const offer = await pc.createOffer();
        socket.emit("message", { type: "offer", sdp: offer.sdp });
        await pc.setLocalDescription(offer);
    }
    catch(error)
    {
        console.log('Error while establishing peer connection');
    }
}

async function handleOffer(offer)
{
    if(pc)
    {
        console.log("Received a Offer While already in a Peer Connection, Ignoring the received offer");
        return;
    }
    try
    {
        pc = new RTCPeerConnection(configuration);
        pc.onicecandidate = (e) => 
        {
            const message = 
            {
                type: "candidate",
                candidate: null,
            };
            if (e.candidate) 
            {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            socket.emit("message", message);
        };

        pc.ontrack = (receivedStream) => (remoteVideo.current.srcObject = receivedStream.streams[0]);
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();
        socket.emit("message", { type: "answer", sdp: answer.sdp });
        await pc.setLocalDescription(answer);
    }
    catch(error)
    {
        console.log('Error While Creating An Answer to Received Offer',error);
    }
}

async function handleAnswer(answer)
{
    if (!pc)
    {
        console.error("No Peer Connection Established to answer");
        return;
    }
    try
    {
        await pc.setRemoteDescription(answer);
    }
    catch(error)
    {
        console.log('Error while receiving answer',error);
    }
}

async function handleCandidate(candidate)
{
    if(!pc)
    {
        console.error("No Peer Connection Established to set its candidates");
        return;
    }

    try
    {
        await pc.addIceCandidate(!candidate ? null : candidate); 
    }
    catch(error)
    {
        console.log('Error while adding ICE candidates',error);
    }
}
async function hangup()
{
    if (pc)
    {
        pc.close();
        pc = null;
    }
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    startButton.current.disabled = false;
    hangupButton.current.disabled = true;
    muteAudButton.current.disabled = true;
}

export default function VideoTextChat()
{
    startButton = useRef(null);
    hangupButton = useRef(null);
    muteAudButton = useRef(null);
    localVideo = useRef(null);
    remoteVideo = useRef(null);

    useEffect(() => 
    {
        hangupButton.current.disabled = true;
        muteAudButton.current.disabled = true;
    }, []);

    const [audiostate, setAudio] = useState(false);

    const startB = async () => 
    {
        try
        {
            localStream = await navigator.mediaDevices.getUserMedia({video: true,audio: { echoCancellation: true }});
            localVideo.current.srcObject = localStream;
        }
        catch(err)
        {
            console.log('Error while setting local Stream, allow camera and mic access',err);
        }

        startButton.current.disabled = true;
        hangupButton.current.disabled = false;
        muteAudButton.current.disabled = false;

        socket.emit("message", { type: "ready" });
    };

    const hangB = async () => 
    {
        hangup();
        socket.emit("message", { type: "bye" });
    };

    function muteAudio()
    {
        localVideo.current.muted = audiostate;
        setAudio(!audiostate);
    }

    return (
        <div className="videoTextChat">
            <main className="container">
                <div className="video bg-main">
                    <video ref={localVideo} className="video-item" autoPlay playsInline src=""></video>
                    <video ref={remoteVideo} className="video-item" autoPlay playsInline src=""></video>
                </div>
                <div className="btn">
                    <button className="btn-item btn-start" ref={startButton} onClick={startB}>
                        <FiVideo />
                    </button>
                    <button className="btn-item btn-end" ref={hangupButton} onClick={hangB}>
                        <FiVideoOff />
                    </button>
                    <button className="btn-item btn-start" ref={muteAudButton}onClick={muteAudio}>
                        {audiostate ? <FiMic /> : <FiMicOff />}
                    </button>
                </div>
            </main>
        </div>
    );
}
