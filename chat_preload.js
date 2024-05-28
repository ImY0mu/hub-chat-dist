const { ipcRenderer } = require("electron");

global.sendToWindow = (type, args = undefined) => {
    if (args == undefined) return ipcRenderer.sendToHost(type)
    ipcRenderer.sendToHost(type, args)
}

var isReady = true;

document.addEventListener('DOMContentLoaded', (event) => {
    if (isReady == false) return console.log("Page was already loaded once before.");
    isReady = false;
    console.log("Page loaded.");

    getRequiredScripts(window.location.href.toString())
        .then(data = (data) => {
            var script = document.createElement('script');
            script.className = "SimScript";
            script.innerHTML = data;
            script.onload = function () {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(script);
        })
        .catch(error => console.log(error));

    window.addEventListener("message", function (event) {
        sendToWindow(event.data.type, event.data.data);
    });
})


window.addEventListener('load', function () {
    getRequiredScriptsAfter(window.location.href.toString())
        .then(data = (data) => {
            var script = document.createElement('script');
            script.className = "SimEndScript";
            script.innerHTML = data;
            script.onload = function () {
                this.remove();
            };
            (document.body).insertAdjacentElement('beforeend', script);
        })
        .catch(error => console.log(error));
})




const getRequiredScripts = async (url) => {
    var script = "";
    if (url.includes('https://simple-mmo.com/chat/public?')) {
        script += `

    /**
     * Send the data to chat client.
     */
    function sendData(type, data){
      if(data == undefined || data == null) return console.warn('No data');
      var item = {
        type: type,
        data: data
      }
      window.postMessage(item);
    }

    /**
     * Setup listeners for chatting rewards/drops.
     */
    function setupListeners() {
        var item = document.querySelectorAll('[x-show="rewards.item"]')[1];
        var diamonds = document.querySelectorAll('[x-show="rewards.diamonds"]')[1];
        var exp = document.querySelectorAll('[x-show="rewards.exp"]')[1];

        
        var exp = document.querySelectorAll('[x-show="rewards.exp"]')[1];
    
        const observer = [
            new MutationObserver((mutations, observer) => {
                var value = mutations[0].target.innerHTML;
    
                if (value != 0 && value != null && value != "" && value != "0")
                    sendData("chat_drop", { type: "item", value: value });
            }),
            new MutationObserver((mutations, observer) => {
                var value = mutations[0].target.innerHTML;
    
                if (value != 0 && value != null && value != "" && value != "0")
                    sendData("chat_drop", { type: "diamonds", value: value });
            }),
            new MutationObserver((mutations, observer) => {
                var value = mutations[0].target.innerHTML;
                
                if (value != 0 && value != null && value != "" && value != "0")
                    sendData("chat_drop", { type: "exp", value: value });
            }),
        ];
    
        observer[0].observe(item, {
            childList: true,
        });
    
        observer[1].observe(diamonds, {
            childList: true,
        });
    
        observer[2].observe(exp, {
            childList: true,
        });
    }

    /**
     * No idea what this does so not used.
     */
    function autoRefresh(){
        setTimeout(() => {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }, 1000 * 60 * 5);
    }

    /**
     * Disable the automatic chat disconnect.
     */
    function disableDisconnect(){
        setTimeout(() => {
            window.Echo.connector.pusher.connection.disconnect = () => {
                console.log("Disconnect is disabled.");
            }
        }, 10_000);
        
    }

   
    
    /**
     * Initialise the chat messages listener.
     */
    function initialiseChat() {
        window.last_refreshed = new Date().toUTCString(); 
        
        window.Alpine.effect(() => {
            getChatMessages();
            getBlockedPlayers();
            getItemFromPopup();
        })
    }


    
    let last_chat_id = null;

    /**
     * Get the chat messages.
    */ 
    function getChatMessages(){
        let chats = Alpine.store('chats');

        if(chats == null)
            return;

        if(chats[0].id === last_chat_id)
            return;
            
        sendData('chatUpdate', JSON.stringify(chats));

        last_chat_id = chats[0].id;
    }

    /**
    * Get the blocked players.
    */
    function getBlockedPlayers(){
        try {
            sendData('blocked_players', JSON.stringify(document.getElementById('smmo-chat')._x_dataStack[0].blocked_players));
        } catch (error) {
            console.log('Could not send the blocked players list as it does not exist yet.');
        }
    }

    /**
     * Overwrite the function for retrieving items to show them in chat client.
     */
    function getItemFromPopup(){
        let element = document.getElementById('item-popup');

        if(!element)
            return;

        let data_stack = element._x_dataStack;

        if(!data_stack)
            return;
        
        let item = data_stack[0].item;

        if(item.id === null)
            return;
        
        var item_data = {
            id: item.id,
            name: btoa(item.name),
            stats: item.stats,
            image: item.image,
            type: item.type,
            description: item.description,
            equipable: item.equipable,
            currently_equipped: item.currently_equipped,
            value: item.value,
            rarity: item.rarity,
            level: item.level,
            circulation: item.circulation,
            yours: item.yours,
            market: item.market,
            current_stats: item.current_stats,
            item_collection: item.item_collection,
            collectable_collection: item.collectable_collection,
            sprite_collection: item.sprite_collection,
            background_collection: item.background_collection,
            avatar_collection: item.avatar_collection,
            custom_item: item.custom_item,
            additional_data: item.additional_data,
        };

        resetData();

        sendData('showItem', JSON.stringify(item_data));
    }

    
    setupListeners();
    //autoRefresh();
    initialiseChat();
    disableDisconnect();
    

  `;
    }
    return script;
}




const getRequiredScriptsAfter = async (url) => {
    var script = "";
    if (url.includes('https://simple-mmo.com/chat/public?')) {
        script += `
    //eval(changeChannel.toString().replace("updateChatWindow(); fixChat();", "sendData('chatUpdate', JSON.stringify(Alpine.store('chats')));"));
  `;
    }
    return script;
}
