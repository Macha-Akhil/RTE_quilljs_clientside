import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;
env.useBrowserCache = false;

// Utility function to debounce API calls
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function TextCorrectionEditor() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const pipelineRef = useRef(null); // To store the pipeline instance

  // Function to send content for correction via transformers.js
  const sendContentForCorrection = async (text) => {
    if (!pipelineRef.current) {
      console.error("Pipeline is not loaded yet.");
      return;
    }

    setIsLoading(true); // Start loading indicator
    try {
      // Send text for correction using the already loaded pipeline (fill-mask, text-generation, etc.)
      const correctedText = await pipelineRef.current(text);
      console.log(correctedText);

      // Replace the content in the editor with the corrected text
      const updatedContent = correctedText[0].generated_text;
      quillInstance.current.root.innerText = updatedContent; // Update Quill editor content
    } catch (error) {
      console.error("Error during text correction:", error);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // Trigger correction when the user stops typing
  const triggerTextCorrection = debounce(() => {
    const editorContent = quillInstance.current.root.innerText;
    sendContentForCorrection(editorContent);
  }, 1000); // Debounce with 1 second delay

  // Load the pipeline only once on component mount
  useEffect(() => {
    const loadPipeline = async () => {
      try {
        console.log("Loading model...");
        const pipe = await pipeline(
          "text-generation", // or "fill-mask" depending on the model used
          "Xenova/gpt2" // Change this to a model more suited for text correction if available
        );
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
      });

      // Automatically trigger correction on text change with debounce
      quillInstance.current.on("text-change", () => {
        triggerTextCorrection(); // Debounced correction
      });
    }
  }, []);

  return (
    <div style={{ position: "relative", padding: "20px" }}>
      {/* Quill Editor */}
      <div
        ref={editorRef}
        style={{
          height: "300px",
          marginBottom: "10px",
          border: "1px solid #ccc",
        }}
      ></div>

      {/* Loading Indicator */}
      {isLoading && <p>Correcting text...</p>}
    </div>
  );
}
