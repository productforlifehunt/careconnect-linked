import"./rolldown-runtime-Eu0AZhn2.js";import{n as e}from"./chunk-Y2CYZVJY-CUaGfQly.js";import{n as t}from"./d3-selection-D2h7Y91O.js";import{D as n,H as r,K as i,U as a,a as o,b as s,c,f as l,v as u,w as d,y as f}from"./chunk-DU6HZSFF-BDIn85ah.js";import{t as p}from"./chunk-CLGD4ZFX-CPC-VA_g.js";import{i as m}from"./chunk-75Z2AOVW-CxhOttCB.js";import{t as h}from"./chunk-JWPE2WC7-CNVnSWDx.js";import{n as g}from"./mermaid-parser.core-CigT8pvL.js";var _=e(()=>({domains:new Map,transitions:[]}),`createDefaultData`),v=_(),y={getDomains:e(()=>v.domains,`getDomains`),getTransitions:e(()=>v.transitions,`getTransitions`),setDomains:e(e=>{if(e)for(let t of e){let e=t.domain,n=(t.items??[]).map(e=>({label:e.label}));v.domains.set(e,{name:e,items:n})}},`setDomains`),setTransitions:e(e=>{e&&(v.transitions=e.filter(e=>e.from===e.to?(t.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},`setTransitions`),getConfig:e(()=>m({...l.cynefin,...s().cynefin}),`getConfig`),clear:e(()=>{o(),v=_()},`clear`),setAccTitle:a,getAccTitle:f,setDiagramTitle:i,getDiagramTitle:d,getAccDescription:u,setAccDescription:r},b=e(e=>{h(e,y),y.setDomains(e.domains),y.setTransitions(e.transitions)},`populate`),x={parse:e(async e=>{let n=await g(`cynefin`,e);t.debug(n),b(n)},`parse`)};function seededRandom(e){let t=e+1831565813|0;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}e(seededRandom,`seededRandom`);function hashString(e){let t=0;for(let n=0;n<e.length;n++){let r=e.charCodeAt(n);t=(t<<5)-t+r,t|=0}return t}e(hashString,`hashString`);function resolveSeed(e,t){return typeof e==`number`&&Number.isFinite(e)&&e!==0?e:hashString(t)}e(resolveSeed,`resolveSeed`);function generateFoldPath(e,t,n,r){let i=e/2,a=r??e*.015,o=t/7,s=[];for(let e=0;e<=7;e++){let t=seededRandom(n+e*17)*a*2-a;s.push({x:i+t,y:e*o})}let c=`M${s[0].x},${s[0].y}`;for(let e=0;e<s.length-1;e++){let t=s[e],r=s[e+1],i=(t.y+r.y)/2,o=e%2==0?1:-1,l=a*1.5*o*seededRandom(n+e*31+7),u=t.x+l,d=i,f=r.x-l;c+=` C${u},${d} ${f},${i} ${r.x},${r.y}`}return c}e(generateFoldPath,`generateFoldPath`);function generateHorizontalBoundary(e,t,n,r){let i=t/2,a=r??t*.015,o=e/7,s=[];for(let e=0;e<=7;e++){let t=seededRandom(n+e*23)*a*2-a;s.push({x:e*o,y:i+t})}let c=`M${s[0].x},${s[0].y}`;for(let e=0;e<s.length-1;e++){let t=s[e],r=s[e+1],i=(t.x+r.x)/2,o=e%2==0?1:-1,l=a*1.5*o*seededRandom(n+e*37+11),u=i,d=t.y+l,f=i,p=r.y-l;c+=` C${u},${d} ${f},${p} ${r.x},${r.y}`}return c}e(generateHorizontalBoundary,`generateHorizontalBoundary`);function generateCliffPath(e,t){let n=e/2,r=t*.5,i=t,a=e*.03;return[`M${n},${r}`,`C${n+a},${r+(i-r)*.2}`,`${n-a*1.5},${r+(i-r)*.55}`,`${n+a*.5},${r+(i-r)*.75}`,`C${n-a},${r+(i-r)*.85}`,`${n+a*.3},${r+(i-r)*.95}`,`${n},${i}`].join(` `)}e(generateCliffPath,`generateCliffPath`);function generateConfusionPath(e,t,n,r){return[`M${e-n},${t}`,`A${n},${r} 0 1,1 ${e+n},${t}`,`A${n},${r} 0 1,1 ${e-n},${t}`,`Z`].join(` `)}e(generateConfusionPath,`generateConfusionPath`);var S={complex:{model:`Probe → Sense → Respond`,practice:`Emergent Practices`},complicated:{model:`Sense → Analyse → Respond`,practice:`Good Practices`},clear:{model:`Sense → Categorise → Respond`,practice:`Best Practices`},chaotic:{model:`Act → Sense → Respond`,practice:`Novel Practices`},confusion:{model:``,practice:`Disorder`}},C=e((e,t)=>{let n=e/2,r=t/2;return{complex:{cx:n/2,cy:r/2,x:0,y:0,w:n,h:r},complicated:{cx:n+n/2,cy:r/2,x:n,y:0,w:n,h:r},chaotic:{cx:n/2,cy:r+r/2,x:0,y:r,w:n,h:r},clear:{cx:n+n/2,cy:r+r/2,x:n,y:r,w:n,h:r},confusion:{cx:n,cy:r,x:n*.7,y:r*.7,w:n*.6,h:r*.6}}},`getDomainLayouts`),w=e(()=>m(n(),s().themeVariables).cynefin,`getCynefinDomainColors`),T=3,E={draw:e((e,n,r,i)=>{let a=i.db,o=a.getDomains(),s=a.getTransitions(),l=a.getDiagramTitle(),u=a.getAccTitle(),d=a.getAccDescription(),f=a.getConfig(),m=w();t.debug(`Rendering Cynefin diagram`);let h=f.width,g=f.height,_=f.padding,v=f.showDomainDescriptions,y=f.boundaryAmplitude,b=h+_*2,x=g+_*2,E={complex:m.complexBg,complicated:m.complicatedBg,clear:m.clearBg,chaotic:m.chaoticBg,confusion:m.confusionBg},D=p(n);c(D,x,b,f.useMaxWidth??!0),D.attr(`viewBox`,`0 0 ${b} ${x}`),u&&D.append(`title`).text(u),d&&D.append(`desc`).text(d);let O=D.append(`g`).attr(`transform`,`translate(${_}, ${_})`),k=C(h,g),A=resolveSeed(f.seed,n),j=O.append(`g`).attr(`class`,`cynefin-backgrounds`),M=[`complex`,`complicated`,`chaotic`,`clear`];for(let e of M){let t=k[e];j.append(`rect`).attr(`class`,`cynefinDomain`).attr(`x`,t.x).attr(`y`,t.y).attr(`width`,t.w).attr(`height`,t.h).attr(`fill`,E[e]).attr(`fill-opacity`,.4).attr(`stroke`,`none`)}let N=O.append(`g`).attr(`class`,`cynefin-boundaries`);N.append(`path`).attr(`class`,`cynefinBoundary`).attr(`d`,generateFoldPath(h,g,A,y)).attr(`fill`,`none`),N.append(`path`).attr(`class`,`cynefinBoundary`).attr(`d`,generateHorizontalBoundary(h,g,A+100,y)).attr(`fill`,`none`),N.append(`path`).attr(`class`,`cynefinCliff`).attr(`d`,generateCliffPath(h,g)).attr(`fill`,`none`);let P=h*.15,F=g*.15;O.append(`path`).attr(`class`,`cynefinConfusion`).attr(`d`,generateConfusionPath(h/2,g/2,P,F)).attr(`fill`,E.confusion).attr(`fill-opacity`,.5);let I=O.append(`g`).attr(`class`,`cynefin-labels`);for(let e of M){let t=k[e];I.append(`text`).attr(`class`,`cynefinDomainLabel`).attr(`x`,t.cx).attr(`y`,v?t.cy-30:t.cy).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(e.charAt(0).toUpperCase()+e.slice(1))}if(I.append(`text`).attr(`class`,`cynefinDomainLabel`).attr(`x`,h/2).attr(`y`,v?g/2-10:g/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(`Confusion`),v){let e=O.append(`g`).attr(`class`,`cynefin-subtitles`);for(let t of M){let n=k[t],r=S[t];e.append(`text`).attr(`class`,`cynefinSubtitle`).attr(`x`,n.cx).attr(`y`,n.cy-10).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(r.model),e.append(`text`).attr(`class`,`cynefinSubtitle`).attr(`x`,n.cx).attr(`y`,n.cy+5).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(r.practice)}e.append(`text`).attr(`class`,`cynefinSubtitle`).attr(`x`,h/2).attr(`y`,g/2+8).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(S.confusion.practice)}let L=O.append(`g`).attr(`class`,`cynefin-items`);for(let e of[`complex`,`complicated`,`chaotic`,`clear`,`confusion`]){let t=o.get(e);if(!t||t.items.length===0)continue;let n=k[e],r=e===`confusion`,i=t.items,a=0;r&&t.items.length>T&&(a=t.items.length-T,i=t.items.slice(0,T));let s;if(r){let e=v?22:14;s=n.cy+e}else s=n.cy+(v?25:15);if([...i].forEach((t,r)=>{let i=s+r*30,a=L.append(`g`),o=a.append(`text`).attr(`class`,`cynefinItemText`).attr(`x`,0).attr(`y`,26/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`central`).text(t.label),c=t.label.length*7,l=o.node();if(l&&typeof l.getBBox==`function`){let e=l.getBBox();e.width>0&&(c=e.width)}let u=c+20,d=n.cx-u/2;a.attr(`transform`,`translate(${d}, ${i})`),a.insert(`rect`,`text`).attr(`class`,`cynefinItem`).attr(`x`,0).attr(`y`,0).attr(`width`,u).attr(`height`,26).attr(`rx`,4).attr(`ry`,4).attr(`fill`,E[e]).attr(`fill-opacity`,.95),o.attr(`x`,u/2).attr(`y`,26/2)}),a>0){let t=s+i.length*30,r=`+${a} more`,o=L.append(`g`),c=o.append(`text`).attr(`class`,`cynefinItemText`).attr(`x`,0).attr(`y`,26/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`central`).text(r),l=r.length*7,u=c.node();if(u&&typeof u.getBBox==`function`){let e=u.getBBox();e.width>0&&(l=e.width)}let d=l+20,f=n.cx-d/2;o.attr(`transform`,`translate(${f}, ${t})`),o.insert(`rect`,`text`).attr(`class`,`cynefinItemOverflow`).attr(`x`,0).attr(`y`,0).attr(`width`,d).attr(`height`,26).attr(`rx`,4).attr(`ry`,4).attr(`fill`,E[e]).attr(`fill-opacity`,.6),c.attr(`x`,d/2).attr(`y`,26/2)}}if(s.length>0){let e=D.select(`defs`).empty()?D.append(`defs`):D.select(`defs`),r=`cynefin-arrow-${n}`;e.append(`marker`).attr(`id`,r).attr(`viewBox`,`0 0 10 10`).attr(`refX`,9).attr(`refY`,5).attr(`markerWidth`,6).attr(`markerHeight`,6).attr(`orient`,`auto-start-reverse`).append(`path`).attr(`d`,`M 0 0 L 10 5 L 0 10 z`).attr(`class`,`cynefinArrowHead`);let i=O.append(`g`).attr(`class`,`cynefin-arrows`);s.forEach(e=>{let n=k[e.from],a=k[e.to];if(!n||!a)return;if(e.from===e.to){t.warn(`Cynefin renderer: skipping self-loop on domain "${e.from}"`);return}let o=n.cx,s=n.cy,c=a.cx,l=a.cy,u=(o+c)/2,d=(s+l)/2,f=c-o,p=l-s,m=Math.sqrt(f*f+p*p),h=m*.15,g=-p/m,_=f/m,v=u+g*h,y=d+_*h;i.append(`path`).attr(`class`,`cynefinArrowLine`).attr(`d`,`M${o},${s} Q${v},${y} ${c},${l}`).attr(`fill`,`none`).attr(`marker-end`,`url(#${r})`),e.label&&i.append(`text`).attr(`class`,`cynefinArrowLabel`).attr(`x`,v).attr(`y`,y-6).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`auto`).text(e.label)})}l&&O.append(`text`).attr(`class`,`cynefinTitle`).attr(`x`,h/2).attr(`y`,-_/2).attr(`text-anchor`,`middle`).attr(`dominant-baseline`,`middle`).text(l)},`draw`)},D=e(()=>m(n(),s().themeVariables).cynefin,`getCynefinTheme`),O={parser:x,db:y,renderer:E,styles:e(()=>{let e=D();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${e.domainFontSize}px;
		font-weight: bold;
		fill: ${e.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${e.itemFontSize-1}px;
		fill: ${e.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${e.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${e.itemFontSize}px;
		fill: ${e.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${e.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${e.boundaryColor};
		stroke-width: ${e.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${e.cliffColor};
		stroke-width: ${e.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${e.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${e.arrowColor};
		stroke-width: ${e.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${e.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${e.itemFontSize-1}px;
		fill: ${e.textColor};
	}
	.cynefinTitle {
		font-size: ${e.domainFontSize+2}px;
		font-weight: bold;
		fill: ${e.labelColor};
	}
	`},`styles`)};export{O as diagram};