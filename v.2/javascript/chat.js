'use strict';
const {channel, token } = window.query;

//oauth:1cz8g47puzj8fmj8vv1hn689kcv7al
if(token.length == 36 && token.startsWith("oauth:")){
   const code = jwt_encode({channel,token:token.substring(6)});
   window.location.href=`${window.location.origin}${window.location.pathname}?code=${code}`;
}else 
if(token.length != 30){
    alert("토큰이 잘못됨!");
    window.location.href=`${window.location.origin}${window.location.pathname}?channel=${channel}`;
}
// 토큰정보 가져옴
const {client_id, login, user_id, expires_in} = getApi("https://id.twitch.tv/oauth2/validate", {
    "authorization":`OAuth ${token}`
});
// 채널 정보 가져옴
const {data: channel_data} = getApi(`https://api.twitch.tv/helix/users?login=${channel}`,{
    "Client-Id" : client_id,
    "authorization":`Bearer ${token}`
})

if(!channel_data){
    alert("사용자 정보가 올바르지 않음!");
    window.location.href=`${window.location.origin}${window.location.pathname}?token=${token}`;
}
const {id: channel_id } = channel_data[0];

const option = {
    // options: {debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: login,
        password: `oauth:${token}`
    },
    channels: [window.query.channel /*, "tuesucmd" */]
};
console.log(option);


window.onConsole = window.onConsole || console.log; // 콘솔세팅
window.command_tag =  window.command_tag || "!";//명령 기본테그
window.chat_js = {}; // 명령처리 기본


// // 키에 데이터 쓰기
// localStorage.setItem("key", value)

// // 키로 부터 데이터 읽기
// localStorage.getItem("key")

// // 키의 데이터 삭제
// localStorage.removeItem("key")

// // 모든 키의 데이터 삭제
// localStorage.clear()

// // 저장된 키/값 쌍의 개수
// localStorage.length

/**
 * 스토리지 아이템을 불러옴
 * @param {*} key 
 * @param {*} non 
 * @returns 
 */
function getStorage(key, non=[]){
    const item = localStorage.getItem(key);
    if(item)
        return JSON.parse(item);
    else return non; 
}


/**
 * 스토리지 아이템을 불러옴
 * @param {*} key 
 * @param {*} non 
 * @returns 
 */
 function setStorage(key, value){
    if(typeof value != "string")
        value = JSON.stringify(value);
    localStorage.setItem(key, value);
    console.log(key, value);
}

const chattings = [];// 채팅 로그기록
window.chat_js.cmd_user = getStorage(`${channel}_${login}_cmd`,{});
window.chat_js.message_user = getStorage(`${channel}_${login}_message`, {});
window.chat_js.bad_user = getStorage(`${channel}_${login}_bad`,[]);

window.chat_js.one_filter_user = [];// 한번 닉네임 필터링 거친사람

const client = new tmi.Client(option);
client.connect().catch(console.error);

client.on("timeout", (channel, msg, self, time, tags) => {
    if (self) return;
    window.onConsole("timeout", msg, time);
});
client.on("ban", (channel, msg, self, tags) => {
    if (self) return;
    window.onConsole("ban", msg);
});


// const cmd_user = getStorage(`${channel}_${login}_cmd`,{});//명령어
// const message_user = getStorage(`${channel}_${login}_message`, {});// 금지어
// const bad_user = getStorage(`${channel}_${login}_bad`,[]);//금지닉

client.on('message', (channel, tags, message, self) => {
    if (self) return;
    const isPermiss = tags.badges ? tags.badges.hasOwnProperty("moderator") || tags.badges.hasOwnProperty("broadcaster") : false;

    let isCmd = false;

    console.log(channel,message);
    Object.keys(window.chat_js.cmd_user).forEach(o=>{
        console.log(message, o);
        if(message.startsWith(o)){
            client.say(channel, window.chat_js.cmd_user[o].replace('{id}', tags.username).replace('{name}', tags["display-name"]));
            isCmd = true;
        }
    });
    if(isCmd)return;// 채팅 명령 처리시 무시;

    if(message[0] != window.command_tag){
        if(!isPermiss){
            chattings.push({channel, msgId : tags.id, login: tags.username});
            // 금지어 처리
            Object.keys(window.chat_js.message_user).forEach(o=>{
                if(message.includes(o)){
                    client.say(channel, `/delete ${tags.id}`);
                    if (window.chat_js.message_user[o])
                        client.say(channel, `/me @${tags.username} -> ${window.chat_js.message_user[o]}`);
                    // window.onConsole("",tags["display-name"],"닉네임 필터링", tags.username);
                }
            });
            // 이름 필터링
            if(!window.chat_js.one_filter_user.includes(tags.username)){
                window.chat_js.bad_user.forEach(o=>{
                    if(tags.username.includes(o)){
                        client.say(channel, `/ban ${tags.username} 귀하는 스트리머가 설정한 닉네임 필터링에 필터링 되셧습니다.`);
                        window.onConsole("notice",tags["display-name"],"닉네임 필터링", tags.username);
                    }
                });
                window.chat_js.one_filter_user.push(tags.username);
            }
        }
    }else{
        const commands = message.includes(" ") ? message.split(" ") : [message];
        commands[0] = commands[0].toLowerCase();
        switch(commands[0]){
            case `${window.command_tag}클리너`:
                if(commands.length < 3){
                    client.say(channel, `/me 잘못된 명령입니다 - ${window.command_tag}클리너 [ban|timeout|delete] {timeout일때 시간} [필터링 단어 및 문장]`);
                    return;
                }
                const point = ["timeout"].includes(commands[1]) ? 3 : 2;
                commands[point] = commands.slice(point).join(" ");
                if(commands[point].length > 5)
                    cleanner(channel, commands[1], commands[point], point==2 || commands[2])
                else 
                    client.say(channel, `/me 잘못된 명령입니다 - 인수가 잘못되었습니다.(필터링 문장은 적어도 5자 이상 적어주세요!)`);
                break;
            case `${window.command_tag}클립`:
                postApi(`https://api.twitch.tv/helix/clips?broadcaster_id=${channel_id}`,{
                    "Authorization": `Bearer ${token}`,
                    "Client-Id" : client_id
                },function(data){
                    if(data){
                        const {id, edit_url} = data.data[0];
                        client.say(channel, `/me 클립을 제작함 - https://www.twitch.tv/${channel.substring(1)}/clip/${id}`);
                        client.say("#tuesucmd", `/me 클립 편집점[${channel.substring(1)}] - ${edit_url}`);
                    }else{
                        client.say(channel, `/me 클립 제작에 실패함!`);
                    }
                });
                break;
            default:// 존재하지 않는 명령어
            // 사용자 명령 처리
                break;
        }// switch
    }
    
});

/**
 * 해당 옶션에 맞춰 기록을 통하여 채팅 필터링
 * @param {*} channel 
 * @param {*} command 
 * @param {*} words 
 * @param {*} option 
 */
function cleanner(channel, command, words, option){
    if(option===true) option = null;

    // 명령 처리 [옵션] 필터링단어 
    const comm_user = [];
    chattings.filter(i=> message.channels === channel && i.message.include(words))
        .map(i=>command=="delete"? i.msgId :i.login)
        .forEach(i=>{
            if(comm_user.includes(i))
                return;
            comm_user.push(i);
            switch(command){
                case "ban":
                    client.say(channel, `/ban ${i}`);
                    // client.say("#tuesucmd", `ban -> ${i}`);
                    break;
                case "timeout":
                    client.say(channel, `/timeout ${option} ${i}`);
                    // client.say("#tuesucmd", `timeout -> [${commands[2]}]${i}`);
                    break;
                case "delete":
                    client.say(channel, `/delete ${i}`);
                    break;
            }
        }
    );
    
    const fileName = `${channel.substring(1)}_${command}_${UUIDGeneratorBrowser()}.data`;
    comm_user.unshift(`/${command} <?> ${words} `);
    if(point===3)
        comm_user[0] += option;
    saveToFile(fileName, comm_user.join("\n"));
    // 파일 다운로더
    client.say(channel, `/me ${comm_user.length}명을 ${command}처리하였습니다!`);
}

/**
 * 블락된 유저 목록을 불러옴
 * @param {*} cursor 
 * @returns [
 *  {
      "user_id": "424596340",
      "user_login": "quotrok",
      "user_name": "quotrok",
      "expires_at": "2018-08-07T02:07:55Z",
    }
 * ]
 */
function getCommandingUsers(cursor) {//channel_id
    let url = "https://api.twitch.tv/helix/moderation/banned?first=100&";
    if(cursor){
        url += `before=${cursor}`
    }else {
        url += `broadcaster_id=${channel_id}`;
    }
    const data = getApi(url,{
        "Client-Id" : client_id,
        "authorization":`Bearer ${token}`
    });
    if(!data) return [];
    const users = JSON.parse(data);
    if(users.hasOwnProperty("pagination") && users.pagination.hasOwnProperty("cursor")){
        users.data.push(...getCommandingUsers(users.pagination.cursor));
    }
    return users.data;
}

// 비 API 툴
//////////////////////////////////////////////////////////////////////////////////
const UUIDGeneratorBrowser = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );

/**
 * 파일 저장 - 텍스트 파일로 로그 저장
 * @param {*} fileName 
 * @param {*} content 
 */
function saveToFile(fileName, content){
    if(isIE())
        saveToFile_IE(fileName,content);
    else saveToFile_Chrome(fileName, content);
}
function saveToFile_Chrome(fileName, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    objURL = window.URL.createObjectURL(blob);
    
    if (window.__Xr_objURL_forCreatingFile__) {
        window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;
    const a = document.createElement('a');
    a.download = fileName;
    a.href = objURL;
    a.click();
}
function saveToFile_IE(fileName, content) {
    var blob = new Blob([content], { type: "text/plain", endings: "native" });
    window.navigator.msSaveBlob(blob, fileName);
    //window.navigator.msSaveOrOpenBlob(blob, fileName);
}
function isIE() {
    return (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) ||
        navigator.userAgent.toLowerCase().indexOf("msie") !== -1;
}

/**
 * API 통신에 필요한 데이터 수신
 * @param {*} url url
 * @param {*} header 헤더
 * @param {function} isSync 비동기 통신 할 때의 처리함수
 * @returns 
 */
function getApi(url, header, isSync=false){
    return networkApi("GET", url, header, isSync);
}

function postApi(url, header, isSync=false){
    return networkApi("POST", url, header, isSync);
}

function networkApi(option, url, header, isSync=false){
    const xmlhttp = new XMLHttpRequest()
    let data = "";
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200){
            data = this.responseText; 
            if(isSync)
                isSync(data);
        }else if (isSync)isSync();
    };
    xmlhttp.open(option, url, isSync!=false);
    Object.keys(header).forEach(o=>xmlhttp.setRequestHeader(o, header[o]));
    xmlhttp.send();
    return JSON.parse(data);
}