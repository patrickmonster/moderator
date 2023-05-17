"use strict";
window.ver = "3.0.0";

const oauth_client_id = "upe7qsmxj1soazkgf1ry7pf8w3d89u";
const oauth_redirect_uri = `${window.location.origin}${window.location.pathname}`; // 리다이렉션

const rawauth = document.location.href.replace("#", "?");
const channel = location.hash.substring(1) || getParams("state") || 0; //채널정보가 없을때 / 스코프 / 0

console.log(channel, rawauth);
const permissions = [
  "channel:moderate",
  "chat:edit",
  "whispers:edit",
  "channel:manage:broadcast", // 방송 정보 수정
  "channel:manage:predictions", // 채널 포인트
  "channel:manage:redemptions", // 채널 포인트 상환관리
  "user:manage:blocked_users",
  "moderator:manage:announcements", // 공지사항 전송
  "moderator:manage:automod", // 보류 메세지 관리
  "moderator:manage:banned_users", // 벤관리
  "moderator:manage:chat_messages", // 채팅 삭제
  "moderator:manage:chat_settings", // 채팅 설정
  "moderator:read:followers", // 채팅 설정
  "user:manage:whispers", // 채팅 설정
  "clips:edit", // 클립생성
];

const oauth = getParams("o");
const access_token = getParams("access_token", rawauth);
const chat_log_limit = 1000;

const is_test = false;

window.autoscroll = true;
window.autoscroll_follow = true;
window.command = {};
window.follows = {};

const modes_bool = {
  //is_only_emote
  "emote-only": "is_only_emote",
};
const modes_func = {
  "followers-only": followChangeSet,
  slow: slowchatChangeSet,
};

// 채팅 모드
const chat_mod = {
  "emote-only": "이모티콘 전용 모드",
  "followers-only": "팔로우 전용 모드",
  // "r9k" : "", // 뭔지몰라 - 일단 9자는 고유한 모드?
  slow: "느린 대화 모드",
  "subs-only": "구독자 전용 모드",
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
if (access_token) {
  // 토큰은 1회성 코드 (발급 당시 사용하고 바로 파기) - 코드발급 - 클라이언트 시크릿 유출
  const scope = getParams("scope", rawauth).split(" "); // 사용자 허용 범위
  const state = getParams("state", rawauth); // 타겟채널
  const jwt = window.jwt_encode({ access_token, scope, date: new Date() }); // 노출 방지를 위하여 키를 가립니다.

  location.href = `${location.origin}${location.pathname}?o=${jwt}#${state}`; // 토큰 적용하여 이동
} else if (!channel) {
  window.onload = function () {
    document.body.innerHTML = `
<div id="input_surch">
	<input id="user-input" type="text" value="" onkeypress="if(event.keyCode!=13)return;setChannel()" placeholder="채널의 id를 입력해 주세요!" focus="">
	<button onclick="setChannel()" style="transform: translate(-70px, 20px);">
		<svg aria-hidden="true" style="transform:translate(0px, 4px)" focusable="false" data-prefix="fas" data-icon="sign-in-alt" class="svg-inline--fa fa-sign-in-alt fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path fill="currentColor" d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"></path>
		</svg>
	</button>
</div>`;

    window.addStyle(
      "#input_surch:hover>button{opacity:1}#input_surch{position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);}#user-input{height: 60px;padding: 2px;width: 400px;border-radius: 50%;font-size: 2em;border: 0px;background: #333;color: #fff;border-radius: 30px;padding: 0 60px 0 14px;}button{height: 60px;opacity: 0;font-size: 2em;border: 0;border-radius: 50%;width: 60px;height: 60px;background: #fff;color: #000;padding: 0 10px 0 0;transform: translate(-60px, 0px);padding-left: 14px;transition: .4s;}"
    );

    document.head.C("script").html(`
function setChannel(){
	const channel = document.getElementById("user-input").value;
	console.log(channel)
	if (/[a-zA-Z0-9_]/.test(channel) && channel.length > 2 ){
		location.href = location.origin + location.pathname + '#' + channel;
		location.reload()
	}else alert("채널이 아닌거 같습니다.. 다시 입력해 주세요!");
}`);
  };
} else if (!oauth) {
  // 사용자 인증
  location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${oauth_client_id}&redirect_uri=${encodeURIComponent(
    oauth_redirect_uri
  )}&scope=${permissions.join("%20")}&state=${channel}`;
} else {
  window.token = window.jwt_decode(oauth, { header: true });

  if (window.token.date > new Date().setDate(new Date().getDate() - 1)) {
    // 일정시간 지나면, 토큰 갱신
    alert("토큰갱신");
    location.href = `${oauth_redirect_uri}${location.hash}`;
  }

  window.token.instance = axios.create({
    baseURL: "https://api.twitch.tv/helix/",
    headers: {
      Authorization: `Bearer ${window.token.access_token}`,
      "Client-Id": window.token.client_id || oauth_client_id,
    },
  });

  window._channel = function (str) {
    const channel = (str ? str : "").toLowerCase();
    return channel[0] === "#" ? channel : "#" + channel;
  };
  window.onload = () => {
    const end = onDialogueLoading("채널정보를 불러오는중...");
    window.token.instance.get("users").then(({ data: { data } }) => {
      if (!data.length) return; // 사용자가 없다?
      const { login: username } = data[0];
      console.log(data[0]);
      const client = new tmi.Client({
        options: {
          debug: is_test,
          level: "warn",
        },
        connection: { reconnect: true, secure: true },
        identity: { username, password: window.token.access_token },
        channels: [channel],
      });
      window.client = client;

      // 응답 객체 입니다
      client.reply = (channel, msg_id, message) => {
        this.log.info(`[${channel}] Reply message: ${command}`);
        if (msg_id)
          this.ws.send(
            `@reply-parent-msg-id=${msg_id} PRIVMSG ${window._channel(
              channel
            )} :${message}`
          );
      };
      client
        .on("connected", (s, p) => {
          client.popup(
            document
              .createElement("span")
              .html(`트위치 채팅채널에 정상적으로 연결되었습니다! ${s}(${p})`)
              .styles("background", "blue")
              .styles("color", "#fff"),
            30
          );

          consoleMessage(`트봇이 트위치에 연결되었습니다. (V.${window.ver})`);
        })
        .on("join", (channel, username, self) => {
          if (self)
            client.popup(
              document
                .createElement("span")
                .html(`${channel}에 연결됨`)
                .styles("background", "blue")
                .styles("color", "#fff"),
              30
            );
        })
        .on("part", (channel, username, self) => {
          if (self)
            client.popup(
              document
                .createElement("span")
                .html(`${channel}에 퇴장됨`)
                .styles("background", "blue")
                .styles("color", "#fff"),
              30
            );
        })
        .on("reconnect", () => {
          client.popup(
            document
              .createElement("span")
              .html(`서버가 불안정하여 재접속을 시도합니다...`)
              .styles("background", "red")
              .styles("color", "#fff"),
            30
          );
        })
        .on("chat", (channel, userstate, message, self) => {
          if (!self) addChat(userstate, message, userstate.id);
        })
        .on("emotesets", (sets, obj) => {
          const ids = client.emotes.split(",").reverse();
          const emots = document.getElementById("emots");
          emots.html("");
          for (const id of ids) {
            if (!obj[id]) continue;
            for (const { code, id: _id } of obj[id]) {
              emots
                .C("img")
                .attr(
                  "src",
                  `https://static-cdn.jtvnw.net/emoticons/v1/${_id}/2.0`
                )
                .attr("title", code).onclick = () => {
                const chat = document.getElementById("chat");
                if (
                  chat.value.length &&
                  chat.value[chat.value.length - 1] != " "
                )
                  chat.value += " ";
                chat.value = `${chat.value}${code} `;
              };
            }
            emots.C("line");
          }
        })
        .on("ban", (channel, username, reason) => {
          removeConsole(username);
          console.log("벤", username);
          const ele = consoleMessage(
            `(유저 벤) ${username} ${reason || ""}`,
            "blue"
          ).styles("cursor", "pointer");
          client.popup(ele, -1);
          ele.onclick = () => {
            window.open(
              `https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${username}?popout=`
            );
          };
        })
        .on("timeout", (channel, username, reason, duration) => {
          removeConsole(username);
          console.log("타임아웃", duration, username);
          const ele = consoleMessage(
            `(유저 타임아웃 ${duration}) ${username} ${reason || ""}`,
            "blue"
          ).styles("cursor", "pointer");
          client.popup(ele, -1);
          ele.onclick = () => {
            window.open(
              `https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${username}?popout=`
            );
          };
        })
        .on(
          "messagedeleted",
          (channel, username, deletedMessage, userstate) => {
            console.log("메세지 삭제", username, deletedMessage);
            removeConsole(userstate.id, (element) => {
              console.log(element.getPosition());
              client.popup(
                consoleMessage(`(메세지 삭제) ${username}`, "blue"),
                -1
              );
            });
          }
        )
        .on("hosted", (channel, username, viewers, autohost) => {
          if (!autohost) {
            consoleMessage(`(호스팅 ${viewers}) ${username}`, "blue");
            newExcitingAlerts(`호스팅 - ${username}`);
            client.popup(
              document
                .createElement("span")
                .html(`(호스팅 ${viewers}) ${username}`)
                .styles("background", "blue")
                .styles("color", "#fff"),
              30
            );
          }
        })
        .on("redeem", (channel, username, rewardType, tag) => {
          switch (rewardType) {
            case "highlighted-message":
              client.msg_op = {
                id: tag.id,
                rewardType: "highlighted_message",
              };
              break;
            case "skip-subs-mode-message":
              client.msg_op = { id: tag.id, rewardType: "subs_mode" };
              break;
            default:
              console.log("(유저보상)", username, rewardType);
              client.popup(
                document
                  .createElement("span")
                  .html(`(포인트 보상[${rewardType}]) ${username}`)
                  .styles("background", "blue")
                  .styles("color", "#fff"),
                30
              );
              consoleMessage(
                `(포인트 보상[${rewardType}]) ${username}`,
                "blue"
              );
              break;
          }
        })
        .on("automod", (channel, msgID, message) => {
          //본인메세지만
          if (msgID == "msg_rejected") {
            consoleMessage(`(AutoMod) 메세지가 보류중... ${message}`, "blue");
          } else {
            consoleMessage(
              `(AutoMod) 메세지가 게시되지 않았습니다 ${message}`,
              "red"
            );
          }
        });

      client.on("roomstate", (channel, state) => {
        console.log(state);
        for (const k in chat_mod) {
          if (modes_bool[k])
            document.getElementById(modes_bool[k]).checked = state[k]; // bool 형 데이터 삽입
          if (modes_func[k]) modes_func[k](state[k]); // func처리형 삽입
          // state[k] 가 존재하고
          if (k == "followers-only") {
            if (state[k] == false) state[k] = 0;
            else if (state[k] == -1) {
              state[k] = false;
            }
          }
          if (state[k] !== false && state[k] !== undefined) {
            let is = false;
            console.log(k, state[k]);
            const event = () => {
              if (is) return;
              is = true;
              const off = `${k.replace(/-/g, "")}off`;
              client[off](channel);
              consoleMessage(`(채팅모드) ${chat_mod[k]} 해제됨`, "green");
              client.popup(
                document
                  .createElement("span")
                  .html(`(채팅모드) ${chat_mod[k]} 해제됨`)
                  .styles("background", "green")
                  .styles("color", "#fff"),
                30
              );
            };

            const popup = document
              .createElement("span")
              .html(
                `(채팅모드) ${chat_mod[k]} ${state[k] ? " - " + state[k] : ""}`
              )
              .styles("background", "red")
              .styles("color", "#fff");
            client.popup(popup, 60);
            popup.onclick = event;
            consoleMessage(
              `(채팅모드) ${chat_mod[k]} ${state[k] ? " - " + state[k] : ""}`,
              "red"
            )
              .styles("cursor", "pointer")
              .attr("title", `${chat_mod[k]}해제하기`).onclick = event;
          } else {
          }
        }
      });

      //roomstate(channel: string, state: RoomState): void;
      //
      client.popup = Popup();
      client.connect().catch(console.error); // 연결 - 임시 주석

      if (window.opener != null) {
        window.opener.location.href = "about:blank";
        window.opener.document.write(
          "페이지가 탭으로 넘어갔습니다. 창을 닫으셔도 좋습니다!"
        );
        document.title = "트봇mini - Leaderboards";
      }
    });

    window.command = JSON.parse(
      localStorage.getItem(`moderator_${channel}`) || `{}`
    );
    console.log(`moderator_${channel}`, window.command);
    for (const k in window.command) {
      console.log(k, window.command[k]);
      addCommandTxt(k, window.command[k]);
    }

    setBrodcast((o) => {
      // 스트리머 정보
      initTime(); // 시간 루퍼
      initBadges(); // 배찌 불러오기
      getStream(end); // 스트림 여부
      getFollows();

      setInterval(getStream, 5 * 60 * 1000); // 스트림 상태 - 임시 주석
      setInterval(getFollows, 5 * 60 * 1000); // 팔로우 리스트
    });
  };
}
