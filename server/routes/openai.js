import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import {openain} from "../index.js"

dotenv.config();
const router=express.Router();

router.post("/text",async(req,res)=>{
    try{
        const {text,activeChatId}= req.body;
        let modifiedPrompt =text;

        if(text && text.includes('\`\`\`csv ')){
          modifiedPrompt = `Analyse this csv and give me unique insights about it. 
          Give the response in proper markdown code that can be formatted by prettier:
          \n ${text.replace(/```csv\s*([\s\S]*?)\s*```/, "$1")}`
        }
        const response = await openain.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{role: "system", content: "Hello.How are you?"},
            { role: "user", content: modifiedPrompt }],
            temperature: 0.5
          });
          console.log(response.choices[0].message.content);

          await axios.post(
            `https://api.chatengine.io/chats/${activeChatId}/messages/`,
            { text: response.choices[0].message.content },
            {
              headers: {
                "Project-ID": process.env.PROJECT_ID,
                "User-Name": process.env.BOT_USER_NAME,
                "User-Secret": process.env.BOT_USER_SECRET,
              },
            }
          );

        res.status(200).json({text: response.choices[0].message.content})
    }catch(error){
        console.error("error",error);
        res.status(500).json({error:error.message})
    }
})


export default router