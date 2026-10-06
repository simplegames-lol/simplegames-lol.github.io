import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";

const config={apiKey:"AIzaSyDzJu7zyLTZWwffbS5wcxAGym5orePvNKg",authDomain:"simplegames-23c2c.firebaseapp.com",projectId:"simplegames-23c2c",storageBucket:"simplegames-23c2c.firebasestorage.app",messagingSenderId:"993873419513",appId:"1:993873419513:web:14e22dfff6d7f0c7051628",measurementId:"G-NC81W7MYG0"};
const app=getApps().length?getApp():initializeApp(config);
initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider("6Lfg4-AtAAAAAH8SOPbduPU0Rio5eUbDhoBq2PQn"),isTokenAutoRefreshEnabled:true});
const panel=document.querySelector("#ai-panel"),messages=document.querySelector("#ai-messages"),form=document.querySelector("#ai-form"),field=form?.elements.message,send=form?.querySelector("button");
let chat;

function addMessage(text,kind){const message=document.createElement("p");message.className=`ai-message ${kind}`;message.textContent=text;messages.append(message);messages.scrollTop=messages.scrollHeight;return message}
function setupMessage(error){const detail=String(error?.message||error);if(detail.includes("API")||detail.includes("403")||detail.includes("permission"))return"Simple AI needs Firebase AI Logic enabled first. Open Firebase → AI Services → AI Logic → Get started, choose Gemini Developer API, and finish App Check setup.";return"Simple AI could not answer right now. Please try again in a moment."}
async function ask(question){if(send.disabled)return;addMessage(question,"user");const waiting=addMessage("","assistant");waiting.classList.add("ai-thinking");waiting.setAttribute("aria-label","AI is responding");waiting.innerHTML="<span></span><span></span><span></span>";send.disabled=true;field.disabled=true;try{if(!chat){const ai=getAI(app,{backend:new GoogleAIBackend()});const model=getGenerativeModel(ai,{model:"gemini-3.8-flash",systemInstruction:"You are Simple AI, a friendly general-purpose assistant inside the Simple Games website. Answer questions clearly and safely. You may answer questions about any subject, not only games. Keep normal answers concise unless the user asks for detail."});chat=model.startChat()}const result=await chat.sendMessage(question);waiting.textContent=result.response.text()||"I couldn't generate an answer."}catch(error){console.error("Simple AI:",error);waiting.textContent=setupMessage(error)}finally{waiting.classList.remove("ai-thinking");waiting.removeAttribute("aria-label");send.disabled=false;field.disabled=false;field.focus();messages.scrollTop=messages.scrollHeight}}

document.querySelector("#ai-close")?.addEventListener("click",()=>panel.hidden=true);
panel?.addEventListener("click",event=>{if(event.target===panel)panel.hidden=true});
document.querySelectorAll(".ai-suggestions button").forEach(button=>button.addEventListener("click",()=>ask(button.textContent)));
form?.addEventListener("submit",event=>{event.preventDefault();const question=field.value.trim();if(!question)return;field.value="";ask(question)});
