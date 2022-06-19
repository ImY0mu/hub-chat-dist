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
    //console.log(event);
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
      if(data == undefined || data == null) return console.warn('No data');
      var item = {
        type: type,
        data: data
      }
      window.postMessage(item);
    }

    function setupListeners(){
      console.log('SET UP');
      var item = document.querySelectorAll('[x-show="rewards.item"]')[1];
      var diamonds = document.querySelectorAll('[x-show="rewards.diamonds"]')[1];
      var exp = document.querySelectorAll('[x-show="rewards.exp"]')[1];


      const observer = [
        new MutationObserver((mutations, observer) => {
          var value = mutations[0].target.innerHTML;
          if(value != 0 && value != null && value != '' && value != '0'){
            console.log('You have earned item: ' + value);
            sendData('chat_drop', { type: 'item', value: value });
          }
        }),
        new MutationObserver((mutations, observer) => {
          var value = mutations[0].target.innerHTML;
          if(value != 0 && value != null && value != '' && value != '0'){
            console.log('You have earned diamonds: ' + value);
            sendData('chat_drop', { type: 'diamonds', value: value });
          }
        }),
        new MutationObserver((mutations, observer) => {
          var value = mutations[0].target.innerHTML;
          if(value != 0 && value != null && value != '' && value != '0'){
            console.log('You have earned exp: ' + value);
            sendData('chat_drop', { type: 'exp', value: value });
          }
        })
      ]

      observer[0].observe(item, {
        childList: true
      });

      observer[1].observe(diamonds, {
        childList: true
      });

      observer[2].observe(exp, {
        childList: true
      });
    }

    setupListeners();

    sendData('blocked_players', JSON.stringify(document.getElementById('smmo-chat')._x_dataStack[0].blocked_players));
    
    setTimeout(function(){
      sendData('chatChannel', active_channel);
    }, 500);

    eval(listenForMessages.toString().replace("//Correct chat length if too long", "sendData('chatUpdate', JSON.stringify(Alpine.store('chats')));"));

    eval(updateChatWindow.toString().replace("Alpine.store('loading_icon', true);", "Alpine.store('loading_icon', true); console.log(active_channel); sendData('chatUpdate', JSON.stringify(Alpine.store('chats')));"));
    
    
    
    eval(retrieveFromServer.toString().replace("Alpine.store('chats', data);", "Alpine.store('chats', data); sendData('chatUpdate', JSON.stringify(data));"));

    eval(disconnectFromChat.toString().replace("window", "//window"));

    eval(retrieveItem.toString().replace(".then(function(data){", ".then(function(data){ sendData('showItem', JSON.stringify(data));"));


    
    setTimeout(() => {
      console.log('Reloading');
      window.location.reload();
    }, 60000 * 5);
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

