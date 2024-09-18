// "https://api-inference.huggingface.co/models/Xenova/bert-base-multilingual-uncased-sentiment",
// Authorization: `Bearer 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`,

// import React, { useState, useEffect, useRef, useCallback } from "react";
// // import axios from "axios";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// // import * as tf from "@tensorflow/tfjs"; // Import TensorFlow.js
// // import { pipeline } from "@huggingface/transformers";
// // const HUGGING_FACE_API_KEY = "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";

// const RichTextEditor = () => {
//   const [editorContent, setEditorContent] = useState("");
//   const [warning, setWarning] = useState("");
//   // const quillRef = useRef(null);

//   const handleChange = useCallback((value) => {
//     setEditorContent(value);
//     // Send text to backend for validation
//     const checkText = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:6001/api/warning", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ text: value }),
//         });

//         const data = await response.json();
//         setWarning(data.warning || "");
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     };
//     checkText();
//   }, []);

//   return (
//     <>
//       <ReactQuill
//         theme="snow"
//         value={editorContent}
//         onChange={handleChange}
//         placeholder="Write something..."
//         // ref={quillRef} // Example of using ref
//       />
//       {warning && <div style={{ color: "red" }}>{warning}</div>}
//     </>
//   );
// };
// export default RichTextEditor;
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function TextEditor() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // Initialize Quill editor
      quillInstance.current = new Quill(editorRef.current, {
        debug: "info",
        modules: {
          toolbar: true, // Formatting options (icons)
        },
        placeholder: "Type here....",
        theme: "snow",
      });

      // Listen for text changes and send content to backend
      quillInstance.current.on("text-change", () => {
        const editorContent = quillInstance.current.root.innerHTML;
        // const words = editorContent.split(/\s+/);
        sendContentToBackend(editorContent);
      });
    }
  }, []);

  // Function to send content to backend
  const sendContentToBackend = async (content) => {
    try {
      const response = await fetch("http://127.0.0.1:6001/api/warning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      console.log("Backend response:", data);
      // Update warning state and highlight warnings in the editor
      setWarning(data.warning || "");
      highlightWarnings(data.warnings || []);
    } catch (error) {
      console.error("Error sending content to backend:", error);
    }
  };

  // Function to highlight warnings in the editor
  const highlightWarnings = (warnings) => {
    const editor = quillInstance.current.getEditor();
    warnings.forEach((warning) => {
      const { text, position, message } = warning;

      // Find text in the editor and apply background color
      editor.getContents().ops.forEach((op, index) => {
        if (op.insert === text) {
          editor.formatText(index, text.length, { background: "yellow" }); // Highlight with yellow background
        }
      });
    });
  };

  return (
    <>
      <div ref={editorRef} id="editor" style={{ height: "397px" }}></div>
      {warning && <div style={{ color: "red" }}>{warning}</div>}
    </>
  );
}
