// `chrome://settings/content/siteDetails?site=${window.location.origin}`


function popupLogList(name = "span") {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  }); // 배경클릭시 닫침
  bord.onclick = (event) => {
    event.stopPropagation();
  };
  bord.styles("width", "500px");
  bord.styles("max-height", "300px");
  bord.styles("height", "auto");

  bord.C("p").html("로그 리스트");
  bord.C("line");

  const logs = window.client.popup("");
  const list = bord
    .C("div")
    .styles("width", "100%")
    .styles("overflow-y", "scroll")
    .styles("max-height", "270px");
  for (const i of logs)
    list
      .C("p")
      .html(i)
      .styles("hieght", "20px")
      .styles("text-overflow", "ellipsis")
      .styles("white-space", "nowrap")
      .styles("overflow", "hidden");
},
// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 스크롤 맨 위로
 * @param {*} target
 */
function scrollDiv(target) {
  target.scrollTop = target.scrollHeight;
}
/**
 * 다이얼로그
 * @param {element} html 표기
 * @param {Function} end 종료후
 */
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

/**
 * 로딩 다이얼로그
 * @param {String} mant 맨트
 * @param {callback} f 콜백
 * @param {boolean} is_cancle 취소 버튼 여부
 * @returns
 */
function onDialogueLoading(mant = false, f, is_cancle = false) {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {});

  const size = 300;
  bord.styles("width", `${size}px`).styles("height", "auto");

  if (mant) bord.C("p").html(mant);
  bord
    .createElement("img")
    .styles("width", `${size}px`)
    .styles("height", `${size}px`).src = "./img/loading.gif";
  bord.onclick = () => {}; // 클릭무시
  if (is_cancle)
    bord.C("button").html("취소").styles("padding", "5px !important").onclick =
      end;
  return end;
}

/*
  
      $.fn.bottomup($.extend({},default_option,{html:`<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/3.0" style="width:${default_option.size +5}px;height:${default_option.size +5}px">`}));
      $.fn.bottomup($.extend({},default_option,{html:`<img src="https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0" style="width:${default_option.size +5}px;height:${default_option.size +5}px">`}));
  */
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
}

/**
 * 스트리머 정보를 불러옴
 * @param {*} f 콜백함수
 */
function setBrodcast(f) {
  window.token.instance
    .get(`users?login=${channel}`)
    .then(({ data: { data } }) => {
      if (data.length) {
        window.broadcaster = data[0]; // 사용자 정보 확보
        f(data[0]);
      }
    })
    .catch((e) => console.error(e));
}

/**
 * 뱃지를 불러옴
 * GET https://api.twitch.tv/kraken/chat/<channel ID>/badges
 */
function initBadges() {
  axios
    .get(`https://api.twitch.tv/kraken/chat/${window.broadcaster.id}/badges`, {
      headers: {
        "Client-Id": window.token.client_id || oauth_client_id,
        Accept: "application/vnd.twitchtv.v5+json",
      },
    })
    .then(({ data }) => {
      window.badges = new Map();
      for (const k in data) if (data[k]) window.badges.set(k, data[k].image);
    })
    .catch((e) => {
      console.error(e);
    });
}

/**
 * 배찌정보를 불러옴
 * @param {*} bages
 */
function getBadges(badges) {
  let out = [];
  for (const k in badges) {
    out.push(window.badges.get(k));
  }
  out = out.filter((o) => o != undefined);
  return out.map((o) => `<img src=${o} />`).join("");
}
/**
 * 알림창
 */
const newExcitingAlerts = (function (msg = "New!") {
  var oldTitle = document.title;
  var timeoutId;
  var blink = function () {
    document.title = document.title == msg ? oldTitle : msg;
  };
  var clear = function () {
    clearInterval(timeoutId);
    document.title = oldTitle;
    window.onmousemove = null;
    timeoutId = null;
  };
  try {
    if (!isMobile) window.open(oauth_redirect_uri).close();
    window.isEnablePopup = true;
  } catch (e) {
    // 팝업이 차단됨
    window.isEnablePopup = false;
  }
  return function () {
    if (!timeoutId) {
      timeoutId = setInterval(blink, 1000);
      window.onmousemove = clear;
    }
  };
})();

//======================================================================================
// 기능
/**
 * 설문조사 뷰 생성
 */
function makePollsView() {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  }); // 배경클릭시 닫침
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  bord.styles("height", "auto");
  bord.C("p").html("설문조사");
  const title = bord
    .C("input")
    .attr("type", "text")
    .styles("padding", "5px !important")
    .attr("placeholder", "제목을 입력해 주세요!");
  bord.C("line");
  bord
    .C("p")
    .html("진행시간 :")
    .styles("display", "contents")
    .styles("width", "50px");
  const duration = bord
    .C("input")
    .attr("type", "number")
    .attr("max", "1800")
    .attr("min", "15");
  // <input type="checkbox" title="자동스크롤 on/off" id="is_scroll" class="checkbox" checked>

  bord.C("br");

  let is_bit = false;

  bord
    .C("p")
    .html("비트후원")
    .styles("display", "contents")
    .styles("width", "50px");
  bord
    .C("input")
    .attr("type", "checkbox")
    .attr("title", "비트후원")
    .addClass("checkbox").onchange = function () {
    is_bit = this.checked;
    if (is_bit) bit.removeAttribute("disabled");
    else bit.attr("disabled", " disabled");
    // bit.styles("display", is_bit ? "inline-block" : "none");
  };

  const bit = bord
    .C("input")
    .attr("type", "number")
    .attr("title", "최소비트")
    .attr("min", "0")
    .attr("max", "10000")
    .attr("value", "0")
    .attr("disabled", " disabled");

  bord.C("br");

  let is_point = false;

  bord
    .C("p")
    .html("포인트후원")
    .styles("display", "contents")
    .styles("width", "50px");
  bord
    .C("input")
    .attr("type", "checkbox")
    .attr("title", "포인트후원")
    .addClass("checkbox").onchange = function () {
    is_point = this.checked;
    if (is_point) point.removeAttribute("disabled");
    else point.attr("disabled", " disabled");
  };

  const point = bord
    .C("input")
    .attr("type", "number")
    .attr("title", "최소포인트")
    .attr("min", "0")
    .attr("max", "1000000")
    .attr("value", "0")
    .attr("disabled", " disabled");

  bord.C("line");
  const choices = [];
  const box = bord.C("box");
  choices[0] = box.C("input").attr("type", "text").attr("placeholder", "항목");
  choices[1] = box.C("input").attr("type", "text").attr("placeholder", "항목");

  box.C("br");
  box.C("button").html("추가");
  box.C("button").html("제거");

  bord.C("line");

  bord.C("button").html("설문 시작하기!");
  bord.C("button").html("취소").onclick = end;
}

/**
 * https://dev.twitch.tv/docs/api/reference#create-poll
 * 설문조사 생성
 * 권한 channel:manage:polls
 * POST https://api.twitch.tv/helix/polls
 * @param {} f
 */
function makePolls(
  f,
  title = "셈플설문조사",
  choices = ["항목1", "항목2"],
  duration = 1800,
  subOption = {}
) {
  //
  const {
    bits_voting_enabled = false, // 비트
    bits_per_vote = 0, // 최대 10000
    channel_points_voting_enabled = false, // 포인트
    channel_points_per_vote = 0, // 1000000
  } = subOption;
  window.token.instance
    .post("polls", {
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
      },
    })
    .then(({ data }) => {
      const { id } = data[0];
      f(id);
    })
    .catch((e) => {
      switch (e.response.statusText) {
        case "Forbidden": // 사용자
          //파트너 또는 제휴사가 아님.
          window.client.popup(
            document
              .createElement("span")
              .html(`(설문) 제휴사 또는 파트너가 아닙니다!`)
              .styles("background", "red")
              .styles("color", "#fff"),
            30
          );
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
function endPolls(f, id, is_privates = false) {
  if (!id) return;
  window.token.instance
    .post("polls", {
      broadcaster_id: window.broadcaster.id,
      id,
      status: is_privates ? "ARCHIVED" : "TERMINATED",
    })
    .then(({ data }) => {
      if (!data.length) return; // 설문조사가 없음
      const { choices, title, status } = data[0];
      f(title, choices, status);
    })
    .catch((e) => {
      console.error(e);
    });
}

/**
 * https://dev.twitch.tv/docs/api/reference#create-clip
 * 클립생성
 * 권한 clips:edit
 * POST https://api.twitch.tv/helix/clips
 */
function createClips(f) {
  window.token.instance
    .post(`clips?broadcaster_id=${window.broadcaster.id}`)
    .then(({ data: { data } }) => {
      if (data.length) f(data[0].id, data[0].edit_url);
    })
    .catch((e) => {
      console.error(e);
    });
}

/**
   * https://dev.twitch.tv/docs/api/reference#get-channel-information
   * channel:manage:broadcast
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
function getChannelStates(f) {
  window.token.instance
    .get(`channels?broadcaster_id=${window.broadcaster.id}`)
    .then(({ data: { data } }) => {
      if (data.length) {
        document.ID("title").html(data[0].title);
        document
          .getElementById("channel")
          .html(`${data[0].broadcaster_name}(${data[0].broadcaster_login})`);
        if (f) f(data[0]);
      }
    })
    .catch((e) => {
      console.error(e);
    });
}

/**
 * 채널정보 수정
 * @param {*} f 콜백
 * @param {*} options 방제
 * @returns
 */
function setChannelStates(f, options) {
  const {
    game_id,
    title,
    // delay
  } = options;
  const query = {};
  if (game_id || title) {
    if (game_id) query.game_id = game_id;
    if (title) query.title = title;
  } else return;
  window.token.instance
    .patch(`channels?broadcaster_id=${window.broadcaster.id}`, query)
    .then(({ data }) => {
      if (f) f(query);
      document.ID("title").html(title);
    })
    .catch((e) => {
      console.error(e);
    });
}

/**
 * 스트림 정보를 불러옴
 * @param {*} f 콜백
 */
function getStream(f) {
  window.token.instance
    .get(`streams?user_id=${window.broadcaster.id}`)
    .then(({ data: { data } }) => {
      window.static_time = new Date("1900-01-01 00:00:00");
      if (data.length) {
        // 방송중일때 데이터 넘김
        const { title, user_login, user_name, started_at, game_name } = data[0];
        document.ID("channel").html(`${user_name}(${user_login})`);
        document.ID("title").html(title);
        document.ID("game").html(game_name);
        document
          .getElementById("is_online")
          .html("On-line")
          .styles("background", "red");
        window.static_time.setTime(
          new Date().getTime() -
            new Date(started_at).getTime() +
            new Date().getTimezoneOffset() * 60000
        ); // 시간 연산
        window.is_online = true;
        if (f) f(data[0]);
      } else {
        window.is_online = false;
        document
          .getElementById("is_online")
          .html("Off-line")
          .styles("background", "blue");
        getChannelStates(f); // 방송중이 아닐때, 정보 전달
      }
    })
    .catch((e) => {
      console.error(e);
    });
}
/**
 * 팔로우 정보를 불러옴
 * window.follows -- 글로벌 팔로우 객체 저장
 *
 * 피코 - 아이디
 * hbo790349444
 * /[a-zA-Z]{3,}[0-9]{9,}/g
 */
function getFollows() {
  // follows

  window.token.instance
    .get(`users/follows?first=100&to_id=${window.broadcaster.id}`)
    .then(({ data }) =>
      data.data.map((o) => {
        return {
          f: o.followed_at,
          i: o.from_id,
          l: o.from_login,
          n: o.from_name,
        };
      })
    )
    .then((users) => {
      // 거꾸로 뒤집고, 역순 정렬
      users = users.reverse();
      for (const user of users) {
        if (!window.follows[user.i]) {
          window.follows[user.i] = user;
          addFollows(user);
        }
      }
      if (window.autoscroll_follow)
        scrollDiv(document.ID("follows").parentNode);
    })
    .catch((e) => []);
}

/**
 * 팔로우 필터
 * @param {*} f( { f: 팔로우 일자, i : 고유id, l: 영문id,  n : 닉네임 } )
 * @param {*} isBlock 사용자 차단 여부
 */
function unfollowUsers(f, isBlock = false) {
  const user_ids = Object.keys(window.follows);
  for (const id of user_ids) {
    if (f(window.follows[id])) {
      // 삭제
      blockUser(id, isBlock);
    }
  }
}
//======================================================================================

/**
 * 명령어 추가
 */
function addCommand(f) {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  });
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  bord.styles("height", "auto");
  bord.C("p").html(`명령을 추가합니다`);

  const command = bord.C("input");
  command.setAttribute("type", "text");
  command.setAttribute("placeholder", "명령어를 입력해 주세요");
  bord.C("br");
  const msg = bord.C("input");
  msg.setAttribute("type", "text");
  msg.setAttribute("placeholder", "출력할 내용을 입력해 주세요");
  bord.C("br");
  bord.C("button").html("저장").onclick = function () {
    if (command.value.length < 3) {
      alert("명령어는 최소 3자 이상으로 해주세요!");
      return;
    } else if (msg.value.length < 1) {
      alert("출력메세지는 최소 1자입니다.");
      return;
    }
    if (window.command[command.value]) {
      alert("이미 존재하는 명령어 입니다!");
      return;
    }
    window.command[command.value] = msg.value;
    addCommandTxt(command.value, msg.value);
    localStorage.setItem(
      `moderator_${channel}`,
      JSON.stringify(window.command)
    );
    if (f) f(command.value, msg.value);
    alert("저장되었습니다.");
    end();
  };
  bord.C("button").html("취소").onclick = end;
}

function addCommandTxt(k, v) {
  document.ID("command").C("p").html(`${k} -> ${v}`).onclick =
    function (event) {
      const element = this;
      const bord = document.createElement("span");
      const end = onDialogue(bord, () => {
        end();
      });
      bord.onclick = (event) => {
        event.stopPropagation();
      };

      bord.styles("height", "auto");
      bord.C("button").html("커맨드변경").onclick = () => {
        end();
        editCommand(
          (tk, tv) => {
            k = tk;
            v = tv;
            element.html(`${k} -> ${v}`);
          },
          k,
          false
        );
      };
      bord.C("button").html("명령변경").onclick = () => {
        end();
        editCommand(
          (tk, tv) => {
            k = tk;
            v = tv;
            element.html(`${k} -> ${v}`);
          },
          k,
          true
        );
      };
      bord.C("button").html("삭제").onclick = () => {
        end();
        subCommand(k);
      };
      bord.C("button").html("취소").onclick = end;
    };
}

function addFollows({ f, i, l, n }) {
  document.ID("follows")
    .C("p")
    .styles("margin", "3px")
    .styles("float", "left")
    .html(`${n}(${l}) - ${f}`).onclick = function (event) {
    const element = this;
    const bord = document.createElement("span");
    const name = l == n ? n : `${n}(${l})`;

    const end = onDialogue(bord, () => {
      end();
    });
    bord.onclick = (event) => {
      event.stopPropagation();
    };
    bord.C("p").html(`${name}유저`).onclick = () => {
      window.open(
        `https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${l}?popout=`
      );
    };
    bord.styles("height", "auto").styles("min-width", "200px");
    bord.C("line");
    //timeout
    bord
      .C("button")
      .attr("title", "타임아웃 (30s)")
      .html(`<i class="fas fa-shield-alt"></i>`).onclick = () => {
      end();
      timeoutUser(username, 30);
      consoleMessage(`${username}사용자를 타임아웃 (30s)`);
    };
    // ban
    // bord
    //   .C("button")
    //   .attr("title", "벤")
    //   .html(`<i class="fas fa-ban"></i>`).onclick = () => {
    //   end();
    //   banUser(username);
    //   consoleMessage(`${username}사용자를 차단함`);
    // };

    // bord.C("button").html("언팔로우").onclick = () => {
    //   end();
    //   blockUser(i, true);
    // };
    // bord.C("button").html("차단").onclick = () => {
    //   end();
    //   blockUser(i, true);
    // };
    bord.C("button").html("취소").onclick = end;
  };
}

/**
 * 명령어 편집
 * @param {*} f 콜백
 * @param {*} target 타겟(key)
 * @param {*} is_msg 메세지 변경?
 */
function editCommand(f, target, is_msg = true) {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  });
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  bord.C("p").html(`바꿀 ${is_msg ? "메세지" : "명령어"}를 입력해 주세요!`);
  bord.C("input").attr("readonly", "readonly").value = target;

  const command = bord.C("input");
  command.setAttribute("type", "text");
  command.setAttribute(
    "placeholder",
    is_msg ? "출력내용을 입력해 주세요!" : "명령어를 입력해 주세요"
  );
  bord.C("br");
  bord.C("button").html("저장").onclick = function () {
    if (!is_msg && command.value.length < 3) {
      alert("명령어는 최소 3자 이상으로 해주세요!");
      return;
    } else if (is_msg && command.value.length < 1) {
      alert("출력메세지는 최소 1자입니다.");
      return;
    } else if (!is_msg && window.command[command.value]) {
      alert("이미 존재하는 명령어 입니다!");
      return;
    } else if (!is_msg && command.value == target) {
      alert("변경내용과, 이전내용이 동일합니다!");
      end();
      return;
    }
    if (is_msg) {
      window.command[target] = command.value;
      if (f) f(target, command.value);
    } else {
      window.command[command.value] = window.command[target];
      delete window.command[target];
      if (f) f(command.value, window.command[command.value]);
    }
    localStorage.setItem(
      `moderator_${channel}`,
      JSON.stringify(window.command)
    );
    alert("변경되었습니다.");
    end();
  };
  bord.C("button").html("취소").onclick = end;
}

/**
 * 명령어 제거
 */
function subCommand(comm) {
  if (!window.command[comm]) return;
  delete window.command[comm];
  localStorage.setItem(`moderator_${channel}`, JSON.stringify(window.command));
}

window.reservation_msg = []; // 예약명령어

//======================================================================================
/**
 * 예약 명령 추가
 */
function addReservation(f) {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  });
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  bord.styles("height", "130px");

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

  bord.C("button").html("저장").onclick = function () {
    if (msg.value.length < 3) {
      alert("메세지는 최소 3자 이상으로 해주세요!");
      return;
    } else if (time.value < 3) {
      alert("최소 3분 이상만 가능합니다.!");
      return;
    }
    window.reservation_msg.push({
      msg: msg.value,
      time: time.value,
      is: true,
      id: setInterval(
        (item) => {
          if (item.is) sendChat(item.msg);
        },
        time.value * 60 * 1000,
        item
      ),
    });
    alert("저장되었습니다.");

    if (f) f(msg.value, time.value);
    end();
  };
  bord.C("button").html("취소").onclick = end;
}

function addReservationTxt(item) {
  // consoleMessage(`반복메세지 설정 ${msg} ${time}s`, 'green');
  document.ID("command")
    .C("p")
    .html(`[${item.time}] -> ${item.msg}`).onclick = function (event) {
    const element = this;
    const bord = document.createElement("span");
    const end = onDialogue(bord, () => {
      end();
    });
    bord.onclick = (event) => {
      event.stopPropagation();
    };

    bord.C("button").html("메세지변경").onclick = () => {
      end();
      editReservation((i) => {
        item = i;
        element.html(`[${item.time}] -> ${item.msg}`);
        consoleMessage(`메세지변경 ${item.msg} ${item.time}s`, "green");
      }, false);
    };
    bord.C("button").html("시간변경").onclick = () => {
      end();
      editReservation((i) => {
        item = i;
        element.html(`[${item.time}] -> ${item.msg}`);
        consoleMessage(`반복시간변경 ${item.msg} ${item.time}s`, "green");
      }, true);
    };
    bord.C("button").html("삭제").onclick = () => {
      end();
      removeReservation((i) => {
        consoleMessage(`반복메세지 삭제 ${i.msg} ${i.time}s`, "green");
      }, item);
      element.remove();
    };
  };
}

/**
 * 주기적 명령 변경
 * @param {*} f 콜백
 * @param {*} msg 메세지
 * @param {*} is_time 시간인지 여부
 */
function editReservation(f, msg, is_time = true) {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  });
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  const item = window.reservation_msg.filter((o) => o.msg == msg)[0];
  if (!item) return; // 아이템이 없음

  const check = bord
    .C("input")
    .attr("type", "checkbox")
    .attr("title", "on/off")
    .addClass("checkbox");
  check.checked = item.is;
  check.onchange = function () {
    item.is = this.checked;
  };

  bord.C("p").html(`바꿀 ${is_time ? "시간" : "메세지"}를 입력해 주세요!`);
  bord.C("input").attr("readonly", "readonly").value = `(${item.time}) ${msg}`;

  const command = bord.C("input");
  command.setAttribute("type", is_time ? "number" : "text");
  if (is_time) {
    command.setAttribute("min", "5");
    command.setAttribute("max", "60");
    command.setAttribute("step", "5");
    command.setAttribute("value", "5");
  }
  command.setAttribute(
    "placeholder",
    is_time ? "시간주기" : "명령어를 입력해 주세요"
  );

  bord.C("br");
  bord.C("button").html("저장").onclick = function () {
    if (!is_time && command.value.length < 3) {
      alert("메세지는 최소 3자 이상으로 해주세요!");
      return;
    } else if (is_time && command.value <= 1) {
      alert("1분이상으로 설정해 주세요!");
      return;
    } else if (!is_time && window.command[command.value]) {
      alert("이미 존재하는 명령어 입니다!");
      return;
    } else if (!is_time && command.value == msg) {
      alert("변경내용과, 이전내용이 동일합니다!");
      end();
      return;
    }
    if (is_time) {
      item.time = command.value;
      clearInterval(item.id); // 타이머 제거
      item.id = setInterval(
        (item) => {
          if (item.is) sendChat(item.msg);
        },
        time.value * 60 * 1000,
        item
      );
    } else {
      item.msg = command.value;
    }
    if (f) f(item);
    alert("변경되었습니다.");
    end();
  };
  bord.C("button").html("취소").onclick = end;
}

/**
 * 반복메세지 삭제
 * @param {*} msg
 */
function removeReservation(f, item) {
  clearInterval(item.id); // 타이머 제거
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
function addChat(user, msg, msg_id) {
  // 채팅기록관리
  window.chatting_log.push({ user, msg, msg_id });
  const console_div = document.ID("console");

  if (chat_log_limit <= window.chatting_log.length) window.chatting_log.shift();

  if (document.ID("is_commands").checked) {
    const [comm, ...args] = msg.split();
    switch (comm) {
      case ";클립":
        console.log(user, msg, msg_id);
        if (window.is_online) {
          consoleMessage("클립 제작을 시작함!", "blue");
          createClips((id, edit_url) => {
            console.log(id, edit_url);
            const out = `<a href="//clips.twitch.tv/${id}" target="_blank">${id.substr(
              5
            )}</a>클립생성 - <a href=${edit_url}>편집하기</a>`;
            consoleMessage(out, "blue");
            window.client.popup(out, 500);
            window.client.reply(
              channel,
              msg_id,
              `[클립생성] clips.twitch.tv/${id}`
            );
            scrollDiv(document.ID("console_scroll"));
          });
        } else {
          window.client.reply(channel, msg_id, `오프라인 상태입니다!`);
          consoleMessage(`오프라인 상태 입니다!`);
        }
        break;
      case ";후원":
        window.client.reply(
          channel,
          msg_id,
          `후원링크 twip.kr/donate/${channel}`
        );
        consoleMessage(`메세지 전송 - 후원링크 twip.kr/donate/${channel}`);
        break;
      case ";트봇":
        window.client.reply(
          channel,
          msg_id,
          `트수가 관리하는 채팅방 - ${oauth_redirect_uri}`
        );
        consoleMessage(
          `메세지 전송 - 트수가 관리하는 채팅방 - ${oauth_redirect_uri}`
        );
        break;
      default:
        for (const k in window.command) {
          if (msg.startsWith(k)) {
            window.client.reply(channel, msg_id, window.command[k]);
            break;
          }
        }
        break;
    }
  }
  if (!msg_id) return;
  user.msg = getMessageHTML(msg, user);
  user.nick =
    user["display-name"] == user.username
      ? user.username
      : `${user["display-name"]}<p style='font-size:0.2em;display:contents;'>${user.username}</p>`;
  const time = new Date();
  time.setTime(user["tmi-sent-ts"]);
  console_div
    .C("p")
    .addClass("hover_pointer")
    .addClass(user.username)
    .addClass(user.id)
    .addClass(
      window.client.msg_op && window.client.msg_op.id == msg_id
        ? window.client.msg_op.rewardType || "none"
        : "none"
    )
    .styles("cursor", "pointer")
    .html(
      `<span style="width:1px;height:1px" class=span_front>${time.format(
        "hh:mm"
      )}</span>[<span style="color:${user.color || "#fff"}">${
        user.nick
      }</span>] ${user.msg}`
    ).onclick = () => {
    userprofile(user);
  };
  window.client.msg_op &&
    window.client.msg_op.id == msg_id &&
    (window.client.msg_op = undefined); // 메세지 강조
  if (console_div.childElementCount > 5000) {
    for (let i = 0; i < 1000; i++) console_div.firstChild.remove();
    window.client.popup("1000개의 메세지가 기록에서 삭제되었습니다.", -1);
  }
  if (window.autoscroll) scrollDiv(console_div.parentNode);
}

/**
 * 프로필 정보
 * @param {*} param0
 */
function userprofile({ username, nick, id, color, badges, msg }) {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  });

  bord.onclick = (event) => {
    event.stopPropagation();
  };
  bord.styles("width", "500px");
  bord.styles("height", "auto");

  bord
    .C("p")
    .html(`${getBadges(badges)}${nick}`)
    .styles("color", color || "#000")
    .styles("cursor", "pointer")
    .attr("title", "사용자 채팅 기록").onclick = () => {
    window.open(
      `https://www.twitch.tv/popout/${window.broadcaster.login}/viewercard/${username}?popout=`
    );
  };
  if (msg) {
    bord.C("line");
    bord.C("p").html("메세지 ID");
    bord.C("p").html(id);
    bord.C("line");
    bord.C("p").html("내용");
    bord.C("p").html(msg);
  }
  bord.C("line");
  //timeout
  bord
    .C("button")
    .attr("title", "타임아웃 (30s)")
    .html(`<i class="fas fa-shield-alt"></i>`).onclick = () => {
    end();
    timeoutUser(username, 30);
    consoleMessage(`${username}사용자를 타임아웃 (30s)`);
  };
  // ban
  bord
    .C("button")
    .attr("title", "벤")
    .html(`<i class="fas fa-ban"></i>`).onclick = () => {
    end();
    banUser(username);
    consoleMessage(`${username}사용자를 차단함`);
  };
  if (msg) {
    /// delete message
    bord
      .C("button")
      .attr("title", "메세지 삭제")
      .html(`<i class="far fa-times-circle"></i>`).onclick = () => {
      end();
      removChat(id);
      consoleMessage(`${id}메세지를 삭제함`);
    };
    // reply message
    bord
      .C("button")
      .attr("title", "답장")
      .html(`<i class="far fa-comment-alt"></i>`).onclick = () => {
      const bord = document.createElement("span");
      const end = onDialogue(bord, () => {
        end();
      });
      bord.onclick = (event) => {
        event.stopPropagation();
      };

      bord.parentNode.styles("z-index", "99999");
      bord.C("p").html(`${nick}님께 답장하기`);
      const input = bord
        .C("input")
        .attr("type", "text")
        .attr("placeholder", "내용을 입력해 주세요!");
      const click = () => {
        if (input.value && input.value.length <= 0) return;
        end();
        consoleMessage(`${username} 님께 답장 :${input.value}`);
        window.client.reply(channel, id, input.value); //메세지 전송
      };
      bord.C("br").C("button").html("전송").onclick = click;
      input.onkeypress = onKeypress(click, 1); // 키 이벤트
      input.focus();
      bord.C("button").html("취소").onclick = end;
    };
  }
}

function sendChat(msg) {
  // 채팅 전송
  console.log("[send]", msg);
  consoleMessage(`[send] ${msg}`, "blue");
  if (window.client && !is_test)
    window.client.say(`#${window.broadcaster.login}`, msg);
}

function banUser(user) {
  // 벤
  console.log("[ban]", user);
  removeConsole(user);
  if (window.client && !is_test)
    window.client.ban(
      `#${window.broadcaster.login}`,
      user,
      "당신은 필터에 의해 제거되었습니다"
    );
}
function timeoutUser(user, time) {
  // 채팅 전송
  console.log("[timeout]", time, user);
  removeConsole(user);
  if (window.client && !is_test)
    window.client.timeout(
      `#${window.broadcaster.login}`,
      user,
      time,
      `당신은 필터에 의해 ${time}동안 차단당하였습니다`
    );
}
// 유저 차단
function blockUser(user_id, isBan = false) {
  // 채팅 전송
  console.log(isBan ? "[block]" : "[unfollow]", user_id);
  window.token.instance
    .put(`/users/blocks?target_user_id=${user_id}`)
    .then((o) => {
      if (!isBan)
        window.token.instance
          .delete(`/users/blocks?target_user_id=${user_id}`)
          .catch((e) => {
            consoleMessage(`${user_id}사용자  차단 해제에 실패하였습니다.`);
          });
    })
    .catch((e) => {
      consoleMessage(`${user_id}사용자  차단에 실패하였습니다.`);
    });
}
function removChat(msg_id) {
  // 채팅 전송
  console.log("[remove]", msg_id);
  removeConsole(msg_id);
  if (window.client && !is_test)
    window.client.deletemessage(`#${window.broadcaster.login}`, msg_id);
}

function removeConsole(msg_id, f) {
  try {
    const list = document
      .getElementById("console")
      .getElementsByClassName(msg_id);
    for (let i = 0; i < list.length; i++)
      if (list[i]) {
        list[i].addClass("delete_message");
        if (f) f(list[i]);
      }
  } catch (e) {
    console.error(e);
  } // 오류처리
}
//subsModeConsole

// function highlightedConsole(msg_id){
// 	try{
// 		document.ID("console").getElementsByClassName(msg_id).forEach(element=>{
// 			element.addClass("highlighted_message");
// 		});
// 	}catch(e){;};// 오류처리
// }

// function subsModeConsole(msg_id){
// 	try{
// 		document.ID("console").getElementsByClassName(msg_id).forEach(element=>{
// 			element.addClass("subs_mode");
// 		});
// 	}catch(e){console.log(e);};// 오류처리
// }

function consoleMessage(message, color = "red") {
  const console_div = document.ID("console");
  if (window.autoscroll) scrollDiv(document.ID("console_scroll"));
  return console_div
    .C("p")
    .html(`[console] ${message}`)
    .styles("background", color)
    .styles("color", "#fff");
}

function toggleTime(is) {
  //span_front
  window.toggle_styles = window.toggle_styles || document.head.C("style");
  window.toggle_styles.html(`
      .span_front{
          font-size: ${is ? "1em" : "0"};
      }`);
}

/**
 * 팔로우 모드 변경
 * @param {*} time
 */
function followChange(time) {
  if (time == "-1") {
    window.client.followersonlyoff(window.broadcaster.login);
    consoleMessage(`(채팅모드) 팔로우 전용 모드 해제됨`, "green");
  } else window.client.followersonly(window.broadcaster.login, time);
}

/**
 * 팔로우 모드 변경 콜
 * @param {*} time
 * @returns
 */
function followChangeSet(time) {
  const eles = document.querySelectorAll("input[name=follow]");
  //document.querySelectorAll("input[name=follow]")
  // consoleMessage(`팔로우 모드 변경 ${time}`, 'blue').onclick=()=>{followChangeSet("off")};
  for (const i of eles) {
    const t = i.id.replace("follow", "");
    if (t == time) {
      i.checked = true;
      document.ID("is_slow_chat").html(i.innerHTML);
      return;
    }
  }
  eles[eles.length - 1].checked = true;
  document.ID("is_slow_chat").html("사용자 지정");
}
/**
 * 슬로우 모드 변경
 * @param {*} time
 */
function slowchatChange(time) {
  console.log(time);
  if (time == "false") {
    window.client.slowoff(window.broadcaster.login);
    consoleMessage(`(채팅모드) 느린 채팅 모드 해제됨`, "green");
  } else window.client.slowmode(window.broadcaster.login, time);
}

/**
 * 슬로우 모드 변경 콜
 * @param {*} time
 * @returns
 */
function slowchatChangeSet(time) {
  const eles = document.querySelectorAll("input[name=slowchat]");
  for (const i of eles) {
    const t = i.id.replace("slowchat", "");
    if (t == time) {
      console.log(time, i);
      i.checked = true;
      document.ID("is_slow_chat").html(i.innerHTML);
      return;
    }
  }
  eles[eles.length - 1].checked = true;
  document.ID("is_slow_chat").html("사용자 지정");
}

//======================================================================================
/**
 * 챗봇 탐지
 */
function chatbot() {
  const bord = document.createElement("span");
  const end = onDialogue(bord, () => {
    end();
  });
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  bord.C("p").html("인식채팅은 최대한 일치하게 적어 주세요!");
  const text = bord.C("input");
  text.setAttribute("placeholder", "탐색할 채팅을 입력해 주세요");
  text.styles("width", "200px");

  bord.C("br");
  bord.C("button").html("탐색").onclick = function () {
    if (text.value.length < 5) {
      alert("위험성 때문에, 5자 이상으로 제한합니다.");
      return;
    }
    end();
    filterChatbot(text.value);
  };
  bord.C("button").html("취소").onclick = end;
}

function filterChatbot(msg) {
  if (!msg || msg.length < 5) {
    //무시
    return;
  }

  const bord = document.createElement("span");

  const end = onDialogue(bord, () => {
    end();
  });
  bord.onclick = (event) => {
    event.stopPropagation();
  };

  bord.C("p").html(`${msg}와 일치하는 채팅목록 (클릭시 예외처리)`);
  bord.styles("width", "500px");
  bord.styles("height", "400px");

  const comm = bord.C("div"); // 커맨드창

  comm.styles("overflow-y", "scroll");
  comm.styles("overflow-x", "hiddin");
  comm.styles("width", "100%");
  comm.styles("height", "88%");

  let isCancle = false;

  bord.C("button").html("취소").onclick = () => {
    isCancle = true;
    end();
  };

  const filter = [];
  window.chatting_log.forEach(({ user, msg: message, msg_id }) => {
    if (isCancle) return;
    if (message.includes(msg)) {
      const data = { user, msg_id };
      filter.push(data);
      comm
        .C("p")
        .addClass("hover_pointer")
        .html(`${user.username}(${msg_id}) : ${message}`)
        .styles("overflow", "hidden")
        .styles("cursor", "pointer").onclick = function () {
        const i = filter.indexOf(data);
        delete filter[i];
        this.remove();
      };
    }
  });
  bord.C("button").html("일괄 벤").onclick = () => {
    filter.forEach(({ user }) => {
      banUser(user.login);
    });
    consoleMessage(`${filter.length}명을 일괄 벤 하였습니다.`);
    sendChat(`/me [tusubot] ${filter.length}명을 일괄 벤하였습니다.`);
    end();
  };
  bord.C("button").html("일괄 타임아웃(30초)").onclick = () => {
    filter.forEach(({ user }) => {
      timeoutUser(user.login, 30);
    });
    consoleMessage(`${filter.length}명을 일괄 타임아웃(30s) 하였습니다.`);
    sendChat(
      `/me [tusubot] ${filter.length}명을 일괄 타임아웃(30s) 하였습니다`
    );
    end();
    // 처리
  };
  bord.C("button").html("일괄 채팅 삭제").onclick = () => {
    filter.forEach(({ msg_id }) => {
      removChat(msg_id);
    });
    consoleMessage(`${filter.length}개의 채팅을 일괄 삭제 하였습니다.`);
    sendChat(`/me [tusubot] ${filter.length}개의 채팅을 일괄 삭제 하였습니다.`);
    end();
    // 처리
  };
}

function initTime() {
  // 시간초기화
  window.static_time = window.static_time || new Date("1900-01-01 00:00:00");
  return setInterval(() => {
    // 시간 루프
    window.static_time.setSeconds(window.static_time.getSeconds() + 1); // 1초더함
    document
      .getElementById("uptime")
      .html(window.static_time.format("HH:mm:ss"));
  }, 1000);
}
//======================================================================================
