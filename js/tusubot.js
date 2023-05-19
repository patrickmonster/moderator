"use strict";
window.ver = "4.0.3";

const is_test = false;

if (!window.tusu) {
  // 코드 보호

  const rawauth = document.location.href.replace("#", "?");

  const SystemOptions = {
    oauth: getParams("o"),
    access_token: getParams("access_token", rawauth),
    chat_log_limit: 10000,
    channel: location.hash.substring(1) || getParams("state") || 0, //채널정보가 없을때 / 스코프 / 0
    oauth_client_id: "upe7qsmxj1soazkgf1ry7pf8w3d89u",
    oauth_redirect_uri: `${window.location.origin}${window.location.pathname}`,
    permissions: [
      "channel:moderate",
      "chat:edit",
      "chat:read",
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
      // "clips:edit", // 클립생성
    ],
  };

  console.log(rawauth, SystemOptions);

  /*
    순서
    1. 타겟채널 - 채널의 사용자 정보를 일단 불러옴
    2. 채널에 사용자 정보를 불러오기 위한 토큰 정보
    3. 사용자 정보를 불러오는 페이지
    - 이전처럼 사용자 정보를 세션 및 클라이언트 스토리지에 저장하지 않음. -
    jinu6734
  */
  ////////////////////////////////////////////////////////////////////////////////////////////
  if (SystemOptions.access_token) {
    console.log("TUSU] 토큰 발급됨");
    // 토큰은 1회성 코드 (발급 당시 사용하고 바로 파기) - 코드발급 - 클라이언트 시크릿 유출
    const scope = getParams("scope", rawauth).split(" "); // 사용자 허용 범위
    const state = getParams("state", rawauth); // 타겟채널
    const jwt = window.jwt_encode({
      access_token: SystemOptions.access_token,
      scope,
      date: new Date(),
    }); // 노출 방지를 위하여 키를 가립니다.

    location.href = `${location.origin}${location.pathname}?o=${jwt}#${state}`; // 토큰 적용하여 이동
  } else if (!SystemOptions.channel) {
    console.log("TUSU] 채널이 지정되지 않음");
    window.addEventListener("load", () => {
      document.body.innerHTML = `
<div id="input_surch" style="color:#fff">
    <h1>트봇</h1><h3>트수가 관리하는 채팅방</h3>
    <input id="user-input" type="text" value="" onkeypress="if(event.keyCode!=13)return;setChannel()" placeholder="채널의 id를 입력해 주세요!" focus="">
    <button onclick="setChannel()" style="transform: translate(-67px, 3px);">
      <svg aria-hidden="true" style="transform:translate(0px, 4px)" focusable="false" data-prefix="fas" data-icon="sign-in-alt" class="svg-inline--fa fa-sign-in-alt fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"></path>
      </svg>
    </button>
    <h5>create by.patrickmonster</h5>
  </div>`;

      window.addStyle(
        "#input_surch:hover>button{opacity:1}#input_surch{position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);}#user-input{height: 60px;padding: 2px;width: 400px;border-radius: 50%;font-size: 2em;border: 0px;background: #333;color: #fff;border-radius: 30px;padding: 0 60px 0 14px;}button{height: 60px;opacity: 0;font-size: 2em;border: 0;border-radius: 50%;width: 60px;height: 60px;background: #fff;color: #000;padding: 0 10px 0 0;transform: translate(-60px, 0px);padding-left: 14px;transition: .4s;}"
      );

      document.head.C("script").html(`
  function setChannel(){
    const channel = document.ID("user-input").value;
    console.log(channel)
    if (/[a-zA-Z0-9_]/.test(channel) && channel.length > 2 ){
      location.href = location.origin + location.pathname + '#' + channel;
      location.reload()
    }else alert("채널이 아닌거 같습니다.. 다시 입력해 주세요!");
  }`);
    });
  } else if (!SystemOptions.oauth) {
    console.log("TUSU] 토큰없음");
    // 사용자 인증
    location.href = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${
      SystemOptions.oauth_client_id
    }&redirect_uri=${encodeURIComponent(
      SystemOptions.oauth_redirect_uri
    )}&scope=${SystemOptions.permissions.join("%20")}&state=${
      SystemOptions.channel
    }`;
  } else {
    console.log("TUSU] 로그인 시도...");
    const token = window.jwt_decode(SystemOptions.oauth, { header: true });

    if (token.date > new Date().setDate(new Date().getDate() - 1)) {
      // 일정시간 지나면, 토큰 갱신
      alert("토큰갱신");
      location.href = `${SystemOptions.oauth_redirect_uri}${location.hash}`;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////

    const api = axios.create({
      baseURL: "https://api.twitch.tv/helix/",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Client-Id": token.client_id || SystemOptions.oauth_client_id,
      },
    });

    ////////////////////////////////////////////////////////////////////////////////////////////

    // 스트림 정보를 불러옴

    const _channel = function (str) {
      const channel = (str ? str : "").toLowerCase();
      return channel[0] === "#" ? channel : "#" + channel;
    };

    window.onload = async () => {
      const {
        data: {
          data: [loginUser],
        },
      } = await api("users"); // 로그인 사용자 뉘신지?
      if (!loginUser) {
        alert("사용자를 찾을 수 없습니다! 없습니다!");
        return; // 사용자가 없다
      }
      tusu.loginChannel = loginUser;
      const { login: loginUserName } = loginUser;

      console.log("LOGIN]", loginUser);
      // 수신 채널 정보를 불러옴
      const {
        data: {
          data: [broadcastChannel],
        },
      } = await api.get(`users?login=${SystemOptions.channel}`);
      if (!broadcastChannel) {
        alert("채널의 정보가 없습니다!");
        location.href = SystemOptions.oauth_redirect_uri;
        return;
      }
      tusu.targetChannel = broadcastChannel;

      // 배찌 정보를 불러옴
      try {
        const {
          data: { data },
        } = await api.get("/chat/badges/global");

        console.log("TUSU] 배찌정보", data);
        for (const {
          set_id,
          versions: [{ image_url_2x }],
        } of data) {
          tusu.targetChannelBadges.set(set_id, image_url_2x);
        }
      } catch (e) {
        console.error(e);
      }
      tusu.streamStatus();
      setInterval(tusu.streamStatus, 5 * 60 * 1000); // 스트림 상태 - 임시 주석

      twitchSocket = new tmi.Client({
        options: { debug: true, level: "warn" },
        connection: { reconnect: true, secure: true },
        identity: { username: loginUserName, password: token.access_token },
        channels: [SystemOptions.channel],
      });
      twitchSocket.connect().catch((err) => console.error(err));

      // 이벤트 등록
      Object.keys(tusu.on).forEach((name) => {
        console.log("EVENT] import", name);
        twitchSocket.on(name, tusu.on[name]);
      });

      twitchSocket.reply = (channel, msg_id, message) => {
        if (msg_id)
          this.ws.send(
            `@reply-parent-msg-id=${msg_id} PRIVMSG ${_channel(
              channel
            )} :${message}`
          );
      };
    }; // end onload

    let twitchSocket;

    const pop = Popup();

    /**
     * 스크롤 맨 위로
     * @param {*} target
     */
    function scrollDiv(target) {
      target.scrollTop = target.scrollHeight;
    }

    function consoleMessage(msg, color = "red") {
      if (tusu.autoscroll_console) scrollDiv(document.ID("console_scroll"));
      return document
        .ID("console")
        .C("tr")
        .C("td")
        .html(msg)
        .styles("background", color)
        .styles("color", "#fff")
        .styles("width", "100%");
      // return document
      //   .ID("console")
      //   .C("p")
      //   .html(`[CONSOLE] ${msg}`)
      //   .styles("background", color)
      //   .styles("color", "#fff");
    }

    function onDialogue(html, f) {
      const dia = document.body.C("div");
      dia.addClass("dialogue");
      dia.onclick = () => {
        if (f) f();
      }; // 클릭무시

      const parent = document.body; //맨앞으로 이동
      parent.insertBefore(dia, parent.firstChild);
      dia.appendChild(html);
      return function end() {
        dia.remove();
      };
    }

    const tusu = {
      autoscroll: true,
      autoscroll_follow: true,
      autoscroll_console: true,

      targetChannel: {},
      targetChannelState: {},
      targetChannelBadges: new Map(),

      event: {
        joinUser: () => {},
      },

      loginChannel: {},
      command: {},
      follows: {},
      chatting_log: [],
      chatting_user: [], // 채팅중인 사용자 리스트
      user_data: {}, // 사용자의 상세정보 ( 입장시 데이터가 로그인 아이디 밖에 없음을 해결)
      update: [
        { v: "2.1.0", title: "팔로우모드/슬로우 모드 적용" },
        { v: "2.1.1", title: "움직이는 이모티콘 적용" },
        { v: "3.0.0", title: "팔로우 리스트 보드" },
        { v: "4.0.0", title: "전체적인 개편" },
        { v: "4.0.1", title: "방문자 리스트 출력" },
        { v: "4.0.2", title: "채팅 로그 선택시, 사용자 조회" },
        { v: "4.0.3", title: "채팅 저장리밋 - 1만건으로 확장" },
        { v: "4.0.4", title: "로그창(콘솔분활), 채팅유저 정렬" },
        { v: "4.0.5", title: "기능창 제거 (임시), 로그 리스트 수정" },
      ],
      modes_bool: { "emote-only": "is_only_emote" },
      modes_func: { "followers-only": () => {}, slow: () => {} },
      chat_mod: {
        "emote-only": "이모티콘 전용 모드",
        "followers-only": "팔로우 전용 모드",
        // "r9k" : "", // 뭔지몰라 - 일단 9자는 고유한 모드?
        slow: "느린 대화 모드",
        "subs-only": "구독자 전용 모드",
      },

      // 이벤트 리스트 (채팅 이벤트)
      on: {
        connected(s, p) {
          pop(
            document
              .C()
              .html(`트위치 채팅채널에 정상적으로 연결되었습니다! ${s}(${p})`)
              .styles("background", "blue")
              .styles("color", "#fff"),
            30
          );
        },
        join(channel, username, self) {
          if (self) {
            pop(
              document
                .C()
                .html(`${channel}에 연결됨`)
                .styles("background", "blue")
                .styles("color", "#fff"),
              30
            );
            consoleMessage(`${channel}에 연결됨`);
          } else {
            //  사용자 입장처리
            tusu.chatting_user.push(username);
          }
        },
        part(channel, username, self) {
          if (self)
            pop(
              document
                .C()
                .html(`${channel}에 퇴장됨`)
                .styles("background", "blue")
                .styles("color", "#fff"),
              30
            );
        },
        reconnect() {
          pop(
            document
              .C()
              .html(`서버가 불안정하여 재접속을 시도합니다...`)
              .styles("background", "red")
              .styles("color", "#fff"),
            30
          );

          consoleMessage(`서버가 불안정하여 재접속을 시도합니다...`);
        },
        chat(channel, userstate, message, self) {
          if (!self) {
            const {
              username,
              "user-id": userid,
              id,
              color,
              badges,
            } = userstate;

            const nick =
              userstate["display-name"] == userstate.username
                ? userstate.username
                : `${userstate["display-name"]}<p style='font-size:0.2em;display:contents;'>${userstate.username}</p>`;

            tusu.chatting_log.push({
              user: { username, nick, color, badges, userid },
              message,
              id,
            });

            // 신규입장 이벤트
            if (!tusu.user_data[username] && tusu.event.joinUser)
              tusu.event.joinUser({
                username,
                nick,
                userid,
                color,
                badges,
              });
            // 사용자 정보를 밀어넣음
            tusu.user_data[username] = {
              username,
              nick,
              userid,
              color,
              badges,
            };

            // 로그가 넘치는 경우 삭제
            if (SystemOptions.chat_log_limit <= tusu.chatting_log.length)
              tusu.chatting_log.shift();

            tusu.addChat(userstate, message);
          }
        },
        emotesets(sets, obj) {
          const ids = twitchSocket.emotes.split(",").reverse();
          const emots = document.ID("emots").html("");

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
                const chat = document.ID("chat");
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
        },
        ban(channel, username, reason) {
          tusu.removeConsole(username);
          pop(
            consoleMessage(`(유저 벤) ${username} ${reason || ""}`, "blue")
              .styles("cursor", "pointer")
              .on("click", () => {
                window.open(
                  `https://www.twitch.tv/popout/${channel}/viewercard/${username}?popout=`
                );
              }),
            -1
          );
        },
        timeout(channel, username, reason, duration) {
          tusu.removeConsole(username);
          pop(
            consoleMessage(
              `(유저 타임아웃 ${duration}) ${username} ${reason || ""}`,
              "blue"
            )
              .styles("cursor", "pointer")
              .on("click", () => {
                window.open(
                  `https://www.twitch.tv/popout/${channel}/viewercard/${username}?popout=`
                );
              }),
            -1
          );
        },
        messagedeleted(channel, username, deletedMessage, userstate) {
          tusu.removeConsole(userstate.id, (element) => {
            pop(consoleMessage(`(메세지 삭제) ${username}`, "blue"), -1);
          });
        },
        hosted(channel, username, viewers, autohost) {
          consoleMessage(`(호스팅 ${viewers}) ${username}`, "blue");
          pop(
            document
              .C()
              .html(`(호스팅 ${viewers}) ${username}`)
              .styles("background", "blue")
              .styles("color", "#fff"),
            30
          );
        },
        redeem(channel, username, rewardType, tag) {}, // 포인트
        automod(channel, msgID, message) {
          if (msgID == "msg_rejected") {
            consoleMessage(`(AutoMod) 메세지가 보류중... ${message}`, "blue");
          } else {
            consoleMessage(
              `(AutoMod) 메세지가 게시되지 않았습니다 ${message}`,
              "red"
            );
          }
        },
        roomstate(channel, state) {
          const { chat_mod, modes_bool, modes_func } = tusu;
          for (const k in chat_mod) {
            if (modes_bool[k]) document.ID(modes_bool[k]).checked = state[k];
            if (modes_func[k]) modes_func[k](state[k]);
            if (k == "followers-only") {
              if (state[k] == false) state[k] = 0;
              else if (state[k] == -1) state[k] = false;
            }

            if (state[k] !== false && state[k] !== undefined) {
              let is = false;
              console.log(k, state[k]);
              const event = () => {
                if (is) return;
                is = true;
                const off = `${k.replace(/-/g, "")}off`;
                // client[off](channel); // ???
                pop(
                  document
                    .C()
                    .html(`(채팅모드) ${chat_mod[k]} 해제됨`)
                    .styles("background", "green")
                    .styles("color", "#fff")
                );
              };
              const popup = document
                .C()
                .html(
                  `(채팅모드) ${chat_mod[k]} ${
                    state[k] ? " - " + state[k] : ""
                  }`
                )
                .styles("background", "red")
                .styles("color", "#fff")
                .on("click", event);
              pop(popup, 60);
              consoleMessage(
                `(채팅모드) ${chat_mod[k]} ${state[k] ? " - " + state[k] : ""}`,
                "red"
              )
                .styles("cursor", "pointer")
                .attr("title", `${chat_mod[k]}해제하기`).onclick = event;
            }
          }
        },
      },

      /**
       * 공용 api
       */
      get api() {
        // api 전송
        return api;
      },

      messageToHTML(message, { emotes }) {
        if (!emotes) return message;

        const stringReplacements = [];
        Object.entries(emotes).forEach(([id, positions]) => {
          const position = positions[0];
          const [start, end] = position.split("-");
          const stringToReplace = message.substring(
            parseInt(start, 10),
            parseInt(end, 10) + 1
          );

          stringReplacements.push({
            stringToReplace: stringToReplace,
            replacement: isNaN(id)
              ? `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0">`
              : `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0">`,
          });
        });

        const messageHTML = stringReplacements.reduce(
          (acc, { stringToReplace, replacement }) => {
            return acc.split(stringToReplace).join(replacement);
          },
          message
        );
        return messageHTML;
      },

      /**
       * 메세지를 추가함 (통합함수) 필터 및 기록
       * @param {ChatUserstate} user 사용자
       * @param {String} msg 메세지
       * @param {String} msg_id 메세지 id
       */
      addChat(user, msg) {
        const chat_div = document.ID("chat");

        // console.log(user, msg);
        // const [comm, ...args] = msg.split();
        // 명령처리
        user.msg = this.messageToHTML(msg, user);
        user.nick =
          user["display-name"] == user.username
            ? user.username
            : `${user["display-name"]}<p style='font-size:0.2em;display:contents;'>${user.username}</p>`;
        chat_div
          .C("p")
          .styles("width", "100%")
          .styles("text-align", "left")
          .addClass("hover_pointer")
          .addClass(user.username)
          .addClass(user.id)
          .addClass("none")
          .styles("cursor", "pointer")
          .html(
            `<span style="width:1px;height:1px" class=span_front>${new Date(
              user["tmi-sent-ts"]
            ).format("hh:mm")}</span>[<span style="color:${
              user.color || "#fff"
            }">${user.nick}</span>] ${user.msg}`
          )
          .on("click", () => tusu.userprofile(user));

        if (window.tusu.autoscroll) scrollDiv(chat_div.parentNode);
      },

      /**
       * 스트림 정보를 불러옴
       */
      async streamStatus() {
        //
        try {
          const {
            data: { data: channelState },
          } = await this.api.get(`streams?user_id=${tusu.targetChannel.id}`);

          console.log("TUSU] 채널상태", channelState);

          tusu.static_time = new Date("1900-01-01 00:00:00");
          if (channelState.length) {
            const { title, user_login, user_name, started_at, game_name } =
              channelState[0];
            document.ID("channel").html(`${user_name}(${user_login})`);
            document.ID("title").html(title);
            document.ID("game").html(game_name);

            document
              .ID("is_online")
              .html("On-line")
              .styles("background", "red");

            tusu.static_time.setTime(
              new Date().getTime() -
                new Date(started_at).getTime() +
                new Date().getTimezoneOffset() * 60000
            );

            tusu.is_online = true;
          } else {
            tusu.is_online = false;
            document
              .ID("is_online")
              .html("Off-line")
              .styles("background", "blue");
          }
        } catch (e) {
          console.error(e);
        }
      },

      /**
       * 팝업 보드를 생성합니다.
       * @returns Element
       */
      createPopBord() {
        const bord = document
          .C()
          .on("click", (e) => e.stopPropagation())
          .styles("width", "500px")
          .styles("height", "auto");
        const end = onDialogue(bord, () => end());

        return { bord, end };
      },

      /**
       * 배찌 정보를 불러옵니다
       * @param {*} badges
       * @returns
       */
      getBadges(badges) {
        let out = [];
        for (const k in badges) {
          out.push(tusu.targetChannelBadges.get(k));
        }
        out = out.filter((o) => o != undefined);
        return out.map((o) => `<img src=${o} />`).join("");
      },

      /**
       * 프로필 정보를 팝업으로 출력합니다.
       * @param {*} param0
       */
      userprofile({ username, nick, id, color, badges, msg }, html = []) {
        const { bord, end } = this.createPopBord();

        bord
          .C("p")
          .html(`${this.getBadges(badges)}${nick}`)
          .styles("color", color || "#000")
          .styles("cursor", "pointer")
          .attr("title", "사용자 채팅 기록")
          .on("click", () => {
            window.open(
              `https://www.twitch.tv/popout/${tusu.targetChannel.login}/viewercard/${username}?popout=`
            );
          });
        //

        if (msg) {
          bord.C("line");
          // bord.C("p").html("내용");
          bord.C("p").html(msg);
        }

        if (html && html.length) {
          // 첨부 내용
          bord.C("line");
          for (const item of html) bord.C("p").html(item);
        }

        bord.C("line");
        bord
          .C("button")
          .attr("title", "타임아웃 (30s)")
          .html(`<i class="fas fa-shield-alt"></i>`)
          .on("click", () => {
            end();
            tusu.timeoutUser(username, 30);
            consoleMessage(`${username}사용자를 타임아웃 (30s)`);
          });

        bord
          .C("button")
          .attr("title", "벤")
          .html(`<i class="fas fa-ban"></i>`)
          .on("click", () => {
            end();
            tusu.banUser(username);
            consoleMessage(`${username}사용자를 차단함`);
          });
        if (msg) {
          bord
            .C("button")
            .attr("title", "메세지 삭제")
            .html(`<i class="far fa-times-circle"></i>`)
            .on("click", () => {
              end();
              tusu.removChat(id);
              consoleMessage(`${id}메세지를 삭제함`);
            });
        }
      },

      /**
       * 메세지 전송
       * @param {*} msg
       */
      sendChat(msg) {
        console.log("[send]", msg);
        consoleMessage(`[send] ${msg}`, "blue");
        if (twitchSocket) twitchSocket.say(`#${tusu.targetChannel.login}`, msg);
      },

      /**
       * 메세지 삭제
       * @param {*} msg
       */
      removChat(msg) {
        console.log("[send]", msg);
        consoleMessage(`[send] ${msg}`, "blue");
        if (twitchSocket) twitchSocket.say(`#${tusu.targetChannel.login}`, msg);
      },

      /**
       * 사용자 벤
       * @param {*} user
       */
      banUser(user) {
        console.log("[ban]", user);
        tusu.removeConsole(user);
        if (twitchSocket)
          twitchSocket.ban(
            `#${tusu.targetChannel.login}`,
            user,
            "트봇 사용자에 의하여 제거됨."
          );
      },

      /**
       * 사용자 타임아웃
       * @param {*} user
       * @param {*} time
       */
      timeoutUser(user, time) {
        console.log("[timeout]", time, user);
        tusu.removeConsole(user);
        if (twitchSocket)
          twitchSocket.timeout(
            `#${tusu.targetChannel.login}`,
            user,
            time,
            `트봇 사용자에 의하여 ${time}}초 동안 제거됨.`
          );
      },

      /**
       * 채팅 삭제 by message
       * @param {*} msg_id
       */
      removeChat(msg_id) {
        // 채팅 전송
        console.log("[remove]", msg_id);
        tusu.removeConsole(msg_id);
        if (twitchSocket)
          twitchSocket.deletemessage(`#${tusu.targetChannel.login}`, msg_id);
      },

      /**
       * 메세지 삭제 by 콘솔
       * @param {*} msg_id
       * @param {*} f
       */
      removeConsole(msg_id, f) {
        try {
          const list = document.ID("chat").getElementsByClassName(msg_id);
          for (let i = 0; i < list.length; i++)
            if (list[i]) {
              list[i].addClass("delete_message");
              if (f) f(list[i]);
            }
        } catch (e) {
          console.error(e);
        }
      },
      popupLogList() {
        const { bord, end } = tusu.createPopBord();

        bord.styles("border-radius", 0);

        bord.C("p").html("로그 리스트");
        bord.C("line");

        const list = bord
          .C("div")
          .styles("width", "100%")
          .styles("overflow-y", "scroll")
          .styles("max-height", "400px");
        for (const { user, message } of tusu.chatting_log) {
          list
            .C("p")
            .addClass("hover_pointer")
            .styles("cursor", "pointer")
            .styles("text-align", "left")
            .html(`${user.nick}: ${message}`)
            // .styles("hieght", "20px")
            .styles("overflow", "hidden")
            .styles("text-overflow", "ellipsis")
            .styles("white-space", "nowrap")
            .on("click", () => {
              const chatLog = tusu.chatting_log.filter(
                ({ user: { userid } }) => user.userid == userid
              );
              tusu.userprofile(
                user,
                chatLog.map((log) => log.message)
              );
            });
        }
      },
    };
    // 지정
    window.tusu = tusu;
  }
}
