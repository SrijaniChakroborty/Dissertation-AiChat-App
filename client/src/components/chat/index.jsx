import {
  useMultiChatLogic,
  MultiChatSocket,
  MultiChatWindow,
 
} from "react-chat-engine-advanced";
import CustomHeader from "@/components/customHeader";
import StandardMessageForm from "@/components/customMessageForms/StandardMessageForm";
import Ai from "@/components/customMessageForms/Ai"
import MessageBubble from "./MessageBubble";
import { ArrowRightStartOnRectangleIcon, TicketIcon } from "@heroicons/react/24/solid";
import ChatForm from "./ChatForm";
const Chat = ({user, secret, setUser, setSecret}) => {
  const chatProps = useMultiChatLogic(
    import.meta.env.VITE_PROJECT_ID,
    user,
    secret
  );
  const handleLogout = () => {
    setUser(null);
    setSecret(null);
  };

  const refreshChats = async () => {
    try {
      const response = await fetch("https://api.chatengine.io/chats/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Project-ID": import.meta.env.VITE_PROJECT_ID,
          "User-Name": user,
          "User-Secret": secret,
        },
      });
      const chats = await response.json();
      chatProps.setChats(chats);
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  };

  return (
    
    <div
      style={{
        flexBasis: "100%",
        alignItems: "center",
        verticalAlign: "center",
      }}
    >
      <button onClick={handleLogout} className="logout">
        <ArrowRightStartOnRectangleIcon class="logout-icon" />
        <p className="logout-text">Logout</p>
      </button>
      <MultiChatSocket {...chatProps} />
      <MultiChatWindow
       
        {...chatProps}
  
        renderChatHeader={(chat) => <CustomHeader chat={chat} />}
        renderMessageForm={(props) => {
          if (chatProps && chatProps.chat && chatProps.chat.title.startsWith("AiChat_")) {
            return <Ai props={props} activeChat={chatProps.chat} />;
          }
          return (
            <StandardMessageForm props={props} activeChat={chatProps.chat} />
          );
        }}
        renderMessage={(props) => {
          // console.log(props)
          // console.log(chatProps);
          return <MessageBubble props={props} />;
        }}        
        renderChatForm={(props)=>{return <ChatForm props={props} user={user} secret={secret} refreshChats={refreshChats}/>}}
      />
      
    </div>
  );
};

export default Chat;
