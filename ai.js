import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";
import {plainAnswer} from './ai-text.js?v=1';

const config={apiKey:"AIzaSyDzJu7zyLTZWwffbS5wcxAGym5orePvNKg",authDomain:"simplegames-23c2c.firebaseapp.com",projectId:"simplegames-23c2c",storageBucket:"simplegames-23c2c.firebasestorage.app",messagingSenderId:"993873419513",appId:"1:993873419513:web:14e22dfff6d7f0c7051628",measurementId:"G-NC81W7MYG0"};
const app=getApps().length?getApp():initializeApp(config);
initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider("6Lfg4-AtAAAAAH8SOPbduPU0Rio5eUbDhoBq2PQn"),isTokenAutoRefreshEnabled:true});
const panel=document.querySelector("#ai-panel"),messages=document.querySelector("#ai-messages"),form=document.querySelector("#ai-form"),field=form?.elements.message,send=form?.querySelector("button");
let chat;

function addMessage(text,kind){const message=document.createElement("p");message.className=`ai-message ${kind}`;message.textContent=text;messages.append(message);messages.scrollTop=messages.scrollHeight;return message}
function setupMessage(error){
  const detail=String(error?.message||error),code=String(error?.code||"unknown");
  if(code==="ai/timeout")return "AI took too long to respond. Please try again. [ai/timeout]";
  if(/app.?check|recaptcha|attestation/i.test(detail+code))return "AI security verification failed. Try the live website; local previews need an authorized App Check debug setup. ["+code+"]";
  if(/429|quota|resource.exhausted/i.test(detail+code))return "AI has reached its usage limit. Try again later. ["+code+"]";
  if(/403|permission|API.*blocked|API.*enabled/i.test(detail+code))return "AI access is blocked by the project setup. Check Firebase AI Logic, API restrictions, and App Check. ["+code+"]";
  if(/404|not.found|model/i.test(detail+code))return "The configured AI model could not be reached. ["+code+"]";
  return "AI couldn't respond. Please try again. ["+code+"]";
}
async function ask(question){
  if(!send||send.disabled)return;
  addMessage(question,"user");const waiting=addMessage("","assistant");
  waiting.classList.add("ai-thinking");waiting.setAttribute("aria-label","AI is responding");waiting.innerHTML="<span></span><span></span><span></span>";
  send.disabled=true;field.disabled=true;let timer;
  try{
    if(!chat){const ai=getAI(app,{backend:new GoogleAIBackend()});const model=getGenerativeModel(ai,{model:"gemini-3.8-flash",systemInstruction:"You are Simple AI, a friendly general-purpose assistant inside Simple Games. Answer clearly and safely about any subject. Use plain text, no Markdown asterisks or heading syntax. Keep normal answers short unless asked for detail."});chat=model.startChat({generationConfig:{maxOutputTokens:1536}})}
    let expired=false,answer='';
    const request=(async()=>{const result=await chat.sendMessageStream(question);for await(const chunk of result.stream){if(expired)return;answer+=chunk.text();waiting.classList.remove('ai-thinking');waiting.textContent=plainAnswer(answer);messages.scrollTop=messages.scrollHeight}if(!answer)waiting.textContent="I couldn't generate an answer."})();
    await Promise.race([request,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Object.assign(new Error("AI response timed out"),{code:"ai/timeout"}))},45000)})]);
  }catch(error){chat=null;console.error("Simple AI:",error);waiting.textContent=setupMessage(error)}
  finally{clearTimeout(timer);waiting.classList.remove("ai-thinking");waiting.removeAttribute("aria-label");send.disabled=false;field.disabled=false;field.focus();messages.scrollTop=messages.scrollHeight}
}

document.querySelector("#ai-close")?.addEventListener("click",()=>panel.hidden=true);
panel?.addEventListener("click",event=>{if(event.target===panel)panel.hidden=true});
document.querySelectorAll(".ai-suggestions button").forEach(button=>button.addEventListener("click",()=>ask(button.textContent)));
form?.addEventListener("submit",event=>{event.preventDefault();const question=field.value.trim();if(!question)return;field.value="";ask(question)});
