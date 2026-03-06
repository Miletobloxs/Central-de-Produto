const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pptxgen.es-CCSff2Bb.js","assets/vite-h6ohMMGa.js"])))=>i.map(i=>d[i]);
import{r as C}from"./vendors-Cf2H4Q9h.js";import{bA as q,hl as O,D as Y,ef as Se,u as ve,c as Ae,I as Te}from"./ask-input-yG-IuTmc.js";import{u as J}from"./i18n-DNY0yzXR.js";import{E as S,l as F,s as Fe,g as Ee,u as ke,t as Me}from"./platform-core-DyhArgEa.js";import{_ as P}from"./vite-h6ohMMGa.js";import{i as Re}from"./utils-ChTVpvHF.js";import{g as Pe,a as Le}from"./fileTypeUtils-BHiDQtE1.js";import{u as Ue}from"./useDownloadS3FileAsset-4ZNCSUG_.js";import{$ as U}from"./pplx-icons-CyseQcag.js";import{e as w}from"./spa-shell-Dad4GT6N.js";const zt=e=>e?e.filter(t=>t.image_mode_block).flatMap(t=>t.image_mode_block.media_items??S):S,Ht=e=>e?e.filter(t=>t.video_mode_block).flatMap(t=>t.video_mode_block.media_items??S):S,Dt=e=>e?e.filter(t=>t.shopping_mode_block).flatMap(t=>t.shopping_mode_block.shopping_widgets??S):S,$t=e=>e?e.filter(t=>t.jobs_mode_block).flatMap(t=>t.jobs_mode_block.jobs_blocks??S):S,Gt=e=>e?e.filter(t=>t.maps_mode_block).flatMap(t=>t.maps_mode_block.places??S):S,Vt=e=>e?e.flatMap(t=>t.widget_block?.news_widget_block??S):S,Wt=e=>{const t=(e??S).filter(s=>s.sources_mode_block).flatMap(s=>s.sources_mode_block),o=t.at(-1),n=new Set,r=[];for(const s of t)for(const l of s.web_results??[]){const a=l.url??"";n.has(a)||(r.push(l),n.add(a))}const i=o?.result_count??0;return{count:Math.max(r.length,i),progress:o?.progress,results:r,rows:o?.rows}};function Q(e){if(!e?.steps)return S;const t=[];for(const o of e.steps)if(o.items)for(const n of o.items){const r=n.payload?.sources_payload?.assets;r&&t.push(...r),t.push(...Q(n.payload?.workflow_payload))}return t}const Ie=(e,{orderedByPriority:t=!1}={})=>{if(!e)return S;const o=e.filter(i=>i.plan_block?.steps).flatMap(i=>i.plan_block.steps).flatMap(i=>i.assets??S),n=e.flatMap(i=>Q(i.workflow_block)),r=[...o,...n];return t?r.sort((i,s)=>i.is_primary_asset===s.is_primary_asset?0:i.is_primary_asset?-1:1):r};function K(e,t){if(e?.steps){for(const o of e.steps)if(o.items)for(const n of o.items){const r=n.payload?.sources_payload?.assets;if(r){const s=r.find(l=>l.uuid===t);if(s)return s}const i=K(n.payload?.workflow_payload,t);if(i)return i}}}const jt=(e,t)=>{if(e)for(const o of e){if(o.canvas_block?.asset?.uuid===t)return o.canvas_block.asset;if(o.plan_block?.steps){for(const r of o.plan_block.steps)if(r.assets){const i=r.assets.find(s=>s.uuid===t);if(i)return i}}const n=K(o.workflow_block,t);if(n)return n}},Ne=e=>{if(e){if(e.app)return e.app.final;if(e.xlsx_file)return e.xlsx_file.final;if(e.doc_file)return e.doc_file.final;if(e.research_report)return e.research_report.final}},Z=e=>e.xlsxAsset?.name||e.researchReportAsset?.name||e.pdfAsset?.name||e.docxAsset?.name||e.docFileAsset?.name||e.codeFileAsset?.name||e.app?.name||null,G=(e,t)=>{const o=q(t),n=Z(e);return n&&o?O(`${n}.${o}`):O(t)},ee=e=>C.useMemo(()=>{if(!e)return{app:null,pdfAsset:null,docxAsset:null,docFileAsset:null,codeFileAsset:null,chartAsset:null,xlsxAsset:null,quizAsset:null,researchReportAsset:null,pdfFileData:null,assetType:null,assetUuid:null};const t=e.pdf_file||null,o=t&&t.url?{url:t.url,name:t.name||"Document"}:null;let n=e.app;return n&&(n={...n,transforms:n.transforms||[]}),{app:n||null,pdfAsset:t,docxAsset:e.docx_file||null,docFileAsset:e.doc_file||null,codeFileAsset:e.code_file||null,chartAsset:e.chart||null,xlsxAsset:e.xlsx_file||null,quizAsset:e.quiz||null,researchReportAsset:e.research_report||null,pdfFileData:o,assetType:e.asset_type??null,assetUuid:e.uuid??null}},[e]);function I(e,t){let o=e;for(const n of t)n.old_str&&n.new_str!==void 0&&(o=o.replaceAll(n.old_str,n.new_str));return o}function te(e){return!!((e?.asset_type==="APP"||e?.asset_type==="SLIDES")&&e?.app?.transforms&&e.app.transforms.length>0||e?.asset_type==="XLSX_FILE"&&e?.xlsx_file?.transforms&&e.xlsx_file.transforms.length>0||e?.asset_type==="DOC_FILE"&&e?.doc_file?.transforms&&e.doc_file.transforms.length>0)}function D(e){return!e?.version_info?.parent_artifact_id||!te(e)?!1:Ne(e)===!1}function Oe(e,t){if(e?.version_info?.artifact_id)return t.find(o=>o.version_info?.parent_artifact_id===e.version_info?.artifact_id&&D(o))}function Be(e,t){const o=C.useMemo(()=>Oe(e,t),[e,t]);return C.useMemo(()=>{let n=!1;e?.app?n=!e.app.final:e?.xlsx_file?n=!e.xlsx_file.final:e?.doc_file&&(n=!e.doc_file.final);const r={streamingChild:void 0,hasStreamingChild:!1,transformedContent:"",transforms:[],isStreaming:n,hasTransforms:!1};if(o?.app?.transforms&&e?.app?.source_content){const i=I(e.app.source_content,o.app.transforms);return{streamingChild:o,hasStreamingChild:!0,transformedContent:i,transforms:o.app.transforms,isStreaming:!o.app.final,hasTransforms:!0}}if(o?.xlsx_file?.transforms&&e?.xlsx_file?.source_content){const i=I(e.xlsx_file.source_content,o.xlsx_file.transforms);return{streamingChild:o,hasStreamingChild:!0,transformedContent:i,transforms:o.xlsx_file.transforms,isStreaming:!o.xlsx_file.final,hasTransforms:!0}}if(o?.doc_file?.transforms&&e?.doc_file?.source_content){const i=I(e.doc_file.source_content,o.doc_file.transforms);return{streamingChild:o,hasStreamingChild:!0,transformedContent:i,transforms:o.doc_file.transforms,isStreaming:!o.doc_file.final,hasTransforms:!0}}return r},[o,e])}function Xt(e,t){if(!D(e))return;const o=e?.version_info?.parent_artifact_id;return t.find(n=>n.version_info?.artifact_id===o)}const ne=(e,t)=>!e.assetType||!t||!e.assetUuid?null:`/apps/${t}?asset=${e.assetUuid}`,ze=(e,t)=>ne(e,t)!==null,oe=e=>e.app!==null,re=e=>e.docxAsset===null&&e.pdfFileData!==null,ie=e=>e.docxAsset!==null,se=e=>e.docFileAsset!==null,le=e=>e.researchReportAsset!==null,ae=e=>e.xlsxAsset!==null,ce=e=>e.codeFileAsset!==null,ue=e=>e.chartAsset!==null;function M(e){return t=>t?e(t):!1}const de=M(e=>e.asset_type==="GENERATED_IMAGE"&&e.generated_image!==null),fe=M(e=>e.asset_type==="GENERATED_VIDEO"&&e.generated_video!==null),pe=M(e=>e.asset_type==="CODE_ASSET"&&e.code!==null),he=M(e=>e.asset_type==="QUIZ"&&e.quiz!==null),ge=M(e=>e.asset_type==="FLASHCARDS"&&e.flashcards!==null),me=M(e=>e.asset_type==="DOCUMENT_REVIEW"&&e.document_review!==null),V="exported-slides.pptx",ye=300,He=100,De="section.slide",xe=.75,$e=96,_e=1920,we=1080,Ge=.85;function Ve(){return new Map}function We(e){return/(repeating-)?(linear|radial|conic)-gradient\(/.test(e)}function je(e){const t=e.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);if(t)return t[0];const o=e.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);return o?`rgb(${o[1]}, ${o[2]}, ${o[3]})`:null}function Xe(e,t,o,n){const r=t.match(/linear-gradient\(([^,]+),/);let i=180;if(r?.[1]){const d=r[1].trim();d.includes("deg")?i=parseFloat(d):d==="to top"?i=0:d==="to right"?i=90:d==="to bottom"?i=180:d==="to left"?i=270:d==="to top right"?i=45:d==="to bottom right"?i=135:d==="to bottom left"?i=225:d==="to top left"&&(i=315)}const s=(i-90)*Math.PI/180,l=o/2-Math.cos(s)*o/2,a=n/2-Math.sin(s)*n/2,c=o/2+Math.cos(s)*o/2,u=n/2+Math.sin(s)*n/2;return e.createLinearGradient(l,a,c,u)}function qe(e,t,o){return e.createRadialGradient(t/2,o/2,0,t/2,o/2,Math.max(t,o)/2)}function Ye(e,t,o,n){const r=t.match(/conic-gradient\(from\s+([\d.]+)deg/),l=((r?.[1]?parseFloat(r[1]):0)-90)*Math.PI/180;return e.createConicGradient(l,o/2,n/2)}function Je(e,t=_e,o=we,n){const r=`${e}:${t}x${o}`;if(n){const i=n.get(r);if(i)return i}try{const i=document.createElement("canvas");i.width=t,i.height=o;const s=i.getContext("2d");if(!s||e.includes("repeating-"))return null;const l=e.includes("linear-gradient"),a=e.includes("radial-gradient"),c=e.includes("conic-gradient");if(!l&&!a&&!c)return null;let u;l?u=Xe(s,e,t,o):a?u=qe(s,t,o):u=Ye(s,e,t,o);const d=/(rgba?\([^)]+\)|#[0-9A-Fa-f]{3,6})\s+([\d.]+)(deg|%)/g,p=Array.from(e.matchAll(d));if(p.length===0)return null;p.forEach(y=>{const _=y[1],x=y[2],f=y[3];if(!_||!x||!f)return;let b;f==="%"?b=parseFloat(x)/100:b=parseFloat(x)/360,u.addColorStop(Math.max(0,Math.min(1,b)),_)}),s.fillStyle=u,s.fillRect(0,0,t,o);const g=i.toDataURL("image/jpeg",Ge);return n&&n.set(r,g),g}catch{return null}}const $=`
/* ========== CSS Variables ========== */
:root {
  /* Typography */
  --font-family-display: Arial, sans-serif;
  --font-weight-display: 600;
  --font-family-content: Arial, sans-serif;
  --font-weight-content: 400;
  --font-size-content: 16px;
  --line-height-content: 1.4;

  /* Colors - Surface */
  --color-surface: #ffffff;
  --color-surface-foreground: #1d1d1d;

  /* Colors - Primary */
  --color-primary: #1791e8;
  --color-primary-light: #3ba1ec;
  --color-primary-dark: #1581d4;
  --color-primary-foreground: #fafafa;

  /* Colors - Secondary */
  --color-secondary: #f5f5f5;
  --color-secondary-foreground: #171717;

  /* Colors - Utility */
  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;
  --color-accent: #f5f5f5;
  --color-accent-foreground: #171717;
  --color-border: #c8c8c8;

  /* Spacing & Layout */
  --spacing: 0.25rem;
  --gap: calc(var(--spacing) * 4);
  --radius: 0.4rem;
  --radius-pill: 999em;
}

/* ========== Base Reset ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ========== Slide Container ========== */
section.slide {
  width: 960px !important;
  height: 540px !important;
  overflow: hidden;
  font-family: var(--font-family-content);
  font-weight: var(--font-weight-content);
  font-size: var(--font-size-content);
  line-height: var(--line-height-content);
  color: var(--color-surface-foreground);
  background: var(--color-surface);
  display: flex;
  margin: 0;
  padding: 0;
  position: relative;
}

/* Body for single slide mode */
body {
  width: 960px;
  height: 540px;
  overflow: hidden;
  font-family: var(--font-family-content);
  font-weight: var(--font-weight-content);
  font-size: var(--font-size-content);
  line-height: var(--line-height-content);
  color: var(--color-surface-foreground);
  background: var(--color-surface);
  display: flex;
  margin: 0;
  padding: 0;
}

/* ========== Typography ========== */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-display);
  font-weight: var(--font-weight-display);
  line-height: 1.2;
  margin: 0;
}

h1 { font-size: 3rem; }
h2 { font-size: 2.25rem; }
h3 { font-size: 1.875rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1.125rem; }

p { margin: 0; }

ul, ol {
  margin: 0;
  padding-left: 1.5em;
}

li {
  margin: 0.25em 0;
}

/* ========== Layout System ========== */

/* Container Classes */
.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
}

.col {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

/* Flex Item Behavior */
.fill-width {
  flex: 1;
  align-self: stretch;
}

.fill-height {
  flex: 1;
  align-self: stretch;
}

.row .fill-width {
  flex: 1;
}

.col .fill-height {
  flex: 1;
}

.items-fill-width > * {
  flex: 1;
  align-self: stretch;
}

.items-fill-height > * {
  flex: 1;
  align-self: stretch;
}

.fit {
  flex: none;
  align-self: auto;
}

.fit-width {
  flex: none;
}

.fit-height {
  flex: none;
}

/* ========== Alignment ========== */

/* Container alignment */
.center {
  align-items: center;
  justify-content: center;
}

.start {
  align-items: flex-start;
  justify-content: flex-start;
}

.end {
  align-items: flex-end;
  justify-content: flex-end;
}

.stretch {
  align-items: stretch;
  justify-content: stretch;
}

.between {
  justify-content: space-between;
}

.around {
  justify-content: space-around;
}

.evenly {
  justify-content: space-evenly;
}

/* Self alignment */
.self-center {
  align-self: center;
}

.self-start {
  align-self: flex-start;
}

.self-end {
  align-self: flex-end;
}

.self-stretch {
  align-self: stretch;
}

/* ========== Spacing ========== */

/* Padding */
.p-0 { padding: 0; }
.p-2 { padding: calc(var(--spacing) * 2); }
.p-4 { padding: calc(var(--spacing) * 4); }
.p-6 { padding: calc(var(--spacing) * 6); }
.p-8 { padding: calc(var(--spacing) * 8); }
.p-12 { padding: calc(var(--spacing) * 12); }
.p-16 { padding: calc(var(--spacing) * 16); }
.p-24 { padding: calc(var(--spacing) * 24); }
.p-32 { padding: calc(var(--spacing) * 32); }

/* Gap */
.gap-0 { gap: 0; }
.gap-xs { gap: calc(var(--spacing) * 2); }
.gap-sm { gap: calc(var(--spacing) * 4); }
.gap-md { gap: calc(var(--spacing) * 8); }
.gap-lg { gap: calc(var(--spacing) * 16); }
.gap-xl { gap: calc(var(--spacing) * 24); }
.gap-2xl { gap: calc(var(--spacing) * 32); }

/* ========== Colors ========== */

/* Background colors */
.bg-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

.bg-secondary {
  background-color: var(--color-secondary);
  color: var(--color-secondary-foreground);
}

.bg-muted {
  background-color: var(--color-muted);
  color: var(--color-muted-foreground);
}

.bg-accent {
  background-color: var(--color-accent);
  color: var(--color-accent-foreground);
}

/* Text colors */
.text-primary {
  color: var(--color-primary);
}

.text-muted {
  color: var(--color-muted-foreground);
}

/* ========== Utilities ========== */

.rounded {
  border-radius: var(--radius);
}

.rounded-lg {
  border-radius: calc(var(--radius) * 2);
}

.rounded-full {
  border-radius: var(--radius-pill);
}

.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shadow-lg {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.border {
  border: 1px solid var(--color-border);
}

/* Text alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

/* Font sizes */
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.text-5xl { font-size: 3rem; }

/* Font weights */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

/* Display */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
`,h=e=>e/$e,E=e=>parseFloat(e)*xe,A=e=>{if(!e||e==="transparent"||e==="rgba(0, 0, 0, 0)")return"FFFFFF";const t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(!t){const o=e.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);if(o&&o[1]){const n=o[1];return n.length===3?n.split("").map(r=>r+r).join("").toUpperCase():n.toUpperCase()}return"000000"}return t.slice(1,4).map(o=>parseInt(o).toString(16).padStart(2,"0")).join("").toUpperCase()},be=e=>{if(!e)return null;const t=e.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);if(!t||!t[4])return null;const o=parseFloat(t[4]);return Math.round((1-o)*100)},Qe=(e,t,o)=>{const n=(e.ownerDocument.defaultView||window).getComputedStyle(e),r=n.backgroundImage;let i=n.backgroundColor;if((i==="rgba(0, 0, 0, 0)"||i==="transparent")&&e.className.includes("bg-")){const s=e.className.match(/bg-(\w+)/);if(s){const l=s[0],a=t.querySelectorAll("style");let c="";a.forEach(u=>{const d=u.textContent||"",p=Array.from(d.matchAll(/--color-(\w+):\s*([^;]+);/g)),g={};for(const x of p)g[`--color-${x[1]}`]=x[2]?.trim()||"";const y=new RegExp(`\\.${l}\\s*{[^}]*background-color:\\s*([^;]+);`,"s"),_=d.match(y);if(_){let x=_[1]?.trim()||"";if(x.startsWith("var(")){const f=x.match(/var\((--[^)]+)\)/)?.[1];f&&g[f]&&(x=g[f])}if(x.startsWith("#")){let f=x.substring(1);f.length===3&&(f=f.split("").map(v=>v+v).join(""));const b=parseInt(f.substring(0,2),16),m=parseInt(f.substring(2,4),16),T=parseInt(f.substring(4,6),16);c=`rgb(${b}, ${m}, ${T})`}else c=x}}),c&&(i=c)}}if(r&&r!=="none")if(We(r)){const s=e.getBoundingClientRect(),l=Math.round(s.width)||_e,a=Math.round(s.height)||we,c=Je(r,l,a,o);if(c)return{gradient:c};{const u=je(r);u&&(i=u)}}else{const s=r.match(/url\(["']?([^"')]+)["']?\)/);if(s&&s[1])return{path:s[1]}}return{color:A(i)}},k=e=>(e.ownerDocument.defaultView||window).getComputedStyle(e),Ke=e=>((e||"Arial").split(",")[0]||"Arial").replace(/['"]/g,"").trim(),Ze=e=>e==="bold"||parseInt(e||"400")>=600,et=e=>e==="italic",B=e=>{const t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);return!t||!t[1]||!t[2]||!t[3]?null:{r:parseInt(t[1]),g:parseInt(t[2]),b:parseInt(t[3]),a:t[4]?parseFloat(t[4]):1}},tt=(e,t)=>{const o=B(e),n=B(t);if(!o||!n)return null;const r=Math.round(o.r*o.a+n.r*(1-o.a)),i=Math.round(o.g*o.a+n.g*(1-o.a)),s=Math.round(o.b*o.a+n.b*(1-o.a));return A(`rgb(${r}, ${i}, ${s})`)},z=e=>!!e&&e!=="rgba(0, 0, 0, 0)"&&e!=="transparent",nt=(e,t)=>{for(const o of e){const n=o.backgroundColor;if(z(n)){const r=B(n);return r&&r.a<1?tt(n,t)??void 0:A(n)}}},ot=e=>{if(e.borderBottomWidth&&parseFloat(e.borderBottomWidth)>0){const t={type:"none"},o={pt:parseFloat(e.borderBottomWidth),color:A(e.borderBottomColor)};return[t,t,o,t]}},rt=e=>{if(!e||e==="none"||e.match(/inset/))return null;const o=e.match(/rgba?\([^)]+\)/),n=e.match(/([-\d.]+)(px|pt)/g);if(!n||n.length<2)return null;const r=parseFloat(n[0]),i=parseFloat(n[1]||"0"),s=n.length>2?parseFloat(n[2]||"0"):0;let l=0;(r!==0||i!==0)&&(l=Math.atan2(i,r)*(180/Math.PI),l<0&&(l+=360));const a=Math.sqrt(r*r+i*i)*xe;let c=.5;if(o){const u=o[0].match(/[\d.]+\)$/);u&&(c=parseFloat(u[0].replace(")","")))}return{type:"outer",angle:Math.round(l),blur:s*.75,color:o?A(o[0]):"000000",offset:a,opacity:c}},H=(e,t={})=>{const o=[];let n=!1;e.childNodes.forEach(i=>{const s=i.nodeType===Node.TEXT_NODE||i.tagName==="BR";if(s){const l=i.tagName==="BR"?`
`:(i.nodeValue||i.textContent||"").replace(/\s+/g," "),a=o[o.length-1];n&&a&&a.text?a.text+=l:o.push({text:l,options:{...t}})}else if(i.nodeType===Node.ELEMENT_NODE&&i.textContent?.trim()){const l=i,a={...t},c=(l.ownerDocument.defaultView||window).getComputedStyle(l);if(["SPAN","B","STRONG","I","EM","U"].includes(l.tagName)){if((c.fontWeight==="bold"||parseInt(c.fontWeight)>=600)&&(a.bold=!0),c.fontStyle==="italic"&&(a.italic=!0),c?.textDecoration?.includes("underline")&&(a.underline={style:"sng"}),c.color&&c.color!=="rgb(0, 0, 0)"){a.color=A(c.color);const d=be(c.color);d!==null&&(a.transparency=d)}c?.fontSize&&(a.fontSize=E(c.fontSize)),H(l,a).forEach(d=>o.push(d))}}n=s});const r=o?.[0];if(r&&r.text){r.text=r.text.replace(/^\s+/,"");const i=o?.[o.length-1];i&&i.text&&(i.text=i.text.replace(/\s+$/,""))}return o.filter(i=>i.text&&i.text.length>0)},it=e=>{if(e.display==="flex"){const t=e.alignItems;if(t==="center")return"middle";if(t==="flex-end")return"bottom"}else{const t=e.verticalAlign;if(t==="middle")return"middle";if(t==="bottom")return"bottom"}return"top"},st=e=>{const t=e.textAlign,o=e.direction;return t==="left"||t==="right"||t==="center"||t==="justify"?t:t==="start"?o==="rtl"?"right":"left":t==="end"?o==="rtl"?"left":"right":"center"},lt=e=>{const t=e.whiteSpace;return!(t==="nowrap"||t==="pre")},at=e=>{const t=e.overflow,o=e.textOverflow;return t==="hidden"&&o==="ellipsis"?"none":"shrink"},ct=e=>{const t=parseFloat(e.paddingLeft)||0,o=parseFloat(e.paddingRight)||0,n=parseFloat(e.paddingTop)||0,r=parseFloat(e.paddingBottom)||0,i=Math.max(t,o,n,r);return E(i.toString())},ut=e=>({fontSize:E(e.fontSize),fontFace:((e.fontFamily||"Arial").split(",")[0]||"Arial").replace(/['"]/g,"").trim(),color:A(e.color),bold:e?.fontWeight==="bold"||parseInt(e?.fontWeight||"400")>=600,italic:e?.fontStyle==="italic",align:st(e),valign:it(e),wrap:lt(e),margin:ct(e),fit:at(e)}),dt=e=>{const t=[];return e.querySelectorAll(".placeholder").forEach(o=>{const n=o.getBoundingClientRect(),r=e.getBoundingClientRect();t.push({id:o.id||`placeholder-${t.length}`,x:h(n.left-r.left),y:h(n.top-r.top),w:h(n.width),h:h(n.height)})}),t},ft=(e,t)=>{const o=[],n=e.getBoundingClientRect();return e.querySelectorAll("IMG").forEach(r=>{if(t.has(r))return;const i=r,s=r.getBoundingClientRect();s.width>0&&s.height>0&&(o.push({type:"image",src:i.src,position:{x:h(s.left-n.left),y:h(s.top-n.top),w:h(s.width),h:h(s.height)}}),t.add(r))}),o},pt=(e,t)=>{const o=[],n=e.getBoundingClientRect();return e.querySelectorAll("DIV, SPAN").forEach(r=>{if(t.has(r))return;const i=(r.ownerDocument.defaultView||window).getComputedStyle(r),s=i.backgroundColor&&i.backgroundColor!=="rgba(0, 0, 0, 0)",l=parseFloat(i.borderWidth)>0;if(s||l){const a=r.getBoundingClientRect();if(a.width>0&&a.height>0){const c=i.boxShadow?rt(i.boxShadow):null,u=parseFloat(i.borderRadius)||0;let d="",p=!1,g;Array.from(r.children).length>0||(d=r.textContent?.trim()||"",p=d.length>0,p&&(g=ut(i))),o.push({type:"shape",text:d,position:{x:h(a.left-n.left),y:h(a.top-n.top),w:h(a.width),h:h(a.height)},style:g,shape:{fill:s?A(i.backgroundColor):null,transparency:s&&i.backgroundColor?be(i.backgroundColor):null,line:l?{color:A(i.borderColor),width:E(i.borderWidth)}:null,rectRadius:u>0?u/10:0,shadow:c}}),p&&t.add(r)}}}),o},ht=e=>{if(!e.textContent?.trim())return!1;const o=e.parentElement;return!(o&&["P","H1","H2","H3","H4","H5","H6","LI","SPAN"].includes(o.tagName))},gt=e=>{if(!e.textContent?.trim())return!1;let o=!1;if(e.childNodes.forEach(i=>{i.nodeType===Node.TEXT_NODE&&i.textContent?.trim()&&(o=!0)}),!o)return!1;const n=e.parentElement;return!(n&&["P","H1","H2","H3","H4","H5","H6","LI","SPAN"].includes(n.tagName)||e.querySelectorAll("P, H1, H2, H3, H4, H5, H6, UL, OL, DIV, SPAN").length>0)},mt=(e,t)=>{const o=[],n=e.getBoundingClientRect();return e.querySelectorAll("P, H1, H2, H3, H4, H5, H6, UL, OL, SPAN, DIV").forEach(r=>{if(t.has(r)||r.tagName==="SPAN"&&!ht(r)||r.tagName==="DIV"&&!gt(r))return;const i=(r.ownerDocument.defaultView||window).getComputedStyle(r),s=r.getBoundingClientRect();if(s.width>0&&s.height>0){const l=E(i.fontSize),a=parseFloat(i.lineHeight)||l*1.2;if(r.tagName==="UL"||r.tagName==="OL"){const c=Array.from(r.querySelectorAll("li")),u=[];c.forEach((d,p)=>{const g=p===c.length-1,y=H(d);if(y.length>0){const _=y[0];if(!_)return;if(_.text&&(_.text=_.text.replace(/^[•\-*▪▸]\s*/,"")),_.options||(_.options={}),_.options.bullet=!0,!g){const x=y[y.length-1];if(!x)return;x.options||(x.options={}),x.options.breakLine=!0}u.push(...y)}t.add(d)}),u.length>0&&(o.push({type:"list",items:u,position:{x:h(s.left-n.left),y:h(s.top-n.top),w:h(s.width),h:h(s.height)},style:{fontSize:l,fontFace:((i.fontFamily||"Arial").split(",")[0]||"Arial").replace(/['"]/g,"").trim(),color:A(i.color),align:i.textAlign,lineSpacing:E(a.toString()),margin:0}}),t.add(r))}else{const c=H(r),u=c.length===1?c[0]?.text:c,d=s.height<=a*1.5;let p=h(s.left-n.left),g=h(s.width);if(d){const y=s.width*.02,_=i.textAlign;_==="center"?(p=h(s.left-n.left-y/2),g=h(s.width+y)):(_==="right"&&(p=h(s.left-n.left-y)),g=h(s.width+y))}o.push({type:r.tagName.toLowerCase(),text:u,position:{x:p,y:h(s.top-n.top),w:g,h:h(s.height)},style:{fontSize:l,fontFace:((i.fontFamily||"Arial").split(",")[0]||"Arial").replace(/['"]/g,"").trim(),color:A(i.color),bold:i?.fontWeight==="bold"||parseInt(i?.fontWeight||"400")>=600,italic:i?.fontStyle==="italic",underline:i?.textDecoration?.includes("underline")?{style:"sng"}:void 0,align:i.textAlign,lineSpacing:E(a.toString()),margin:0}}),t.add(r)}}}),o},yt=e=>{const t=[];if(Array.from(e.children).length>0&&e.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE){const r=n.textContent?.trim();if(r){const i=k(e);t.push({text:r,options:{color:A(i.color)}})}}else if(n.nodeType===Node.ELEMENT_NODE){const r=n,i=r.textContent?.trim();if(i){const s=k(r);t.push({text:i,options:{color:A(s.color)}})}}}),t.length===0){const n=e.textContent?.trim();if(n){const r=k(e);t.push({text:n,options:{color:A(r.color)}})}}return t},N=(e,t,o)=>{const n=[];return e.forEach(r=>{const i=[],s=k(r);r.querySelectorAll("th, td").forEach(l=>{const a=l;i.push(xt(a,s,t,o))}),i.length>0&&n.push(i)}),n},xt=(e,t,o,n)=>{const r=k(e),s={text:yt(e),options:{fontSize:E(r.fontSize),fontFace:Ke(r.fontFamily),bold:Ze(r.fontWeight),italic:et(r.fontStyle),align:r.textAlign||"left",valign:"middle"}},l=nt([r,t,o].filter(c=>c!==null),n);l&&s.options&&(s.options.fill={color:l});const a=ot(r);return a&&s.options&&(s.options.border=a),s},_t=(e,t)=>{const o=[],n=e.getBoundingClientRect(),r=k(e),i=z(r.backgroundColor)?r.backgroundColor:"rgb(255, 255, 255)";return e.querySelectorAll("TABLE").forEach(s=>{if(t.has(s))return;const l=s,a=s.getBoundingClientRect();if(a.width>0&&a.height>0){const c=[],u=l.parentElement,d=u?k(u):null,p=d&&z(d.backgroundColor)?d.backgroundColor:i,g=l.querySelectorAll("thead tr"),y=l.querySelector("thead"),_=y?k(y):null;c.push(...N(g,_,p));const x=l.querySelectorAll("tbody tr");if(c.push(...N(x,null,p)),c.length===0){const f=l.querySelectorAll(":scope > tr");c.push(...N(f,null,p))}c.length>0&&(o.push({type:"table",rows:c,position:{x:h(a.left-n.left),y:h(a.top-n.top),w:h(a.width),h:h(a.height)}}),t.add(s),l.querySelectorAll("*").forEach(f=>t.add(f)))}}),o};function W(e,t,o){const n=[],r=new Set,i=Qe(e,t,o),s=dt(e);s.forEach(p=>{const g=e.querySelector(`#${p.id}`);g&&r.add(g)});const l=pt(e,r),a=ft(e,r),c=_t(e,r),u=mt(e,r),d=[...l,...a,...c,...u];return{background:i,elements:d,placeholders:s,errors:n}}function j(e,t,o){"gradient"in e.background?t.addImage({data:e.background.gradient,x:0,y:0,w:"100%",h:"100%"}):t.background=e.background;for(const n of e.elements)switch(n.type){case"table":{n.rows&&n.rows.length>0&&t.addTable(n.rows,{x:n.position.x,y:n.position.y,w:n.position.w,h:n.position.h,autoPage:!1,border:{type:"none"}});break}case"image":{t.addImage({path:n.src,x:n.position.x,y:n.position.y,w:n.position.w,h:n.position.h});break}case"shape":{const r={x:n.position.x,y:n.position.y,w:n.position.w,h:n.position.h};n.shape&&n.shape.rectRadius>0?(r.shape=o.ShapeType.roundRect,r.rectRadius=n.shape.rectRadius):r.shape=o.ShapeType.rect,n.shape?.fill&&(r.fill={color:n.shape.fill},n.shape.transparency!=null&&(r.fill.transparency=n.shape.transparency)),n.shape?.line&&(r.line=n.shape.line),n.shape?.shadow&&(r.shadow=n.shape.shadow),n.style&&(n.style.fontSize&&(r.fontSize=n.style.fontSize),n.style.fontFace&&(r.fontFace=n.style.fontFace),n.style.color&&(r.color=n.style.color),n.style.bold&&(r.bold=n.style.bold),n.style.italic&&(r.italic=n.style.italic),n.style.align&&(r.align=n.style.align),n.style.valign&&(r.valign=n.style.valign)),r.wrap=n.style?.wrap??!1,r.fit=n.style?.fit??"shrink",r.margin=n.style?.margin??0,t.addText(n.text||"",r);break}case"list":{const r={x:n.position.x,y:n.position.y,w:n.position.w,h:n.position.h,fontSize:n.style?.fontSize,fontFace:n.style?.fontFace,color:n.style?.color,align:n.style?.align,valign:"top",lineSpacing:n.style?.lineSpacing,margin:n.style?.margin};t.addText(n.items??"",r);break}case"p":case"h1":case"h2":case"h3":case"h4":case"h5":case"h6":{const r={x:n.position.x,y:n.position.y,w:n.position.w,h:n.position.h,fontSize:n.style?.fontSize,fontFace:n.style?.fontFace,color:n.style?.color,bold:n.style?.bold,italic:n.style?.italic,underline:n.style?.underline,valign:"top",align:n.style?.align,lineSpacing:n.style?.lineSpacing,inset:0};t.addText(n.text??"",r);break}default:{const r={x:n.position.x,y:n.position.y,w:n.position.w,h:n.position.h,fontSize:n.style?.fontSize,fontFace:n.style?.fontFace,color:n.style?.color,bold:n.style?.bold,italic:n.style?.italic,underline:n.style?.underline,valign:"top",align:n.style?.align,lineSpacing:n.style?.lineSpacing,inset:0};t.addText(n.text??"",r)}}}async function L(e,t,o,n=!1,r){n&&t.querySelectorAll("img").forEach(s=>s.remove());const i=t.querySelectorAll(De);if(i.length>0)for(let s=0;s<i.length;s++){const l=i[s];let a=W(l,t,r);n&&(a={...a,elements:a.elements.filter(u=>u.type!=="image")});const c=e.addSlide();j(a,c,e)}else{const s=o.createElement("section");s.className="slide",s.innerHTML=t.innerHTML,t.innerHTML="",t.appendChild(s);const l=o.createElement("style");l.textContent=$,t.insertBefore(l,t.firstChild),await new Promise(u=>setTimeout(u,He));let a=W(s,t,r);n&&(a={...a,elements:a.elements.filter(u=>u.type!=="image")});const c=e.addSlide();j(a,c,e)}}async function wt(e,t="exported-slides.pptx"){const o=document.createElement("iframe");o.style.cssText=`
    position: fixed !important;
    left: -10000px !important;
    top: -10000px !important;
    width: 1920px !important;
    height: 1080px !important;
    border: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
    opacity: 0 !important;
    display: block !important;
  `,o.setAttribute("aria-hidden","true"),document.body.appendChild(o);const n=Ve();try{const r=o.contentDocument||o.contentWindow?.document;if(!r)throw new Error("Failed to access iframe document");r.body||(r.write("<!DOCTYPE html><html><head></head><body></body></html>"),r.close());const i=r.createElement("div");if(i.style.cssText=`
    width: 1920px;
    height: 1080px;
  `,r.body.appendChild(i),i.innerHTML=e,!i.querySelector("style")){const l=r.createElement("style");l.textContent=$,i.insertBefore(l,i.firstChild)}await new Promise(l=>setTimeout(l,ye));let s=new(await P(async()=>{const{default:l}=await import("./pptxgen.es-CCSff2Bb.js");return{default:l}},__vite__mapDeps([0,1]))).default;s.layout="LAYOUT_16x9",s.author="Perplexity",s.title="Converted Presentation",s.company="Perplexity AI";try{await L(s,i,r,!1,n),await s.writeFile({fileName:t||V})}catch(l){F.warn("PPTX export failed with images, retrying without images",{error:l}),s=new(await P(async()=>{const{default:a}=await import("./pptxgen.es-CCSff2Bb.js");return{default:a}},__vite__mapDeps([0,1]))).default,s.layout="LAYOUT_16x9",s.author="Perplexity",s.title="Converted Presentation",s.company="Perplexity AI",await L(s,i,r,!0,n),await s.writeFile({fileName:t||V})}}finally{document.body.removeChild(o),n.clear()}}async function bt(e,t="slides.pptx"){try{await wt(e,t)}catch(o){throw F.error("Failed to export slides to PPTX",{error:o}),new Error("Failed to export slides to PowerPoint format")}}async function Ct(e){const t=document.createElement("iframe");t.style.cssText=`
    position: fixed !important;
    left: -10000px !important;
    top: -10000px !important;
    width: 1920px !important;
    height: 1080px !important;
    border: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
    opacity: 0 !important;
    display: block !important;
  `,t.setAttribute("aria-hidden","true"),document.body.appendChild(t);try{const o=t.contentDocument||t.contentWindow?.document;if(!o)throw new Error("Failed to access iframe document");o.body||(o.write("<!DOCTYPE html><html><head></head><body></body></html>"),o.close());const n=o.createElement("div");if(n.style.cssText=`
      width: 1920px;
      height: 1080px;
    `,o.body.appendChild(n),n.innerHTML=e,!n.querySelector("style")){const i=o.createElement("style");i.textContent=$,n.insertBefore(i,n.firstChild)}await new Promise(i=>setTimeout(i,ye));let r=new(await P(async()=>{const{default:i}=await import("./pptxgen.es-CCSff2Bb.js");return{default:i}},__vite__mapDeps([0,1]))).default;r.layout="LAYOUT_16x9",r.author="Perplexity",r.title="Converted Presentation",r.company="Perplexity AI";try{return await L(r,n,o,!1),await r.write({outputType:"blob"})}catch{return r=new(await P(async()=>{const{default:l}=await import("./pptxgen.es-CCSff2Bb.js");return{default:l}},__vite__mapDeps([0,1]))).default,r.layout="LAYOUT_16x9",r.author="Perplexity",r.title="Converted Presentation",r.company="Perplexity AI",await L(r,n,o,!0),await r.write({outputType:"blob"})}}finally{t.parentNode&&document.body.removeChild(t)}}function St(e){return new Promise((t,o)=>{const n=new FileReader;n.onloadend=()=>{if(typeof n.result=="string"){const r=n.result.split(",")[1];r?t(r):o(new Error("Failed to extract base64 from data URL"))}else o(new Error("Failed to convert blob to base64"))},n.onerror=o,n.readAsDataURL(e)})}async function X({htmlContent:e,filename:t,saveFile:o}){const n=await Ct(e);if(!n)throw new Error("Failed to generate PPTX file");const r=await St(n),i=t.endsWith(".pptx")?t:`${t}.pptx`;return{webViewLink:(await o({fileName:i,fileContentB64:r,mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation",connectionType:"GOOGLE_DRIVE"})).web_view_link}}const vt=({reason:e})=>{const{$t:t}=J(),{openToast:o}=Y(),n=C.useCallback(async r=>{try{const i=await Se({name:r,reason:e,autoClose:!0});if(!i)return o({message:t({defaultMessage:"Unable to start authentication.",id:"7sb7u3pWWr"}),variant:"error",timeout:3}),!1;const s=600,l=700,a=window.screenX+(window.outerWidth-s)/2,c=window.screenY+(window.outerHeight-l)/2,u=window.open(i,"oauth-popup",`width=${s},height=${l},left=${a},top=${c},popup=yes,noopener=no`);return u?new Promise(d=>{const p=setInterval(()=>{u.closed&&(clearInterval(p),F.info("OAuth popup closed",{connectorName:r,reason:e}),d(!0))},500);setTimeout(()=>{clearInterval(p),u.closed||(u.close(),F.warn("OAuth popup timeout",{connectorName:r,reason:e}),d(!1))},300*1e3)}):(o({message:t({defaultMessage:"Please allow popups to connect your account.",id:"gMeARpuir7"}),variant:"error",timeout:3}),!1)}catch(i){return F.error("Failed to start OAuth flow",{error:i,connectorName:r,reason:e}),o({message:t({defaultMessage:"Failed to connect account. Please try again.",id:"l9HkZMlKDR"}),variant:"error",timeout:3}),!1}},[e,t,o]);return C.useMemo(()=>({startOAuthFlow:n}),[n])},At=({reason:e})=>{const[t,o]=C.useState(!1),n=C.useCallback(async r=>{o(!0);try{const{data:i,error:s}=await Fe.POST("/rest/connectors/save-file",e,{body:{file_name:r.fileName,s3_url:r.s3Url,file_content_b64:r.fileContentB64,mime_type:r.mimeType,connection_type:r.connectionType,parent_remote_id:r.parentRemoteId},timeoutMs:Ee()});if(s){F.error("Failed to save file to connector",{error:s,request:r,errorMessage:s instanceof Error?s.message:"Unknown error"});const l=s.detail;return{success:!1,errorCode:l?.error_code,errorMessage:l?.error_message||"Failed to save file"}}return i?{success:i.success,webViewLink:i.web_view_link??void 0,errorCode:i.error_code??void 0,errorMessage:i.error_message??void 0}:{success:!1,errorMessage:"No response from server"}}catch(i){return F.error("Unexpected error saving file to connector",{err:i,request:r,errorMessage:i instanceof Error?i.message:"Unknown error"}),{success:!1,errorMessage:i instanceof Error?i.message:"Unknown error"}}finally{o(!1)}},[e]);return C.useMemo(()=>({saveFile:n,isLoading:t}),[n,t])};function Tt({asset:e,assetResult:t}){const o=ee(e),n=[],{session:r}=ke(),{trackEvent:i}=ve(r),{$t:s}=J(),{openToast:l}=Y(),[a,c]=C.useState(!1),u=Ae(),{downloadS3Asset:d}=Ue({reason:"canvas-pdf-download"}),{saveFile:p}=At({reason:"canvas-export-to-drive"}),{startOAuthFlow:g}=vt({reason:"canvas-export-to-drive"}),y=C.useCallback(async f=>{if(!a){c(!0);try{const b=G(o,f.filename!=null?f.filename:"download");let m=await p({fileName:b,s3Url:f.url??"",connectionType:"GOOGLE_DRIVE"});if(m.errorCode==="MISSING_SCOPE"||m.errorCode==="ACCOUNT_NOT_CONNECTED"||m.errorCode==="AUTH_ERROR")if(await g("google_drive"))m=await p({fileName:b,s3Url:f.url??"",connectionType:"GOOGLE_DRIVE"});else return;if(m.success&&m.webViewLink)t&&e&&e.asset_type!=null&&i("canvas content downloaded",{entryUUID:t.backend_uuid,contentType:e.asset_type,assetUUID:e.uuid??"",downloadType:"export"}),l({message:s({defaultMessage:"File exported to Google Drive",id:"FDX8mJLmJm"}),variant:"success",timeout:3}),window.open(m.webViewLink,"_blank");else{let T=s({defaultMessage:"Failed to export file",id:"5/D0jskfku"});m.errorCode==="FILE_TOO_LARGE"?T=s({defaultMessage:"File exceeds 20MB limit for export",id:"UZ4y2AORv5"}):m.errorMessage&&(T=m.errorMessage),l({message:T,variant:"error",timeout:3}),F.error("Failed to export file to Drive",{errorCode:m.errorCode,errorMessage:m.errorMessage,fileName:f.filename})}}catch(b){F.error("Unexpected error during export",{error:b,info:f}),l({message:s({defaultMessage:"Failed to export file",id:"5/D0jskfku"}),variant:"error",timeout:3})}finally{c(!1)}}},[o,a,p,g,t,e,i,s,l]),_=C.useCallback(async(f,b)=>{if(!a){c(!0);try{const m=await X({htmlContent:f,filename:b,saveFile:async T=>{const v=await p({...T});if(!v.success)throw new Error(`Export failed: ${v.errorCode??"unknown error"}${v.errorMessage?` - ${v.errorMessage}`:""}`);return{web_view_link:v.webViewLink??""}}});t&&e&&e.asset_type!=null&&i("canvas content downloaded",{entryUUID:t.backend_uuid,contentType:e.asset_type,assetUUID:e.uuid??"",downloadType:"export"}),l({message:s({defaultMessage:"Slides exported to Google Drive",id:"efsXWg4g3j"}),variant:"success",timeout:3}),window.open(m.webViewLink,"_blank")}catch(m){if(m instanceof Error&&(m.message.includes("MISSING_SCOPE")||m.message.includes("ACCOUNT_NOT_CONNECTED")||m.message.includes("AUTH_ERROR")))if(await g("google_drive"))try{const v=await X({htmlContent:f,filename:b,saveFile:async Ce=>{const R=await p({...Ce});if(!R.success)throw new Error(`Export failed: ${R.errorCode??"unknown error"}${R.errorMessage?` - ${R.errorMessage}`:""}`);return{web_view_link:R.webViewLink??""}}});t&&e&&e.asset_type!=null&&i("canvas content downloaded",{entryUUID:t.backend_uuid,contentType:e.asset_type,assetUUID:e.uuid??"",downloadType:"export"}),l({message:s({defaultMessage:"Slides exported to Google Drive",id:"efsXWg4g3j"}),variant:"success",timeout:3}),window.open(v.webViewLink,"_blank");return}catch(v){F.error("Failed to export slides after OAuth",{error:v})}else return;l({message:m instanceof Error&&m.message?m.message:s({defaultMessage:"Failed to export slides",id:"W62bIrXvad"}),variant:"error",timeout:3}),F.error("Failed to export slides to Drive",{error:m})}finally{c(!1)}}},[a,p,g,t,e,i,s,l]);if(Re(e)&&oe(o)&&o.app.source_content){const f=Z(o)||"slides",b=O(`${f}.pptx`);n.push({type:"default",downloadType:"trigger",text:s({defaultMessage:"Download as PPTX",id:"MbQGjmBtrT"}),icon:U("file-type-ppt"),category:"download",onClick:async()=>{t&&e&&e.asset_type!=null&&i("canvas content downloaded",{entryUUID:t.backend_uuid,contentType:e.asset_type,assetUUID:e.uuid??"",downloadType:"download"});try{await bt(o.app?.source_content??"",b)}catch{}}}),u&&n.push({type:"default",downloadType:"trigger",text:s({defaultMessage:"Export PPTX to GDrive",id:"vxG0vz9KXW"}),icon:U("brand-google-drive"),category:"export",onClick:()=>{_(o.app?.source_content??"",f)}})}return e?.download_info&&e.download_info.length>0&&e.download_info.forEach(f=>{if(!f.url||!Me(f.url))return;const b=q(f.filename),m=Pe(b),T=e.asset_type!=null?Le(e.asset_type,b):"File",v=G(o,f.filename!=null?f.filename:"download");n.push({type:"default",downloadType:"trigger",text:s({defaultMessage:"Download as {fileType}",id:"PJh4v0uaV6"},{fileType:T}),icon:m,category:"download",onClick:()=>{t&&e&&e.asset_type!=null&&i("canvas content downloaded",{entryUUID:t.backend_uuid,contentType:e.asset_type,assetUUID:e.uuid??"",downloadType:"download"}),d({url:f.url??"",filename:v})}}),f.is_exportable&&u&&n.push({type:"default",downloadType:"trigger",text:s({defaultMessage:"Export {fileType} to GDrive",id:"IHrc/RdUMs"},{fileType:T}),icon:U("brand-google-drive"),category:"export",onClick:()=>{y(f)}})}),n}function Ft(e,t,o){if(!e)return{final:null,url:null,name:null,isFinal:!0,isStreaming:!1,chunks:[]};if(o.hasStreamingChild&&o.transformedContent){const n=o.streamingChild?.app?.source_content_chunks;return{final:o.transformedContent,url:t.app?.url??null,name:t.app?.name??null,isFinal:o.streamingChild?.app?.final??!1,isStreaming:o.isStreamingChildActive,chunks:n?.length?n:o.transformedContent?[o.transformedContent]:[]}}if(oe(t)){const n=t.app.source_content_chunks,r=t.app.source_content;return{final:r??null,url:t.app.url??null,name:t.app.name??null,isFinal:t.app.final??!1,isStreaming:!t.app.final,chunks:n?.length?n:r?[r]:[]}}if(ae(t)){if(o.hasStreamingChild&&o.transformedContent){const i=o.streamingChild?.xlsx_file?.source_content_chunks;return{final:o.transformedContent,url:t.xlsxAsset.url??null,name:t.xlsxAsset.name??null,isFinal:o.streamingChild?.xlsx_file?.final??!1,isStreaming:o.isStreamingChildActive,chunks:i?.length?i:o.transformedContent?[o.transformedContent]:[]}}const n=t.xlsxAsset.source_content_chunks,r=t.xlsxAsset.source_content;return{final:r??null,url:t.xlsxAsset.url??null,name:t.xlsxAsset.name??null,isFinal:t.xlsxAsset.final??!1,isStreaming:!t.xlsxAsset.final,chunks:n?.length?n:r?[r]:[]}}if(re(t))return{final:t.pdfFileData?.url??null,url:t.pdfFileData?.url??null,name:t.pdfFileData?.name??null,isFinal:!0,isStreaming:!1,chunks:[]};if(ie(t))return{final:t.docxAsset.url??null,url:t.docxAsset.url??null,name:t.docxAsset.name??null,isFinal:!0,isStreaming:!1,chunks:[]};if(se(t)){if(o.hasStreamingChild&&o.transformedContent){const i=o.streamingChild?.doc_file?.source_content_chunks;return{final:o.transformedContent,url:t.docFileAsset.url??null,name:t.docFileAsset.name??null,isFinal:o.streamingChild?.doc_file?.final??!1,isStreaming:o.isStreamingChildActive,chunks:i?.length?i:o.transformedContent?[o.transformedContent]:[]}}const n=t.docFileAsset.source_content_chunks,r=t.docFileAsset.source_content;return{final:r??null,url:t.docFileAsset.url??null,name:t.docFileAsset.name??null,isFinal:t.docFileAsset.final??!1,isStreaming:!t.docFileAsset.final,chunks:n?.length?n:r?[r]:[]}}if(le(t)){if(o.hasStreamingChild&&o.transformedContent)return{final:o.transformedContent,url:t.researchReportAsset.url??null,name:t.researchReportAsset.name??null,isFinal:o.streamingChild?.research_report?.final??!1,isStreaming:o.isStreamingChildActive,chunks:o.transformedContent?[o.transformedContent]:[]};const n=t.researchReportAsset.source_content;return{final:n??null,url:t.researchReportAsset.url??null,name:t.researchReportAsset.name??null,isFinal:t.researchReportAsset.final??!1,isStreaming:!t.researchReportAsset.final,chunks:n?[n]:[]}}return ue(t)?{final:t.chartAsset.url??null,url:t.chartAsset.url??null,name:null,isFinal:!0,isStreaming:!1,chunks:[]}:ce(t)?{final:null,url:null,name:t.codeFileAsset.filename??null,isFinal:!0,isStreaming:!1,chunks:[]}:pe(e)?{final:e.code.script??null,url:null,name:null,isFinal:!0,isStreaming:!1,chunks:[]}:de(e)?{final:e.generated_image.url??null,url:e.generated_image.url??null,name:null,isFinal:!0,isStreaming:!1,chunks:[]}:fe(e)?{final:e.generated_video.url??null,url:e.generated_video.url??null,name:null,isFinal:!0,isStreaming:!1,chunks:[]}:he(e)?{final:null,url:null,name:e.quiz.title??null,isFinal:!0,isStreaming:!1,chunks:[]}:ge(e)?{final:null,url:null,name:e.flashcards.title??null,isFinal:!0,isStreaming:!1,chunks:[]}:me(e)?{final:null,url:null,name:e.document_review.document_name??null,isFinal:!0,isStreaming:!1,chunks:[]}:{final:null,url:null,name:null,isFinal:!0,isStreaming:!1,chunks:[]}}function Et(e,t){if(e?.asset_type==="APP"||e?.asset_type==="SLIDES"){const o=e.app?.final===!0,n=!!e.app?.source_content,r=o,i=n,s=[];r&&s.push(w.Preview),i&&s.push(w.Source);let l=null;return t.isStreamingUpdate?l=w.Source:t.hasStreamingChild&&!t.streamingChild?.app?.final?l=w.Source:o||t.streamingChild?.app?.final?l=w.Preview:!o&&n&&(l=w.Source),{supportsPreviewTab:r,supportsCodeTab:i,availableTabs:s,defaultTab:l}}if(e?.asset_type==="XLSX_FILE"){const o=e.xlsx_file?.final===!0,n=!!e.xlsx_file?.source_content,r=o,i=n,s=[];r&&s.push(w.Preview),i&&s.push(w.Source);let l=null;return t.isStreamingUpdate?l=w.Source:t.hasStreamingChild&&!t.streamingChild?.xlsx_file?.final?l=w.Source:o||t.streamingChild?.xlsx_file?.final?l=w.Preview:!o&&n&&(l=w.Source),{supportsPreviewTab:r,supportsCodeTab:i,availableTabs:s,defaultTab:l}}if(e?.asset_type==="DOC_FILE"){const o=e.doc_file?.final===!0,n=!!e.doc_file?.source_content,r=o,i=n,s=[];r&&s.push(w.Preview),i&&s.push(w.Source);let l=null;return t.isStreamingUpdate?l=w.Source:t.hasStreamingChild&&!t.streamingChild?.doc_file?.final?l=w.Source:o||t.streamingChild?.doc_file?.final?l=w.Preview:!o&&n&&(l=w.Source),{supportsPreviewTab:r,supportsCodeTab:i,availableTabs:s,defaultTab:l}}if(e?.asset_type==="RESEARCH_REPORT"){const o=e.research_report?.final===!0,n=!!e.research_report?.source_content,r=n||o,i=n,s=[];r&&s.push(w.Preview),i&&s.push(w.Source);const l=s[0]??null;return{supportsPreviewTab:r,supportsCodeTab:i,availableTabs:s,defaultTab:l}}return{supportsPreviewTab:!1,supportsCodeTab:!1,availableTabs:[],defaultTab:null}}function qt({asset:e,allAssets:t,assetResult:o,backendUuid:n}){const r=ee(e),i=Be(e,t),s=C.useMemo(()=>({hasTransforms:te(e),isStreamingUpdate:D(e),streamingChild:i.streamingChild,transformedContent:i.transformedContent,parentAsset:void 0,hasStreamingChild:i.hasStreamingChild,isStreamingChildActive:i.isStreaming}),[e,i]),l=C.useMemo(()=>Ft(e,r,s),[e,r,s]),a=C.useMemo(()=>Et(e,s),[e,s]),c=Tt({asset:e,assetResult:o}),u=C.useMemo(()=>{const p=n??o?.backend_uuid,g=ze(r,p),y=ne(r,p);return{supportsFullScreen:g,fullScreenUrl:y,supportsDownload:c.length>0,downloadableItems:c,supportsVersioning:!!e?.version_info}},[r,n,o,c,e]),d=C.useMemo(()=>({app:e?.asset_type==="APP",slides:e?.asset_type==="SLIDES",pdf:re(r),docx:ie(r),docFile:se(r),researchReport:le(r),xlsx:ae(r),codeFile:ce(r),chart:ue(r),code:pe(e),generatedImage:de(e),generatedVideo:fe(e),quiz:he(e),flashcards:ge(e),documentReview:me(e)}),[e,r]);return{assetData:r,content:l,streaming:s,tabs:a,capabilities:u,is:d}}const Yt=()=>{const{results:e}=Te(),t=C.useMemo(()=>!e||e.length===0?[]:e.map(r=>({result:r,assets:Ie(r?.blocks??S,{orderedByPriority:!0})})),[e]),o=C.useMemo(()=>t.flatMap(({assets:r})=>r),[t]),n=o.length>0;return{resultAssets:t,allAssets:o,hasAssets:n}};export{he as A,ge as B,I as C,Vt as a,Ie as b,Gt as c,$t as d,Wt as e,Dt as f,Ht as g,zt as h,D as i,Xt as j,qt as k,Ne as l,jt as m,oe as n,me as o,ie as p,se as q,le as r,ae as s,re as t,Yt as u,ue as v,ce as w,pe as x,de as y,fe as z};
//# sourceMappingURL=https://pplx-static-sourcemaps.perplexity.ai/_spa/assets/useThreadAssets-D2Rdf-tr.js.map
