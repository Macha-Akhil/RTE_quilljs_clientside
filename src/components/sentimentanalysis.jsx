import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { pipeline, env } from "@xenova/transformers";
import { LoaderCircle } from "lucide-react"; // Import your loader component
// import { Loader } from "rsuite";

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
  const [isModelLoading, setIsModelLoading] = useState(true);

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
        setIsModelLoading(true);
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

      setIsModelLoading(false);
    };
    loadPipeline();
  }, []);
  useEffect(() => {
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
    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change", triggerSpellCheck);
      }
    };
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Sentiment Analysis Text Editor
        </h1>
        <div className="relative">
          <div
            ref={editorRef}
            style={{
              height: "300px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              backgroundColor: "#f7f7f7", // Custom background color
              borderRadius: "", // Rounded corners for a unique look
            }}
            className="h-[300px] mb-4 border border-gray-300 rounded-lg bg-white"
          />
          {isModelLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="text-center">
                {/* <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" /> */}
                <LoaderCircle className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Loading Sentiment Analysis Model...
                </p>
              </div>
            </div>
          )}
          {/* {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
              <LoaderCircle className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
            </div>
          )} */}
        </div>

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
