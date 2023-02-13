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

      <template v-if="interval">
        <div class="group">
          <p>OpenCV Bilateral Filter</p>
          <canvas ref="canvasRef" style="height: 240px; width: 320px" />
        </div>

        <div class="group">
          <p>OpenCV Median blur (ksize: {{ ksize }})</p>
          <canvas ref="canvasRef2" style="height: 240px; width: 320px" />

          <input
            type="range"
            v-model.number="ksize"
            min="1"
            max="15"
            step="2"
          />
        </div>
      </template>
    </div>
    <br />
    <button @click="interval ? stopOpenCV() : startOpenCV()">
      {{ interval ? "Stop OpenCV" : "Start OpenCV" }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, nextTick } from "vue";
import cv from "@techstark/opencv-js";

const videoRef: Ref<HTMLVideoElement | null> = ref(null);
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null);
const canvasRef2: Ref<HTMLCanvasElement | null> = ref(null);
const interval: any = ref(null);
const ksize: Ref<number> = ref(5);

const stopOpenCV = () => {
  if (interval.value) {
    clearInterval(interval.value);
    interval.value = null;
  }
};

const startOpenCV = () => {
  const FPS = 60;
  interval.value = setInterval(() => {
    const videoEl = videoRef.value;
    const canvasEl = canvasRef.value;
    const medianCanvasEl = canvasRef2.value;
    if (!videoEl || !canvasEl || !medianCanvasEl) {
      console.warn("Video or Canvas element not found", videoEl, canvasEl);
      return;
    }

    if (videoEl?.paused || videoEl?.ended) {
      clearInterval();
      return;
    }

    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;
    // Capture video frame
    const cap = new cv.VideoCapture(videoEl);
    videoEl.width = width;
    videoEl.height = height;
    // Opencv Mats
    const src = new cv.Mat(height, width, cv.CV_8UC4);
    const blurDst = new cv.Mat(height, width, cv.CV_8UC1);
    const medianDst = new cv.Mat(height, width, cv.CV_8UC1);

    cap.read(src);
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
    cv.bilateralFilter(src, blurDst, 6, 50, 50, cv.BORDER_DEFAULT);
    cv.medianBlur(src, medianDst, ksize.value);
    cv.imshow(canvasEl, blurDst);
    cv.imshow(medianCanvasEl, medianDst);
    src.delete();
    blurDst.delete();
  }, 1000 / FPS);
};

onMounted(() => {
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
});
</script>

<style>
.videos {
  display: flex;
  flex-wrap: wrap;
  max-width: 90vw;
  gap: 40px;
}
</style>
