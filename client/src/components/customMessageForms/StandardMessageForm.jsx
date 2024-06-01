
//import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';
// eslint-disable-next-line no-unused-vars
import React,{ useState } from 'react'
//import Dropzone from 'react-dropzone';
import MessageFormUI from './MessageFormUI';

const StandardMessageForm = ({props,activeChat}) => {

    const [message,setMessage]=useState(null);
    // const [msg, setMsg] = useState(null);
    const [attachment,setAttachment]=useState('');

    const handleChange = (e) => {
      const value = e.target.value;
      setMessage(
        value.includes("```csv")
          ? value.replace(/```csv\s*([\s\S]*?)\s*```/, "$1")
          : (value.includes("```pdf") ? '' : value)
      );
      // console.log("messssage", message)
    };
    // console.log('MESSAGE ', message)
    const handleSubmit=async(msg)=>{
      const date=new Date().toISOString().replace("T"," ").replace("Z",`${Math.floor(Math.random()*1000)}+00:00`)
        // const adjustedDate = new Date(date.getTime() );
        setMessage(msg);
        console.log('attachment',attachment)
        const at=attachment?[{blob:attachment,file:attachment.name}]:[];
        const form={
            attachments:at,
            created:date,
            sender_username:props.username,
            text:msg,
            activeChatId:activeChat.id,
        }

        props.onSubmit(form);
        setMessage("");
        setAttachment("");
    }

  return (
    <MessageFormUI
      setAttachment={setAttachment}
      message={message}
      handleChange={handleChange}
      handleSubmit={handleSubmit} />
   
      
  )
}

export default StandardMessageForm;