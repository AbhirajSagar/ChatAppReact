import React, { useEffect, useRef, useState } from 'react';
import Navbar from "./ui/Navbar";
import { BiSend } from "react-icons/bi";
import io from 'socket.io-client';
import { useMediaQuery } from 'react-responsive';


export default function VideoTextChat() 
{
    let socket;
    const hideAdsSideBar = useMediaQuery({ query: '(max-width: 820px)' });
    const isAMobile = useMediaQuery({ query: '(max-width: 509px)' });
    
    const localVideoTabletCSS = 
    {
        position: 'absolute',
        width:'150px',
        height:'200px',
        bottom: '0px',
        right: '0px',
        marginBottom: '8.5vh',
        marginRight:'10px',
    }
    const localVideoMobileCSS =
    {
        position: 'absolute',
        width:'70px',
        height:'90px',
        top: '0px',
        right: '0px',
        margin:'55px 5px',
    }

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const joinedRoomRef = useRef(false);
    let peerConnections = {};
    const constraints = { video: true, audio: true };
    let localStream;
    
    
    useEffect(() => 
    {
        if (!joinedRoomRef.current)
        {
            socket = io('http://localhost:5000');
            joinRoom();
            joinedRoomRef.current = true; // Mark as joined
            socket.emit('get-partner');
        }

        return () => 
        {
            socket.off('user-disconnected');
            socket.off('ice-candidate');
            socket.off('offer');
            socket.off('answer');
        };
    }, []);

    async function joinRoom() 
    {
        try
        {
            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            localVideoRef.current.srcObject = localStream;

            socket.on('user-disconnected', userId => 
            {
                alert(`User ${userId} disconnected`);
                if (peerConnections[userId])
                {
                    peerConnections[userId].close();
                    delete peerConnections[userId];
                }
            });

            socket.on('ice-candidate', (userId, iceCandidate) => 
            {
                console.log('received ICE candidate');
                const peerConnection = peerConnections[userId];
                if (peerConnection) {
                    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate))
                        .then(() => { console.log('peer connection successful'); })
                        .catch(error => console.warn('Error adding received ICE candidate:', error));
                } else {
                    console.log('no peer connection found to apply ice candidate');
                }
            });

            socket.on('offer', (userId, offer) => 
            {
                console.log('received an offer');
                if (!peerConnections[userId])
                {
                    createPeerConnection(userId);
                }

                peerConnections[userId].setRemoteDescription(new RTCSessionDescription(offer))
                    .then(() => peerConnections[userId].createAnswer())
                    .then(answer => peerConnections[userId].setLocalDescription(answer))
                    .then(() => {
                        socket.emit('answer', userId, peerConnections[userId].localDescription);
                        console.log('sent an answer');
                    })
                    .catch(error => console.error('Error handling offer:', error));
            });

            socket.on('answer', (userId, answer) => 
            {
                console.log('Received an answer');
                const peerConnection = peerConnections[userId];
                if (peerConnection)
                {
                    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
                    .catch(error => console.error('Error setting remote description:', error));
                    console.log('set answer');
                }
                else
                {
                    console.log('peer Connection not found to set answer');
                }
            });

            socket.on('user-connected', userId => 
            {
                alert(`Setting up a peer connection between  else (${userId}) and you (${socket.id})`);
                if (!peerConnections[userId])
                {
                    createPeerConnection(userId);
                }
                const peerConnection = peerConnections[userId];
                peerConnection.createOffer().then((offer) => peerConnection.setLocalDescription(offer))
                .then(() => 
                {
                    socket.emit('offer', userId, peerConnection.localDescription);
                })
                .catch(error => console.error('Error creating offer:', error));
            });
        } 
        catch (error)
        {
            console.error('Error setting up connection', error);
        }
    }

    function createPeerConnection(userId) 
    {
        const iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ]
        };
        const peerConnection = new RTCPeerConnection(iceServers);
    
        peerConnection.onicecandidate = event => 
        {
            if (event.candidate) 
            {
                const iceCandidate = {
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    candidate: event.candidate.candidate
                };
                socket.emit('ice-candidate', userId, iceCandidate);
            }
        };
    
        peerConnection.onicegatheringstatechange = () => 
        {
            console.log('ICE gathering state:', peerConnection.iceGatheringState);
        };
    
        peerConnection.ontrack = event => 
        {
            console.log('Received remote stream',event);
            remoteVideoRef.current.srcObject = event.streams[0];
        };
        
        if(localStream)
        {
            localStream.getTracks().forEach(track => 
            {
                peerConnection.addTrack(track, localStream);
                console.log('Added local track:', track);
            });
        }
        else
        {
            console.log("Local Stream not available");
        }
        

        peerConnections[userId] = peerConnection;
        console.log(peerConnection);
        return peerConnection;
    }
    

    return (
        <>
            <div className='videoTextChat'>
                <Navbar showProfile={false} showMenuBtn={false} />
                <div className="horizontalContainer">
                    <div className="textChat" style={hideAdsSideBar ? (isAMobile ? {} : {width: '40%',borderRight:'2px solid var(--blue)'}) : {width: '25%',borderRight:'2px solid var(--blue)'}}>
                        <div className="chatMessages"></div>
                        <div className="textChatInput">
                            <input type="text" placeholder="Type your message here.." />
                            <button>
                                <BiSend />
                            </button>
                        </div>
                    </div>
                    <div className="videoChat" style={hideAdsSideBar ? (isAMobile ? {} : {width: '60%'}) : {width: '45%'}}>
                        <video className="remoteVideo" ref={remoteVideoRef}  autoPlay></video>
                        <video className="localVideo" ref={localVideoRef} autoPlay style={hideAdsSideBar ? (isAMobile ? localVideoMobileCSS : localVideoTabletCSS) : {}}></video>
                        {hideAdsSideBar && <div className='inVideoAdsBanner'>Ads Banner</div>}
                    </div>
                    {!hideAdsSideBar && <div className='adsSideBar'>Some Ads Here...</div>} 
                </div>
            </div>
        </>
    );
}