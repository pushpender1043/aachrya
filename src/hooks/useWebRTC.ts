import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseWebRTCProps {
  roomId: string;
  isInitiator: boolean;
  onRemoteStream?: (stream: MediaStream) => void;
}

export const useWebRTC = ({ roomId, isInitiator, onRemoteStream }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RealtimeChannel | null>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    initializeMedia();
    setupSignaling();

    return () => {
      cleanup();
    };
  }, [roomId]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const setupSignaling = () => {
    channel.current = supabase.channel(`call-${roomId}`);

    channel.current
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer:', payload);
        await handleOffer(payload.offer);
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer:', payload);
        await handleAnswer(payload.answer);
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('Received ICE candidate:', payload);
        await handleIceCandidate(payload.candidate);
      })
      .subscribe((status) => {
        console.log('Channel status:', status);
        if (status === 'SUBSCRIBED' && isInitiator) {
          createPeerConnection();
          createOffer();
        } else if (status === 'SUBSCRIBED' && !isInitiator) {
          createPeerConnection();
        }
      });
  };

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        channel.current?.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate },
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      console.log('Received remote stream');
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (onRemoteStream) {
        onRemoteStream(stream);
      }
      setIsConnected(true);
    };

    peerConnection.current.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.current?.connectionState);
      if (peerConnection.current?.connectionState === 'connected') {
        setIsConnected(true);
      } else if (peerConnection.current?.connectionState === 'disconnected' ||
                 peerConnection.current?.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream);
      });
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current) return;

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      console.log('Sending offer');
      channel.current?.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer },
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      
      console.log('Sending answer');
      channel.current?.send({
        type: 'broadcast',
        event: 'answer',
        payload: { answer },
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (channel.current) {
      channel.current.unsubscribe();
    }
  };

  return {
    localStream,
    remoteStream,
    isConnected,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    cleanup,
  };
};
