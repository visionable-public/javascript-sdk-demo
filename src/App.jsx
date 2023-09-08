import { useState, useEffect, useRef } from 'react';
import './App.css';
import { VisiWebRTC } from 'visionable-js-sdk';

import {
  Box,
  Button,
  Stack,
  Select,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

const SERVER = "app.visionable.one";
// let visiClient;

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [videoDevice, setVideoDevice] = useState("default");
  const [videoDevices, setVideoDevices] = useState(["default"]);
  const [videoStreams, setVideoStreams] = useState([]);
  const [inMeeting, setInMeeting] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [inputMuted, setInputMuted] = useState(false);
  const [outputMuted, setOututMuted] = useState(false);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);

  let visiClient = null;

  const connect = () => {
    setLoading(true);

    visiClient = new VisiWebRTC({
      server: SERVER,
      email,
      password,
      meetingID: meetingId,
      name: displayName,
      callback: function(err, mjwt) {
        if (err) {
          alert(err)
          console.log(err);
          return;
        }

        joinMeeting(meetingId)
      }
    });

    setClient(visiClient)
  }

  const joinMeeting = (meetingId) => {
    visiClient.connectToMeeting({
      meeting_id: meetingId,
      videoStreamAdded: function(id, email, name, camera, isScreenShare) {
        // optionally, don't get your stream from the server, use the local stream
        if (name === displayName) {
          setVideoStreams((vs) => {
            const localStream = vs.find((s) => s.id === "local");
            const rest = vs.filter((s) => s.id !== "local");
            return [...rest, { id, email, name, camera, isScreenShare, stream: localStream.stream }]
          });

          return;
        }

        // automatically enable all remote video streams
        visiClient.enableRemoteVideo(id, function(err, stream) {
          if (err) {
            console.log(err);
            alert(JSON.stringify(err));
          }

          setVideoStreams((vs) => [...vs, { id, email, name, camera, isScreenShare, stream }])
        });
      },
      videoStreamRemoved: function(id) {
        setVideoStreams((vs) => vs.filter((v) => v.id !== id));
      },
      callback: function(err, video_receive_max, meeting_id) {
        if (err) {
          console.log(err);
          alert(err);
          return;
        }

        setInMeeting(true);

        visiClient.enableLocalVideo(function(stream) { // enable local video
          setVideoStreams((vs) => [...vs, { id: "local", stream }])
          setVideoEnabled(true);

          visiClient.enableAudio(); // enable all audio

          setLoading(false);
        }, null, null, videoDevice);
      }
    })
  };

  const toggleLocalVideo = async () => {
    setLoading(true);
    if (videoEnabled) {
      await client.disableLocalVideo();
      setVideoEnabled(false);
      setLoading(false);
    } else {
      await client.enableLocalVideo(function(stream) { // enable local video
        setVideoStreams((vs) => [...vs, { id: "local", stream }])
        setVideoEnabled(true);
        setLoading(false);
      }, null, null, videoDevice);
    }
  };

  const toggleAudioInput = () => {
    if (inputMuted) {
      client.unMuteAudioInput();
    } else {
      client.muteAudioInput();
    }
    setInputMuted(!inputMuted);
  };

  function exitMeeting() {
    client.disconnect();
    setInMeeting(false);
  }

  const formValid = meetingId && displayName;

  return (
    <Box sx={{ display: "flex", justifyContent: "top" }}>
      <Stack sx={{ maxWidth: "300px", p: 2, gap: 2 }}>
        <img src={`https://${SERVER}/images/visionable-login-logo.svg`} />

        <FormControl>
          <TextField
            label="Server"
            disabled
            value={SERVER}
          />
        </FormControl>

        <FormControl>
          <TextField
            label="Email (empty for guest)"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <TextField
            label="Password (empty for guest)"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <TextField
            label="Meeting ID"
            value={meetingId}
            required
            onChange={(e) => setMeetingId(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <TextField
            label="Display Name"
            value={displayName}
            required
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <InputLabel id="video-device-label">Video Device</InputLabel>
          <Select
            labelId="video-device-label"
            value={videoDevice}
            label="Video Device"
            onChange={(e) => setVideoDevice(e.target.value)}
          >
            {videoDevices.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" id="join_button" onClick={connect} disabled={inMeeting || !formValid || loading}>Join Meeting</Button>

        <Button variant="outlined" color="error" id="exit_button" onClick={exitMeeting} disabled={!inMeeting || loading}>Exit Meeting</Button>

        <Button disabled={!inMeeting || loading} variant="outlined" onClick={toggleLocalVideo}>{videoEnabled ? "Disable" : "Enable"} Local Video</Button>
        <Button disabled={!inMeeting || loading} variant="outlined" onClick={toggleAudioInput}>{inputMuted ? "Unmute" : "Mute"} Audio Input</Button>
      </Stack>

      <Box sx={{
        display: "flex", flexWrap: "wrap", gap: 1, p: 2
      }}>
        {videoStreams.map((v) => <Video key={v.id} video={v} />)}
      </Box>
    </Box >
  )
}

const Video = ({ video }) => {
  // We need to use a ref to attach the video stream to the <video> element's srcObject
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = video.stream;
    }
  }, [videoRef]);

  if (!video.stream || !video.name) {
    return;
  }

  return (
    <Box id={video.id} key={video.id}>
      <Box sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eee" }}>
        {`${video.name} ${video.camera ? ` - ${video.camera}` : ""}`}
      </Box>
      <video ref={(el) => videoRef.current = el} autoPlay={true} style={{ height: "300px" }} />
    </Box >
  );
}

export default App
