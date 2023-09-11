# Visionable JavaScript SDK Demo App

[SDK Documentation](https://visionable.readme.io/v3.0-dev/docs/javascript-getting-started)

[Live Demo](https://visionable-public.github.io/javascript-sdk-demo/dist/)

## Installation
```console
npm install bitbucket:visionable_development/visionable-js-sdk
```

## Initialization

```js
import { VisiWebRTC } from 'visionable-js-sdk';

// use the Meeting API to create a meeting
// https://visionable.readme.io/v3.0-dev/reference/postmeeting
const meetingID = "56cf228b-af75-421e-9ff1-dfe7c849d1a1";

// Instantiate
const visiClient = new VisiWebRTC({
  server: "app.visionable.one",
  email: undefined, // authentication is optional
  password: undefined, // leave email & password undefined to join as a guest
  meetingID: meetingID, // optional if authenticating with email & password
  name: "Test User 1",
  callback: function(err, jwt) {
    if (err) {
      // handle error
    }
  }
});
```

## Joining a Meeting
```js
visiClient.connectToMeeting({
  meeting_id: meetingID,
  videoStreamAdded: function(id, email, name, camera, isScreenShare) {
    // this callback is called for local and remote videos

    // to automatically enable all video streams
    visiClient.enableRemoteVideo(id, function(err, stream) {
      if (err) {
        // handle error
      }

      // add video stream to data structure
      // e.g. setVideoStreams((vs) => [...vs, { id, email, name, camera, isScreenShare, stream }])
    });
  },
  videoStreamRemoved: function(id) {
    // remove video stream from data structure
    // e.g. setVideoStreams((vs) => vs.filter((v) => v.id !== id));
  },
  callback: function(err, video_receive_max) {
    if (err) {
      // handle error
      return;
    }

    // to automatically enable local video on meeting-join
    visiClient.enableLocalVideo(function(stream) {
      // add local stream to data structure
      // e.g. setVideoStreams((vs) => [...vs, { id: "local", stream }])

      // to automatically enable audio on meeting-join
      visiClient.enableAudio();
    });
  }
})
```
