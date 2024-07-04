// src/tensorflow-init.js
import * as tf from "@tensorflow/tfjs";

const setBackend = async () => {
  await tf.setBackend("cpu");
  await tf.ready();
  console.log("TensorFlow.js set to CPU backend");
};

setBackend();

export default tf;
