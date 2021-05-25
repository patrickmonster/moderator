'use strict';
window.ver = "2.0.0";

const oauth_client_id = "upe7qsmxj1soazkgf1ry7pf8w3d89u";
const oauth_redirect_uri = `${location.origin}${location.pathname}`;// 리다이렉션

const rawauth = document.location.href.replace("#", "?");
const channel = location.hash.substr(1) || getParams("state") || 0;//채널정보가 없을때 / 스코프 / 0
const permissions = ["channel:moderate", "whispers:edit", "clips:edit"]; // "chat:edit"

const oauth = getParams("o");
const access_token = getParams("access_token", rawauth);
const chat_log_limit = 1000;

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
				<button onclick="setChannel()" style="transform: translate(-60px, 4px);">
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
	window.token.instance.get("users").then(({data: {data}}) =>{
		console.log(data[0]);
		if(!data.length)return;// 사용자가 없다?
		const {login : username , id} = data[0];
		// window.client = new tmi.Client({
		// 	connection: { reconnect: true, secure: true },
		// 	identity: { username,password: window.token.access_token},
		// });
		// window.client.on("chat",(channel, userstate, message, self)=>{
		// 	if(self)return;
		// 	addChat(userstate, message, userstate.id);
		// });
	})

	setBrodcast((o)=>{// 스트리머 정보
		getStream(()=>{// 스트림 여부
			initTime();// 시간 루퍼
		});
		setInterval(getStream, 5 * 60 * 1000);// 스트림 상태
	});
}

//http://localhost:3000/moderator/mini.html?o=eyJhY2Nlc3NfdG9rZW4iOiJrc2xxYWIzc3lqaW16em5sMWQ0MjBkNGZrdmtlYjAiLCJzY29wZSI6WyJjaGFubmVsOm1vZGVyYXRlIiwid2hpc3BlcnM6ZWRpdCIsImNsaXBzOmVkaXQiXSwiZGF0ZSI6IjIwMjEtMDUtMjVUMDI6MTI6NDkuNTk2WiJ9.c2VjcmV0#ju10506

// 가독성 떨어지게 하는 코드
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
function onDialogue(html){
	const dia = document.body.C("div");
	dia.addClass("dialogue");
	dia.onclick =()=>{}; // 클릭무시

	const parent = document.body;//맨앞으로 이동
	parent.insertBefore(dia, parent.firstChild);
	dia.appendChild(html);
	return function end(){
		dia.remove();
	}
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
 * https://dev.twitch.tv/docs/api/reference#create-poll
 * 설문조사 생성
 * 권한 channel:manage:polls
 * POST https://api.twitch.tv/helix/polls
 * @param {} f
 */
function makePolls(f,title = "셈플설문조사",choics = [{title:"설문1"},{title:"설문2"}],duration = 1800, subOption = {}){
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
		choics,
		duration,
		bits_voting_enabled,
		bits_per_vote,
		channel_points_voting_enabled,
		channel_points_per_vote
	}).then(({data})=>{
		const {id} = data[0];
		f(id);
	}).catch(e=>{
		console.error(e);
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
	window.token.instance.post(`clips?broadcaster_id=${window.broadcaster.id}`).then(({data})=>{
		data.forEach(({id, edit_url})=> {
			f(id,edit_url);
		});
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

function getStream(f){
	window.token.instance.get(`streams?user_id=${window.broadcaster.id}`).then(({data : {data}})=>{
		window.static_time = new Date("1900-01-01 00:00:00");
		if(data.length){// 방송중일때 데이터 넘김
			const {title, user_login, user_name, started_at} = data[0];
			document.getElementById("channel").html(`${user_name}(${user_login})`);
			document.getElementById("title").html(title);
			document.getElementById("is_online").html("On-line").styles("background", "red");
			window.static_time.setTime(new Date().getTime() - new Date(started_at).getTime());// 시간 연산
			if(f)f(data[0]);
		}else {
			document.getElementById("is_online").html("Off-line").styles("background", "blue");
			getChannelStates();// 방송중이 아닐때, 정보 전달
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
	const end = onDialogue(bord);

	const command = bord.C("input");
	command.setAttribute("type", "text");
	command.setAttribute("placeholder", "명령어를 입력해 주세요");
	const msg = bord.C("input");
	msg.setAttribute("type", "text");
	msg.setAttribute("placeholder", "출력할 내용을 입력해 주세요");
	bord.C("br");
	bord.C("button").html("취소").onclick = end;
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
		if(f)f(command.value, msg.value);
		alert("저장되었습니다.");
		end();
	};
}

/**
 * 명령어 편집
 * @param {*} f 콜백
 * @param {*} target 타겟(key)
 * @param {*} is_msg 메세지 변경?
 */
function editCommand(f, target, is_msg = true){
	const bord = document.createElement("span");
	const end = onDialogue(bord);

	bord.C("input").html(target).setAttribute("readonly","readonly");

	const command = bord.C("input");
	command.setAttribute("type", "text");
	command.setAttribute("placeholder", is_msg ? "출력내용을 입력해 주세요!" : "명령어를 입력해 주세요");
	bord.C("br");
	bord.C("button").html("저장").onclick = function(){
		if(!is_msg && command.value.length < 3){
			alert("명령어는 최소 3자 이상으로 해주세요!");
			return;
		}else if( is_msg && msg.value.length < 1){
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
		alert("저장되었습니다.");
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
	const end = onDialogue(bord);
	
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
			id : setInterval(sendChat,time.value, msg.value)
		});
		alert("저장되었습니다.");
		if(f)f(msg.value,time.value);
		end();
	};
	bord.C("button").html("취소").onclick = end;
}

/**
 * 반복메세지 삭제
 * @param {*}} msg 
 */
function removeReservation(msg){
	const list = window.reservation_msg.filter(({msg: message})=> message == msg);
	list.forEach(o=>{
		clearInterval(o.id);
		delete window.reservation_msg[o];
	});
}
//======================================================================================

// 채팅 기본 checked

window.chatting_log = [];
function addChat(user, msg, msg_id){// 채팅기록관리
	window.chatting_log.push({user,msg, msg_id});
	if(chat_log_limit <= window.chatting_log.length)window.chatting_log.shift();
	if(document.getElementById("is_commands").checked){
		for (const k of window.command.keys()){
			if(msg.includes(k)){
				sendChat(window.command[k]);
				break;
			}
		}
	}else{
		const [comm, ...args] = msg;
		if(comm == "!클립"){
			createClips(({id,edit_url})=>{
				// 클립 url
				document.getElementById("console").C("p").html(`[console] ${id}클립생성 - ${edit_url}`);
				sendChat(`@${user.username} 클립생성! ${id}`);
				scrollDiv(document.getElementById("console_scroll"));
			});
		}
	}
	document.getElementById("console").C("p").html(`[${user.username}] ${msg}`);
	scrollDiv(document.getElementById("console_scroll"));
}

function sendChat(msg){// 채팅 전송
	console.log("[send]", msg);
	if(window.client)
		window.client.say(`#${window.broadcaster.login}`,msg);
}

function banUser(user){// 벤
	console.log("[ban]", user);
	if(window.client)
		window.client.ban(`#${window.broadcaster.login}`, user, "당신은 필터에 의해 제거되었습니다");

}
function timeoutUser(user, time){// 채팅 전송
	console.log("[timeout]", time, user);
	if(window.client)
		window.client.timeout(`#${window.broadcaster.login}`, user, time, `당신은 필터에 의해 ${time}동안 차단당하였습니다`);
}
function removChat(msg_id){// 채팅 전송
	console.log("[remove]", msg_id);
	if(window.client)
		window.client.deletemessage(`#${window.broadcaster.login}`, msg_id);
}


//======================================================================================
/**
 * 챗봇 탐지
 */
function chatbot(){
	const bord = document.createElement("span");
	const end = onDialogue(bord);

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
	const end = onDialogue(bord);
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
		document.getElementById("console").C("p").html(`[console] ${filter.length}명을 일괄 벤 하였습니다.`);
		sendChat(`/me [tusubot] ${filter.length}명을 일괄 벤하였습니다.`);
		scrollDiv(document.getElementById("console_scroll"));
		end();
		//처리

	};
	console.log(filter.length);
	bord.C("button").html("일괄 타임아웃(30초)").onclick = () => {
		filter.forEach(({user})=>{
			timeoutUser(user.login, 30);
		});
		document.getElementById("console").C("p").html(`[console] ${filter.length}명을 일괄 타임아웃(30s) 하였습니다.`);
		sendChat(`/me [tusubot] ${filter.length}명을 일괄 타임아웃(30s) 하였습니다`);
		scrollDiv(document.getElementById("console_scroll"));
		end();
		// 처리
	};
	bord.C("button").html("일괄 채팅 삭제").onclick = () => {
		filter.forEach(({msg_id})=>{
			removChat(msg_id);
		});
		document.getElementById("console").C("p").html(`[console] ${filter.length}개의 채팅을 일괄 삭제 하였습니다.`);
		sendChat(`/me [tusubot] ${filter.length}개의 채팅을 일괄 삭제 하였습니다.`);
		scrollDiv(document.getElementById("console_scroll"));
		end();
		// 처리
	};
	
}

//======================================================================================
/**
 * 
 * @param {Function} f 아이템 클릭 이벤트(콜백)
 * @param {Element} target 
 * @param  {...element} items 
 */
function appendItem(f, target ,...items){
	if(!target)return false;
	items.forEach(element=>target.appendChild(element));
}
