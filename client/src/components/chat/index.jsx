import {
  useMultiChatLogic,
  MultiChatSocket,
  MultiChatWindow,

} from "react-chat-engine-advanced";
import CustomeHeader from "@/components/customHeader";
import StandardMessageForm from "@/components/customMessageForms/StandardMessageForm";
import Ai from "@/components/customMessageForms/Ai"
import MessageBubble from "./MessageBubble";
import { ArrowRightStartOnRectangleIcon, TicketIcon } from "@heroicons/react/24/solid";

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
    <div style={{ flexBasis: "100%", alignItems:"center", verticalAlign:"center"}}>
       <button
        onClick={handleLogout}
        className="logout"
      >
        <ArrowRightStartOnRectangleIcon class="logout-icon"/>
        <p className="logout-text">Logout</p>
      </button>
      <MultiChatSocket {...chatProps} />
      <MultiChatWindow
        {...chatProps}
        style={{ height: "100vh" }}
        renderChatHeader={(chat) => <CustomeHeader chat={chat} />}
        renderMessageForm={(props) => {
          if(chatProps.chat?.title.startsWith("AiChat_")){
            return <Ai props={props} activeChat={chatProps.chat}/>
          }
          return (
            <StandardMessageForm props={props} activeChat={chatProps.chat} />
          );
        }}
        renderMessage={(props)=> {return <MessageBubble props={props} activeChat={props.chat}/>}}
      />
    </div>
  );
};

export default Chat;
