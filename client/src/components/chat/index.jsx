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
import axios from 'axios';

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
      />
    </div>
  );
};

export default Chat;
