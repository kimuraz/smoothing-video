<template>
  <div id="app">
    <div class="videos">
      <div class="group">
        <p>Video</p>
        <video
          autoplay
          ref="videoRef"
          style="height: 240px; width: 320px"
        ></video>
      </div>

      <div class="group">
        <p>OpenCV Median blur (ksize: {{ ksize }})</p>
        <canvas ref="canvasRef2" style="height: 240px; width: 320px" />

        <input type="range" v-model.number="ksize" min="1" max="15" step="2" />
      </div>

      <br />

      <div class="group">
        <p>OpenCV Face recognition</p>
        <canvas ref="canvasRef3" style="height: 240px; width: 320px" />
      </div>
    </div>
    <br />
    <button @click="interval ? stopOpenCV() : startOpenCV()">
      {{ interval ? "Stop OpenCV" : "Start OpenCV" }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from "vue";
import cv from "@techstark/opencv-js";

const videoRef: Ref<HTMLVideoElement | null> = ref(null);
const canvasRef2: Ref<HTMLCanvasElement | null> = ref(null);
const canvasRef3: Ref<HTMLCanvasElement | null> = ref(null);
const interval: any = ref(null);
const shouldStop: Ref<boolean> = ref(false);
const ksize: Ref<number> = ref(5);

const stopOpenCV = () => {
  shouldStop.value = true;
};

const startOpenCV = async () => {
  shouldStop.value = false;
  const FPS = 45;
  const videoEl = videoRef.value;
  if (!videoEl) {
    return;
  }
  // Capture video frame
  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;
  videoEl.width = width;
  videoEl.height = height;
  const medianCanvasEl = canvasRef2.value;
  const faceCanvasEl = canvasRef3.value;

  const src = new cv.Mat(height, width, cv.CV_8UC4);
  const medianDst = new cv.Mat(height, width, cv.CV_8UC1);
  const faceDst = new cv.Mat(height, width, cv.CV_8UC4);
  const gray = new cv.Mat();

  const cap = new cv.VideoCapture(videoEl);

  const faces = new cv.RectVector();
  const classifier = new cv.CascadeClassifier();
  classifier.load("haarcascade_frontalface_default.xml");

  // Processing images
  interval.value = setInterval(() => {
    try {
      if (!medianCanvasEl || !faceCanvasEl) {
        return;
      }

      if (videoEl?.paused || videoEl?.ended || shouldStop.value) {
        src.delete();
        medianDst.delete();
        faceDst.delete();
        gray.delete();
        faces.delete();
        classifier.delete();
        clearInterval(interval.value);
        interval.value = null;
        return;
      }
      cap.read(src);

      // Median blur
      cv.medianBlur(src, medianDst, ksize.value);
      cv.imshow(medianCanvasEl, medianDst);

      // Face recognition
      src.copyTo(faceDst);
      cv.cvtColor(faceDst, gray, cv.COLOR_RGBA2GRAY, 0);
      // Detect faces
      classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
      for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        let point1 = new cv.Point(face.x, face.y);
        let point2 = new cv.Point(face.x + face.width, face.y + face.height);
        cv.rectangle(faceDst, point1, point2, [255, 0, 0, 255]);
      }
      cv.imshow(faceCanvasEl, faceDst);
    } catch (err) {
      console.error(err);
    }
  }, 1000 / FPS);
};

onMounted(async () => {
  // Get User camera permission
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      const videoEl = videoRef.value;
      videoEl && (videoEl.srcObject = stream);
    })
    .catch((err) => {
      console.log(err);
    });
  // Get model from github
  const resp = await fetch(
    "https://raw.githubusercontent.com/kipr/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
  );
  const buffer = await resp.arrayBuffer();
  const data = new Uint8Array(buffer);
  cv.FS_createDataFile(
    "/",
    "haarcascade_frontalface_default.xml",
    data,
    true,
    false,
    false
  );
});
</script>

<style>
.videos {
  display: flex;
  flex-wrap: wrap;
  max-width: 90vw;
  gap: 40px;
}
.group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
</style>
