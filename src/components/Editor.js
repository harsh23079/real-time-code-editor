import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
// import * as Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";


const Editor = ({ socketRef, roomId, selectedLanguage, onCodeChange }) => {
  const editorRef = useRef(null);
  //   useEffect(() => {
  //     async function init() {

  //       editorRef.current = Codemirror.fromTextArea(
  //         document.getElementById("realtimeEditor"),
  //         {
  //           mode:getModeForLanguage(selectedLanguage),
  //           theme: "dracula",
  //           autoCloseTags: true,
  //           autoCloseBrackets: true,
  //           lineNumbers: true,
  //         }

  //       );
  //       editorRef.current.on("change", (instance, changes) => {
  //         const { origin } = changes;
  //         const code = instance.getValue();
  //         onCodeChange(code);
  //         if (origin !== "setValue") {
  //           socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
  //         }
  //       });
  //     }
  //     init();
  //   }, [selectedLanguage]);
  //   useEffect(() => {
  //     if (socketRef.current) {
  //       socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
  //         if (code !== null) {
  //           editorRef.current.setValue(code);
  //         }
  //       });
  //     }
  //     return () => {
  //       socketRef.current.off(ACTIONS.CODE_CHANGE);
  //     };
  //   }, [socketRef.current]);
  //   const getModeForLanguage = (language) => {
  //     switch (language) {
  //       case "javascript":
  //         return "javascript";
  //       case "Python":
  //         return "python";
  //       case "Cpp":
  //         return "text/x-c++src"
  //       case "C":
  //         return "text/x-csrc"
  //       case "Java":
  //         return "text/x-java";
  //       default:
  //         return "javascript"; // Default to JavaScript
  //     }
  //   };
  //   return <textarea id="realtimeEditor"></textarea>;
  // };

  // export default Editor;
  useEffect(() => {
    if (editorRef.current) {
      // Change the CodeMirror mode when the selected language changes
      editorRef.current.setOption("mode", getModeForLanguage(selectedLanguage));
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (!editorRef.current) {
      // Initialize the editor
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: getModeForLanguage(selectedLanguage),
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
        }
      });
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  // Function to map selectedLanguage to CodeMirror mode
  const getModeForLanguage = (language) => {
    switch (language) {
      case "javascript":
        return "javascript";
      case "Python":
        return "python";
      case "Cpp":
        return "text/x-c++src";
      case "C":
        return "text/x-csrc";
      case "Java":
        return "text/x-java";
      default:
        return "javascript"; // Default to JavaScript
    }
  };

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;

