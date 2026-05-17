// Probe with a dummy input — run inference once with a 640x640 zero tensor
// to learn the output shape empirically.
import * as ort from "onnxruntime-node";
const session = await ort.InferenceSession.create("models/thai-id-card-detector.onnx");

const dummy = new Float32Array(1 * 3 * 640 * 640);
const input = new ort.Tensor("float32", dummy, [1, 3, 640, 640]);
const results = await session.run({ images: input });
const out = results.output0;
console.log("output0:");
console.log("  type:", out.type);
console.log("  dims:", out.dims);
console.log("  data length:", out.data.length);
console.log("  first 20 values:", Array.from(out.data.slice(0, 20)));
