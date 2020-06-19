Element.prototype.data=function(){var a=arguments,b=a.length;if(!(b-1))return this.getAttribute("data-"+a[0]);else this.setAttribute("data-"+a[0],a[1]);return this;};
window.addStyle=document.addStyle=function(a,b){b=document.head.C('style');b.innerHTML=a;return b};
Element.prototype.createElement=Element.prototype.C=function(ele){var ele=document.createElement(ele);this.appendChild(ele);return ele};
Element.prototype.styles=function(e,f){this.style[e]=f;return this};
Element.prototype.addClass=function(className){this.classList.add(className);return this};
Element.prototype.html=function(str){this.innerHTML = str;return this};
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
