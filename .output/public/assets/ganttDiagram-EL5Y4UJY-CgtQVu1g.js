import{s as e,t}from"./rolldown-runtime-Eu0AZhn2.js";import{n}from"./chunk-Y2CYZVJY-CUaGfQly.js";import{i as r,n as i,t as o}from"./d3-selection-D2h7Y91O.js";import{H as s,K as h,U as g,a as _,c as b,s as x,v as S,w as C,x as w,y as T}from"./chunk-DU6HZSFF-BDIn85ah.js";import{E,T as D,_ as O,a as k,c as A,d as j,f as M,g as N,h as P,i as F,l as I,m as L,n as ee,o as R,p as z,s as te,u as ne,v as B,x as re}from"./d3-scale-C2f0sYxj.js";import{t as ie}from"./dist-Bv4gmayF.js";import{g as ae}from"./chunk-75Z2AOVW-CxhOttCB.js";function identity(e){return e}var oe=1,se=2,ce=3,le=4,ue=1e-6;function translateX(e){return`translate(`+e+`,0)`}function translateY(e){return`translate(0,`+e+`)`}function number(e){return t=>+e(t)}function center(e,t){return t=Math.max(0,e.bandwidth()-t*2)/2,e.round()&&(t=Math.round(t)),n=>+e(n)+t}function entering(){return!this.__axis}function axis(e,t){var n=[],r=null,i=null,o=6,s=6,h=3,g=typeof window<`u`&&window.devicePixelRatio>1?0:.5,_=e===oe||e===le?-1:1,b=e===le||e===se?`x`:`y`,x=e===oe||e===ce?translateX:translateY;function axis(S){var C=r??(t.ticks?t.ticks.apply(t,n):t.domain()),w=i??(t.tickFormat?t.tickFormat.apply(t,n):identity),T=Math.max(o,0)+h,E=t.range(),D=+E[0]+g,O=+E[E.length-1]+g,k=(t.bandwidth?center:number)(t.copy(),g),A=S.selection?S.selection():S,j=A.selectAll(`.domain`).data([null]),M=A.selectAll(`.tick`).data(C,t).order(),N=M.exit(),P=M.enter().append(`g`).attr(`class`,`tick`),F=M.select(`line`),I=M.select(`text`);j=j.merge(j.enter().insert(`path`,`.tick`).attr(`class`,`domain`).attr(`stroke`,`currentColor`)),M=M.merge(P),F=F.merge(P.append(`line`).attr(`stroke`,`currentColor`).attr(b+`2`,_*o)),I=I.merge(P.append(`text`).attr(`fill`,`currentColor`).attr(b,_*T).attr(`dy`,e===oe?`0em`:e===ce?`0.71em`:`0.32em`)),S!==A&&(j=j.transition(S),M=M.transition(S),F=F.transition(S),I=I.transition(S),N=N.transition(S).attr(`opacity`,ue).attr(`transform`,function(e){return isFinite(e=k(e))?x(e+g):this.getAttribute(`transform`)}),P.attr(`opacity`,ue).attr(`transform`,function(e){var t=this.parentNode.__axis;return x((t&&isFinite(t=t(e))?t:k(e))+g)})),N.remove(),j.attr(`d`,e===le||e===se?s?`M`+_*s+`,`+D+`H`+g+`V`+O+`H`+_*s:`M`+g+`,`+D+`V`+O:s?`M`+D+`,`+_*s+`V`+g+`H`+O+`V`+_*s:`M`+D+`,`+g+`H`+O),M.attr(`opacity`,1).attr(`transform`,function(e){return x(k(e)+g)}),F.attr(b+`2`,_*o),I.attr(b,_*T).text(w),A.filter(entering).attr(`fill`,`none`).attr(`font-size`,10).attr(`font-family`,`sans-serif`).attr(`text-anchor`,e===se?`start`:e===le?`end`:`middle`),A.each(function(){this.__axis=k})}return axis.scale=function(e){return arguments.length?(t=e,axis):t},axis.ticks=function(){return n=Array.from(arguments),axis},axis.tickArguments=function(e){return arguments.length?(n=e==null?[]:Array.from(e),axis):n.slice()},axis.tickValues=function(e){return arguments.length?(r=e==null?null:Array.from(e),axis):r&&r.slice()},axis.tickFormat=function(e){return arguments.length?(i=e,axis):i},axis.tickSize=function(e){return arguments.length?(o=s=+e,axis):o},axis.tickSizeInner=function(e){return arguments.length?(o=+e,axis):o},axis.tickSizeOuter=function(e){return arguments.length?(s=+e,axis):s},axis.tickPadding=function(e){return arguments.length?(h=+e,axis):h},axis.offset=function(e){return arguments.length?(g=+e,axis):g},axis}function axisTop(e){return axis(oe,e)}function axisBottom(e){return axis(ce,e)}var de=t(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):(n=typeof globalThis<`u`?globalThis:n||self).dayjs_plugin_isoWeek=r()})(e,(function(){return function(e,t,n){var a=function(e){return e.add(4-e.isoWeekday(),`day`)},r=t.prototype;r.isoWeekYear=function(){return a(this).year()},r.isoWeek=function(e){if(!this.$utils().u(e))return this.add(7*(e-this.isoWeek()),`day`);var t,r,i,o,s=a(this),h=(t=this.isoWeekYear(),r=this.$u,i=(r?n.utc:n)().year(t).startOf(`year`),o=4-i.isoWeekday(),i.isoWeekday()>4&&(o+=7),i.add(o,`day`));return s.diff(h,`week`)+1},r.isoWeekday=function(e){return this.$utils().u(e)?this.day()||7:this.day(this.day()%7?e:e-7)};var i=r.startOf;r.startOf=function(e,t){var n=this.$utils(),r=!!n.u(t)||t;return n.p(e)===`isoweek`?r?this.date(this.date()-(this.isoWeekday()-1)).startOf(`day`):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf(`day`):i.bind(this)(e,t)}}}))})),fe=t(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):(n=typeof globalThis<`u`?globalThis:n||self).dayjs_plugin_customParseFormat=r()})(e,(function(){var e={LTS:`h:mm:ss A`,LT:`h:mm A`,L:`MM/DD/YYYY`,LL:`MMMM D, YYYY`,LLL:`MMMM D, YYYY h:mm A`,LLLL:`dddd, MMMM D, YYYY h:mm A`},t=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,n=/\d/,r=/\d\d/,i=/\d\d?/,o=/\d*[^-_:/,()\s\d]+/,s={},a=function(e){return(e=+e)+(e>68?1900:2e3)},f=function(e){return function(t){this[e]=+t}},h=[/[+-]\d\d:?(\d\d)?|Z/,function(e){(this.zone||={}).offset=function(e){if(!e||e===`Z`)return 0;var t=e.match(/([+-]|\d\d)/g),n=60*t[1]+(+t[2]||0);return n===0?0:t[0]===`+`?-n:n}(e)}],u=function(e){var t=s[e];return t&&(t.indexOf?t:t.s.concat(t.f))},d=function(e,t){var n,r=s.meridiem;if(r){for(var i=1;i<=24;i+=1)if(e.indexOf(r(i,0,t))>-1){n=i>12;break}}else n=e===(t?`pm`:`PM`);return n},g={A:[o,function(e){this.afternoon=d(e,!1)}],a:[o,function(e){this.afternoon=d(e,!0)}],Q:[n,function(e){this.month=3*(e-1)+1}],S:[n,function(e){this.milliseconds=100*e}],SS:[r,function(e){this.milliseconds=10*e}],SSS:[/\d{3}/,function(e){this.milliseconds=+e}],s:[i,f(`seconds`)],ss:[i,f(`seconds`)],m:[i,f(`minutes`)],mm:[i,f(`minutes`)],H:[i,f(`hours`)],h:[i,f(`hours`)],HH:[i,f(`hours`)],hh:[i,f(`hours`)],D:[i,f(`day`)],DD:[r,f(`day`)],Do:[o,function(e){var t=s.ordinal,n=e.match(/\d+/);if(this.day=n[0],t)for(var r=1;r<=31;r+=1)t(r).replace(/\[|\]/g,``)===e&&(this.day=r)}],w:[i,f(`week`)],ww:[r,f(`week`)],M:[i,f(`month`)],MM:[r,f(`month`)],MMM:[o,function(e){var t=u(`months`),n=(u(`monthsShort`)||t.map((function(e){return e.slice(0,3)}))).indexOf(e)+1;if(n<1)throw Error();this.month=n%12||n}],MMMM:[o,function(e){var t=u(`months`).indexOf(e)+1;if(t<1)throw Error();this.month=t%12||t}],Y:[/[+-]?\d+/,f(`year`)],YY:[r,function(e){this.year=a(e)}],YYYY:[/\d{4}/,f(`year`)],Z:h,ZZ:h};function l(n){for(var r=n,i=s&&s.formats,o=(n=r.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,n,r){var o=r&&r.toUpperCase();return n||i[r]||e[r]||i[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(e,t,n){return t||n.slice(1)}))}))).match(t),h=o.length,_=0;_<h;_+=1){var b=o[_],x=g[b],S=x&&x[0],C=x&&x[1];o[_]=C?{regex:S,parser:C}:b.replace(/^\[|\]$/g,``)}return function(e){for(var t={},n=0,r=0;n<h;n+=1){var i=o[n];if(typeof i==`string`)r+=i.length;else{var s=i.regex,g=i.parser,_=e.slice(r),b=s.exec(_)[0];g.call(t,b),e=e.replace(b,``)}}return function(e){var t=e.afternoon;if(t!==void 0){var n=e.hours;t?n<12&&(e.hours+=12):n===12&&(e.hours=0),delete e.afternoon}}(t),t}}return function(e,t,n){n.p.customParseFormat=!0,e&&e.parseTwoDigitYear&&(a=e.parseTwoDigitYear);var r=t.prototype,i=r.parse;r.parse=function(e){var t=e.date,r=e.utc,o=e.args;this.$u=r;var h=o[1];if(typeof h==`string`){var g=!0===o[2],_=!0===o[3],b=g||_,x=o[2];_&&(x=o[2]),s=this.$locale(),!g&&x&&(s=n.Ls[x]),this.$d=function(e,t,n,r){try{if([`x`,`X`].indexOf(t)>-1)return new Date((t===`X`?1e3:1)*e);var i=l(t)(e),o=i.year,s=i.month,h=i.day,g=i.hours,_=i.minutes,b=i.seconds,x=i.milliseconds,S=i.zone,C=i.week,w=new Date,T=h||(o||s?1:w.getDate()),E=o||w.getFullYear(),D=0;o&&!s||(D=s>0?s-1:w.getMonth());var O,k=g||0,A=_||0,j=b||0,M=x||0;return S?new Date(Date.UTC(E,D,T,k,A,j,M+60*S.offset*1e3)):n?new Date(Date.UTC(E,D,T,k,A,j,M)):(O=new Date(E,D,T,k,A,j,M),C&&(O=r(O).week(C).toDate()),O)}catch{return new Date(``)}}(t,h,r,n),this.init(),x&&!0!==x&&(this.$L=this.locale(x).$L),b&&t!=this.format(h)&&(this.$d=new Date(``)),s={}}else if(h instanceof Array)for(var S=h.length,C=1;C<=S;C+=1){o[1]=h[C-1];var w=n.apply(this,o);if(w.isValid()){this.$d=w.$d,this.$L=w.$L,this.init();break}C===S&&(this.$d=new Date(``))}else i.call(this,e)}}}))})),pe=t(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):(n=typeof globalThis<`u`?globalThis:n||self).dayjs_plugin_advancedFormat=r()})(e,(function(){return function(e,t){var n=t.prototype,r=n.format;n.format=function(e){var t=this,n=this.$locale();if(!this.isValid())return r.bind(this)(e);var i=this.$utils(),o=(e||`YYYY-MM-DDTHH:mm:ssZ`).replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(e){switch(e){case`Q`:return Math.ceil((t.$M+1)/3);case`Do`:return n.ordinal(t.$D);case`gggg`:return t.weekYear();case`GGGG`:return t.isoWeekYear();case`wo`:return n.ordinal(t.week(),`W`);case`w`:case`ww`:return i.s(t.week(),e===`w`?1:2,`0`);case`W`:case`WW`:return i.s(t.isoWeek(),e===`W`?1:2,`0`);case`k`:case`kk`:return i.s(String(t.$H===0?24:t.$H),e===`k`?1:2,`0`);case`X`:return Math.floor(t.$d.getTime()/1e3);case`x`:return t.$d.getTime();case`z`:return`[`+t.offsetName()+`]`;case`zzz`:return`[`+t.offsetName(`long`)+`]`;default:return e}}));return r.bind(this)(o)}}}))})),me=t(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):(n=typeof globalThis<`u`?globalThis:n||self).dayjs_plugin_duration=r()})(e,(function(){var e,t,n=1e3,r=6e4,i=36e5,o=864e5,s=31536e6,h=2628e6,g=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,_=/\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g,b={years:s,months:h,days:o,hours:i,minutes:r,seconds:n,milliseconds:1,weeks:6048e5},c=function(e){return e instanceof x},f=function(e,t,n){return new x(e,n,t.$l)},m=function(e){return t.p(e)+`s`},l=function(e){return e<0},$=function(e){return l(e)?Math.ceil(e):Math.floor(e)},y=function(e){return Math.abs(e)},v=function(e,t){return e?l(e)?{negative:!0,format:``+y(e)+t}:{negative:!1,format:``+e+t}:{negative:!1,format:``}},x=function(){function l(e,t,n){var r=this;if(this.$d={},this.$l=n,e===void 0&&(this.$ms=0,this.parseFromMilliseconds()),t)return f(e*b[m(t)],this);if(typeof e==`number`)return this.$ms=e,this.parseFromMilliseconds(),this;if(typeof e==`object`)return Object.keys(e).forEach((function(t){r.$d[m(t)]=e[t]})),this.calMilliseconds(),this;if(typeof e==`string`){var i=e.match(g);if(i){var o=i.slice(2).map((function(e){return e==null?0:Number(e)}));return this.$d.years=o[0],this.$d.months=o[1],this.$d.weeks=o[2],this.$d.days=o[3],this.$d.hours=o[4],this.$d.minutes=o[5],this.$d.seconds=o[6],this.calMilliseconds(),this}}return this}var x=l.prototype;return x.calMilliseconds=function(){var e=this;this.$ms=Object.keys(this.$d).reduce((function(t,n){return t+(e.$d[n]||0)*b[n]}),0)},x.parseFromMilliseconds=function(){var e=this.$ms;this.$d.years=$(e/s),e%=s,this.$d.months=$(e/h),e%=h,this.$d.days=$(e/o),e%=o,this.$d.hours=$(e/i),e%=i,this.$d.minutes=$(e/r),e%=r,this.$d.seconds=$(e/n),e%=n,this.$d.milliseconds=e},x.toISOString=function(){var e=v(this.$d.years,`Y`),t=v(this.$d.months,`M`),n=+this.$d.days||0;this.$d.weeks&&(n+=7*this.$d.weeks);var r=v(n,`D`),i=v(this.$d.hours,`H`),o=v(this.$d.minutes,`M`),s=this.$d.seconds||0;this.$d.milliseconds&&(s+=this.$d.milliseconds/1e3,s=Math.round(1e3*s)/1e3);var h=v(s,`S`),g=e.negative||t.negative||r.negative||i.negative||o.negative||h.negative,_=i.format||o.format||h.format?`T`:``,b=(g?`-`:``)+`P`+e.format+t.format+r.format+_+i.format+o.format+h.format;return b===`P`||b===`-P`?`P0D`:b},x.toJSON=function(){return this.toISOString()},x.format=function(e){var n=e||`YYYY-MM-DDTHH:mm:ss`,r={Y:this.$d.years,YY:t.s(this.$d.years,2,`0`),YYYY:t.s(this.$d.years,4,`0`),M:this.$d.months,MM:t.s(this.$d.months,2,`0`),D:this.$d.days,DD:t.s(this.$d.days,2,`0`),H:this.$d.hours,HH:t.s(this.$d.hours,2,`0`),m:this.$d.minutes,mm:t.s(this.$d.minutes,2,`0`),s:this.$d.seconds,ss:t.s(this.$d.seconds,2,`0`),SSS:t.s(this.$d.milliseconds,3,`0`)};return n.replace(_,(function(e,t){return t||String(r[e])}))},x.as=function(e){return this.$ms/b[m(e)]},x.get=function(e){var t=this.$ms,n=m(e);return n===`milliseconds`?t%=1e3:t=n===`weeks`?$(t/b[n]):this.$d[n],t||0},x.add=function(e,t,n){var r;return r=t?e*b[m(t)]:c(e)?e.$ms:f(e,this).$ms,f(this.$ms+r*(n?-1:1),this)},x.subtract=function(e,t){return this.add(e,t,!0)},x.locale=function(e){var t=this.clone();return t.$l=e,t},x.clone=function(){return f(this.$ms,this)},x.humanize=function(t){return e().add(this.$ms,`ms`).locale(this.$l).fromNow(!t)},x.valueOf=function(){return this.asMilliseconds()},x.milliseconds=function(){return this.get(`milliseconds`)},x.asMilliseconds=function(){return this.as(`milliseconds`)},x.seconds=function(){return this.get(`seconds`)},x.asSeconds=function(){return this.as(`seconds`)},x.minutes=function(){return this.get(`minutes`)},x.asMinutes=function(){return this.as(`minutes`)},x.hours=function(){return this.get(`hours`)},x.asHours=function(){return this.as(`hours`)},x.days=function(){return this.get(`days`)},x.asDays=function(){return this.as(`days`)},x.weeks=function(){return this.get(`weeks`)},x.asWeeks=function(){return this.as(`weeks`)},x.months=function(){return this.get(`months`)},x.asMonths=function(){return this.as(`months`)},x.years=function(){return this.get(`years`)},x.asYears=function(){return this.as(`years`)},l}(),p=function(e,t,n){return e.add(t.years()*n,`y`).add(t.months()*n,`M`).add(t.days()*n,`d`).add(t.hours()*n,`h`).add(t.minutes()*n,`m`).add(t.seconds()*n,`s`).add(t.milliseconds()*n,`ms`)};return function(n,r,i){e=i,t=i().$utils(),i.duration=function(e,t){return f(e,{$l:i.locale()},t)},i.isDuration=c;var o=r.prototype.add,s=r.prototype.subtract;r.prototype.add=function(e,t){return c(e)?p(this,e,1):o.bind(this)(e,t)},r.prototype.subtract=function(e,t){return c(e)?p(this,e,-1):s.bind(this)(e,t)}}}))})),he=ie(),V=e(r(),1),ge=e(de(),1),_e=e(fe(),1),ve=e(pe(),1),ye=e(me(),1),be=(function(){var e=n(function(e,t,n,r){for(n||={},r=e.length;r--;n[e[r]]=t);return n},`o`),t=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],r=[1,26],i=[1,27],o=[1,28],s=[1,29],h=[1,30],g=[1,31],_=[1,32],b=[1,33],x=[1,34],S=[1,9],C=[1,10],w=[1,11],T=[1,12],E=[1,13],D=[1,14],O=[1,15],k=[1,16],A=[1,19],j=[1,20],M=[1,21],N=[1,22],P=[1,23],F=[1,25],I=[1,35],L={trace:n(function trace(){},`trace`),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:`error`,4:`gantt`,6:`EOF`,8:`SPACE`,10:`NL`,12:`weekday_monday`,13:`weekday_tuesday`,14:`weekday_wednesday`,15:`weekday_thursday`,16:`weekday_friday`,17:`weekday_saturday`,18:`weekday_sunday`,20:`weekend_friday`,21:`weekend_saturday`,22:`dateFormat`,23:`inclusiveEndDates`,24:`topAxis`,25:`axisFormat`,26:`tickInterval`,27:`excludes`,28:`includes`,29:`todayMarker`,30:`title`,31:`acc_title`,32:`acc_title_value`,33:`acc_descr`,34:`acc_descr_value`,35:`acc_descr_multiline_value`,36:`section`,38:`taskTxt`,39:`taskData`,40:`click`,41:`callbackname`,42:`callbackargs`,43:`href`},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:n(function anonymous(e,t,n,r,i,o,s){var h=o.length-1;switch(i){case 1:return o[h-1];case 2:this.$=[];break;case 3:o[h-1].push(o[h]),this.$=o[h-1];break;case 4:case 5:this.$=o[h];break;case 6:case 7:this.$=[];break;case 8:r.setWeekday(`monday`);break;case 9:r.setWeekday(`tuesday`);break;case 10:r.setWeekday(`wednesday`);break;case 11:r.setWeekday(`thursday`);break;case 12:r.setWeekday(`friday`);break;case 13:r.setWeekday(`saturday`);break;case 14:r.setWeekday(`sunday`);break;case 15:r.setWeekend(`friday`);break;case 16:r.setWeekend(`saturday`);break;case 17:r.setDateFormat(o[h].substr(11)),this.$=o[h].substr(11);break;case 18:r.enableInclusiveEndDates(),this.$=o[h].substr(18);break;case 19:r.TopAxis(),this.$=o[h].substr(8);break;case 20:r.setAxisFormat(o[h].substr(11)),this.$=o[h].substr(11);break;case 21:r.setTickInterval(o[h].substr(13)),this.$=o[h].substr(13);break;case 22:r.setExcludes(o[h].substr(9)),this.$=o[h].substr(9);break;case 23:r.setIncludes(o[h].substr(9)),this.$=o[h].substr(9);break;case 24:r.setTodayMarker(o[h].substr(12)),this.$=o[h].substr(12);break;case 27:r.setDiagramTitle(o[h].substr(6)),this.$=o[h].substr(6);break;case 28:this.$=o[h].trim(),r.setAccTitle(this.$);break;case 29:case 30:this.$=o[h].trim(),r.setAccDescription(this.$);break;case 31:r.addSection(o[h].substr(8)),this.$=o[h].substr(8);break;case 33:r.addTask(o[h-1],o[h]),this.$=`task`;break;case 34:this.$=o[h-1],r.setClickEvent(o[h-1],o[h],null);break;case 35:this.$=o[h-2],r.setClickEvent(o[h-2],o[h-1],o[h]);break;case 36:this.$=o[h-2],r.setClickEvent(o[h-2],o[h-1],null),r.setLink(o[h-2],o[h]);break;case 37:this.$=o[h-3],r.setClickEvent(o[h-3],o[h-2],o[h-1]),r.setLink(o[h-3],o[h]);break;case 38:this.$=o[h-2],r.setClickEvent(o[h-2],o[h],null),r.setLink(o[h-2],o[h-1]);break;case 39:this.$=o[h-3],r.setClickEvent(o[h-3],o[h-1],o[h]),r.setLink(o[h-3],o[h-2]);break;case 40:this.$=o[h-1],r.setLink(o[h-1],o[h]);break;case 41:case 47:this.$=o[h-1]+` `+o[h];break;case 42:case 43:case 45:this.$=o[h-2]+` `+o[h-1]+` `+o[h];break;case 44:case 46:this.$=o[h-3]+` `+o[h-2]+` `+o[h-1]+` `+o[h];break}},`anonymous`),table:[{3:1,4:[1,2]},{1:[3]},e(t,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:r,13:i,14:o,15:s,16:h,17:g,18:_,19:18,20:b,21:x,22:S,23:C,24:w,25:T,26:E,27:D,28:O,29:k,30:A,31:j,33:M,35:N,36:P,37:24,38:F,40:I},e(t,[2,7],{1:[2,1]}),e(t,[2,3]),{9:36,11:17,12:r,13:i,14:o,15:s,16:h,17:g,18:_,19:18,20:b,21:x,22:S,23:C,24:w,25:T,26:E,27:D,28:O,29:k,30:A,31:j,33:M,35:N,36:P,37:24,38:F,40:I},e(t,[2,5]),e(t,[2,6]),e(t,[2,17]),e(t,[2,18]),e(t,[2,19]),e(t,[2,20]),e(t,[2,21]),e(t,[2,22]),e(t,[2,23]),e(t,[2,24]),e(t,[2,25]),e(t,[2,26]),e(t,[2,27]),{32:[1,37]},{34:[1,38]},e(t,[2,30]),e(t,[2,31]),e(t,[2,32]),{39:[1,39]},e(t,[2,8]),e(t,[2,9]),e(t,[2,10]),e(t,[2,11]),e(t,[2,12]),e(t,[2,13]),e(t,[2,14]),e(t,[2,15]),e(t,[2,16]),{41:[1,40],43:[1,41]},e(t,[2,4]),e(t,[2,28]),e(t,[2,29]),e(t,[2,33]),e(t,[2,34],{42:[1,42],43:[1,43]}),e(t,[2,40],{41:[1,44]}),e(t,[2,35],{43:[1,45]}),e(t,[2,36]),e(t,[2,38],{42:[1,46]}),e(t,[2,37]),e(t,[2,39])],defaultActions:{},parseError:n(function parseError(e,t){if(t.recoverable)this.trace(e);else{var n=Error(e);throw n.hash=t,n}},`parseError`),parse:n(function parse(e){var t=this,r=[0],i=[],o=[null],s=[],h=this.table,g=``,_=0,b=0,x=0,S=2,C=1,w=s.slice.call(arguments,1),T=Object.create(this.lexer),E={yy:{}};for(var D in this.yy)Object.prototype.hasOwnProperty.call(this.yy,D)&&(E.yy[D]=this.yy[D]);T.setInput(e,E.yy),E.yy.lexer=T,E.yy.parser=this,T.yylloc===void 0&&(T.yylloc={});var O=T.yylloc;s.push(O);var k=T.options&&T.options.ranges;typeof E.yy.parseError==`function`?this.parseError=E.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function popStack(e){r.length-=2*e,o.length-=e,s.length-=e}n(popStack,`popStack`);function lex(){var e=i.pop()||T.lex()||C;return typeof e!=`number`&&(e instanceof Array&&(i=e,e=i.pop()),e=t.symbols_[e]||e),e}n(lex,`lex`);for(var A,j,M,N,P,F={},I,L,ee,R;;){if(M=r[r.length-1],this.defaultActions[M]?N=this.defaultActions[M]:(A??=lex(),N=h[M]&&h[M][A]),N===void 0||!N.length||!N[0]){var z=``;for(I in R=[],h[M])this.terminals_[I]&&I>S&&R.push(`'`+this.terminals_[I]+`'`);z=T.showPosition?`Parse error on line `+(_+1)+`:
`+T.showPosition()+`
Expecting `+R.join(`, `)+`, got '`+(this.terminals_[A]||A)+`'`:`Parse error on line `+(_+1)+`: Unexpected `+(A==C?`end of input`:`'`+(this.terminals_[A]||A)+`'`),this.parseError(z,{text:T.match,token:this.terminals_[A]||A,line:T.yylineno,loc:O,expected:R})}if(N[0]instanceof Array&&N.length>1)throw Error(`Parse Error: multiple actions possible at state: `+M+`, token: `+A);switch(N[0]){case 1:r.push(A),o.push(T.yytext),s.push(T.yylloc),r.push(N[1]),A=null,j?(A=j,j=null):(b=T.yyleng,g=T.yytext,_=T.yylineno,O=T.yylloc,x>0&&x--);break;case 2:if(L=this.productions_[N[1]][1],F.$=o[o.length-L],F._$={first_line:s[s.length-(L||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(L||1)].first_column,last_column:s[s.length-1].last_column},k&&(F._$.range=[s[s.length-(L||1)].range[0],s[s.length-1].range[1]]),P=this.performAction.apply(F,[g,b,_,E.yy,N[1],o,s].concat(w)),P!==void 0)return P;L&&(r=r.slice(0,-1*L*2),o=o.slice(0,-1*L),s=s.slice(0,-1*L)),r.push(this.productions_[N[1]][0]),o.push(F.$),s.push(F._$),ee=h[r[r.length-2]][r[r.length-1]],r.push(ee);break;case 3:return!0}}return!0},`parse`)};L.lexer=(function(){return{EOF:1,parseError:n(function parseError(e,t){if(this.yy.parser)this.yy.parser.parseError(e,t);else throw Error(e)},`parseError`),setInput:n(function(e,t){return this.yy=t||this.yy||{},this._input=e,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match=``,this.conditionStack=[`INITIAL`],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},`setInput`),input:n(function(){var e=this._input[0];return this.yytext+=e,this.yyleng++,this.offset++,this.match+=e,this.matched+=e,e.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),e},`input`),unput:n(function(e){var t=e.length,n=e.split(/(?:\r\n?|\n)/g);this._input=e+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-t),this.offset-=t;var r=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),n.length-1&&(this.yylineno-=n.length-1);var i=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:n?(n.length===r.length?this.yylloc.first_column:0)+r[r.length-n.length].length-n[0].length:this.yylloc.first_column-t},this.options.ranges&&(this.yylloc.range=[i[0],i[0]+this.yyleng-t]),this.yyleng=this.yytext.length,this},`unput`),more:n(function(){return this._more=!0,this},`more`),reject:n(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError(`Lexical error on line `+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:``,token:null,line:this.yylineno});return this},`reject`),less:n(function(e){this.unput(this.match.slice(e))},`less`),pastInput:n(function(){var e=this.matched.substr(0,this.matched.length-this.match.length);return(e.length>20?`...`:``)+e.substr(-20).replace(/\n/g,``)},`pastInput`),upcomingInput:n(function(){var e=this.match;return e.length<20&&(e+=this._input.substr(0,20-e.length)),(e.substr(0,20)+(e.length>20?`...`:``)).replace(/\n/g,``)},`upcomingInput`),showPosition:n(function(){var e=this.pastInput(),t=Array(e.length+1).join(`-`);return e+this.upcomingInput()+`
`+t+`^`},`showPosition`),test_match:n(function(e,t){var n,r,i;if(this.options.backtrack_lexer&&(i={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(i.yylloc.range=this.yylloc.range.slice(0))),r=e[0].match(/(?:\r\n?|\n).*/g),r&&(this.yylineno+=r.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:r?r[r.length-1].length-r[r.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+e[0].length},this.yytext+=e[0],this.match+=e[0],this.matches=e,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(e[0].length),this.matched+=e[0],n=this.performAction.call(this,this.yy,this,t,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),n)return n;if(this._backtrack){for(var o in i)this[o]=i[o];return!1}return!1},`test_match`),next:n(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var e,t,n,r;this._more||(this.yytext=``,this.match=``);for(var i=this._currentRules(),o=0;o<i.length;o++)if(n=this._input.match(this.rules[i[o]]),n&&(!t||n[0].length>t[0].length)){if(t=n,r=o,this.options.backtrack_lexer){if(e=this.test_match(n,i[o]),e!==!1)return e;if(this._backtrack){t=!1;continue}else return!1}else if(!this.options.flex)break}return t?(e=this.test_match(t,i[r]),e!==!1&&e):this._input===``?this.EOF:this.parseError(`Lexical error on line `+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:``,token:null,line:this.yylineno})},`next`),lex:n(function lex(){return this.next()||this.lex()},`lex`),begin:n(function begin(e){this.conditionStack.push(e)},`begin`),popState:n(function popState(){return this.conditionStack.length-1>0?this.conditionStack.pop():this.conditionStack[0]},`popState`),_currentRules:n(function _currentRules(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},`_currentRules`),topState:n(function topState(e){return e=this.conditionStack.length-1-Math.abs(e||0),e>=0?this.conditionStack[e]:`INITIAL`},`topState`),pushState:n(function pushState(e){this.begin(e)},`pushState`),stateStackSize:n(function stateStackSize(){return this.conditionStack.length},`stateStackSize`),options:{"case-insensitive":!0},performAction:n(function anonymous(e,t,n,r){switch(n){case 0:return this.begin(`open_directive`),`open_directive`;case 1:return this.begin(`acc_title`),31;case 2:return this.popState(),`acc_title_value`;case 3:return this.begin(`acc_descr`),33;case 4:return this.popState(),`acc_descr_value`;case 5:this.begin(`acc_descr_multiline`);break;case 6:this.popState();break;case 7:return`acc_descr_multiline_value`;case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin(`href`);break;case 15:this.popState();break;case 16:return 43;case 17:this.begin(`callbackname`);break;case 18:this.popState();break;case 19:this.popState(),this.begin(`callbackargs`);break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin(`click`);break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return`date`;case 45:return 30;case 46:return`accDescription`;case 47:return 36;case 48:return 38;case 49:return 39;case 50:return`:`;case 51:return 6;case 52:return`INVALID`}},`anonymous`),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}}})();function Parser(){this.yy={}}return n(Parser,`Parser`),Parser.prototype=L,L.Parser=Parser,new Parser})();be.parser=be;var xe=be;V.default.extend(ge.default),V.default.extend(_e.default),V.default.extend(ve.default);var Se={friday:5,saturday:6},H=``,Ce=``,we=void 0,Te=``,U=[],W=[],Ee=new Map,De=[],Oe=[],G=``,ke=``,Ae=[`active`,`done`,`crit`,`milestone`,`vert`],je=[],K=``,q=!1,Me=!1,Ne=`sunday`,J=`saturday`,Pe=0,Fe=n(function(){De=[],Oe=[],G=``,je=[],ht=0,vt=void 0,yt=void 0,X=[],H=``,Ce=``,ke=``,we=void 0,Te=``,U=[],W=[],q=!1,Me=!1,Pe=0,Ee=new Map,K=``,_(),Ne=`sunday`,J=`saturday`},`clear`),Ie=n(function(e){K=e},`setDiagramId`),Le=n(function(e){Ce=e},`setAxisFormat`),Re=n(function(){return Ce},`getAxisFormat`),ze=n(function(e){we=e},`setTickInterval`),Be=n(function(){return we},`getTickInterval`),Ve=n(function(e){Te=e},`setTodayMarker`),He=n(function(){return Te},`getTodayMarker`),Ue=n(function(e){H=e},`setDateFormat`),We=n(function(){q=!0},`enableInclusiveEndDates`),Ge=n(function(){return q},`endDatesAreInclusive`),Ke=n(function(){Me=!0},`enableTopAxis`),qe=n(function(){return Me},`topAxisEnabled`),Je=n(function(e){ke=e},`setDisplayMode`),Ye=n(function(){return ke},`getDisplayMode`),Xe=n(function(){return H},`getDateFormat`),Ze=n((e,t)=>{let n=t.toLowerCase().split(/[\s,]+/).filter(e=>e!==``);return[...new Set([...e,...n])]},`mergeTokens`),Qe=n(function(e){U=Ze(U,e)},`setIncludes`),$e=n(function(){return U},`getIncludes`),et=n(function(e){W=Ze(W,e)},`setExcludes`),tt=n(function(){return W},`getExcludes`),nt=n(function(){return Ee},`getLinks`),rt=n(function(e){G=e,De.push(e)},`addSection`),it=n(function(){return De},`getSections`),at=n(function(){let e=Ct(),t=0;for(;!e&&t<10;)e=Ct(),t++;return Oe=X,Oe},`getTasks`),ot=n(function(e,t,n,r){let i=e.format(t.trim()),o=e.format(`YYYY-MM-DD`);return r.includes(i)||r.includes(o)?!1:n.includes(`weekends`)&&(e.isoWeekday()===Se[J]||e.isoWeekday()===Se[J]+1)||n.includes(e.format(`dddd`).toLowerCase())?!0:n.includes(i)||n.includes(o)},`isInvalidDate`),st=n(function(e){Ne=e},`setWeekday`),ct=n(function(){return Ne},`getWeekday`),lt=n(function(e){J=e},`setWeekend`),ut=n(function(e,t,n,r){if(!n.length||e.manualEndTime)return;let i;i=e.startTime instanceof Date?(0,V.default)(e.startTime):(0,V.default)(e.startTime,t,!0),i=i.add(1,`d`);let o;o=e.endTime instanceof Date?(0,V.default)(e.endTime):(0,V.default)(e.endTime,t,!0);let[s,h]=dt(i,o,t,n,r);e.endTime=s.toDate(),e.renderEndTime=h},`checkTaskDates`),dt=n(function(e,t,n,r,i){let o=!1,s=null,h=t.add(1e4,`d`);for(;e<=t;){if(o||(s=t.toDate()),o=ot(e,n,r,i),o&&(t=t.add(1,`d`),t>h))throw Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");e=e.add(1,`d`)}return[t,s]},`fixTaskDates`),ft=n(function(e,t,r){if(r=r.trim(),n(e=>{let t=e.trim();return t===`x`||t===`X`},`isTimestampFormat`)(t)&&/^\d+$/.test(r))return new Date(Number(r));let o=/^after\s+(?<ids>[\d\w- ]+)/.exec(r);if(o!==null){let e=null;for(let t of o.groups.ids.split(` `)){let n=Z(t);n!==void 0&&(!e||n.endTime>e.endTime)&&(e=n)}if(e)return e.endTime;let t=new Date;return t.setHours(0,0,0,0),t}let s=(0,V.default)(r,t.trim(),!0);if(s.isValid())return s.toDate();{i.debug(`Invalid date:`+r),i.debug(`With date format:`+t.trim());let e=new Date(r);if(e===void 0||isNaN(e.getTime())||e.getFullYear()<-1e4||e.getFullYear()>1e4)throw Error(`Invalid date:`+r);return e}},`getStartDate`),pt=n(function(e){let t=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(e.trim());return t===null?[NaN,`ms`]:[Number.parseFloat(t[1]),t[2]]},`parseDuration`),mt=n(function(e,t,n,r=!1){n=n.trim();let i=/^until\s+(?<ids>[\d\w- ]+)/.exec(n);if(i!==null){let e=null;for(let t of i.groups.ids.split(` `)){let n=Z(t);n!==void 0&&(!e||n.startTime<e.startTime)&&(e=n)}if(e)return e.startTime;let t=new Date;return t.setHours(0,0,0,0),t}let o=(0,V.default)(n,t.trim(),!0);if(o.isValid())return r&&(o=o.add(1,`d`)),o.toDate();let s=(0,V.default)(e),[h,g]=pt(n);if(!Number.isNaN(h)){let e=s.add(h,g);e.isValid()&&(s=e)}return s.toDate()},`getEndDate`),ht=0,Y=n(function(e){return e===void 0?(ht+=1,`task`+ht):e},`parseId`),gt=n(function(e,t){let n;n=t.substr(0,1)===`:`?t.substr(1,t.length):t;let r=n.split(`,`),i={};getTaskTags(r,i,Ae);for(let e=0;e<r.length;e++)r[e]=r[e].trim();let o=``;switch(r.length){case 1:i.id=Y(),i.startTime=e.endTime,o=r[0];break;case 2:i.id=Y(),i.startTime=ft(void 0,H,r[0]),o=r[1];break;case 3:i.id=Y(r[0]),i.startTime=ft(void 0,H,r[1]),o=r[2];break;default:}return o&&(i.endTime=mt(i.startTime,H,o,q),i.manualEndTime=(0,V.default)(o,`YYYY-MM-DD`,!0).isValid(),ut(i,H,W,U)),i},`compileData`),_t=n(function(e,t){let n;n=t.substr(0,1)===`:`?t.substr(1,t.length):t;let r=n.split(`,`),i={};getTaskTags(r,i,Ae);for(let e=0;e<r.length;e++)r[e]=r[e].trim();switch(r.length){case 1:i.id=Y(),i.startTime={type:`prevTaskEnd`,id:e},i.endTime={data:r[0]};break;case 2:i.id=Y(),i.startTime={type:`getStartDate`,startData:r[0]},i.endTime={data:r[1]};break;case 3:i.id=Y(r[0]),i.startTime={type:`getStartDate`,startData:r[1]},i.endTime={data:r[2]};break;default:}return i},`parseData`),vt,yt,X=[],bt={},xt=n(function(e,t){let n={section:G,type:G,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:t},task:e,classes:[]},r=_t(yt,t);n.raw.startTime=r.startTime,n.raw.endTime=r.endTime,n.id=r.id,n.prevTaskId=yt,n.active=r.active,n.done=r.done,n.crit=r.crit,n.milestone=r.milestone,n.vert=r.vert,n.vert?n.order=-1:(n.order=Pe,Pe++);let i=X.push(n);yt=n.id,bt[n.id]=i-1},`addTask`),Z=n(function(e){let t=bt[e];return X[t]},`findTaskById`),St=n(function(e,t){let n={section:G,type:G,description:e,task:e,classes:[]},r=gt(vt,t);n.startTime=r.startTime,n.endTime=r.endTime,n.id=r.id,n.active=r.active,n.done=r.done,n.crit=r.crit,n.milestone=r.milestone,n.vert=r.vert,vt=n,Oe.push(n)},`addTaskOrg`),Ct=n(function(){let e=n(function(e){let t=X[e],n=``;switch(X[e].raw.startTime.type){case`prevTaskEnd`:t.startTime=Z(t.prevTaskId).endTime;break;case`getStartDate`:n=ft(void 0,H,X[e].raw.startTime.startData),n&&(X[e].startTime=n);break}return X[e].startTime&&(X[e].endTime=mt(X[e].startTime,H,X[e].raw.endTime.data,q),X[e].endTime&&(X[e].processed=!0,X[e].manualEndTime=(0,V.default)(X[e].raw.endTime.data,`YYYY-MM-DD`,!0).isValid(),ut(X[e],H,W,U))),X[e].processed},`compileTask`),t=!0;for(let[n,r]of X.entries())e(n),t&&=r.processed;return t},`compileTasks`),wt=n(function(e,t){let n=t;w().securityLevel!==`loose`&&(n=(0,he.sanitizeUrl)(t)),e.split(`,`).forEach(function(e){Z(e)!==void 0&&(Dt(e,()=>{window.open(n,`_self`)}),Ee.set(e,n))}),Tt(e,`clickable`)},`setLink`),Tt=n(function(e,t){e.split(`,`).forEach(function(e){let n=Z(e);n!==void 0&&n.classes.push(t)})},`setClass`),Et=n(function(e,t,n){if(w().securityLevel!==`loose`||t===void 0)return;let r=[];if(typeof n==`string`){r=n.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let e=0;e<r.length;e++){let t=r[e].trim();t.startsWith(`"`)&&t.endsWith(`"`)&&(t=t.substr(1,t.length-2)),r[e]=t}}r.length===0&&r.push(e),Z(e)!==void 0&&Dt(e,()=>{ae.runFunc(t,...r)})},`setClickFun`),Dt=n(function(e,t){je.push(function(){let n=K?`${K}-${e}`:e,r=document.querySelector(`[id="${n}"]`);r!==null&&r.addEventListener(`click`,function(){t()})},function(){let n=K?`${K}-${e}`:e,r=document.querySelector(`[id="${n}-text"]`);r!==null&&r.addEventListener(`click`,function(){t()})})},`pushFun`),Ot={getConfig:n(()=>w().gantt,`getConfig`),clear:Fe,setDateFormat:Ue,getDateFormat:Xe,enableInclusiveEndDates:We,endDatesAreInclusive:Ge,enableTopAxis:Ke,topAxisEnabled:qe,setAxisFormat:Le,getAxisFormat:Re,setTickInterval:ze,getTickInterval:Be,setTodayMarker:Ve,getTodayMarker:He,setAccTitle:g,getAccTitle:T,setDiagramTitle:h,getDiagramTitle:C,setDiagramId:Ie,setDisplayMode:Je,getDisplayMode:Ye,setAccDescription:s,getAccDescription:S,addSection:rt,getSections:it,getTasks:at,addTask:xt,findTaskById:Z,addTaskOrg:St,setIncludes:Qe,getIncludes:$e,setExcludes:et,getExcludes:tt,setClickEvent:n(function(e,t,n){e.split(`,`).forEach(function(e){Et(e,t,n)}),Tt(e,`clickable`)},`setClickEvent`),setLink:wt,getLinks:nt,bindFunctions:n(function(e){je.forEach(function(t){t(e)})},`bindFunctions`),parseDuration:pt,isInvalidDate:ot,setWeekday:st,getWeekday:ct,setWeekend:lt};function getTaskTags(e,t,n){let r=!0;for(;r;)r=!1,n.forEach(function(n){let i=`^\\s*`+n+`\\s*$`,o=new RegExp(i);e[0].match(o)&&(t[n]=!0,e.shift(1),r=!0)})}n(getTaskTags,`getTaskTags`),V.default.extend(ye.default);var kt=n(function(){i.debug(`Something is calling, setConf, remove the call`)},`setConf`),At={monday:M,tuesday:O,wednesday:B,thursday:N,friday:I,saturday:L,sunday:P},jt=n((e,t)=>{let n=[...e].map(()=>-1/0),r=[...e].sort((e,t)=>e.startTime-t.startTime||e.order-t.order),i=0;for(let e of r)for(let r=0;r<n.length;r++)if(e.startTime>=n[r]){n[r]=e.endTime,e.order=r+t,r>i&&(i=r);break}return i},`getMaxIntersections`),Q,Mt=1e4,Nt={parser:xe,db:Ot,renderer:{setConf:kt,draw:n(function(e,t,r,s){let h=w().gantt;s.db.setDiagramId(t);let g=w().securityLevel,_;g===`sandbox`&&(_=o(`#i`+t));let S=o(g===`sandbox`?_.nodes()[0].contentDocument.body:`body`),C=g===`sandbox`?_.nodes()[0].contentDocument:document,T=C.getElementById(t);Q=T.parentElement.offsetWidth,Q===void 0&&(Q=1200),h.useWidth!==void 0&&(Q=h.useWidth);let O=s.db.getTasks(),M=O.filter(e=>!e.vert),N=[];for(let e of M)N.push(e.type);N=checkUnique(N);let P={},I=2*h.topPadding;if(s.db.getDisplayMode()===`compact`||h.displayMode===`compact`){let e={};for(let t of M)e[t.section]===void 0?e[t.section]=[t]:e[t.section].push(t);let t=0;for(let n of Object.keys(e)){let r=jt(e[n],t)+1;t+=r,I+=r*(h.barHeight+h.barGap),P[n]=r}}else{I+=M.length*(h.barHeight+h.barGap);for(let e of N)P[e]=M.filter(t=>t.type===e).length}T.setAttribute(`viewBox`,`0 0 `+Q+` `+I);let L=S.select(`[id="${t}"]`),B=F().domain([E(O,function(e){return e.startTime}),D(O,function(e){return e.endTime})]).rangeRound([0,Q-h.leftPadding-h.rightPadding]);function taskCompare(e,t){let n=e.startTime,r=t.startTime,i=0;return n>r?i=1:n<r&&(i=-1),i}n(taskCompare,`taskCompare`),O.sort(taskCompare),makeGantt(O,Q,I),b(L,I,Q,h.useMaxWidth),L.append(`text`).text(s.db.getDiagramTitle()).attr(`x`,Q/2).attr(`y`,h.titleTopMargin).attr(`class`,`titleText`);function makeGantt(e,t,n){let r=h.barHeight,i=r+h.barGap,o=h.topPadding,g=h.leftPadding,_=ee().domain([0,N.length]).range([`#00B9FA`,`#F95002`]).interpolate(re);drawExcludeDays(i,o,g,t,n,e,s.db.getExcludes(),s.db.getIncludes()),makeGrid(g,o,t,n),drawRects(e,i,o,g,r,_,t,n),vertLabels(i,o,g,r,_),drawToday(g,o,t,n)}n(makeGantt,`makeGantt`);function drawRects(e,n,r,i,g,_,b){e.sort((e,t)=>e.vert===t.vert?0:e.vert?1:-1);let x=e.filter(e=>!e.vert),S=[...new Set(x.map(e=>e.order))].map(e=>x.find(t=>t.order===e));L.append(`g`).selectAll(`rect`).data(S).enter().append(`rect`).attr(`x`,0).attr(`y`,function(e,t){return t=e.order,t*n+r-2}).attr(`width`,function(){return b-h.rightPadding/2}).attr(`height`,n).attr(`class`,function(e){for(let[t,n]of N.entries())if(e.type===n)return`section section`+t%h.numberSectionStyles;return`section section0`}).enter();let C=L.append(`g`).selectAll(`rect`).data(e).enter(),T=s.db.getLinks();if(C.append(`rect`).attr(`id`,function(e){return t+`-`+e.id}).attr(`rx`,3).attr(`ry`,3).attr(`x`,function(e){return e.milestone?B(e.startTime)+i+.5*(B(e.endTime)-B(e.startTime))-.5*g:B(e.startTime)+i}).attr(`y`,function(e,t){return t=e.order,e.vert?h.gridLineStartPadding:t*n+r}).attr(`width`,function(e){return e.milestone?g:e.vert?.08*g:B(e.renderEndTime||e.endTime)-B(e.startTime)}).attr(`height`,function(e){return e.vert?x.length*(h.barHeight+h.barGap)+h.barHeight*2:g}).attr(`transform-origin`,function(e,t){return t=e.order,(B(e.startTime)+i+.5*(B(e.endTime)-B(e.startTime))).toString()+`px `+(t*n+r+.5*g).toString()+`px`}).attr(`class`,function(e){let t=``;e.classes.length>0&&(t=e.classes.join(` `));let n=0;for(let[t,r]of N.entries())e.type===r&&(n=t%h.numberSectionStyles);let r=``;return e.active?e.crit?r+=` activeCrit`:r=` active`:e.done?r=e.crit?` doneCrit`:` done`:e.crit&&(r+=` crit`),r.length===0&&(r=` task`),e.milestone&&(r=` milestone `+r),e.vert&&(r=` vert `+r),r+=n,r+=` `+t,`task`+r}),C.append(`text`).attr(`id`,function(e){return t+`-`+e.id+`-text`}).text(function(e){return e.task}).attr(`font-size`,h.fontSize).attr(`x`,function(e){let t=B(e.startTime),n=B(e.renderEndTime||e.endTime);if(e.milestone&&(t+=.5*(B(e.endTime)-B(e.startTime))-.5*g,n=t+g),e.vert)return B(e.startTime)+i;let r=this.getBBox().width;return r>n-t?n+r+1.5*h.leftPadding>b?t+i-5:n+i+5:(n-t)/2+t+i}).attr(`y`,function(e,t){return e.vert?h.gridLineStartPadding+x.length*(h.barHeight+h.barGap)+60:(t=e.order,t*n+h.barHeight/2+(h.fontSize/2-2)+r)}).attr(`text-height`,g).attr(`class`,function(e){let t=B(e.startTime),n=B(e.endTime);e.milestone&&(n=t+g);let r=this.getBBox().width,i=``;e.classes.length>0&&(i=e.classes.join(` `));let o=0;for(let[t,n]of N.entries())e.type===n&&(o=t%h.numberSectionStyles);let s=``;return e.active&&(s=e.crit?`activeCritText`+o:`activeText`+o),e.done?s=e.crit?s+` doneCritText`+o:s+` doneText`+o:e.crit&&(s=s+` critText`+o),e.milestone&&(s+=` milestoneText`),e.vert&&(s+=` vertText`),r>n-t?n+r+1.5*h.leftPadding>b?i+` taskTextOutsideLeft taskTextOutside`+o+` `+s:i+` taskTextOutsideRight taskTextOutside`+o+` `+s+` width-`+r:i+` taskText taskText`+o+` `+s+` width-`+r}),w().securityLevel===`sandbox`){let e;e=o(`#i`+t);let n=e.nodes()[0].contentDocument;C.filter(function(e){return T.has(e.id)}).each(function(e){var r=n.querySelector(`#`+CSS.escape(t+`-`+e.id)),i=n.querySelector(`#`+CSS.escape(t+`-`+e.id+`-text`));let o=r.parentNode;var s=n.createElement(`a`);s.setAttribute(`xlink:href`,T.get(e.id)),s.setAttribute(`target`,`_top`),o.appendChild(s),s.appendChild(r),s.appendChild(i)})}}n(drawRects,`drawRects`);function drawExcludeDays(e,n,r,o,g,_,b,x){if(b.length===0&&x.length===0)return;let S,C;for(let{startTime:e,endTime:t}of _)(S===void 0||e<S)&&(S=e),(C===void 0||t>C)&&(C=t);if(!S||!C)return;if((0,V.default)(C).diff((0,V.default)(S),`year`)>5){i.warn(`The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.`);return}let w=s.db.getDateFormat(),T=[],E=null,D=(0,V.default)(S);for(;D.valueOf()<=C;)s.db.isInvalidDate(D,w,b,x)?E?E.end=D:E={start:D,end:D}:E&&=(T.push(E),null),D=D.add(1,`d`);L.append(`g`).selectAll(`rect`).data(T).enter().append(`rect`).attr(`id`,e=>t+`-exclude-`+e.start.format(`YYYY-MM-DD`)).attr(`x`,e=>B(e.start.startOf(`day`))+r).attr(`y`,h.gridLineStartPadding).attr(`width`,e=>B(e.end.endOf(`day`))-B(e.start.startOf(`day`))).attr(`height`,g-n-h.gridLineStartPadding).attr(`transform-origin`,function(t,n){return(B(t.start)+r+.5*(B(t.end)-B(t.start))).toString()+`px `+(n*e+.5*g).toString()+`px`}).attr(`class`,`exclude-range`)}n(drawExcludeDays,`drawExcludeDays`);function getEstimatedTickCount(e,t,n,r){if(n<=0||e>t)return 1/0;let i=t-e,o=V.default.duration({[r??`day`]:n}).asMilliseconds();return o<=0?1/0:Math.ceil(i/o)}n(getEstimatedTickCount,`getEstimatedTickCount`);function makeGrid(e,t,n,r){let o=s.db.getDateFormat(),g=s.db.getAxisFormat(),_;_=g||(o===`D`?`%d`:h.axisFormat??`%Y-%m-%d`);let b=axisBottom(B).tickSize(-r+t+h.gridLineStartPadding).tickFormat(k(_)),x=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(s.db.getTickInterval()||h.tickInterval);if(x!==null){let e=parseInt(x[1],10);if(isNaN(e)||e<=0)i.warn(`Invalid tick interval value: "${x[1]}". Skipping custom tick interval.`);else{let t=x[2],n=s.db.getWeekday()||h.weekday,r=B.domain(),o=r[0],g=r[1],_=getEstimatedTickCount(o,g,e,t);if(_>Mt)i.warn(`The tick interval "${e}${t}" would generate ${_} ticks, which exceeds the maximum allowed (${Mt}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(t){case`millisecond`:b.ticks(R.every(e));break;case`second`:b.ticks(te.every(e));break;case`minute`:b.ticks(j.every(e));break;case`hour`:b.ticks(ne.every(e));break;case`day`:b.ticks(A.every(e));break;case`week`:b.ticks(At[n].every(e));break;case`month`:b.ticks(z.every(e));break}}}if(L.append(`g`).attr(`class`,`grid`).attr(`transform`,`translate(`+e+`, `+(r-50)+`)`).call(b).selectAll(`text`).style(`text-anchor`,`middle`).attr(`fill`,`#000`).attr(`stroke`,`none`).attr(`font-size`,10).attr(`dy`,`1em`),s.db.topAxisEnabled()||h.topAxis){let n=axisTop(B).tickSize(-r+t+h.gridLineStartPadding).tickFormat(k(_));if(x!==null){let e=parseInt(x[1],10);if(isNaN(e)||e<=0)i.warn(`Invalid tick interval value: "${x[1]}". Skipping custom tick interval.`);else{let t=x[2],r=s.db.getWeekday()||h.weekday,i=B.domain(),o=i[0],g=i[1];if(getEstimatedTickCount(o,g,e,t)<=Mt)switch(t){case`millisecond`:n.ticks(R.every(e));break;case`second`:n.ticks(te.every(e));break;case`minute`:n.ticks(j.every(e));break;case`hour`:n.ticks(ne.every(e));break;case`day`:n.ticks(A.every(e));break;case`week`:n.ticks(At[r].every(e));break;case`month`:n.ticks(z.every(e));break}}}L.append(`g`).attr(`class`,`grid`).attr(`transform`,`translate(`+e+`, `+t+`)`).call(n).selectAll(`text`).style(`text-anchor`,`middle`).attr(`fill`,`#000`).attr(`stroke`,`none`).attr(`font-size`,10)}}n(makeGrid,`makeGrid`);function vertLabels(e,t){let n=0,r=Object.keys(P).map(e=>[e,P[e]]);L.append(`g`).selectAll(`text`).data(r).enter().append(function(e){let t=e[0].split(x.lineBreakRegex),n=-(t.length-1)/2,r=C.createElementNS(`http://www.w3.org/2000/svg`,`text`);r.setAttribute(`dy`,n+`em`);for(let[e,n]of t.entries()){let t=C.createElementNS(`http://www.w3.org/2000/svg`,`tspan`);t.setAttribute(`alignment-baseline`,`central`),t.setAttribute(`x`,`10`),e>0&&t.setAttribute(`dy`,`1em`),t.textContent=n,r.appendChild(t)}return r}).attr(`x`,10).attr(`y`,function(i,o){if(o>0)for(let s=0;s<o;s++)return n+=r[o-1][1],i[1]*e/2+n*e+t;else return i[1]*e/2+t}).attr(`font-size`,h.sectionFontSize).attr(`class`,function(e){for(let[t,n]of N.entries())if(e[0]===n)return`sectionTitle sectionTitle`+t%h.numberSectionStyles;return`sectionTitle`})}n(vertLabels,`vertLabels`);function drawToday(e,t,n,r){let i=s.db.getTodayMarker();if(i===`off`)return;let o=L.append(`g`).attr(`class`,`today`),g=new Date,_=o.append(`line`);_.attr(`x1`,B(g)+e).attr(`x2`,B(g)+e).attr(`y1`,h.titleTopMargin).attr(`y2`,r-h.titleTopMargin).attr(`class`,`today`),i!==``&&_.attr(`style`,i.replace(/,/g,`;`))}n(drawToday,`drawToday`);function checkUnique(e){let t={},n=[];for(let r=0,i=e.length;r<i;++r)Object.prototype.hasOwnProperty.call(t,e[r])||(t[e[r]]=!0,n.push(e[r]));return n}n(checkUnique,`checkUnique`)},`draw`)},styles:n(e=>`
  .mermaid-main-font {
        font-family: ${e.fontFamily};
  }

  .exclude-range {
    fill: ${e.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${e.sectionBkgColor};
  }

  .section2 {
    fill: ${e.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${e.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${e.titleColor};
  }

  .sectionTitle1 {
    fill: ${e.titleColor};
  }

  .sectionTitle2 {
    fill: ${e.titleColor};
  }

  .sectionTitle3 {
    fill: ${e.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${e.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${e.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${e.fontFamily};
    fill: ${e.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${e.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${e.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${e.taskTextDarkColor};
    text-anchor: start;
    font-family: ${e.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${e.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${e.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${e.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${e.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${e.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${e.taskBkgColor};
    stroke: ${e.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${e.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${e.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${e.activeTaskBkgColor};
    stroke: ${e.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${e.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${e.doneTaskBorderColor};
    fill: ${e.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${e.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${e.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${e.critBorderColor};
    fill: ${e.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${e.critBorderColor};
    fill: ${e.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${e.critBorderColor};
    fill: ${e.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${e.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar \u2014 same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${e.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${e.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${e.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${e.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${e.titleColor||e.textColor};
    font-family: ${e.fontFamily};
  }
`,`getStyles`)};export{Nt as diagram};