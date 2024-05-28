import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import markdown from "highlight.js/lib/languages/markdown";
import java from "highlight.js/lib/languages/java";
import * as prettier from "prettier/standalone";
import * as parserHtml from "prettier/parser-html";
import * as parserCss from "prettier/parser-postcss";
import * as parserMarkdown from "prettier/parser-markdown";
import "highlight.js/styles/default.css";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import { useRef, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // using Prism for syntax highlighting
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism"; // choose your preferred theme
import prettierJava from "prettier-plugin-java";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", html);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("java", java);

const MessageBubble = ({ props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const codeRef = useRef(null);
  const messageText = props.message.text;
  //   console.log("message ",messageText)
  const codeBlockMatch = messageText.match(/```(\w+)\s*([\s\S]*?)\s*```/);
  //   console.log(codeBlockMatch);
  const formatCode = async (code, language) => {
    try {
      let formattedCode;
      switch (language) {
        case "javascript":
          formattedCode = prettier.format(code, {
            parser: "babel",
            plugins: [babelPlugin, estreePlugin],
            semi: true,
            useTabs: true,
          });
          break;
        case "css":
          formattedCode = prettier.format(code, {
            parser: "css",
            plugins: [parserCss],
          });
          break;
        case "html":
          formattedCode = prettier.format(code, {
            parser: "html",
            plugins: [parserHtml],
          });
          break;
        case "markdown":
          formattedCode = prettier.format(code, {
            parser: "markdown",
            plugins: [parserMarkdown],
          });
          break;
        case "java":
          formattedCode = prettier.format(code, {
            parser: "java",
            tabWidth: 2,
            plugins: [prettierJava],
            proseWrap: "preserve",
          });
          break;
        default:
          formattedCode = code; // If the language is not supported by Prettier
      }
      return formattedCode;
    } catch (e) {
      console.error("Error formatting code:", e);
      return code;
    }
  };

  useEffect(() => {
    async function formattedCode() {
      if (codeRef.current && codeBlockMatch) {
        const language = codeBlockMatch[1];
        const code = codeBlockMatch[2];

        const formattedCode = await formatCode(code, language);
        codeRef.current.innerHTML =
          language === "html" ? formattedCode : hljs.highlightAuto(code).value;
        codeRef.current.textContent = formattedCode;
        hljs.highlightElement(codeRef.current);
      }
    }
    formattedCode();
  }, [messageText]);


  const handleCopyCode = () => {
    // Copy code to clipboard
    setIsCopied(true);
    const codeToCopy = codeRef.current.textContent;
    navigator.clipboard
      .writeText(codeToCopy)
      .then(() => console.log("Code copied to clipboard"))
      .catch((err) => console.error("Error copying code to clipboard:", err));

    setTimeout(()=>{setIsCopied(false)}, 4000);
  };

  return props.isMyMessage ? (
    <div className="my-message">
      <p className="my-text-content">{props.message.text}</p>
    </div>
  ) : !codeBlockMatch || codeBlockMatch == null ? (
    <div className="other-message">
      <p className="other-text-content">{props.message.text}</p>
    </div>
  ) : (
    <div className="code-message">
      <div className="code-header">
        <span className="language-header">{codeBlockMatch[1]}</span>
        <button className="copy-button" onClick={handleCopyCode}>
          {!isCopied ? "Copy" : "Copied!"}
        </button>
      </div>
      {codeBlockMatch[1] === "python" ? (
        <SyntaxHighlighter
          language="python"
          wrapLines="true"
          wrapLongLines="true"
          style={darcula}
          className="python-format"
        >
          {codeBlockMatch[2]}
        </SyntaxHighlighter>
      ) : (
        <pre>
          <code
            ref={codeRef}
            className={codeBlockMatch[2] ? `language-${codeBlockMatch[1]}` : ""}
          >
            {codeBlockMatch[1] === "html" ? (
              <span dangerouslySetInnerHTML={{ __html: codeBlockMatch[2] }} />
            ) : (
              codeBlockMatch[2]
            )}
          </code>
        </pre>
      )}
    </div>
  );
};

export default MessageBubble;
