// Inspect ONNX model shape so we don't guess input/output dimensions.
import * as ort from "onnxruntime-node";
const session = await ort.InferenceSession.create("models/thai-id-card-detector.onnx");
console.log("=== INPUTS ===");
for (const name of session.inputNames) {
  console.log(name, session.handler?.inputMetadata?.[name] ?? "(metadata unavailable)");
}
console.log("\n=== OUTPUTS ===");
for (const name of session.outputNames) {
  console.log(name, session.handler?.outputMetadata?.[name] ?? "(metadata unavailable)");
}
console.log("\nFull session input names:", session.inputNames);
console.log("Full session output names:", session.outputNames);
