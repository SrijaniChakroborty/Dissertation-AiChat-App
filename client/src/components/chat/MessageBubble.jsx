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
import csv from "react-syntax-highlighter/dist/cjs/languages/prism/csv";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism"; // choose your preferred theme
import prettierJava from "prettier-plugin-java";
import MarkdownCode from "./MarkdownCode";
import { LoadingOutlined } from "@ant-design/icons";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", html);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("java", java);

const MessageBubble = ({ props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filetype, setFileType] = useState("");
  const codeRef = useRef(null);
  const messageText = props.message.text;
  console.log("message ", props.message);

  const codeBlockMatch =
    props.message.text === " "
      ? null
      : messageText?.match(/```(\w+)\s*([\s\S]*?)\s*```/);
  console.log("CODE", codeBlockMatch);

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

  const attachment = props.message.attachments[0];
  console.log(attachment);

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

  useEffect(() => {
    if (props.message.attachments && props.message.attachments[0]?.file && props.message.attachments.length > 0 && props.message.attachments[0].file.includes('https://')) {
      setIsLoading(false);
    }
  }, [props.message.attachments]);

  const handleCopyCode = () => {
    // Copy code to clipboard
    setIsCopied(true);
    const codeToCopy = codeRef.current.textContent;
    navigator.clipboard
      .writeText(codeToCopy)
      .then(() => console.log("Code copied to clipboard"))
      .catch((err) => console.error("Error copying code to clipboard:", err));

    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  };

  const renderTimestamp = () => (
    <span className="timestamp">
      {new Date(props.message.created).toLocaleTimeString()}
    </span>
  );

  const renderAvatar = () => {
    return (
      <div className="avatar">{getInitials(props.message.sender.username)}</div>
    );
  };

  const extractFileNameFromURL = (url) => {
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const fileName = lastPart.split("?")[0];
    return fileName;
  };

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0);
    return nameParts[0].charAt(0) + nameParts[1].charAt(0);
  };

  return props.isMyMessage ? (
    !codeBlockMatch ? (
      <div className="my-message-container">
        <div className="my-message">
          {props.message.attachments.length != 0 ? (
            <div className="my-message-image-container">
              {isLoading && (
                <LoadingOutlined
                  size={60}
                  color={"#123abc"}
                  loading={isLoading}
                  style={{ padding: "10px", width: "90%" }}
                />
              )}

              <img
                className="my-message-image"
                src={props.message.attachments[0].file}
                alt="attachment"
                onLoad={() => setIsLoading(false)}
                style={isLoading ? { display: "none" } : {}}
                onClick={() => {
                  window.open(props.message.attachments[0].file, "_blank");
                }}
              />
              <p className="my-text-content">
                {props.message.text === undefined ? "" : props.message.text}
              </p>
            </div>
          ) : (
            <p className="my-text-content">{props.message.text}</p>
          )}
        </div>
        {renderTimestamp()}
      </div> // this condition is for your message (when there's no code)
    ) : (
      <div className="my-message-container">
        <div className="my-message">
          {codeBlockMatch[1] === "pdf" ? ( //pdf file bubble
            !isLoading ? (
              <div
                className="pdf-message my-pdf-message"
                onClick={() => {
                  window.open(props.message.attachments[0].file, "_blank");
                }}
              >
                {extractFileNameFromURL(props.message.attachments[0].file)}
              </div>
            ) : (
              <LoadingOutlined
                size={60}
                color={"#123abc"}
                loading={isLoading}
                style={{ padding: "10px", width: "90%" }}
              />
            )
          ) : (
            <div className="code-message">
              <div className="code-header">
                <span className="language-header">{codeBlockMatch[1]}</span>
                <button className="copy-button" onClick={handleCopyCode}>
                  {!isCopied ? "Copy" : "Copied!"}
                </button>
              </div>
              <SyntaxHighlighter
                language="csv"
                style={darcula}
                wrapLines="true"
                wrapLongLines="true"
                children={codeBlockMatch[2]}
              />
            </div>
          )}
        </div>
        {renderTimestamp()}
      </div> //this condition is for your message when there's csv and pdf data you're sending from an excel/csv or pdf file
    )
  ) : !codeBlockMatch || codeBlockMatch == null ? (
    <div className="other-message-container">
      <div className="other-message">
        {renderAvatar()}
        {props.message.attachments.length != 0 ? (
          <img
            className="my-message-image"
            src={props.message.attachments[0].file}
          />
        ) : (
          <p className="other-text-content">{props.message.text}</p>
        )}
      </div>
      {renderTimestamp()}
    </div> //this condition is for other's message when there's no code
  ) : codeBlockMatch[1] === "markdown" ? (
    <div className="other-message-container">
      <div className="other-message">
        {renderAvatar()}
        <MarkdownCode message={codeBlockMatch} />
      </div>
      {renderTimestamp()}
    </div> // this condition is for when other's send markdown content
  ) : (
    <div className="code-message-container">
      <div className="code-avatar-container">
        {renderAvatar()}
        <div className="other-message">
          {codeBlockMatch[1] === "pdf" ? ( //pdf file bubble
            !isLoading ? (
              <div
                className="other-pdf-message pdf-message"
                onClick={() => {
                  window.open(props.message.attachments[0].file, "_blank");
                }}

              >
                {extractFileNameFromURL(props.message.attachments[0].file)}
              </div>
            ) : (
              <LoadingOutlined
                size={60}
                color={"#123abc"}
                loading={isLoading}
                style={{ padding: "10px", width: "90%" }}
              />
            )
          ) : (
            <div className="code-message">
              <div className="code-header">
                <span className="language-header">{codeBlockMatch[1]}</span>
                <button className="copy-button" onClick={handleCopyCode}>
                  {!isCopied ? "Copy" : "Copied!"}
                </button>
              </div>
              {codeBlockMatch[1] === "python" ||
              codeBlockMatch[1] === "c" ||
              codeBlockMatch[1] === "cpp" ||
              codeBlockMatch[1] === "csv" ? (
                <SyntaxHighlighter
                  language={codeBlockMatch[1]}
                  wrapLines={true}
                  wrapLongLines={true}
                  style={darcula}
                  className="python-format"
                >
                  {codeBlockMatch[2]}
                </SyntaxHighlighter>
              ) : (
                <pre>
                  <code
                    ref={codeRef}
                    className={
                      codeBlockMatch[2] ? `language-${codeBlockMatch[1]}` : ""
                    }
                  >
                    {codeBlockMatch[1] === "html" ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: codeBlockMatch[2] }}
                      />
                    ) : (
                      codeBlockMatch[2]
                    )}
                  </code>
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
      {renderTimestamp()}
    </div> //finally when other's message has code in it
  );
};

export default MessageBubble;
