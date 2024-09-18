import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";

export default function TextEditorword() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        debug: "info",
        modules: {
          toolbar: true,
        },
        placeholder: "Type here....",
        theme: "snow",
      });
    }
  }, []);

  // Function to send content to the backend when button is clicked
  const handleButtonClick = async () => {
    const editorContent = quillInstance.current.root.innerHTML;
    const words = editorContent.split(/\s+/);
    sendContentToBackend(words);
  };

  const sendContentToBackend = async (words) => {
    try {
      // Send words to the backend
      const response = await fetch("http://127.0.0.1:6001/api/warning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ words }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.error) {
        setWarning(data.error);
      } else {
        setWarning("");
        highlightWarnings(data.warnings || []);
      }
    } catch (error) {
      console.error("Error sending content to backend:", error);
    }
  };

  const highlightWarnings = (warnings) => {
    const editor = quillInstance.current.getEditor();

    // Clear previous highlights
    editor.formatText(0, editor.getLength(), { background: "" });

    warnings.forEach((warning) => {
      const { text, message } = warning;

      // Find and highlight the text
      const delta = editor.getContents();
      let offset = 0;

      delta.ops.forEach((op) => {
        if (op.insert && typeof op.insert === "string") {
          let startIndex = 0;
          let index = op.insert.indexOf(text, startIndex);
          while (index !== -1) {
            editor.formatText(index + offset, text.length, {
              background: "yellow",
              "data-warning": message,
            });
            startIndex = index + text.length;
            index = op.insert.indexOf(text, startIndex);
          }
          offset += op.insert.length;
        }
      });
    });
  };

  return (
    <>
      <div
        ref={editorRef}
        id="editor"
        style={{ height: "300px", marginBottom: "10px" }}
      ></div>

      {/* Button to trigger server request */}
      <button onClick={handleButtonClick} style={{ marginBottom: "10px" }}>
        Check for Warnings
      </button>

      {/* Display warning message if any */}
      {warning && <div style={{ color: "red" }}>{warning}</div>}
    </>
  );
}
