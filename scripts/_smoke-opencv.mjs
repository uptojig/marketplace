// Smoke test: can we load opencv.js in Node, get a Mat, and run a basic op?
import cv from "@techstark/opencv-js";

async function main() {
  await new Promise((resolve) => {
    if (cv.Mat) resolve();
    else cv.onRuntimeInitialized = () => resolve();
  });
  console.log("opencv.js loaded");
  console.log("cv.Mat available:", typeof cv.Mat);
  console.log("cv.cvtColor available:", typeof cv.cvtColor);
  console.log("cv.findContours available:", typeof cv.findContours);
  console.log("cv.getPerspectiveTransform available:", typeof cv.getPerspectiveTransform);
  console.log("cv.warpPerspective available:", typeof cv.warpPerspective);

  // Quick functional check: make a 10x10 Mat and read it
  const m = new cv.Mat(10, 10, cv.CV_8UC1);
  console.log(`Mat created: ${m.rows}x${m.cols} channels=${m.channels()}`);
  m.delete();
  console.log("Mat deleted — runtime OK");
}

main().catch((e) => { console.error("FAIL:", e); process.exit(1); });
