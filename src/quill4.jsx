import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function TextEditor() {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [warnings, setWarnings] = useState([]); // Store warnings

  // Function to handle text and send to Hugging Face API (or your API)
  const sendContentToAPI = async (text) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:6001/api/warning",
        // "https://api-inference.huggingface.co/models/t5-small",
        // "https://api-inference.huggingface.co/models/ai-forever/T5-large-spell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `correct the following text: ${text}`,
          }), // Send text as 'inputs'
        }
      );

      const result = await response.json();
      console.log("API response:", result);

      // Update the warnings state with the incorrect words from the API response
      if (result.error) {
        setWarnings([result.error]);
      } else {
        setWarnings([result.completion]); // Assuming API returns incorrect words
      }
      // console.log(warnings);
      // Call the function to highlight the incorrect words
      highlightText(result.completion.split(" "));
    } catch (error) {
      console.error("Error with API request:", error);
      setWarnings(["Error processing your request."]);
    }
  };

  // Function to highlight incorrect words in the Quill.js editor
  // const highlightText = (incorrectWords) => {
  //   console.log("Incorrect words:", incorrectWords);
  //   const quill = quillInstance.current;
  //   const text = quill.getText().trim();
  //   console.log("Text:", text);

  //   // Split text into words, including punctuation (we'll consider it separately)
  //   const words = text.match(/\b(\w+)\b/g); // Match words using word boundaries (ignoring punctuation)
  //   console.log("Words:", words);

  //   let index = 0; // Track the current index in the editor content

  //   quill.removeFormat(0, quill.getLength()); // Clear all previous formatting

  //   words.forEach((word) => {
  //     // Find where the word starts and ends in the text
  //     const start = text.indexOf(word, index); // Find word's starting index in the text
  //     const end = start + word.length;

  //     // Check if the word (case-insensitive) is in the incorrectWords array
  //     if (
  //       incorrectWords.some(
  //         (incorrect) => incorrect.toLowerCase() === word.toLowerCase()
  //       )
  //     ) {
  //       // console.log(`Word "${word}" found in incorrectWords array`);
  //       // Highlight incorrect words with red background
  //       // quill.formatText(start, word.length, { background: "blue" });
  //     } else {
  //       quill.formatText(start, word.length, { underline: true });
  //       // console.log(`Word "${word}" not found in incorrectWords array`);
  //     }
  //     // Move to the next word (adjusting for the space after the word)
  //     index = end + 1;
  //   });
  // };

  const highlightText = (incorrectWords) => {
    console.log("Incorrect words:", incorrectWords);
    const quill = quillInstance.current;
    const text = quill.getText().trim();
    console.log("Text:", text);

    // Remove special characters from both the text and words, and split text into words
    const words = text.split(/\s+/); // Split by spaces, treating multiple spaces as one

    let index = 0; // Track the current index in the editor content

    quill.removeFormat(0, quill.getLength()); // Clear all previous formatting

    words.forEach((word) => {
      const cleanedWord = word.replace(/[^\w\s]|_/g, "").toLowerCase(); // Remove special chars, convert to lowercase
      const start = index; // Find word's starting index
      const end = start + word.length;

      // Check if the cleaned word (case-insensitive) is in the incorrectWords array
      if (
        incorrectWords.some(
          (incorrect) => incorrect.toLowerCase() === cleanedWord
        )
      ) {
        // Underline incorrect words
        // quill.formatText(start, word.length, { underline: true });
      } else {
        quill.formatText(start, word.length, { underline: true });
        // console.log(`Word "${word}" not found in incorrectWords array`);
      }

      // Move to the next word (adjusting for space after the word)
      index = end + 1;
    });
  };

  // Function to trigger spell-check on button click

  const triggerSpellCheck = () => {
    const editorContent = quillInstance.current.root.innerText;
    sendContentToAPI(editorContent); // Send editor content to API
  };

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Type here...",
      });

      quillInstance.current.on("text-change", () => {
        setWarnings([]); // Clear warnings on text change
      });
    }
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={editorRef}
        style={{ height: "300px", marginBottom: "10px" }}
      ></div>

      {/* Button for spell check */}
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
          <p key={index}>{warning}</p> // Render the incorrect words from the API response
        ))}
      </div>
    </div>
  );
}
