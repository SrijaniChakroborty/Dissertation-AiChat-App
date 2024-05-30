import {useState, useEffect} from 'react'
import MessageFormUI from './MessageFormUI'
import { usePostAiTextMutation } from '@/state/api';
import { getChat } from "react-chat-engine-advanced";
import axios from 'axios';

const Ai = ({props, activeChat}) => {
    const [message,setMessage]=useState(null);
    const [attachment,setAttachment]=useState('');
    const [trigger]=usePostAiTextMutation();

    const handleChange = (e) => {
      const value = e.target.value;
      setMessage(
        value.includes("```csv")
          ? value.replace(/```csv\s*([\s\S]*?)\s*```/, "$1")
          : value
      );
    };
  
  useEffect(() => {
    if (activeChat?.title.startsWith("AiChat_")) {

      const headers = {
        "Project-ID": import.meta.env.VITE_PROJECT_ID,
        "User-Name": props.username,
        "User-Secret": '1234'
      };
      const data = {
        "username":"Ai_bot-Srijani"
      };

      // Check if a chat with the same title already exists
      getChat(
        "https://api.chatengine.io",
        headers,
        activeChat.id,
        async existingChat => {
          // console.log(activeChat)
          // console.log(existingChat)
          await axios.post(
           `https://api.chatengine.io/chats/${existingChat.id}/people/`,
           data,
           {headers},
          ).then(response => {
            console.log('User added to chat:', response.data);
          }).catch(error => {
            console.log('Error adding user to chat:', error);
          });
        }
      );
    }
  }, [activeChat?.id, props.username]);

    const handleSubmit=async(msg)=>{
        const date=new Date().toISOString().replace("T"," ").replace("Z",`${Math.floor(Math.random()*1000)}+00:00`)
        //const date=getCurrentISTTimestamp();
        setMessage(msg);
        const at=attachment?[{blob:attachment,file:attachment.name}]:[];
        const form={
            attachments:at,
            created:date,
            sender_username:props.username,
            text:msg,
            activeChatId:activeChat.id,
        }
        props.onSubmit(form);
        trigger(form)
        setMessage("");
        setAttachment("");
      }
  return (
    <MessageFormUI
    setAttachment={setAttachment}
    message={message}
    handleChange={handleChange}
    handleSubmit={handleSubmit}
    />
  )
}

export default Ai