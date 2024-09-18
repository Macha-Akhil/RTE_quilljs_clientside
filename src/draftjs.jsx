import React, { useState } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";

const RichTextEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleEditorChange = (state) => {
    setEditorState(state);
    // Send editor content to backend
    const content = state.getCurrentContent().getPlainText();
    sendContentToBackend(content);
  };

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
    } catch (error) {
      console.error("Error sending content to backend:", error);
    }
  };

  return (
    <div>
      <Editor editorState={editorState} onChange={handleEditorChange} />
    </div>
  );
};

export default RichTextEditor;
