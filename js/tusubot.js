'use strict';
window.ver = "2.0.0";

const oauth_client_id = "upe7qsmxj1soazkgf1ry7pf8w3d89u";
const oauth_redirect_uri = `${window.location.origin}${window.location.pathname}`;// 리다이렉션

const rawauth = document.location.href.replace("#", "?");
const channel = location.hash.substr(1) || getParams("state") || 0;//채널정보가 없을때 / 스코프 / 0
const permissions = ["chat:read","chat:edit", "channel:moderate", 
		"moderation:read",
		"moderator:manage:automod", // Automod
		"channel:manage:broadcast", // 방송 정보 수정
		"channel:manage:polls", //설문
		"whispers:edit", // 귓속말
		"clips:edit"]; // 클립생성

const oauth = getParams("o");
const access_token = getParams("access_token", rawauth);
const chat_log_limit = 1000;

const is_test = false;

window.autoscroll = true;
window.command = {};

// 채팅 모드
const chat_mod = {
	"emote-only" : "이모티콘 전용 모드" ,
	"followers-only": "팔로우 전용 모드",
	// "r9k" : "", // 뭔지몰라 - 일단 9자는 고유한 모드?
	"slow" : "느린 대화 모드",
	"subs-only" : "구독자 전용 모드"
};
//@client-nonce=46dc4a903d9d360d7350a62b615b0562;reply-parent-msg-id=b208830b-28ce-40fa-9373-9b5c9ae83168 PRIVMSG #sjrnf0113 :답장 테스트
//=======================================================================================================

const append_bt = document.getElementById("append_load");
/*
순서
1. 타겟채널 - 채널의 사용자 정보를 일단 불러옴
2. 채널에 사용자 정보를 불러오기 위한 토큰 정보
3. 사용자 정보를 불러오는 페이지
 - 이전처럼 사용자 정보를 세션 및 클라이언트 스토리지에 저장하지 않음. -

 jinu6734
*/
if(access_token){ // 토큰은 1회성 코드 (발급 당시 사용하고 바로 파기) - 코드발급 - 클라이언트 시크릿 유출
	const scope = getParams("scope", rawauth).split(" ");// 사용자 허용 범위
	const state = getParams("state", rawauth);// 타겟채널
	const jwt = window.jwt_encode({access_token,scope, date : new Date()});
	location.href = `${location.origin}${location.pathname}?o=${jwt}#${state}`;// 토큰 적용하여 이동
}else if(!channel){
    window.onload = function() {
		document.body.innerHTML = `
			<div id="input_surch">
				<input id="user-input" type="text" value="" onkeypress="if(event.keyCode!=13)return;setChannel()" placeholder="채널의 id를 입력해 주세요!" focus="">
				<button onclick="setChannel()" style="transform: translate(-70px, 20px);">
					<svg aria-hidden="true" style="transform:translate(0px, 4px)" focusable="false" data-prefix="fas" data-icon="sign-in-alt" class="svg-inline--fa fa-sign-in-alt fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
						<path fill="currentColor" d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"></path>
					</svg>
				</button>
			</div>
		`;
		window.addStyle("#input_surch:hover>button{opacity:1}#input_surch{position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);}#user-input{height: 60px;padding: 2px;width: 400px;border-radius: 50%;font-size: 2em;border: 0px;background: #333;color: #fff;border-radius: 30px;padding: 0 60px 0 14px;}button{height: 60px;opacity: 0;font-size: 2em;border: 0;border-radius: 50%;width: 60px;height: 60px;background: #fff;color: #000;padding: 0 10px 0 0;transform: translate(-60px, 0px);padding-left: 14px;transition: .4s;}");
		document.head.C("script").html(`
			function setChannel(){
				const channel = document.getElementById("user-input").value;
				console.log(channel)
				if (/[a-zA-Z0-9_]/.test(channel) && channel.length > 2 ){
					location.href = location.origin + location.pathname + '#' + channel;
					location.reload()
				}else alert("채널이 아닌거 같습니다.. 다시 입력해 주세요!");
			}
		`)
		
    }
}else if(!oauth){// 사용자 인증
	location.href = `https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=${oauth_client_id}&redirect_uri=${oauth_redirect_uri}&scope=${permissions.join("%20")}&state=${channel}`;
}else {
	window.token = window.jwt_decode(oauth, {header : true});
	window.token.instance = axios.create({
		baseURL: 'https://api.twitch.tv/helix/',
		headers: { 
			'Authorization':  `Bearer ${window.token.access_token}`,
			"Client-Id" : oauth_client_id
		}
	});
	
	function initTime(){// 시간초기화
		window.static_time = window.static_time || new Date("1900-01-01 00:00:00");
		return setInterval(()=>{// 시간 루프
			window.static_time.setSeconds(window.static_time.getSeconds() + 1);// 1초더함
			document.getElementById("uptime").html(window.static_time.format("HH:mm:ss"));
		}, 1000);
	}
	window._channel = function(str){
		const channel = (str ? str : '').toLowerCase();
		return channel[0] === '#' ? channel : '#' + channel;
	}
	window.onload = ()=>{
		const end = onDialogueLoading("채널정보를 불러오는중...");
		window.token.instance.get("users").then(({data: {data}}) =>{
			if(!data.length)return;// 사용자가 없다?
			const {login : username} = data[0];
			console.log(data[0]);
			window.client = new tmi.Client({
				options: {
					debug: is_test,
					level: 'warn',
				},
				connection: { reconnect: true, secure: true },
				identity : { username,  password: window.token.access_token},
				channels : [channel]
			});
			window.client.reply=function reply(channel, msg_id, message){
				this.log.info(`[${channel}] Reply message: ${command}`);
				this.ws.send(`@reply-parent-msg-id=${msg_id} PRIVMSG ${window._channel(channel)} :${message}`);
			}
			window.client.once("connected", (s,p)=>{window.client.popup(document.createElement("span").html(`트위치 채팅채널에 정상적으로 연결되었습니다! ${s}(${p})`).styles("background","blue").styles("color","#fff"), 30)});
			window.client.on("join", (channel, username, self)=>{if(self)window.client.popup(document.createElement("span").html(`${channel}에 연결됨`).styles("background","blue").styles("color","#fff"), 30)});
			window.client.on("part", (channel, username, self)=>{if(self)window.client.popup(document.createElement("span").html(`${channel}에 퇴장됨`).styles("background","blue").styles("color","#fff"), 30)});
			window.client.on("reconnect", ()=>{window.client.popup(document.createElement("span").html(`서버가 불안정하여 재접속을 시도합니다...`).styles("background","red").styles("color","#fff"), 30)});
			window.client.on("chat",(channel, userstate, message, self)=>{if(self)return;addChat(userstate, message, userstate.id)});
			window.client.on("ban", (channel, username, reason)=>{
				removeConsole(username);
				const ele = consoleMessage(`(유저 벤) ${username} ${reason  || ""}`, "blue").styles("cursor","pointer");
				window.client.popup(ele,-1);
				ele.onclick=()=>{window.open(`https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${username}?popout=`)};
			});
			window.client.on("timeout", (channel, username, reason, duration)=>{
				removeConsole(username);
				const ele = consoleMessage(`(유저 타임아웃 ${duration}) ${username} ${reason || ""}`, "blue").styles("cursor","pointer")
				window.client.popup(ele,-1);
				ele.onclick=()=>{window.open(`https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${username}?popout=`)};
			});
			window.client.on("messagedeleted", (channel, username, deletedMessage, userstate)=>{
				removeConsole(userstate.id,(element)=>{
					console.log(element.getPosition());
					window.client.popup(consoleMessage(`(메세지 삭제) ${username}`, "blue"),-1)
				});
			});
			window.client.on("hosted", (channel, username, viewers, autohost)=>{
				if(!autohost){
					consoleMessage(`(호스팅 ${viewers}) ${username}`, "blue");
					newExcitingAlerts(`호스팅 - ${username}`);
					window.client.popup(document.createElement("span").html(`(호스팅 ${viewers}) ${username}`).styles("background","blue").styles("color","#fff"), 30);
				}
			});
			window.client.on("redeem", (channel, username, rewardType, tag)=>{
				switch(rewardType){
					case "highlighted-message":
						window.client.msg_op = {id: tag.id, rewardType : "highlighted_message"}
						// window.client.popup(document.createElement("span").html(`(포인트 보상[강조 메세지]) ${username}`).styles("background","blue").styles("color","#fff"), 30);
						// highlightedConsole(tag.id);
						// consoleMessage(`(포인트 보상[강조 메세지]) ${username}`, "blue");
						break;
					case "skip-subs-mode-message":
						window.client.msg_op = {id: tag.id, rewardType : "subs_mode"}
						// window.client.popup(document.createElement("span").html(`(포인트 보상[비 구독자 메세지]) ${username}`).styles("background","blue").styles("color","#fff"), 30);
						// subsModeConsole(tag.id);
						// consoleMessage(`(포인트 보상[비 구독자 메세지]) ${username}`, "blue");
						break;
					default:
						//`(포인트 보상[${rewardType}]) ${username}`
						window.client.popup(document.createElement("span").html(`(포인트 보상[${rewardType}]) ${username}`).styles("background","blue").styles("color","#fff"), 30);
						consoleMessage(`(포인트 보상[${rewardType}]) ${username}`, "blue");
						break;
				}
			});
			window.client.on("automod", (channel, msgID , message)=>{
				//msgID = ['msg_rejected' | 'msg_rejected_mandatory']
				if(msgID == "msg_rejected"){
					consoleMessage(`(AutoMod) 메세지가 보류중... ${message}`, "blue");
				}else {
					consoleMessage(`(AutoMod) 메세지가 게시되지 않았습니다 ${message}`, "red");
				}
			});
			window.client.on("roomstate",(channel, state)=>{
				console.log(state);
				for(const k in chat_mod){
					if(state[k] && (k != "followers-only" || state[k] != "-1")){
						let is = false;
						const event = ()=>{
							if(is)return;
							is = true;
							const off = `${k.replace("-","")}off`;
							window.client[off](channel);
							consoleMessage(`(채팅모드) ${chat_mod[k]} 해제됨`, "green")
							window.client.popup(document.createElement("span").html(`(채팅모드) ${chat_mod[k]} 해제됨`).styles("background","green").styles("color","#fff"), 30);
						};
						const popup = document.createElement("span").html(`(채팅모드) ${chat_mod[k]} ${state[k] == true ? "" : " - " + state[k]}`).styles("background","red").styles("color","#fff");
						window.client.popup(popup, 60);
						popup.onclick=event;
						consoleMessage(`(채팅모드) ${chat_mod[k]} ${state[k] == true ? "" : " - " + state[k]}`, "red").styles("cursor","pointer").attr("title",`${chat_mod[k]}해제하기`).onclick=event;
					}
				}
			})

			//roomstate(channel: string, state: RoomState): void;
			//
			window.client.popup = Popup();
			window.client.connect().catch(console.error);
			if(window.opener != null){
				window.opener.location.href = "about:blank";
				window.opener.document.write("페이지가 탭으로 넘어갔습니다. 창을 닫으셔도 좋습니다!");
				document.title = "트봇mini - Leaderboards";
			}
		})

		setBrodcast((o)=>{// 스트리머 정보
			initTime();// 시간 루퍼
			initBadges(); // 배찌 불러오기
			getStream(end); // 스트림 여부
			// getEmoteListView();
			setInterval(getStream, 5 * 60 * 1000);// 스트림 상태
		});
	}
}

// `chrome://settings/content/siteDetails?site=${window.location.origin}`

function popupLogList(){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });// 배경클릭시 닫침
	bord.onclick = (event)=>{event.stopPropagation()};
	bord.styles("width", "500px");
	bord.styles("max-height", "300px");
	bord.styles("height", "auto");
	
	bord.C("p").html("로그 리스트");
	bord.C("line");

	const logs = window.client.popup("");
	const list = bord.C("div").styles("width","100%").styles("overflow-y", "scroll").styles("max-height","270px");
	for (const i of logs)
		list.C("p").html(i).styles("hieght", "20px").styles("text-overflow","ellipsis").styles("white-space","nowrap").styles("overflow","hidden");
	
}
/**
 * GET https://api.twitch.tv/kraken/chat/emoticon_images
 */
// function getEmoteListView(){
// 	// targetPopup
// 	axios.get(`https://api.twitch.tv/kraken/chat/emoticon_images`, {
// 		headers : { "Client-Id" : oauth_client_id, "Accept" : "application/vnd.twitchtv.v5+json" }
// 	}).then(({data})=>{
// 		console.log(data);
// 	}).catch(e=>{
// 		console.error(e);
// 	})
// }

// 가독성 떨어지게 하는 코드
// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 스크롤 맨 위로
 * @param {*} target 
 */
function scrollDiv(target){
    target.scrollTop = target.scrollHeight;
}
/**
 * 다이얼로그
 * @param {element} html 표기
 * @param {Function} end 종료후
 */
function onDialogue(html,f){
	const dia = document.body.C("div");
	dia.addClass("dialogue");
	dia.onclick =()=>{if(f)f();}; // 클릭무시

	const parent = document.body;//맨앞으로 이동
	parent.insertBefore(dia, parent.firstChild);
	dia.appendChild(html);
	return function end(){
		dia.remove();
	}
}

/**
 * 로딩 다이얼로그
 * @param {String} mant 맨트
 * @param {callback} f 콜백
 * @param {boolean} is_cancle 취소 버튼 여부
 * @returns 
 */
 function onDialogueLoading(mant=false,f,is_cancle = false){
	const bord = document.createElement("span");
	const end = onDialogue(bord,()=>{});

	const size = 300;
	bord.styles("width",`${size}px`).styles("height", "auto");


	if(mant)bord.C("p").html(mant);
	bord.createElement("img").styles("width", `${size}px`).styles("height", `${size}px`).src = "./img/loading.gif";
	bord.onclick =()=>{}; // 클릭무시
	if(is_cancle)bord.C("button").html("취소").styles("padding", "5px !important").onclick= end;
	return end;
}

/**
 * https://www.stefanjudis.com/blog/how-to-display-twitch-emotes-in-tmi-js-chat-messages/
 * 이모지 단어를 html테그로 변경
 * @param {*} message 메세지
 * @param {*} emotes
 * @returns 
 */
function getMessageHTML(message, { emotes }) {
	if (!emotes) return message;

	// store all emote keywords
	// ! you have to first scan through 
	// the message string and replace later
	const stringReplacements = [];

	// iterate of emotes to access ids and positions
	Object.entries(emotes).forEach(([id, positions]) => {
		// use only the first position to find out the emote key word
		const position = positions[0];
		const [start, end] = position.split("-");
		const stringToReplace = message.substring(
			parseInt(start, 10),
			parseInt(end, 10) + 1
		);

		stringReplacements.push({
			stringToReplace: stringToReplace,
			replacement: `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0">`,
		});
	});

	const messageHTML = stringReplacements.reduce(
		(acc, { stringToReplace, replacement }) => {
			return acc.split(stringToReplace).join(replacement);
		},
		message
	);
	return messageHTML;
}

/**
 * 스트리머 정보를 불러옴
 * @param {*} f 콜백함수
 */
function setBrodcast(f){
	window.token.instance.get(`users?login=${channel}`).then(({data : {data}})=>{
		if(data.length){
			window.broadcaster = data[0];// 사용자 정보 확보
			f(data[0]);
		}
	}).catch(e=>console.error(e));
}

/**
 * 뱃지를 불러옴
 * GET https://api.twitch.tv/kraken/chat/<channel ID>/badges
 */
function initBadges() {
	axios.get(`https://api.twitch.tv/kraken/chat/${window.broadcaster.id}/badges`, {
		headers : { "Client-Id" : oauth_client_id, "Accept" : "application/vnd.twitchtv.v5+json" }
	}).then(({data})=>{
		window.badges = new Map();
		for(const k in data)if(data[k])window.badges.set(k, data[k].image);
	}).catch(e=>{
		console.error(e);
	})
}

/**
 * 배찌정보를 불러옴
 * @param {*} bages 
 */
 function getBadges(badges) {
	let out = [];
	for (const k in badges){
		out.push(window.badges.get(k));
	}
	out = out.filter(o=> o != undefined);
	return out.map(o=>`<img src=${o} />`).join("");
}
/**
 * 알림창
 */
const newExcitingAlerts = (function (msg = "New!") {
    var oldTitle = document.title;
    var timeoutId;
    var blink = function() { document.title = document.title == msg ? oldTitle : msg; };
    var clear = function() {
        clearInterval(timeoutId);
        document.title = oldTitle;
        window.onmousemove = null;
        timeoutId = null;
    };
	try{
		if(!isMobile)
			window.open(oauth_redirect_uri).close();
		window.isEnablePopup = true;
	}catch(e){
		// 팝업이 차단됨
		window.isEnablePopup = false;
	}
    return function () {
        if (!timeoutId) {
            timeoutId = setInterval(blink, 1000);
            window.onmousemove = clear;
        }
    };
}());

//======================================================================================
// 기능
/**
 * 설문조사 뷰 생성
 */
function makePollsView(){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });// 배경클릭시 닫침
	bord.onclick = (event)=>{event.stopPropagation()};

	bord.styles("height", "auto");
	bord.C("p").html("설문조사");
	const title = bord.C("input").attr("type","text").styles("padding","5px !important").attr("placeholder", "제목을 입력해 주세요!");
	bord.C("line");
	bord.C("p").html("진행시간 :").styles("display","contents").styles("width","50px");
	const duration = bord.C("input").attr("type","number").attr("max","1800").attr("min","15");
	// <input type="checkbox" title="자동스크롤 on/off" id="is_scroll" class="checkbox" checked>

	bord.C("br");

	let is_bit = false;

	bord.C("p").html("비트후원").styles("display","contents").styles("width","50px");
	bord.C("input").attr("type","checkbox").attr("title","비트후원").addClass("checkbox").onchange=function(){
		is_bit = this.checked;
		if(is_bit)
			bit.removeAttribute("disabled");
		else 
			bit.attr("disabled"," disabled");
		// bit.styles("display", is_bit ? "inline-block" : "none");
	};

	const bit = bord.C("input").attr("type","number").attr("title","최소비트").attr("min", "0").attr("max", "10000").attr("value", "0").attr("disabled"," disabled");
	
	bord.C("br");

	let is_point = false;

	bord.C("p").html("포인트후원").styles("display","contents").styles("width","50px");
	bord.C("input").attr("type","checkbox").attr("title","포인트후원").addClass("checkbox").onchange=function(){
		is_point = this.checked;
		if(is_point)
			point.removeAttribute("disabled");
		else 
			point.attr("disabled"," disabled");
	}
	
	const point = bord.C("input").attr("type","number").attr("title","최소포인트").attr("min", "0").attr("max", "1000000").attr("value", "0").attr("disabled"," disabled");
	
	bord.C("line");
	const choices = [];
	const box = bord.C("box");
	choices[0] = box.C("input").attr("type","text").attr("placeholder", "항목");
	choices[1] = box.C("input").attr("type","text").attr("placeholder", "항목");
	
	box.C("br")
	box.C("button").html("추가");
	box.C("button").html("제거");

	bord.C("line");
	
	bord.C("button").html("설문 시작하기!")
	bord.C("button").html("취소").onclick=end;
}

/**
 * https://dev.twitch.tv/docs/api/reference#create-poll
 * 설문조사 생성
 * 권한 channel:manage:polls
 * POST https://api.twitch.tv/helix/polls
 * @param {} f
 */
function makePolls(f,title = "셈플설문조사",choices = ["항목1","항목2"],duration = 1800, subOption = {}){
	//
	const {
		bits_voting_enabled = false, // 비트
		bits_per_vote = 0, // 최대 10000
		channel_points_voting_enabled = false, // 포인트
		channel_points_per_vote	= 0 // 1000000
	} = subOption;
	window.token.instance.post("polls",{
		broadcaster_id: window.broadcaster.id,
		title,
		choices,
		duration,
		bits_voting_enabled,
		bits_per_vote,
		channel_points_voting_enabled,
		channel_points_per_vote,
		validateStatus: function (status) {
			return status < 500;
		}
	}).then(({data})=>{
		const {id} = data[0];
		f(id);
	}).catch(e=>{
		switch(e.response.statusText){
			case "Forbidden":// 사용자 
				//파트너 또는 제휴사가 아님.
				window.client.popup(document.createElement("span").html(`(설문) 제휴사 또는 파트너가 아닙니다!`).styles("background","red").styles("color","#fff"), 30);
				break;
		}
	});
}

/**
 * https://dev.twitch.tv/docs/api/reference#end-poll
 * 설문조사 종료
 * 권한 channel:manage:polls
 * PATCH https://api.twitch.tv/helix/polls
 */
function endPolls(f,id,is_privates = false){
	if(!id)return;
	window.token.instance.post("polls",{
		broadcaster_id: window.broadcaster.id,
		id,
		status : (is_privates ? "ARCHIVED" : "TERMINATED")
	}).then(({data})=>{
		if(!data.length)return; // 설문조사가 없음
		const {choices, title, status} = data[0];
		f(title, choices, status)
	}).catch(e=>{
		console.error(e);
	});
}

/**
 * https://dev.twitch.tv/docs/api/reference#create-clip
 * 클립생성
 * 권한 clips:edit
 * POST https://api.twitch.tv/helix/clips
 */
function createClips(f){
	window.token.instance.post(`clips?broadcaster_id=${window.broadcaster.id}`).then(({data:{data}})=>{
		if(data.length)f(data[0].id,data[0].edit_url);
	}).catch(e=>{
		console.error(e);
	})
}

/**
 * https://dev.twitch.tv/docs/api/reference#get-channel-information
 * 채널 정보
 * {
      "broadcaster_id": "141981764",
      "broadcaster_login": "twitchdev",
      "broadcaster_name": "TwitchDev",
      "broadcaster_language": "en",
      "game_id": "509670",
      "game_name": "Science & Technology",
      "title": "TwitchDev Monthly Update // May 6, 2021",
      "delay": 0
    }
 * GET https://api.twitch.tv/helix/channels
 */
function getChannelStates(f){
	window.token.instance.get(`channels?broadcaster_id=${window.broadcaster.id}`).then(({data : {data}})=>{
		if(data.length){
			document.getElementById("title").html(data[0].title);
			document.getElementById("channel").html(`${data[0].broadcaster_name}(${data[0].broadcaster_login})`);
			if(f)f(data[0]);
		}
	}).catch(e=>{
		console.error(e);
	})
}

function getChannelGame(){

}

function setChannelStates(f, options){
	const {
		game_id,
		title,
		// delay
	} = options;
	const query = {};
	if(game_id || title){
		if(game_id) query.game_id = game_id;
		if(title) query.title = title;
	}else return;
	window.token.instance.patch(`channels?broadcaster_id=${window.broadcaster.id}`, query).then(({data})=>{
		f(query);
		document.getElementById("title").html(title);
	}).catch(e=>{
		console.error(e);
	})
}

function getStream(f){
	window.token.instance.get(`streams?user_id=${window.broadcaster.id}`).then(({data : {data}})=>{
		window.static_time = new Date("1900-01-01 00:00:00");
		if(data.length){// 방송중일때 데이터 넘김
			const {title, user_login, user_name, started_at, game_name} = data[0];
			document.getElementById("channel").html(`${user_name}(${user_login})`);
			document.getElementById("title").html(title);
			document.getElementById("game").html(game_name);
			document.getElementById("is_online").html("On-line").styles("background", "red");
			window.static_time.setTime(new Date().getTime() - new Date(started_at).getTime());// 시간 연산
			if(f)f(data[0]);
		}else {
			document.getElementById("is_online").html("Off-line").styles("background", "blue");
			getChannelStates(f);// 방송중이 아닐때, 정보 전달
		}
	}).catch(e=>{
		console.error(e);
	})
}

//======================================================================================

/**
 * 명령어 추가
 */
function addCommand(f){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });
	bord.onclick = (event)=>{event.stopPropagation()};

	bord.C("p").html(`명령을 추가합니다`);

	const command = bord.C("input");
	command.setAttribute("type", "text");
	command.setAttribute("placeholder", "명령어를 입력해 주세요");
	const msg = bord.C("input");
	msg.setAttribute("type", "text");
	msg.setAttribute("placeholder", "출력할 내용을 입력해 주세요");
	bord.C("br");
	bord.C("button").html("저장").onclick = function(){
		if(command.value.length < 3){
			alert("명령어는 최소 3자 이상으로 해주세요!");
			return;
		}else if(msg.value.length < 1){
			alert("출력메세지는 최소 1자입니다.");
			return;
		}
		if(window.command[command.value]){
			alert("이미 존재하는 명령어 입니다!");
			return;
		}
		window.command[command.value] = msg.value;
		addCommandTxt(command.value, msg.value);
		if(f)f(command.value, msg.value);
		alert("저장되었습니다.");
		end();
	};
	bord.C("button").html("취소").onclick = end;
}

function addCommandTxt(k,v) {
	document.getElementById("command").C("p").html(`${k} -> ${v}`).onclick= function(event){
		const element = this;
		const bord = document.createElement("span");
		const end = onDialogue(bord);

		bord.C("button").html("커맨드변경").onclick = ()=>{
			end();
			editCommand((tk, tv)=>{
				k = tk;v = tv;
				element.html(`${k} -> ${v}`);
			}, k, false);
		};
		bord.C("button").html("명령변경").onclick = ()=>{
			end();
			editCommand((tk, tv)=>{
				k = tk;v = tv;
				element.html(`${k} -> ${v}`);
			}, k, true);
		};

	}
}

/**
 * 명령어 편집
 * @param {*} f 콜백
 * @param {*} target 타겟(key)
 * @param {*} is_msg 메세지 변경?
 */
function editCommand(f, target, is_msg = true){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });
	bord.onclick = (event)=>{event.stopPropagation()};

	bord.C("p").html(`바꿀 ${is_msg ? "메세지" : "명령어"}를 입력해 주세요!`);
	bord.C("input").attr("readonly","readonly").value = target;

	const command = bord.C("input");
	command.setAttribute("type", "text");
	command.setAttribute("placeholder", is_msg ? "출력내용을 입력해 주세요!" : "명령어를 입력해 주세요");
	bord.C("br");
	bord.C("button").html("저장").onclick = function(){
		if(!is_msg && command.value.length < 3){
			alert("명령어는 최소 3자 이상으로 해주세요!");
			return;
		}else if( is_msg && command.value.length < 1){
			alert("출력메세지는 최소 1자입니다.");
			return;
		}else if(!is_msg && window.command[command.value]){
			alert("이미 존재하는 명령어 입니다!");
			return;
		}else if(!is_msg && command.value == target){
			alert("변경내용과, 이전내용이 동일합니다!");
			end();
			return;
		}
		if(is_msg){
			window.command[target] = command.value;
			if(f)f(target, command.value);
		}else{
			window.command[command.value] = window.command[target];
			delete window.command[target];
			if(f)f(command.value, window.command[command.value]);
		}
		alert("변경되었습니다.");
		end();
	};
	bord.C("button").html("취소").onclick = end;
}

/**
 * 명령어 제거
 */
function subCommand(comm){
	if(!window.command[comm])return;
	delete window.command[comm];
}

window.reservation_msg = [];// 예약명령어

//======================================================================================
/**
 * 예약 명령 추가
 */
function addReservation(f){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });
	bord.onclick = (event)=>{event.stopPropagation()};
	
	bord.styles("height", "130px")
	
	bord.C("p").html("주기적 메세지");
	/* <input id="time_start" type="time"> */
	const time = bord.C("input");
	bord.C("p").html("분마다 전송");
	time.setAttribute("type", "number");
	time.setAttribute("min", "5");
	time.setAttribute("max", "60");
	time.setAttribute("step", "5");
	time.setAttribute("value", "5");

	const msg = bord.C("textarea");
	msg.setAttribute("placeholder", "전송할 메세지");

	bord.C("br");

	bord.C("button").html("저장").onclick = function(){
		if(msg.value.length < 3){
			alert("메세지는 최소 3자 이상으로 해주세요!");
			return;
		}else if(time.value < 3){
			alert("최소 3분 이상만 가능합니다.!");
			return;
		}
		window.reservation_msg.push({
			msg : msg.value,
			time: time.value,
			is : true,
			id : setInterval(item=>{if(item.is)sendChat(item.msg)},time.value * 60 * 1000, item)
		});
		alert("저장되었습니다.");
		if(f)f(msg.value,time.value);
		end();
	};
	bord.C("button").html("취소").onclick = end;
}

function addReservationTxt(item){
	// consoleMessage(`반복메세지 설정 ${msg} ${time}s`, 'green');
	document.getElementById("command").C("p").html(`[${item.time}] -> ${item.msg}`).onclick= function(event){
		const element = this;
		const bord = document.createElement("span");
		const end = onDialogue(bord, ()=>{ end() });
		bord.onclick = (event)=>{event.stopPropagation()};

		bord.C("button").html("메세지변경").onclick = ()=>{
			end();
			editReservation((i)=>{
				item = i;
				element.html(`[${item.time}] -> ${item.msg}`);
				consoleMessage(`메세지변경 ${item.msg} ${item.time}s`, 'green');
			}, false);
		};
		bord.C("button").html("시간변경").onclick = ()=>{
			end();
			editReservation((i)=>{
				item = i;
				element.html(`[${item.time}] -> ${item.msg}`);
				consoleMessage(`반복시간변경 ${item.msg} ${item.time}s`, 'green');
			}, true);
		};
		bord.C("button").html("삭제").onclick = ()=>{
			end();
			removeReservation((i)=>{
				consoleMessage(`반복메세지 삭제 ${i.msg} ${i.time}s`, 'green');
			},item);
			element.remove();
		};
	}
}

/**
 * 주기적 명령 변경
 * @param {*} f 콜백
 * @param {*} msg 메세지
 * @param {*} is_time 시간인지 여부
 */
function editReservation(f, msg, is_time = true){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });
	bord.onclick = (event)=>{event.stopPropagation()};

	const item = window.reservation_msg.filter(o=> o.msg == msg)[0];
	if(!item)return; // 아이템이 없음

	const check = bord.C("input").attr("type", "checkbox").attr("title", "on/off").addClass("checkbox");
	check.checked = item.is;
	check.onchange = function(){
		item.is = this.checked;
	}

	bord.C("p").html(`바꿀 ${is_time ? "시간" : "메세지"}를 입력해 주세요!`);
	bord.C("input").attr("readonly","readonly").value = `(${item.time}) ${msg}`;

	const command = bord.C("input");
	command.setAttribute("type", is_time ? "number" : "text");
	if(is_time){
		command.setAttribute("min", "5");
		command.setAttribute("max", "60");
		command.setAttribute("step", "5");
		command.setAttribute("value", "5");
	}
	command.setAttribute("placeholder", is_time ? "시간주기" : "명령어를 입력해 주세요");

	bord.C("br");
	bord.C("button").html("저장").onclick = function(){
		if(!is_time && command.value.length < 3){
			alert("메세지는 최소 3자 이상으로 해주세요!");
			return;
		}else if( is_time && command.value <= 1){
			alert("1분이상으로 설정해 주세요!");
			return;
		}else if(!is_time && window.command[command.value]){
			alert("이미 존재하는 명령어 입니다!");
			return;
		}else if(!is_time && command.value == msg){
			alert("변경내용과, 이전내용이 동일합니다!");
			end();
			return;
		}
		if(is_time){
			item.time = command.value;
			clearInterval(item.id);// 타이머 제거
			item.id = setInterval(item=>{
				if(item.is)sendChat(item.msg)
			},time.value * 60 * 1000, item);
		}else{
			item.msg = command.value;
		}
		if(f)f(item);
		alert("변경되었습니다.");
		end();
	};
	bord.C("button").html("취소").onclick = end;
}

/**
 * 반복메세지 삭제
 * @param {*} msg 
 */
function removeReservation(f,item){
	clearInterval(item.id);// 타이머 제거
	delete window.reservation_msg[item];
	item.is = false;
	f(item);
}
//======================================================================================

// 채팅 기본 checked

window.chatting_log = [];
/**
 * 메세지를 추가함 (통합함수) 필터 및 기록
 * @param {ChatUserstate} user 사용자
 * @param {String} msg 메세지
 * @param {String} msg_id 메세지 id
 */
function addChat(user, msg, msg_id){// 채팅기록관리
	window.chatting_log.push({user,msg, msg_id});
	const console_div = document.getElementById("console");
	
	if(chat_log_limit <= window.chatting_log.length)window.chatting_log.shift();

	if(document.getElementById("is_commands").checked){
		const [comm, ...args] = msg;
		switch(comm){
			case "!클립":
				createClips(({id,edit_url})=>{
					// 클립 url
					// console_div.C("p").html(`[console] ${id}클립생성 - ${edit_url}`);
					const out = `[console] <a src="clips.twitch.tv/${id}">${id}</a>클립생성 - ${edit_url}`;
					consoleMessage(out);
					window.client.popup(out, 500);
					window.client.reply(channel, msg_id, `[클립생성] clips.twitch.tv/${id}`);
					scrollDiv(document.getElementById("console_scroll"));
				});
				break;
			case "!후원":
				window.client.reply(channel, msg_id, `후원링크 twip.kr/donate/${channel}`);
				break;
			default:
				for (const k in window.command){
					if(msg.includes(k)){
						window.client.reply(channel, msg_id, window.command[k]);
						break;
					}
				}
				break;
		}
	}
	user.msg = getMessageHTML(msg, user);
	user.nick = user["display-name"] == user.username ? user.username : `${user["display-name"]}<p style='font-size:0.2em;display:contents;'>${user.username}</p>`; 
	console_div.C("p")
		.addClass("hover_pointer")
		.addClass(user.username)
		.addClass(user.id)
		.addClass(window.client.msg_op && window.client.msg_op.id == msg_id ? (window.client.msg_op.rewardType || "none") : "none")
		.styles("cursor","pointer")
		.html(`<span style="width:1px;height:1px" class=span_front></span>[<span style="color:${user.color || "#fff"}">${user.nick}</span>] ${user.msg}`)
		.onclick = ()=>{userprofile(user)};
	window.client.msg_op = undefined;// 메세지 강조
	if(console_div.childElementCount > 5000){
		for(let i = 0; i < 1000; i++)
			console_div.firstChild.remove();
		window.client.popup("1000개의 메세지가 기록에서 삭제되었습니다.",-1);
	}
	if(window.autoscroll)scrollDiv(console_div.parentNode);
}

/**
 * 프로필 정보
 * @param {*} param0 
 */
function userprofile({username, nick, id, color, badges, msg}){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });

	bord.onclick = (event)=>{event.stopPropagation()};
	bord.styles("width", "500px");
	bord.styles("height", "auto");

	bord.C("p").html(`${getBadges(badges)}${nick}`).styles("color", color || "#000").styles("cursor","pointer").attr("title","사용자 채팅 기록").onclick = () =>{
		window.open(`https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${username}?popout=`);
	};
	if(msg){
		bord.C("line");
		bord.C("p").html("메세지 ID");
		bord.C("p").html(id);
		bord.C("line");
		bord.C("p").html("내용");
		bord.C("p").html(msg);
	}
	bord.C("line");
	//timeout
	bord.C("button").attr("title","타임아웃 (30s)").html(`<i class="fas fa-shield-alt"></i>`).onclick = () => {
		end();
		removChat(username);
		consoleMessage(`${username}사용자를 타임아웃 (30s)`);
	};
	// ban
	bord.C("button").attr("title","벤").html(`<i class="fas fa-ban"></i>`).onclick = () => {
		end();
		removChat(username);
		consoleMessage(`${username}사용자를 차단함`);
	};
	if(msg){
		/// delete message
		bord.C("button").attr("title","메세지 삭제").html(`<i class="far fa-times-circle"></i>`).onclick = () => {
			end();
			removChat(id);
			consoleMessage(`${id}메세지를 삭제함`);
		};
		// reply message
		bord.C("button").attr("title","답장").html(`<i class="far fa-comment-alt"></i>`).onclick = () => {
			const bord = document.createElement("span");
			const end = onDialogue(bord, ()=>{ end() });
			bord.onclick = (event)=>{event.stopPropagation()};
	
			bord.parentNode.styles("z-index", "99999");
			bord.C("p").html(`${nick}님께 답장하기`);
			const input = bord.C("input").attr("type", "text").attr("placeholder", "내용을 입력해 주세요!");
			const click = ()=>{
				if(input.value && input.value.length <= 0)return;
				end();
				consoleMessage(`${username} 님께 답장 :${input.value}`);
				window.client.reply(channel,id, input.value);//메세지 전송
			};
			bord.C("br").C("button").html("전송").onclick = click;
			input.onkeypress=onKeypress(click, 1);// 키 이벤트
			input.focus();
			bord.C("button").html("취소").onclick = end;
		};
	}
}

function sendChat(msg){// 채팅 전송
	console.log("[send]", msg);
	consoleMessage(`[send] ${msg}`, 'blue');
	if(window.client && !is_test)
		window.client.say(`#${window.broadcaster.login}`,msg);
}

function banUser(user){// 벤
	console.log("[ban]", user);
	removeConsole(user);
	if(window.client && !is_test)
		window.client.ban(`#${window.broadcaster.login}`, user, "당신은 필터에 의해 제거되었습니다");

}
function timeoutUser(user, time){// 채팅 전송
	console.log("[timeout]", time, user);
	removeConsole(user);
	if(window.client && !is_test)
		window.client.timeout(`#${window.broadcaster.login}`, user, time, `당신은 필터에 의해 ${time}동안 차단당하였습니다`);
}
function removChat(msg_id){// 채팅 전송
	console.log("[remove]", msg_id);
	removeConsole(msg_id);
	if(window.client && !is_test)
		window.client.deletemessage(`#${window.broadcaster.login}`, msg_id);
}

function removeConsole(msg_id,f){
	try{
		const list = document.getElementById("console").getElementsByClassName(msg_id);
		for (let i = 0; i < list.length; i++)
			if(list[i]){
				list[i].addClass("delete_message");
				if(f)f(list[i]);
			}
	}catch(e){
		console.error(e);
	};// 오류처리
}
//subsModeConsole

// function highlightedConsole(msg_id){
// 	try{
// 		document.getElementById("console").getElementsByClassName(msg_id).forEach(element=>{
// 			element.addClass("highlighted_message");
// 		});
// 	}catch(e){;};// 오류처리
// }

// function subsModeConsole(msg_id){
// 	try{
// 		document.getElementById("console").getElementsByClassName(msg_id).forEach(element=>{
// 			element.addClass("subs_mode");
// 		});
// 	}catch(e){console.log(e);};// 오류처리
// }

function consoleMessage(message, color = "red") {
	const console_div = document.getElementById("console");
	if(window.autoscroll)scrollDiv(document.getElementById("console_scroll"));
	return console_div.C("p").html(`[console] ${message}`).styles("background", color).styles("color", "#fff");
}

//======================================================================================
/**
 * 챗봇 탐지
 */
function chatbot(){
	const bord = document.createElement("span");
	const end = onDialogue(bord, ()=>{ end() });
	bord.onclick = (event)=>{event.stopPropagation()};

	bord.C("p").html("인식채팅은 최대한 일치하게 적어 주세요!");
	const text = bord.C("input");
	text.setAttribute("placeholder", "탐색할 채팅을 입력해 주세요");
	text.styles("width","200px");
	
	bord.C("br");
	bord.C("button").html("탐색").onclick = function(){
		if(text.value.length < 5){
			alert("위험성 때문에, 5자 이상으로 제한합니다.");
			return;
		}
		end();
		filterChatbot(text.value);
	};
	bord.C("button").html("취소").onclick = end;
}

function filterChatbot(msg){
	if(!msg || msg.length < 5){//무시
		return;
	}
	
	const bord = document.createElement("span");

	const end = onDialogue(bord, ()=>{ end() });
	bord.onclick = (event)=>{event.stopPropagation()};

	bord.C("p").html(`${msg}와 일치하는 채팅목록 (클릭시 예외처리)`);
	bord.styles("width", "500px");
	bord.styles("height", "400px");

	const comm = bord.C("div");// 커맨드창
	
	comm.styles("overflow-y", "scroll");
	comm.styles("overflow-x", "hiddin");
	comm.styles("width", "100%");
	comm.styles("height", "88%");

	let isCancle = false;

	bord.C("button").html("취소").onclick = () => {isCancle = true; end()};

	const filter = [];
	window.chatting_log.forEach(({user,msg: message, msg_id}) => {
		if(isCancle)return;
		if(message.includes(msg)){
			const data = {user,msg_id}
			filter.push(data);
			comm.C("p").addClass("hover_pointer").html(`${user.username}(${msg_id}) : ${message}`).styles("overflow","hidden").styles("cursor","pointer").onclick = function(){
				const i = filter.indexOf(data);
				delete filter[i];
				this.remove();
			};
		}
	});
	bord.C("button").html("일괄 벤").onclick = () => {
		filter.forEach(({user})=>{
			banUser(user.login);
		});
		consoleMessage(`${filter.length}명을 일괄 벤 하였습니다.`);
		sendChat(`/me [tusubot] ${filter.length}명을 일괄 벤하였습니다.`);
		end();

	};
	bord.C("button").html("일괄 타임아웃(30초)").onclick = () => {
		filter.forEach(({user})=>{
			timeoutUser(user.login, 30);
		});
		consoleMessage(`${filter.length}명을 일괄 타임아웃(30s) 하였습니다.`);
		sendChat(`/me [tusubot] ${filter.length}명을 일괄 타임아웃(30s) 하였습니다`);
		end();
		// 처리
	};
	bord.C("button").html("일괄 채팅 삭제").onclick = () => {
		filter.forEach(({msg_id})=>{
			removChat(msg_id);
		});
		consoleMessage(`${filter.length}개의 채팅을 일괄 삭제 하였습니다.`);
		sendChat(`/me [tusubot] ${filter.length}개의 채팅을 일괄 삭제 하였습니다.`);
		end();
		// 처리
	};
	
}

//======================================================================================