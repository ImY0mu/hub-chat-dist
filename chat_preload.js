const { ipcRenderer } = require("electron");
//const { post } = require("got");

global.sendToWindow = (type, args = undefined) => {
  if(args == undefined) return ipcRenderer.sendToHost(type)
  ipcRenderer.sendToHost(type, args)
}
var isReady = true;

document.addEventListener('DOMContentLoaded', (event) => {
  if(isReady == false) return console.log("Page was already loaded once before.");
  isReady = false;
  console.log("Page loaded.");

  getRequiredScripts(window.location.href.toString())
  .then(data = (data) => {
    var script = document.createElement('script'); 
    script.className = "SimScript";
    script.innerHTML = data;
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  })
  .catch(error => console.log(error));

  window.addEventListener("message", function(event) {
    console.log(event);
    sendToWindow(event.data.type, event.data.data);
  });
  //END OF LOAD
})


window.addEventListener('load', function () {
  getRequiredScriptsAfter(window.location.href.toString())
  .then(data = (data) => {
    var script = document.createElement('script'); 
    script.className = "SimEndScript";
    script.innerHTML = data;
    script.onload = function() {
      this.remove();
    };
    (document.body).insertAdjacentElement('beforeend', script);
  })
  .catch(error => console.log(error));
})




const getRequiredScripts = async (url) => {
  var script = "";
  if(url.includes('https://simple-mmo.com/chat/public?')){
    script += `
    function sendData(type, data){
      var item = {
        type: type,
        data: data
      }
      window.postMessage(item);
    }
    eval(updateChatWindow.toString().replace("var timer = null;", "var timer = null; sendData('chatChannel', active_channel);"));
    eval(updateChatWindow.toString().replace("//Correct chat length if too long", "sendData('chatUpdate', JSON.stringify(Alpine.store('chats')));"));

    eval(retrieveFromServer.toString().replace("Alpine.store('chats', data);", "Alpine.store('chats', data); sendData('chatUpdate', JSON.stringify(data));"));

    eval(disconnectFromChat.toString().replace("window", "//window"));


  `;
  }
  return script;
}

const getRequiredScriptsAfter = async (url) => {
  var script = "";
  if(url.includes('https://simple-mmo.com/chat/public?')){
    script += `
    //eval(changeChannel.toString().replace("updateChatWindow(); fixChat();", "sendData('chatUpdate', JSON.stringify(Alpine.store('chats')));"));
  `;
  }
  return script;
}



/* Additional functions */

