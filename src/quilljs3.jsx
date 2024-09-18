import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function TextEditor() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [warnings, setWarnings] = useState([]); // Store warnings in state
  const [selectedText, setSelectedText] = useState(""); // To store selected text

  // Function to handle text and send to Hugging Face API (or your API)
  const sendContentToHuggingFaceAPI = async (text) => {
    try {
      // oliverguhr/spelling-correction-english-base
      const response = await fetch(
        "http://127.0.0.1:6001/api/warning",
        // "https://api-inference.huggingface.co/models/ai-forever/T5-large-spell",
        // `${AZURE_ENDPOINT}openai/deployments/${AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_API_VERSION}`,
        {
          method: "POST",
          headers: {
            // Authorization: `Bearer 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`,
            // "Api-key": AZURE_OPENAI_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }), // Send text as 'inputs'
        }
      );
      const result = await response.json();
      console.log("Hugging Face API response:", result);
      // Update the warnings state with the response from the API
      if (result.error) {
        setWarnings([result.error]);
      } else {
        setWarnings([result.completion]); // Update with the completion text
      }
    } catch (error) {
      console.error("Error with API request:", error);
      setWarnings(["Error processing your request."]);
    }
  };
  // highlighted for wrong words ----------------------------------------------------------------------------------------

  // ---------------------------------DOM ISSUE-----------------------------------------------------------------------------------------------
  // Function to trigger spell-check on button click
  const triggerSpellCheck = () => {
    const editorContent = quillInstance.current.root.innerText;
    sendContentToHuggingFaceAPI(editorContent); // Send editor content to API
  };
  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Type here...",
      });

      // Optional: Automatically send content to the backend on text-change
      quillInstance.current.on("text-change", () => {
        setWarnings([]); // Clear warnings on text change
      });
    }
  }, []);
  // --------------------------------------------------------------------------------------------------------------------------------------
  return (
    <>
      <div
        ref={editorRef}
        style={{ height: "300px", marginBottom: "10px" }}
      ></div>

      {/* Round button for spell check */}
      <button
        onClick={triggerSpellCheck}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#007BFF",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        ✔
      </button>

      {/* Display AI Warnings */}
      <div style={{ marginTop: "10px", color: "red" }}>
        {warnings.map((warning, index) => (
          <p key={index}>{warning}</p> // Render the response warnings in UI
        ))}
      </div>
    </>
  );
}
