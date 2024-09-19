import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = false;
env.backends.onnx.wasm.numThreads = 1;

// Utility function to debounce API calls
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function TextEditorLLM() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [warnings, setWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const pipelineRef = useRef(null); // To store the pipeline instance

  // Function to send content to the LLaMA model via transformers.js
  const sendContentToAPI = async (text) => {
    if (!pipelineRef.current) {
      console.error("Pipeline is not loaded yet.");
      return;
    }
    setIsLoading(true); // Start loading indicator
    try {
      // Perform sentiment analysis using the already loaded pipeline
      const generated_text = await pipelineRef.current(text);
      console.log(generated_text);

      // Store the label and score in the warnings state
      setWarnings(
        generated_text.map((item) => ({
          label: item.label,
          score: item.score,
        }))
      );
    } catch (error) {
      if (error.message.includes("Unexpected token")) {
        console.error("Error: Model URL might be incorrect or inaccessible.");
      } else {
        console.error("Model inference error:", error);
      }
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // Trigger spell-check by sending the Quill content to the AI
  const triggerSpellCheck = debounce(() => {
    const editorContent = quillInstance.current.root.innerText;
    sendContentToAPI(editorContent);
  }, 500); // Debounce with 1 second delay

  // Load the pipeline only once on component mount
  useEffect(() => {
    const loadPipeline = async () => {
      try {
        console.log("Loading model...");
        const pipe = await pipeline(
          "sentiment-analysis",
          "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
        );
        console.log(pipe);
        pipelineRef.current = pipe; // Store the pipeline in the ref
        console.log("Model loaded successfully.");
      } catch (error) {
        console.error("Error loading the model:", error);
      }
    };

    loadPipeline();

    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Type here...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"], // Text formatting
            ["link", "image", "video"], // Link, image, video options
            [{ list: "ordered" }, { list: "bullet" }], // Lists
            [{ "code-block": true }], // Code block
            ["clean"], // Clear formatting
          ],
        },
      });

      // Automatically trigger spell-check on text change with debounce
      quillInstance.current.on("text-change", () => {
        setWarnings([]); // Clear warnings when the text changes
        triggerSpellCheck(); // Debounced spell-check
      });
    }
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-6">
        Sentiment Analysis Text Editor
      </h1>
      <div style={{ position: "relative", padding: "20px" }}>
        {/* Quill Editor */}

        <div
          ref={editorRef}
          style={{
            height: "300px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            backgroundColor: "#f7f7f7", // Custom background color
            borderRadius: "", // Rounded corners for a unique look
          }}
        ></div>
        {/* AI Response */}
        <div style={{ marginTop: "10px", color: "red" }}>
          {warnings.map((warning, index) => (
            <p key={index}>
              <strong>Label:</strong> {warning.label} | <strong>Score:</strong>{" "}
              {warning.score}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}

// const pipe = await pipeline( "text-generation", "Xenova/gpt2");
// const pipe = await pipeline(
//   "text2text-generation",
//   "facebook/bart-large-cnn"
// );
// const pipe = await pipeline(
//   "text2text-generation",
//   "facebook/bart-large"
// );
// const pipe = await pipeline(
//   "sentiment-analysis",
//   "distilbert-base-uncased"
// );
// const pipe = await pipeline("text-generation", "gpt2");
// const pipe = await pipeline(
//   "text2text-generation",
//   "teapotai/instruct-teapot"
// );
// const pipe = await pipeline(
//   "text2text-generation",
//   (model = "oliverguhr/spelling-correction-english-base")
// );
