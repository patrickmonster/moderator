'use strict';
const {channel, token } = window.query;
const {client_id, login, user_id, expires_in} = getApi("https://id.twitch.tv/oauth2/validate", {
    "authorization":`OAuth ${token}`
});

const option = {
    options: {debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: login,
        password: `OAuth ${token}`
    },
    // channels: [window.query.channel]
};
console.log(option);


const client = new tmi.Client(option);
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
    if (self) return;
    console.log(message);
    // if (message.toLowerCase() === '!hello') {
    //     client.say(channel, `@${tags.username}, heya!`);
    // }
});


/**
 * 
 * @param {*} url 
 * @param {*} header 
 * @returns 
 */
function getApi(url, header){
    const xmlhttp = new XMLHttpRequest()
    let data = "";
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) 
            data = this.responseText
    };
    xmlhttp.open("GET", url, false);
    Object.keys(header).forEach(o=>xmlhttp.setRequestHeader(o, header[o]));
    // xmlhttp.setRequestHeader('Client-ID', window.clientId);
    // xmlhttp.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    // if (token) 
    //     xmlhttp.setRequestHeader("Authorization", `OAuth ${oauth}`);
    xmlhttp.send();
    return JSON.parse(data);
}