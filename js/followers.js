
'use strict';
window.ver = "2.0.0";

const oauth_client_id = "4s1mf6ai6s5070n3ph8pnrud76gwda";
const oauth_redirect_uri = `${location.origin}${location.pathname}`;// 리다이렉션

const rawauth = document.location.href.replace("#", "?");
const channel = location.hash.substr(1) || getParams("state") || 0;//채널정보가 없을때 / 스코프 / 0
const permissions = ["user:manage:blocked_users", "user:edit:follows"]; // "chat:edit"

const oauth = getParams("o");
const access_token = getParams("access_token", rawauth);
const viewbot_follow = 20;

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

	// user:manage:blocked_users / user:edit:follows / chat:edit
	const _permiss = {
		"user:manage:blocked_users" : "사용자 차단",
		"user:edit:follows" : "사용자 언팔로우",
		"chat:edit" : "사용자 채팅 차단"
	}
	window.token.scope = window.token.scope || ["user:manage:blocked_users","user:edit:follows"]
	const permiss = window.token.scope.map(o=>_permiss[o]);
	document.getElementById("follower_sec").html(`${viewbot_follow}명`);
	document.getElementById("permiss").html(permiss.join(","))
	// 토큰정보 가져온 직후, 권한 혹은 유효한지 확인

	window.token.instance = axios.create({
		baseURL: 'https://api.twitch.tv/helix/',
		headers: { 
			'Authorization':  `Bearer ${window.token.access_token}`,
			"Client-Id" : oauth_client_id
		}
	});
	window.token.instance.get(`users?login=${channel}`).then(({data : {data}})=>{
		if(data.length){
			window.broadcaster = data[0];// 사용자 정보 확보
			document.getElementById("loading_channel").html(`<h1>${window.broadcaster.display_name}(${window.broadcaster.login})</h1>`);// 채널
			load_list();
		}
	}).catch(e=>console.error(e));
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

//=======================================================================================================
function search_view_bot(){
	const alert_ele = document.createElement("span").html("데이터를 불러오는중...");
	let count = 0;
	const allFunc = async (list, cursor, total)=>{
		count += list.length;
		alert_ele.html(`팔로우 사용자 ${count}/${total}`);
		if(cursor)
			list.push(... await getUserList(cursor, allFunc));
		return list
	}
	const end = onDialogue(alert_ele);

	const then = list =>{
		window.allList = list;

		alert_ele.html("팔로우 필터링중...");
		const times = {};
		let is_viewbot = 0;
		list.forEach(({f,i})=>{
			const time =  new Date(f).format("yyyy-MM-dd HH:mm");
			times[time] = times[time] || [];
			times[time].push(i);
			if(times[time].length >= viewbot_follow){
				is_viewbot = is_viewbot < times[time].length ? times[time].length : is_viewbot;
			}
		});
		if(is_viewbot){
			alert(`비정상적인 팔로우 관측 : 최소${is_viewbot}`);
		}else{
			alert(`비정상적인 팔로우가 관측되지 않았습니다.`);
			clear();
			list.forEach(element => {
				list_item(element);
			});
			end();
			return;
		}
		const filter = [];
		for(const [k, v] in times)
			if(v >= viewbot_follow)
				filter.push(k);
		
		const newList =  list.filter(o=>filter.includes(new Date(o.f).format("yyyy-MM-dd HH:mm")));
		alert_ele.html(`사용자 분류... ${newList.length}명 필터링됨`);
		
		clear();
		newList.forEach(element => {
			list_item(element);
		});
		end();
	}

	if(!window.allList){
		getUserList(false,allFunc).then(then).catch(e=>{});
	}else {
		then(window.allList);
	}
}

/**
 * 사용자 리스트를 불러옴
 * @param {*} cursor 
 * @param {*} f 
 * @returns 
 */
async function getUserList(cursor,f){
	try{
		const {data} = await window.token.instance.get(`users/follows?first=100&to_id=${window.broadcaster.id}${cursor? "&after=" + cursor :""}`);
		let c;
		if(data.pagination && data.pagination.cursor){
			c = data.pagination.cursor;
		}else {
			c = undefined;
		}
	
		const o = data.data.map(o=>{return {f: o.followed_at, i : o.from_id, l:o.from_login, n : o.from_name}});
		return f(o,c, data.total);
	}catch(e){
		console.log(e);
		alert("불러오는 도중, 에러가 발생하였습니다.");
		return [];
	}
}

/**
 * 사용자 리스트를 불러옴
 */
function load_list(cursor){
	if (!cursor) clear();
	const end = onDialogue(document.createElement("span").html("데이터를 불러오는중..."));
	getUserList(cursor, (list, cursor, total)=>{
		window.total = window.total || 0;
		if(window.total && window.total != total){
			alert(`불러오는 도중, 팔로우 사용자 변동 - ${total  - window.total}`);
		}
		window.total = total;
		document.getElementById("loading_channel_total").html(`${window.total}명`);
		if(cursor){
			append_bt.styles("display","block");//display: none;
			window.cursor = cursor;
		}else {
			window.allList = window.users;
			append_bt.styles("display","none");//display: none;
			window.cursor = undefined;
		}
		return list;
	}).then((list)=>{
		list.forEach(element => {
			list_item(element);
		});
		end();
		window.users = window.users|| [];
		window.users.push(...list);
	}).catch(e=>{
		alert("불러오는 도중, 에러가 발생하였습니다!");
		end();
	})
}
const target = document.getElementById("user_list");

/**
 * 아이템 1개 추가
 * @param {*} param0 
 */
function list_item({f,i,l,n}){
	const ele = target.C("table").addClass("user_item").styles("white-space","nowrap");
	
	ele.data("created_at",f);//구독일
	ele.data("id",i);//고유 id
	ele.data("login",l);// 로그인
	ele.data("name",n);// 이름
	
	let tr = ele.C("tr");
	let td = tr.C("td");

	tr.C("td").html(n==l?l:`${pad(n, 20)}(${l})`)
		.styles("text-overflow"+"ellipsis")
		.styles("cursor","pointer")
		.addClass("over_word")
		.onclick = function(){
			window.open(`https://www.twitch.tv/${l}`);
		};//이름

	// 사용자 정보 클릭
	td.html(`
		<svg aria-hidden="true" focusable="false" data-prefix="fas" style="height: 20px;width: 20px;" data-icon="user" class="svg-inline--fa fa-user fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path>
		</svg>
	`).onclick=function(){
		// 사용자 정보창
		window.open(
			`https://www.twitch.tv/popout/${channel}/viewercard/${this.parentNode.parentNode.data("login")}?popout=`,
			'_blank',
			"width=400, height=500, status=0, location=0,left=510, top=20"
		);
	}

	tr = ele.C("tr");
	tr.C("td").html("followd :"+new Date(f).format("yyyy-MM-dd(E)HH:mm:ss")).styles("font-size","0.5em");

	// 사용자 날자 선택
	tr.C("td").html('<a title="Start At"><i class="fas fa-long-arrow-alt-right"></i></a>').styles("cursor","pointer").onclick=function(){
		const day = this.parentNode.parentNode.data("created_at");
		document.getElementById("day_start").value = new Date(day).format("yyyy-MM-dd");
		document.getElementById("time_start").value = new Date(day).format("HH:mm");
	};

	//사용자 날자 선택
	tr.C("td").html('<a title="End At"><i class="fas fa-long-arrow-alt-right fa-rotate-180"></i></a>').styles("cursor","pointer").onclick=function(){
		const day = this.parentNode.parentNode.data("created_at");
		document.getElementById("day_end").value = new Date(day).format("yyyy-MM-dd");
		document.getElementById("time_end").value = new Date(day).format("HH:mm");
	};

	// tr.C("td").html("Create :" +new Date(i.user.created_at).format("yyyy-MM-dd(E)HH:mm:ss")).styles("font-size","0.5em");
	tr = ele.C("tr");
	tr.C("td").html('<a title="ban"><i class="fas fa-shield-alt"></i></a>').styles("cursor","pointer").onclick=function(){
		var table = this.parentNode.parentNode;
		unfollow_user(table.data("id"),true,function(){
			table.remove();
		});
	};
	tr.C("td").html('<a title="unfollow"><i class="fas fa-ban"></i></a>').styles("cursor","pointer").onclick=function(){
		var table = this.parentNode.parentNode;
		unfollow_user(table.data("id"),false,function(){
			table.remove();
		});
	};
}

function clear(){
	target.html("");
}

/**
 * 필터 초기화
 */
function reset(){
	document.getElementById("day_start").value ="";
	document.getElementById("day_end").value ="";
	document.getElementById("time_start").value ="";
	document.getElementById("time_end").value ="";
	window.tmp = 0;
	list_followers(window.users);
}

/**
 * 리스트 필터 함수
 * @param {*} l 타겟이 되는 리스트
 * @returns 필터링된 리스튼
 */
function list_filter(l){
	if (document.getElementById("day_start").value == "" && document.getElementById("day_end").value == "" &&
		document.getElementById("time_start").value == "" && document.getElementById("time_end").value == "")return l;
	let s_d = new Date((document.getElementById("day_start").value == ""? new Date("1999-01-01").format("yyyy-MM-dd"):document.getElementById("day_start").value) +" " + (document.getElementById("time_start").value == ""? new Date("1999-01-01 00:00").format("HH:mm"):document.getElementById("time_start").value));
	let e_d = new Date((document.getElementById("day_end").value == ""? new Date().format("yyyy-MM-dd") :document.getElementById("day_end").value ) +" " + (document.getElementById("time_end").value == ""? new Date().format("HH:mm"):document.getElementById("time_end").value));
	if(s_d > e_d){
		const tmp = s_d;
		s_d = e_d;
		e_d = tmp;
	}
	console.log(s_d, e_d);
	return l.filter(function({f}){
		const day = new Date(f);
		return (s_d <= day && day <= e_d);
	});
}

function unfollow_user(user,is_ban,f){
	window.token.instance.delete(`users/follows/?to_id=${window.broadcaster.id}&from_id=${user}`).then(o=>{
		if(is_ban){
			window.token.instance.put(`users/blocks?reason=harassment&source_context=chat&target_user_id=${user}`).then(o=>{
				if(typeof f == "function")f();
			}).catch(e=>{});
		}else if(typeof f == "function")f(); 
	}).catch(e=>{

	});
}

function unfollow_users(l,is_ban){
	if(confirm('사용자'+l.length+'명이 언팔로우 됩니다!\n진행하시겠습니까?')==true)
		l.forEach(({i})=>{
			unfollow_user(i,is_ban);
		});
		save(`unfollow_${is_ban?"ban":"unban"}.json`, JSON.stringify(l))// 리스트
}
//=======================================================================================================


function pad(n, width){
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(' ') + n;
}


function saveToFile_Chrome(fileName, content) {
    var blob = new Blob([content], { type: 'text/plain' });
    const objURL = window.URL.createObjectURL(blob);
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

function save(fileName, content){
	if(isIE())saveToFile_IE(fileName, content);
	else saveToFile_Chrome(fileName, content);
}
function isIE() {
    return (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) ||
        navigator.userAgent.toLowerCase().indexOf("msie") !== -1;
}