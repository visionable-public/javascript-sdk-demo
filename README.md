# Visionable JavaScript SDK Demo App

[SDK Documentation](https://visionable.readme.io/v3.0-dev/docs/javascript-getting-started)

[Live Demo](https://visionable-public.github.io/javascript-sdk-demo/dist/)

## Installation

### Install the library directly from the repository:
```
npm install bitbucket:visionable_development/visionable-js-sdk#v1.0.1
```

### Import into your source code
```
import { VisiWebRTC } from 'visionable-js-sdk';
```

### Initialization

```
const visiClient = new VisiWebRTC({
  server: SERVER,
  email,
  password,
  meetingID,
  name,
  callback: function(err, jwt) {
    if (err) {
      // handle error
      return;
    }

    joinMeeting(meetingId)
  }
});
```

```
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
    callback: function(err, video_receive_max) {
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

```

