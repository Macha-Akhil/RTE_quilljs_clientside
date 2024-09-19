import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { CreateMLCEngine } from "@mlc-ai/web-llm";

export default function TextEditorLLM() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [warnings, setWarnings] = useState([]);

  const sendContentToAPI = async (text) => {
    try {
      // Callback to track loading progress
      const initProgressCallback = (progress) => {
        console.log(`Model loading progress: ${progress}`);
      };

      // Load the MLC engine and specify CPU usage
      const engine = await CreateMLCEngine(
        "Llama-3.1-8B-Instruct-q4f32_1-MLC",
        {
          initProgressCallback,
          device: "cpu", // Set the device to CPU
        }
      );

      const messages = [
        { role: "system", content: "Check text for spelling errors." },
        { role: "user", content: text },
      ];

      const reply = await engine.chat.completions.create({ messages });
      const correctedText = reply.choices[0].message.content;
      setWarnings([correctedText]);
    } catch (error) {
      console.error("Error during model inference:", error);
      setWarnings(["Model inference failed."]);
    }
  };

  const triggerSpellCheck = () => {
    const editorContent = quillInstance.current.root.innerText;
    sendContentToAPI(editorContent);
  };

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Type here...",
      });

      quillInstance.current.on("text-change", () => {
        setWarnings([]);
      });
    }
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={editorRef}
        style={{ height: "300px", marginBottom: "10px" }}
      ></div>

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

      <div style={{ marginTop: "10px", color: "red" }}>
        {warnings.map((warning, index) => (
          <p key={index}>{warning}</p>
        ))}
      </div>
    </div>
  );
}
