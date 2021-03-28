'use strict';
const {channel, token } = window.query;

const channel_data = getApi("oauth2/validate", window.query.token ,"OAuth ", "https://id.twitch.tv/");

console.log("사용자 정보", channel_data);

const option = {
    options: {debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: 'bot-name',
        password: `OAuth ${token}`
    },
    channels: [window.query.channel]
};


// const client = new tmi.Client(option);
// client
//     .connect()
//     .catch(console.error);
// client.on('message', (channel, tags, message, self) => {
//     if (self) 
//         return;
//     if (message.toLowerCase() === '!hello') {
//         client.say(channel, `@${tags.username}, heya!`);
//     }
// });



/**
 * api를 통하여 필요 정보를 가지고 옴
 * @param {*} url 
 * @param {*} oauth 
 * @param {*} isOauth 
 * @param {*} base_url 
 * @returns 
 */
function getApi(url, oauth, isOauth, base_url = "https://api.twitch.tv/") { //  OAuth
    const xmlhttp = new XMLHttpRequest()
    let channel = "";
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) 
            channel = this.responseText
    };
    xmlhttp.open("GET", base_url + url, false);
    xmlhttp.setRequestHeader('Client-ID', window.oauth_client_id);
    xmlhttp.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    if (isOauth) 
        xmlhttp.setRequestHeader("Authorization", `${isOauth} ${oauth}`);
    xmlhttp.send();
    return channel;
}