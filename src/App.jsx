import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
// import RichTextEditor from "./quilljs.jsx";
// import TextEditor from "./quilljs.jsx";
// import TextEditor from "./quill4.jsx";
// import TextEditor from "./quilljs3.jsx";
// import TextEditorllm from "./quillwebllm.jsx";
// import TextEditorword from "./quill2js.jsx";
// import RichTextEditor from "./draftjs.jsx";
import TextEditorTransformers from "./transjs.jsx";
// import TextCorrectionEditor from "./transcortjs.jsx";

function App() {
  return (
    <div>
      {/* <TextCorrectionEditor /> */}
      <TextEditorTransformers />
    </div>
  );
}

export default App;
