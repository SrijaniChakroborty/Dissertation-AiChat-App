import {
  MinusCircleIcon,
  PlusCircleIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import React, { useState, useEffect, useRef } from "react";
import { BsSend, BsStars } from "react-icons/bs";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ChatForm = ({ props, user, secret, refreshChats }) => {
  const [form, setForm] = useState(false);
  const [button, setButton] = useState("");
  const inputRef = useRef(null);
  const buttonContainerRef = useRef(null);
  const [message, setMessage] = useState(null);
  const handleClick = (isAi) => {
    setButton(isAi);
    setForm(!form);
  };

  const handleChange = (e) =>{
     setMessage(e.target.value);
  }
//   console.log("PROPSS", props);
  const handleSubmit = (isAi) => {
    console.log("input", inputRef.current.value);
    console.log("MESSAGE", message);
    if (!message) {
      toast.error("Enter chat name!");
      return;
    }

    const title = isAi ? `AiChat_${message}` : `${message}`;

    var data = { "title": title };
    console.log(data);

    var config = {
      method: "post",
      //   maxBodyLength: Infinity,
      url: "https://api.chatengine.io/chats/",
      headers: {
        "Project-ID": import.meta.env.VITE_PROJECT_ID,
        "User-Name": user,
        "User-Secret": secret,
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        refreshChats();
        console.log(JSON.stringify(response.data));
        setMessage(null);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleClickOutside = (event) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(event.target) &&
      buttonContainerRef.current &&
      !buttonContainerRef.current.contains(event.target)
    ) {
      setButton("");
      setForm(false)
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="new-chat-container">
        <Toaster/>
      {!button &&(
        <div className="new-chat-form-heading">
          <h1>My Chats</h1>
        </div>
      )}
      <div className="new-chat-input-container">
        {button &&(
          <div className="new-chat-input" ref={inputRef}>
            <input
              type="text"
              row={1}
              className="new-chat-input-field"
              placeholder={button === "normal" ? "New Chat" : "Ai Chat"}
              ref={inputRef}
              onChange={handleChange}
            />
            <div className="create-chat-button">
              <BsSend
                className="send-button"
                onClick={() =>
                  button === "normal" ? handleSubmit(false) : handleSubmit(true)
                }
              />
            </div>
          </div>
        )}
        <div className="new-chat-button-container" ref={buttonContainerRef}>
          <PlusCircleIcon
            className="new-chat-button"
            onClick={() => handleClick("normal")}
          />
          <BsStars
            className="ai-chat-button"
            onClick={() => handleClick("ai")}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatForm;
