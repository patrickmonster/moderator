Element.prototype.data=function(){var a=arguments,b=a.length;if(!(b-1))return this.getAttribute("data-"+a[0]);else this.setAttribute("data-"+a[0],a[1]);return this;};
window.addStyle=document.addStyle=function(a,b){b=document.head.C('style');b.innerHTML=a;return b};
Element.prototype.createElement=Element.prototype.C=function(ele){var ele=document.createElement(ele);this.appendChild(ele);return ele};
Element.prototype.styles=function(e,f){this.style[e]=f;return this};
Element.prototype.attr=function(e,f){if(f){this.setAttribute(e,f);return this;}else return this.getAttribute(e)};
Element.prototype.addClass=function(className){this.classList.add(className);return this};
Element.prototype.delClass=function(className){this.classList.remove(className);return this};
Element.prototype.html=function(str){this.innerHTML = str;return this};
Element.prototype.getPosition=function(){return this.getBoundingClientRect()};
Element.prototype.A=function(a,b){this[a]=b;return this};
String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };
Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
    var weekName = ["일", "월", "화", "수", "목", "금", "토"];
    var d = this;
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};

function onKeypress(f,min=3){
    return function(event){
        if(event.keyCode!=13)return;// 엔터 아니면 빠꾸
        const {value} = this;
        if(!value || value.length < min)return;
        else f(value);
    }
}
function randomItem(a) {return a[Math.floor(Math.random() * a.length)]}
function make_qury(option,out){out =[];for(var i in option)out.push(i + "=" + option[i]);return "?"+out.join("&")}
function getParams(name, address = window.location.href) {
    let url;
    let results = "";
    url = new URL(address);
    if (typeof url.searchParams === 'undefined') {
        results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(address);
        if (results == null) {
            return null;
        } else {
            return decodeURI(results[1]) || 0;
        }
    } else {
        return url.searchParams.get(name);
    }
}

/**
 * 모바일 확인
 * @returns 
 */
function isMobile(){
	const uAgent = navigator.userAgent.toLowerCase(); 
	const mobilePhones = new RegExp(/\b(:?iphone|ipod|ipad|android|blackberry|windows ce|nokia|webos|opera mini|sonyericsson|opera mobi|iemobile)\b/g);
	return mobilePhones.test(uAgent);
}

/**
 * 팝업 관리자 - 팝업창을 띄움
 * @param {*} max 최대 팝업 (이후삽입은 팝업 스텍)
 * @returns 생성함수
 */
function Popup(max = 10){//팝업 관리자
    const list = [];// 팝업 스텍
    const msg_queue = [];
    window.addStyle(`#popup{position:fixed;left:0;margin:10px !important;bottom: 0%;}#popup *{width:100%;display: inline-block;}`);
    function create(element = "test", time = 5){
        const popup = document.body.C("pupup").attr("id","popup");
        let i = 0;
        let isEnable = true;

        if(time < 5)time = 5;

        popup.target_pos = 0;//목표하는 높이
        for(; i < max; i++){
            if(!list[i]){
                list[i] = popup.styles("z-index",`${9999 - i}`);// 삽입
                popup.list_index = i;// 번지
                break;
            }
            else popup.target_pos += list[i].getPosition().height;
        }
        if(i >= max){
            isEnable = false;// 활성화 되지 못함
            msg_queue.push(popup.styles("opacity", "0"));
        }

        if(typeof element === "string"){
            element = popup.C("span").html(element);
        }else popup.appendChild(element);
        
        popup.pos_value = element.styles("padding", "10px").styles("background","#349ac3").getPosition().height;
        popup.styles("bottom", `${popup.pos_value * -1}px`).onclick = function(){end(this)};
        popup.loop = ()=>{
            popup.styles("bottom", `${(popup.pos_value -= (popup.list_index + 1)) * -1}px`);
            if(popup.pos_value >= -1 * popup.target_pos){
                window.requestAnimationFrame(popup.loop);
            }
            else setTimeout(end,time * 1000, popup);
        }
        if(isEnable){
            popup.loop();// 활성화 시에만
        }
        return ()=>{end(popup)};
    }
    function end(popup){
        const max = popup.getPosition().height;
        popup.styles("z-index",`${9999 - popup.list_index}`);
        const loop = ()=>{
            popup.styles("bottom", `${(popup.pos_value += (popup.list_index + 1)) * -1}px`);
            if(popup.pos_value <= max)window.requestAnimationFrame(loop);
            else {
                popup.remove();
                if(msg_queue.length){
                    const element = msg_queue.shift();
                    element.target_pos = 0;//목표하는 높이
                    element.list_index = popup.list_index;
                    element.target_pos = popup.target_pos;
                    list[element.list_index] = element;// 삽입
                    element.styles("z-index",9999 - element.list_index).styles("opacity", "1");
                    element.loop();
                }else delete list[popup.list_index];
            }
        }
        loop();
    }
    return create;
}

function getCmpPos(obj){
	const { height, bottom, top, left } =obj.getPosition();
    const h = height || bottom-top;
	return {left,top: top+h+10};
}

function targetPopup(element, id="popup2"){
    const {left, top} = getCmpPos(this);
    const popup = document.body.C("pupup2");
    return popup.attr("id",id).styles("left",`${left}px`).styles("top",`${top}px`).styles("position","fixed").appendChild(element.styles("width", "300px").styles("height", "auto"));
}