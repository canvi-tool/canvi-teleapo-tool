import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import AuthPage from "./AuthPage";
import AdminPage from "./AdminPage";
const CALL_PATTERNS = [
{ id: "new_list", label: "新規リスト向け", icon: "📋", desc: "未接触の新規ターゲットへのコールド架電" },
{ id: "exhibition", label: "展示会リード向け", icon: "🏛️", desc: "展示会・セミナーで接触済みのリード" },
{ id: "cold_list", label: "過去名刺・コールドリスト向け", icon: "🗂️", desc: "過去の名刺データや休眠リスト" },
{ id: "web_inquiry", label: "Web問い合わせ向け", icon: "🌐", desc: "Webフォームから問い合わせがあったリード" },
{ id: "upsell", label: "既存顧客アップセル向け", icon: "📈", desc: "既存顧客への追加提案・アップセル" },
];
const DEPARTMENTS = ["経営企画部","総務部","人事部","経理・財務部","情報システム部","営業部","マーケティング部","購買・調達部","製造部","物流部","カスタマーサポート部","法務部","広報部","その他"];
const EMPLOYEE_RANGES = ["1〜10名","11〜30名","31〜50名","51〜100名","101〜300名","301〜500名","501〜1000名","1001名以上"];
const AREA_OPTIONS = ["全国","首都圏（東京・神奈川・埼玉・千葉）","関西圏（大阪・京都・兵庫）","主要都市のみ","東日本","西日本","カスタム指定"];
const INDUSTRIES = ["IT・ソフトウェア","SaaS・クラウド","製造業","建設・不動産","金融・保険","医療・ヘルスケア","小売・EC","物流・運輸","教育・研修","人材・採用","コンサルティング","飲食・ホスピタリティ","メディア・広告","その他"];
const STEPS = [{id:1,label:"サービス情報",icon:"📦"},{id:2,label:"架電パターン",icon:"📞"},{id:3,label:"ターゲット設定",icon:"🎯"},{id:4,label:"営業戦略",icon:"⚡"},{id:5,label:"断り文句",icon:"🛡️"},{id:6,label:"生成・確認",icon:"✨"}];
const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",GOLD="#f5a623",DARK="#0f0f0f",GRAY_LIGHT="#f5f5f5",WHITE="#ffffff",TEXT="#1a1a1a",TEXT_MUTED="#666",BORDER="#e8e8e8";
const BG="#0d0d0d",SURFACE="#1a1a1a",SURFACE2="#252525",SURFACE3="#2e2e2e",TEAL="#0e9b7e",TEAL_LIGHT="#13c0a0";
// ===== LUXE GENERATING PROGRESS =====
function GeneratingProgress({progress,status,messages,currentMsg}){
var items=[
{id:"script",label:"📋 トークスクリプト",color:RED,gradient:"linear-gradient(90deg,"+RED+","+RED_DARK+")"},
{id:"objection",label:"🛡️ 切り返しトーク",color:RED_DARK,gradient:"linear-gradient(90deg,"+RED_DARK+",#8b0012)"},
{id:"faq",label:"❓ FAQ",color:GOLD,gradient:"linear-gradient(90deg,"+GOLD+",#d48c1a)"}
];
var total=(progress.script+progress.objection+progress.faq)/3;
var allDone=status.script==="done"&&status.objection==="done"&&status.faq==="done";
return(
<div style={{background:WHITE,borderRadius:16,padding:"40px 36px",border:"1px solid "+BORDER,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",position:"relative",overflow:"hidden"}}>
{/* Background pulse effect */}
<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 30% 50%,rgba(232,0,29,0.03),transparent 70%)",animation:allDone?"none":"pulse 3s infinite",pointerEvents:"none"}}/>
  {/* Main title */}
  <div style={{textAlign:"center",marginBottom:32,position:"relative",zIndex:1}}>
    <div style={{fontSize:48,marginBottom:12,animation:allDone?"celebrate 0.6s ease-out":"none"}}>
      {allDone?"🎉":"⚡"}
    </div>
    <div style={{fontSize:22,fontWeight:900,color:DARK,marginBottom:6}}>
      {allDone?"生成完了！":"AIが最強スクリプトを設計中..."}
    </div>
    <div style={{fontSize:14,color:TEXT_MUTED,height:20}}>
      {allDone?"":""}
    </div>
  </div>

  {/* Total progress bar */}
  <div style={{marginBottom:28,position:"relative",zIndex:1}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
      <span style={{fontSize:13,fontWeight:700,color:TEXT}}>全体進捗</span>
      <span style={{fontSize:15,fontWeight:900,color:allDone?"#22c55e":RED}}>{Math.round(total)}%</span>
    </div>
    <div style={{background:"#e8e8e8",height:12,borderRadius:20,overflow:"hidden",position:"relative",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.06)"}}>
      <div style={{
        background:allDone?"linear-gradient(90deg,#22c55e,#16a34a)":"linear-gradient(90deg,"+RED+","+GOLD+")",
        height:"100%",
        width:total+"%",
        borderRadius:20,
        transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)",
        position:"relative",
        overflow:"hidden"
      }}>
        {/* Shine effect */}
        {!allDone&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",animation:"shine 2s infinite"}}/>}
      </div>
    </div>
  </div>

  {/* Rotating messages */}
  {!allDone&&(
    <div style={{background:GOLD+"08",border:"1px solid "+GOLD+"22",borderRadius:12,padding:"14px 18px",marginBottom:24,textAlign:"center",minHeight:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:13,color:"#92400e",fontWeight:600,animation:"fadeSlide 0.5s ease-in"}}>
        💡 {messages[currentMsg]}
      </div>
    </div>
  )}

  {/* Section progress */}
  <div style={{display:"flex",flexDirection:"column",gap:16,position:"relative",zIndex:1}}>
    {items.map(function(item,idx){
      var p=progress[item.id];
      var s=status[item.id];
      var icon=s==="done"?"✓":s==="processing"?"⏳":"⏱️";
      var statusText=s==="done"?"完了":s==="processing"?"処理中 ("+Math.round(p)+"%)":"待機中";
      var statusColor=s==="done"?"#22c55e":s==="processing"?item.color:"#aaa";
      
      return(
        <div key={item.id} style={{opacity:s==="waiting"?0.4:1,transition:"opacity 0.3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>{item.label.split(" ")[0]}</span>
              <span style={{fontSize:13,fontWeight:700,color:TEXT}}>{item.label.split(" ")[1]}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:statusColor}}>{statusText}</span>
            </div>
          </div>
          <div style={{background:"#f0f0f0",height:6,borderRadius:10,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{
              background:item.gradient,
              height:"100%",
              width:p+"%",
              borderRadius:10,
              transition:"width 0.3s ease-out",
              position:"relative",
              overflow:"hidden"
            }}>
              {s==="processing"&&<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)",animation:"shine 1.5s infinite"}}/>}
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* Completion message */}
  {allDone&&(
    <div style={{marginTop:24,textAlign:"center",animation:"fadeIn 0.5s ease-in"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#22c55e",marginBottom:4}}>✨ 3つのセクションがすべて完了しました</div>
      <div style={{fontSize:12,color:TEXT_MUTED}}>結果を確認してください</div>
    </div>
  )}

  {/* CSS animations */}
  <style>{`
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes celebrate {
      0% { transform: scale(1); }
      50% { transform: scale(1.3) rotate(10deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
</div>
);
}
// ===== FORM COMPONENTS =====
function StepIndicator({current}){
return(
<div style={{display:"flex",alignItems:"center",marginBottom:40}}>
{STEPS.map(function(s,i){return(
<div key={s.id} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
<div style={{width:48,height:48,borderRadius:"50%",background:current===s.id?RED:current>s.id?DARK:WHITE,border:"2px solid "+(current===s.id?RED:current>s.id?DARK:BORDER),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:current>s.id?GOLD:current===s.id?WHITE:"#aaa",boxShadow:current===s.id?"0 0 0 4px "+RED_LIGHT:"none",transition:"all 0.3s"}}>
{current>s.id?"✓":s.icon}
</div>
<span style={{fontSize:10,fontWeight:700,whiteSpace:"nowrap",color:current===s.id?RED:current>s.id?DARK:"#aaa"}}>{s.label}</span>
</div>
{i<STEPS.length-1&&<div style={{flex:1,height:3,margin:"0 4px",marginBottom:24,background:current>s.id?"linear-gradient(90deg,"+DARK+","+RED+")":BORDER,borderRadius:2}}/>}
</div>
);})}
</div>
);
}
function MultiSelect({options,selected,onChange,cols}){
var c=cols||3;
return(
<div style={{display:"grid",gridTemplateColumns:"repeat("+c+",1fr)",gap:8}}>
{options.map(function(o){
var on=selected.includes(o);
return(
<button key={o} onClick={function(){onChange(on?selected.filter(function(x){return x!==o;}):[...selected,o]);}} style={{padding:"10px 12px",borderRadius:8,border:"2px solid "+(on?RED:BORDER),background:on?RED_LIGHT:WHITE,color:on?RED:TEXT,fontSize:13,fontWeight:on?700:400,cursor:"pointer",textAlign:"left"}}>
{on&&"✓ "}{o}
</button>
);
})}
</div>
);
}
function Lbl({children,req}){
return(
<div style={{fontSize:13,fontWeight:700,color:TEXT,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
{children}{req&&<span style={{background:RED,color:WHITE,fontSize:10,fontWeight:800,padding:"2px 6px",borderRadius:4}}>必須</span>}
</div>
);
}
function Inp({value,onChange,placeholder,multi,rows}){
var r=rows||4;
var s={width:"100%",padding:"12px 16px",borderRadius:10,border:"2px solid "+BORDER,background:WHITE,fontSize:14,color:TEXT,outline:"none",fontFamily:"inherit",resize:multi?"vertical":"none",boxSizing:"border-box"};
return multi?<textarea value={value} onChange={function(e){onChange(e.target.value);}} placeholder={placeholder} rows={r} style={s}/>:<input value={value} onChange={function(e){onChange(e.target.value);}} placeholder={placeholder} style={s}/>;
}
function Card({children,style}){
return <div style={Object.assign({background:WHITE,borderRadius:16,padding:"32px 36px",border:"1px solid "+BORDER,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",marginBottom:20},style||{})}>{children}</div>;
}
function H({children,sub}){
return(
<div style={{marginBottom:28}}>
<div style={{fontSize:22,fontWeight:900,color:DARK}}>{children}</div>
{sub&&<div style={{fontSize:13,color:TEXT_MUTED,marginTop:4}}>{sub}</div>}
</div>
);
}
function PdfDropZone({onText,uploaded,setUploaded,fileName,setFileName}){
var[dragging,setDragging]=useState(false);
var[loading,setLoading]=useState(false);
function processFile(file){
if(!file||file.type!=="application/pdf")return;
if(file.size>4500000){alert("PDFのファイルサイズは4.5MB以下にしてください。");return;}
setFileName(file.name);setUploaded(true);setLoading(true);
var reader=new FileReader();
reader.onload=function(ev){
var base64=ev.target.result.split(",")[1];
fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-opus-4-5",max_tokens:2000,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},{type:"text",text:"このドキュメントの内容を日本語でそのまま抽出してください。"}]}]})})
.then(function(res){return res.json();}).then(function(data){onText(data.content?data.content.map(function(c){return c.text||"";}).join(""):"");setUploaded(true);setLoading(false);}).catch(function(){setLoading(false);});
};
reader.readAsDataURL(file);
}
var borderColor=uploaded?"#22c55e":dragging?RED:BORDER;
var bg=uploaded?"#f0fdf4":dragging?RED_LIGHT:GRAY_LIGHT;
return(
<div onDragOver={function(e){e.preventDefault();setDragging(true);}} onDragLeave={function(){setDragging(false);}} onDrop={function(e){e.preventDefault();setDragging(false);processFile(e.dataTransfer.files[0]);}} style={{border:"2px dashed "+borderColor,borderRadius:12,padding:"32px 20px",textAlign:"center",background:bg,transition:"all 0.2s",cursor:"pointer"}}>
{loading&&<div><div style={{fontSize:36,marginBottom:8}}>⏳</div><div style={{fontSize:13,color:GOLD,fontWeight:700}}>PDFを読み込み中...</div></div>}
{!loading&&!uploaded&&<div><div style={{fontSize:36,marginBottom:8}}>{dragging?"📂":"📄"}</div><div style={{fontSize:13,color:TEXT_MUTED,marginBottom:4,fontWeight:600}}>ここにPDFをドラッグ＆ドロップ</div><div style={{fontSize:11,color:"#aaa",marginBottom:16}}>または</div><label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 24px",borderRadius:8,background:RED,color:WHITE,fontWeight:700,fontSize:13,cursor:"pointer"}}>ファイルを選択<input type="file" accept="application/pdf" onChange={function(e){processFile(e.target.files[0]);}} style={{display:"none"}}/></label></div>}
{!loading&&uploaded&&<div><div style={{fontSize:36,marginBottom:8}}>✅</div><div style={{fontSize:13,color:"#166534",fontWeight:800,marginBottom:4}}>{fileName}</div><div style={{fontSize:11,color:"#166534",marginBottom:14}}>読み込み完了！</div><label style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 18px",borderRadius:8,border:"2px solid "+BORDER,background:WHITE,color:TEXT_MUTED,fontWeight:600,fontSize:12,cursor:"pointer"}}>別のファイルに変更<input type="file" accept="application/pdf" onChange={function(e){setUploaded(false);processFile(e.target.files[0]);}} style={{display:"none"}}/></label></div>}
</div>
);
}
function ToggleInput({mode,setMode,textValue,onTextChange,textPlaceholder,textRows,onPdfText,uploaded,setUploaded,fileName,setFileName}){
return(
<div>
<div style={{display:"flex",gap:8,marginBottom:14}}>
{[["text","✏️ テキストで入力"],["pdf","📎 PDFをアップロード"]].map(function(item){
var active=mode===item[0];
return <button key={item[0]} onClick={function(){setMode(item[0]);}} style={{padding:"8px 18px",borderRadius:20,border:"2px solid "+(active?RED:BORDER),background:active?RED_LIGHT:WHITE,color:active?RED:TEXT_MUTED,fontWeight:active?700:500,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{item[1]}</button>;
})}
</div>
{mode==="text"&&<Inp value={textValue} onChange={onTextChange} placeholder={textPlaceholder} multi={true} rows={textRows||4}/>}
{mode==="pdf"&&<PdfDropZone onText={onPdfText} uploaded={uploaded} setUploaded={setUploaded} fileName={fileName} setFileName={setFileName}/>}
</div>
);
}
// ===== INPUT SUMMARY =====
function InputSummary({form}){
var p=CALL_PATTERNS.find(function(x){return x.id===form.callPattern;});
var items=[
{icon:"🏢",label:"会社名",value:form.companyName},
{icon:"📦",label:"サービス名",value:form.serviceName},
{icon:"📞",label:"架電パターン",value:p?p.label:"-"},
{icon:"🏭",label:"ターゲット業界",value:form.industries.join("・")||"-"},
{icon:"📍",label:"エリア",value:form.area||"-"},
{icon:"🎯",label:"訴求ポイント",value:form.appealPoints||"-"},
{icon:"🛡️",label:"受付断り",value:form.rcptObjections||"なし"},
{icon:"💬",label:"担当者断り",value:form.contactObjections||"なし"},
];
return(
<div style={{background:SURFACE2,borderRadius:10,padding:"14px 18px",marginBottom:14,border:"1px solid rgba(255,255,255,0.06)"}}>
<div style={{fontSize:10,fontWeight:700,color:GOLD,letterSpacing:"0.12em",marginBottom:10}}>📋 入力内容サマリー</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
{items.map(function(item,i){
var val=item.value&&item.value.length>36?item.value.slice(0,36)+"…":item.value||"-";
return(
<div key={i} style={{display:"flex",gap:7,alignItems:"flex-start"}}>
<span style={{fontSize:12,flexShrink:0,marginTop:1}}>{item.icon}</span>
<div>
<div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:"0.05em",marginBottom:1}}>{item.label}</div>
<div style={{fontSize:11,color:"#c0c0c0",lineHeight:1.5}}>{val}</div>
</div>
</div>
);
})}
</div>
</div>
);
}
// ===== LINE RENDERER (shared by all viewers) =====
function renderLine(line, j, accentColor){
var t = line.trim();
var ac = accentColor || RED;
if(!t) return <div key={j} style={{height:6}}/>;
if(/^# /.test(t)){
return(
<div key={j} style={{
background:"linear-gradient(90deg,"+ac+"22,transparent)",
borderLeft:"4px solid "+ac,
borderRadius:"0 8px 8px 0",
padding:"10px 16px",
marginTop:16, marginBottom:8,
}}>
<span style={{fontSize:16,fontWeight:900,color:WHITE,letterSpacing:"0.04em"}}>
{t.replace(/^# /,"")}
</span>
</div>
);
}
if(/^## /.test(t)){
return(
<div key={j} style={{
borderLeft:"3px solid "+ac+"bb",
paddingLeft:12,
marginTop:12, marginBottom:6,
}}>
<span style={{fontSize:14,fontWeight:800,color:"#e8e8e8"}}>
{t.replace(/^## /,"")}
</span>
</div>
);
}
if(/^### /.test(t)){
return(
<div key={j} style={{
paddingLeft:4,
marginTop:10, marginBottom:4,
}}>
<span style={{fontSize:13,fontWeight:700,color:"#c8c8c8",borderBottom:"1px solid rgba(255,255,255,0.1)",paddingBottom:2}}>
{t.replace(/^### /,"")}
</span>
</div>
);
}
if(/^#### /.test(t)){
return(
<div key={j} style={{paddingLeft:8,marginTop:6,marginBottom:2}}>
<span style={{fontSize:12,fontWeight:600,color:"#aaa",fontStyle:"italic"}}>
{t.replace(/^#### /,"")}
</span>
</div>
);
}
if(/^---+$/.test(t)) return <div key={j} style={{height:1,background:"rgba(255,255,255,0.07)",margin:"8px 0"}}/>;
if(/^💡/.test(t)) return(
<div key={j} style={{background:"rgba(245,166,35,0.08)",border:"1px solid rgba(245,166,35,0.22)",borderRadius:8,padding:"8px 12px",fontSize:12,color:GOLD,display:"flex",gap:6,lineHeight:1.8,marginTop:4,marginBottom:2}}>
<span>💡</span><span>{t.replace(/^💡\s*/,"")}</span>
</div>
);
if(/^【あなた】/.test(t)) return(
<div key={j} style={{fontFamily:"monospace",fontSize:10,color:TEAL_LIGHT,letterSpacing:"1px",marginTop:10,marginBottom:3,display:"flex",alignItems:"center",gap:5}}>
<span style={{width:5,height:5,borderRadius:"50%",background:TEAL_LIGHT,display:"inline-block"}}></span>あなた（発信者）
</div>
);
if(/^【受付】/.test(t)) return(
<div key={j} style={{fontFamily:"monospace",fontSize:10,color:"#e87a7a",letterSpacing:"1px",marginTop:10,marginBottom:3,display:"flex",alignItems:"center",gap:5}}>
<span style={{width:5,height:5,borderRadius:"50%",background:"#e87a7a",display:"inline-block"}}></span>受付
</div>
);
if(t.startsWith("「")&&t.endsWith("」")) return(
<div key={j} style={{background:SURFACE3,borderLeft:"3px solid "+ac,borderRadius:"0 8px 8px 0",padding:"10px 14px",fontSize:13,color:"#ececec",lineHeight:1.9,marginBottom:3}}>
{t}
</div>
);
if(/^→/.test(t)) return(
<div key={j} style={{background:"rgba(232,0,29,0.06)",border:"1px solid rgba(232,0,29,0.14)",borderRadius:7,padding:"7px 12px",fontSize:13,color:"#ff9999",lineHeight:1.8,marginLeft:10}}>
{t}
</div>
);
if(/^✅|^※/.test(t)) return(
<div key={j} style={{background:"rgba(245,166,35,0.07)",border:"1px solid rgba(245,166,35,0.18)",borderRadius:7,padding:"7px 12px",fontSize:12,color:GOLD,lineHeight:1.8}}>
{t}
</div>
);
if(/^[①-⑥]|^\d+.\s/.test(t)) return(
<div key={j} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"2px 0"}}>
<span style={{color:ac,fontWeight:700,flexShrink:0,fontSize:13,marginTop:2}}>▶</span>
<span style={{fontSize:13,color:"#c0c0c0",lineHeight:1.8}}>{t.replace(/^[①-⑥]\s*|^\d+.\s*/,"")}</span>
</div>
);
if(/^[-・]\s/.test(t)) return(
<div key={j} style={{display:"flex",gap:6,alignItems:"flex-start",padding:"1px 0",paddingLeft:4}}>
<span style={{color:"#666",flexShrink:0,marginTop:3,fontSize:10}}>●</span>
<span style={{fontSize:13,color:"#b8b8b8",lineHeight:1.8}}>{t.replace(/^[-・]\s*/,"")}</span>
</div>
);
if(/^❌/.test(t)) return(
<div key={j} style={{background:"rgba(232,0,29,0.08)",border:"1px solid rgba(232,0,29,0.22)",borderRadius:7,padding:"9px 12px",fontSize:13,color:"#ff6b6b",fontWeight:700,lineHeight:1.8,marginTop:10}}>
{t}
</div>
);
if(/^▍|^パターン[①-⑤⑥]/.test(t)) return(
<div key={j} style={{fontSize:10,fontFamily:"monospace",color:"#777",letterSpacing:"1px",marginTop:10,marginBottom:2,borderBottom:"1px solid "+SURFACE3,paddingBottom:3}}>
{t}
</div>
);
if(/^🏆/.test(t)) return(
<div key={j} style={{background:"linear-gradient(90deg,rgba(245,166,35,0.12),transparent)",borderLeft:"3px solid "+GOLD,borderRadius:"0 8px 8px 0",padding:"9px 14px",fontSize:13,fontWeight:700,color:GOLD,lineHeight:1.8,marginTop:10}}>
{t}
</div>
);
return <div key={j} style={{fontSize:13,color:"#a8a8a8",lineHeight:1.9,padding:"1px 0"}}>{t}</div>;
}
// ===== SCRIPT VIEWER =====
function ScriptViewer({content}){
var[open,setOpen]=useState({0:true,1:true});
if(!content) return <div style={{color:"#666",fontSize:13,padding:20,textAlign:"center"}}>データがありません</div>;
var blocks=[];var cur=null;
content.split("\n").forEach(function(line){
var t=line.trim();
var isHeader=/^■\sPART/.test(t)||/^STEP\s+0[2-6]/.test(t)||/^🏆/.test(t);
if(isHeader){
if(cur)blocks.push(cur);
var isGate=/PART\s1|受付/.test(t);
var isGolden=/🏆/.test(t);
cur={title:t,lines:[],color:isGolden?GOLD:isGate?RED:RED_DARK,icon:isGolden?"🏆":isGate?"🔑":"💬"};
} else {
if(!cur) cur={title:"",lines:[],color:RED,icon:"📋"};
cur.lines.push(line);
}
});
if(cur&&(cur.title||cur.lines.length)) blocks.push(cur);
return(
<div style={{display:"flex",flexDirection:"column",gap:10}}>
{blocks.map(function(block,i){
var isOpen=open[i]!==false;
return(
<div key={i} style={{borderRadius:12,overflow:"hidden",border:"1px solid "+block.color+"44"}}>
{block.title&&(
<button onClick={function(){setOpen(function(o){var n=Object.assign({},o);n[i]=!isOpen;return n;});}}
style={{width:"100%",background:"linear-gradient(135deg,"+BG+","+SURFACE+")",borderTop:"3px solid "+block.color,
padding:"12px 16px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
<div style={{width:28,height:28,borderRadius:6,background:block.color+"20",border:"1px solid "+block.color+"44",
display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{block.icon}</div>
<span style={{fontWeight:800,fontSize:13,color:WHITE,flex:1}}>{block.title}</span>
<span style={{color:block.color,fontSize:11,opacity:0.7}}>{isOpen?"▲":"▼"}</span>
</button>
)}
{(isOpen||!block.title)&&(
<div style={{background:SURFACE,padding:"12px 14px",display:"flex",flexDirection:"column",gap:2}}>
{block.lines.map(function(line,j){return renderLine(line,j,block.color);})}
</div>
)}
</div>
);
})}
</div>
);
}
// ===== OBJECTION VIEWER =====
function ObjectionViewer({content}){
var[open,setOpen]=useState({});
if(!content) return <div style={{color:"#666",fontSize:13,padding:20,textAlign:"center"}}>データがありません</div>;
var blocks=content.split(/\n(?=❌)/).filter(function(b){return b.trim();});
return(
<div style={{display:"flex",flexDirection:"column",gap:10}}>
{blocks.map(function(block,i){
var lines=block.split("\n").filter(function(l){return l.trim();});
var headline=lines[0].replace(/^❌\s*/,"").replace(/^「|」$/g,"").trim();
var isOpen=open[i]!==false;
return(
<div key={i} style={{borderRadius:12,overflow:"hidden",border:"1px solid rgba(232,0,29,0.28)"}}>
<button onClick={function(){setOpen(function(o){var n=Object.assign({},o);n[i]=!isOpen;return n;});}}
style={{width:"100%",background:"linear-gradient(135deg,"+BG+","+SURFACE+")",borderTop:"3px solid "+RED,
padding:"12px 16px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
<div style={{width:28,height:28,borderRadius:6,background:"rgba(232,0,29,0.12)",border:"1px solid rgba(232,0,29,0.3)",
display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>❌</div>
<span style={{fontWeight:800,fontSize:13,color:WHITE,flex:1,textAlign:"left"}}>「{headline}」</span>
<span style={{color:RED,fontSize:11,opacity:0.7}}>{isOpen?"▲":"▼"}</span>
</button>
{isOpen&&(
<div style={{background:SURFACE,padding:"12px 14px",display:"flex",flexDirection:"column",gap:7}}>
<div style={{background:"rgba(232,0,29,0.06)",borderLeft:"3px solid "+RED,borderRadius:"0 7px 7px 0",padding:"8px 12px",marginBottom:2}}>
<div style={{fontFamily:"monospace",fontSize:9,color:"#e87a7a",letterSpacing:"1px",marginBottom:2,display:"flex",alignItems:"center",gap:5}}>
<span style={{width:4,height:4,borderRadius:"50%",background:"#e87a7a",display:"inline-block"}}></span>相手の言葉
</div>
<div style={{fontSize:13,color:"#ff9999",lineHeight:1.8}}>「{headline}」</div>
</div>
{lines.slice(1).map(function(line,j){
var t=line.trim();if(!t)return null;
if(/^1[.．]/.test(t)) return(
<div key={j} style={{borderRadius:7,overflow:"hidden"}}>
<div style={{background:"#1e3050",padding:"3px 10px",fontSize:9,fontWeight:800,color:"#7aaed4",display:"inline-block",borderRadius:"5px 5px 0 0"}}>① 共感</div>
<div style={{background:"rgba(30,48,80,0.5)",border:"1px solid rgba(74,120,200,0.18)",borderRadius:"0 5px 5px 5px",padding:"8px 12px",fontSize:13,color:"#a8bdd4",lineHeight:1.8}}>{t.replace(/^1[.．]\s*/,"")}</div>
</div>
);
if(/^2[.．]/.test(t)) return(
<div key={j} style={{borderRadius:7,overflow:"hidden"}}>
<div style={{background:"#3a2800",padding:"3px 10px",fontSize:9,fontWeight:800,color:GOLD,display:"inline-block",borderRadius:"5px 5px 0 0"}}>② 転換</div>
<div style={{background:"rgba(58,40,0,0.5)",border:"1px solid rgba(245,166,35,0.18)",borderRadius:"0 5px 5px 5px",padding:"8px 12px",fontSize:13,color:"#d4a84b",lineHeight:1.8}}>{t.replace(/^2[.．]\s*/,"")}</div>
</div>
);
if(/^3[.．]/.test(t)) return(
<div key={j} style={{borderRadius:7,overflow:"hidden"}}>
<div style={{background:RED_DARK,padding:"3px 10px",fontSize:9,fontWeight:800,color:WHITE,display:"inline-block",borderRadius:"5px 5px 0 0"}}>③ クロージング</div>
<div style={{background:"rgba(181,0,23,0.15)",border:"1px solid rgba(232,0,29,0.22)",borderRadius:"0 5px 5px 5px",padding:"8px 12px",fontSize:13,color:"#ff9999",lineHeight:1.8}}>{t.replace(/^3[.．]\s*/,"")}</div>
</div>
);
return renderLine(line,j,RED);
})}
</div>
)}
</div>
);
})}
</div>
);
}
// ===== FAQ VIEWER =====
function FaqViewer({content}){
var[open,setOpen]=useState(null);
if(!content) return <div style={{color:"#666",fontSize:13,padding:20,textAlign:"center"}}>データがありません</div>;
var pairs=[];var cur=null;
content.split("\n").forEach(function(line){
var t=line.trim();if(!t)return;
if(/^Q[\d.\s：]+/.test(t)||/^Q\d/.test(t)){if(cur)pairs.push(cur);cur={q:t.replace(/^Q[\d.\s：]+/,"").trim(),a:[]};}
else if(/^A[\d.\s：]+/.test(t)||/^A\d/.test(t)){if(cur)cur.a.push(t.replace(/^A[\d.\s：]+/,"").trim());}
else if(cur){cur.a.push(t);}
});
if(cur)pairs.push(cur);
return(
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{pairs.map(function(p,i){
var isOpen=open===i;
return(
<div key={i} style={{borderRadius:10,overflow:"hidden",border:"1px solid "+(isOpen?GOLD+"44":"rgba(255,255,255,0.06)")}}>
<button onClick={function(){setOpen(isOpen?null:i);}}
style={{width:"100%",background:isOpen?"linear-gradient(135deg,"+SURFACE+","+SURFACE2+")":BG,
padding:"11px 14px",border:"none",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10,textAlign:"left",
borderTop:isOpen?"3px solid "+GOLD:"3px solid transparent"}}>
<span style={{minWidth:22,height:22,borderRadius:5,background:isOpen?GOLD+"18":"rgba(255,255,255,0.04)",
border:"1px solid "+(isOpen?GOLD+"44":"rgba(255,255,255,0.08)"),color:isOpen?GOLD:"#555",
fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>Q</span>
<span style={{fontSize:13,fontWeight:700,color:isOpen?WHITE:"#a0a0a0",flex:1,lineHeight:1.7}}>{p.q}</span>
<span style={{color:isOpen?GOLD:"#444",fontSize:11,flexShrink:0,marginTop:2}}>{isOpen?"▲":"▼"}</span>
</button>
{isOpen&&(
<div style={{padding:"11px 14px 11px 46px",background:SURFACE,borderTop:"1px solid "+GOLD+"18"}}>
{p.a.map(function(line,j){return renderLine(line,j,GOLD);})}
</div>
)}
</div>
);
})}
</div>
);
}
// ===== VERSION HISTORY =====
function VersionHistory({versions,currentId,onRestore}){
if(!versions.length)return null;
return(
<div style={{marginBottom:10}}>
<div style={{fontSize:10,fontWeight:700,color:"#777",marginBottom:6}}>📁 バージョン履歴</div>
<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
{versions.map(function(v,i){return <button key={v.id} onClick={function(){onRestore(v);}} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:"2px solid "+(v.id===currentId?RED:BORDER),background:v.id===currentId?RED_LIGHT:WHITE,color:v.id===currentId?RED:"#666"}}>v{i+1} — {v.timestamp}</button>;})}
</div>
</div>
);
}
// ===== SECTION FEEDBACK =====
function SectionFeedback({label,value,onChange,onRegenerate,loading}){
return(
<div style={{background:SURFACE2,borderRadius:9,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.06)"}}>
<div style={{fontSize:11,fontWeight:700,color:"#888",marginBottom:7}}>{label}</div>
<textarea value={value} onChange={function(e){onChange(e.target.value);}} placeholder="修正指示を入力..." rows={2}
style={{width:"100%",padding:"8px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",fontSize:12,color:"#c0c0c0",outline:"none",fontFamily:"inherit",resize:"none",boxSizing:"border-box"}}/>
<button onClick={onRegenerate} disabled={!value||loading}
style={{marginTop:7,padding:"6px 16px",borderRadius:6,background:value&&!loading?RED:"#2a2a2a",color:value&&!loading?WHITE:"#555",fontWeight:700,fontSize:11,border:"none",cursor:value&&!loading?"pointer":"not-allowed"}}>
{loading?"生成中...":"再生成"}
</button>
</div>
);
}
// ===== OUTPUT VIEWER =====
function OutputViewer({output,form,onSave,saved,onRegenerate,regenLoading}){
var[tab,setTab]=useState("script");
var[copied,setCopied]=useState(false);
var[fb,setFb]=useState({script:"",objection:"",faq:""});
var tabs=[
{id:"script",  label:"📋 トークスクリプト", color:RED},
{id:"objection",label:"🛡️ 切り返しトーク",  color:RED_DARK},
{id:"faq",     label:"❓ FAQ",              color:GOLD},
];
var sectionLabels={script:"受付トーク・担当者トークを修正",objection:"切り返しトークを修正",faq:"FAQを修正"};
function copyAll(){
navigator.clipboard.writeText([output.talkScript,output.objectionHandling,output.faq].join("\n\n"+"=".repeat(50)+"\n\n"));
setCopied(true);setTimeout(function(){setCopied(false);},2000);
}
function downloadWord(){
var content=["【"+(form&&form.serviceName||"テレアポ")+"】トークスクリプト\n","=".repeat(60),
"\n■ トークスクリプト\n",output.talkScript,
"\n\n"+"=".repeat(60),"\n■ 切り返しトーク\n",output.objectionHandling,
"\n\n"+"=".repeat(60),"\n■ FAQ\n",output.faq].join("\n");
var blob=new Blob(["\ufeff"+content],{type:"application/msword;charset=utf-8"});
var a=document.createElement("a");a.href=URL.createObjectURL(blob);
a.download=(form&&form.serviceName||"teleapo")+"_スクリプト.doc";a.click();
}
return(
<div style={{background:BG,borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 8px 40px rgba(0,0,0,0.7)"}}>
<div style={{padding:"14px 16px 0",background:SURFACE}}>
<InputSummary form={form}/>
</div>
<div style={{background:SURFACE,padding:"5px 5px 0",display:"flex",gap:3,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
{tabs.map(function(t){
var active=tab===t.id;
return <button key={t.id} onClick={function(){setTab(t.id);}}
style={{flex:1,padding:"9px 6px",borderRadius:"6px 6px 0 0",border:"none",cursor:"pointer",
background:active?BG:"transparent",color:active?t.color:"#555",
fontWeight:active?800:500,fontSize:12,fontFamily:"inherit",
borderBottom:active?"2px solid "+t.color:"2px solid transparent",transition:"all 0.2s"}}>{t.label}</button>;
})}
<button onClick={copyAll} style={{padding:"6px 11px",margin:"3px 2px",borderRadius:6,
border:"1px solid rgba(255,255,255,0.07)",background:copied?"rgba(245,166,35,0.1)":"transparent",
color:copied?GOLD:"#555",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",alignSelf:"center"}}>
{copied?"✓ コピー済":"📋 全コピー"}
</button>
</div>
<div style={{padding:"16px 14px",minHeight:260,maxHeight:560,overflowY:"auto"}}>
{tab==="script"   &&<ScriptViewer   content={output.talkScript}/>}
{tab==="objection"&&<ObjectionViewer content={output.objectionHandling}/>}
{tab==="faq"      &&<FaqViewer      content={output.faq}/>}
</div>
<div style={{padding:"12px 14px",background:SURFACE,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
<div style={{fontSize:11,fontWeight:700,color:"#666",marginBottom:8}}>🔄 セクション別ブラッシュアップ</div>
<SectionFeedback
label={sectionLabels[tab]}
value={fb[tab]}
onChange={function(v){setFb(function(f){return Object.assign({},f,{[tab]:v});});}}
onRegenerate={function(){onRegenerate(tab,fb[tab]);setFb(function(f){return Object.assign({},f,{[tab]:""});});}}
loading={regenLoading}
/>
</div>
<div style={{padding:"12px 14px",background:SURFACE,borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",gap:8}}>
<button onClick={onSave} style={{flex:1,padding:"10px",borderRadius:8,
background:saved?"rgba(245,166,35,0.12)":RED,color:saved?GOLD:WHITE,fontWeight:800,fontSize:12,
border:saved?"1px solid "+GOLD+"33":"none",cursor:"pointer",
boxShadow:saved?"none":"0 3px 12px rgba(232,0,29,0.28)"}}>
{saved?"✓ 保存済み":"💾 結果を保存"}
</button>
<button onClick={downloadWord} style={{flex:1,padding:"10px",borderRadius:8,
background:"rgba(255,255,255,0.04)",color:"#a0a0a0",fontWeight:700,fontSize:12,
border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer"}}>📄 Wordダウンロード</button>
<button onClick={copyAll} style={{flex:1,padding:"10px",borderRadius:8,
background:copied?"rgba(245,166,35,0.08)":"rgba(255,255,255,0.04)",
color:copied?GOLD:"#a0a0a0",fontWeight:700,fontSize:12,
border:"1px solid "+(copied?GOLD+"22":"rgba(255,255,255,0.08)"),cursor:"pointer"}}>
{copied?"✓ コピー済み":"📋 全文コピー"}
</button>
</div>
</div>
);
}
// ===== MAIN APP =====
export default function CanviTool(){
var[step,setStep]=useState(1);
var[loading,setLoading]=useState(false);
var[regenLoading,setRegenLoading]=useState(false);
var[versions,setVersions]=useState([]);
var[currentId,setCurrentId]=useState(null);
var[output,setOutput]=useState(null);
var[saved,setSaved]=useState(false);
var[overviewMode,setOverviewMode]=useState("text");
var[overviewUploaded,setOverviewUploaded]=useState(false);
var[overviewFileName,setOverviewFileName]=useState("");
var[scriptMode,setScriptMode]=useState("text");
var[scriptUploaded,setScriptUploaded]=useState(false);
var[scriptFileName,setScriptFileName]=useState("");
var[user,setUser]=useState(undefined);
var[page,setPage]=useState("tool");
var[form,setForm]=useState({companyName:"",serviceName:"",serviceOverview:"",serviceUrl:"",talkScript:"",voiceNote:"",callPattern:"",industries:[],employeeRange:[],departments:[],area:"",contactRole:"",goal:"",appealPoints:"",differentiation:"",competitors:"",rcptObjections:"",contactObjections:"",situationNotes:""});
// Progress states
var[genProgress,setGenProgress]=useState({script:0,objection:0,faq:0});
var[genStatus,setGenStatus]=useState({script:"waiting",objection:"waiting",faq:"waiting"});
var[currentMsg,setCurrentMsg]=useState(0);
var messages=[
"The Model型の戦略フレームワークを分析中...",
"受付突破の最適パターンを設計中...",
"担当者トークのHOOK→PAIN→VALUEフローを構築中...",
"切り返しトークを最適化中...",
"よくある質問への完璧な回答を準備中...",
"最終調整とブラッシュアップ中..."
];
useEffect(function(){
var unsub=onAuthStateChanged(auth,function(u){setUser(u||null);});
if(window.location.pathname==="/admin")setPage("admin");
return unsub;
},[]);
if(user===undefined) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:TEXT_MUTED}}>読み込み中...</div>;
if(page==="admin"&&!user) return <AuthPage/>;
if(page==="admin"&&user) return <AdminPage/>;
function set(k,v){setForm(function(f){return Object.assign({},f,{[k]:v});});}
function canNext(){
if(step===1){var ok=overviewMode==="text"?!!form.serviceOverview:overviewUploaded;return !!(form.companyName&&form.serviceName&&ok);}
if(step===2)return !!form.callPattern;
if(step===3)return form.industries.length>0&&!!form.area;
if(step===4)return !!form.appealPoints;
return true;
}
function buildPrompt(type,fb){
var p=CALL_PATTERNS.find(function(x){return x.id===form.callPattern;});
var base="会社名:"+form.companyName+" / サービス名:"+form.serviceName
+"\n概要:"+form.serviceOverview
+"\n架電パターン:"+(p?p.label:"")
+"\n業界:"+form.industries.join("、")+" / エリア:"+form.area
+"\n訴求:"+form.appealPoints
+"\n受付断り:"+(form.rcptObjections||"なし")+" / 担当者断り:"+(form.contactObjections||"なし")
+"\n"+(fb?"修正指示:"+fb:"");
var rules="\n\n【絶対ルール】\n・JSONや```は使わない\n・「**」「---」などのMarkdown装飾は使わない\n・見出しは #（大項目）##（中項目）###（小項目）のみ使用可\n・途中で切れず必ず最後まで出力する\n";

if(type==="script") return "あなたはThe Model型テレアポのトップエキスパートです。\n\n"+base+rules
  +"\n以下の構成でトークスクリプトを作成してください。\n\n"
  +"■ PART1 受付突破（ナチュラル型）\n\n"
  +"## STEP A: 最初の一言\n【あなた】\n「具体的なセリフ」\n💡 ポイント：...\n\n"
  +"## STEP B: 受付パターン別対応\n"
  +"❌ パターン①「受付の言葉」\n【受付】\n「受付のセリフ」\n1. 対応方法\n→ 「セリフ」\n2. 対応方法\n→ 「セリフ」\n"
  +"（3〜5パターン）\n\n"
  +"🏆 ゴールデンルール\n① ...\n② ...\n③ ...\n\n"
  +"■ PART2 担当者トーク\n\n"
  +"## STEP 02 [HOOK] 興味喚起\n【あなた】\n「具体的なセリフ」\n💡 ポイント：...\n\n"
  +"## STEP 03 [PAIN] 課題深掘り\n【あなた】\n「セリフ」\n💡 ポイント：...\n\n"
  +"## STEP 04 [VALUE] 価値訴求\n【あなた】\n「セリフ」\n💡 ポイント：...\n\n"
  +"## STEP 05 [CLOSE] アポ打診\n【あなた】\n「セリフ」\n💡 ポイント：...\n\n"
  +"## STEP 06 [CONFIRM] 確認・締め\n【あなた】\n「セリフ」\n💡 ポイント：...\n\n"
  +"※必ずSTEP 06まで完全に出力すること。途中で終わらないこと。";

if(type==="objection") return "あなたはThe Model型テレアポのトップエキスパートです。\n\n"+base+rules
  +"\n以下の形式で切り返しトークを10個作成してください。受付用5個、担当者用5個。\n\n"
  +"# 受付用 切り返しトーク\n\n"
  +"❌ 「断り文句」\n1. 共感：「セリフ」\n→ 補足\n2. 転換：「セリフ」\n→ 補足\n3. クロージング：「セリフ」\n→ 補足\n\n"
  +"# 担当者用 切り返しトーク\n\n"
  +"❌ 「断り文句」\n1. 共感：「セリフ」\n→ 補足\n2. 転換：「セリフ」\n→ 補足\n3. クロージング：「セリフ」\n→ 補足";

if(type==="faq") return "あなたはThe Model型テレアポのトップエキスパートです。\n\n"+base+rules
  +"\n以下の形式でよくある質問FAQを10個作成してください。\n\n"
  +"Q1. 質問文\nA1. 回答文\n\nQ2. 質問文\nA2. 回答文\n\n（Q10まで）";
}
function generate(fb){
setLoading(true);
setSaved(false);
setGenProgress({script:0,objection:0,faq:0});
setGenStatus({script:"waiting",objection:"waiting",faq:"waiting"});
setCurrentMsg(0);
// Message rotation
var msgInterval=setInterval(function(){
  setCurrentMsg(function(m){return (m+1)%messages.length;});
},5000);

var results={script:"",objection:"",faq:""};
var progressTimers={};

function startProgress(type, estimatedSeconds){
  setGenStatus(function(prev){
    var next=Object.assign({},prev);
    next[type]="processing";
    return next;
  });
  
  // 推定時間に基づいた増分計算（95%まで）
  var totalIncrements = estimatedSeconds / 0.4; // 400msごと
  var baseIncrement = 95 / totalIncrements;
  
  progressTimers[type]=setInterval(function(){
    setGenProgress(function(prev){
      if(prev[type]>=95)return prev;
      var newProg=Object.assign({},prev);
      var randomVariation = Math.random() * 0.5;
      newProg[type]=Math.min(prev[type] + baseIncrement + randomVariation, 95);
      return newProg;
    });
  },400);
}

function completeProgress(type){
  clearInterval(progressTimers[type]);
  setGenProgress(function(prev){
    var next=Object.assign({},prev);
    next[type]=100;
    return next;
  });
  setGenStatus(function(prev){
    var next=Object.assign({},prev);
    next[type]="done";
    return next;
  });
}

// Start all sections with slight delay
setTimeout(function(){ startProgress('script', 25); }, 200);
setTimeout(function(){ startProgress('objection', 20); }, 500);
setTimeout(function(){ startProgress('faq', 15); }, 800);

var calls=["script","objection","faq"].map(function(type){
  return fetch("/api/generate",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-opus-4-5",
      max_tokens:type==="script"?4000:3000,
      messages:[{role:"user",content:buildPrompt(type,fb)}]
    })
  })
  .then(function(res){return res.json();})
  .then(function(data){
    var text="";
    if(data&&data.content&&Array.isArray(data.content)){
      data.content.forEach(function(c){if(c&&c.text)text+=c.text;});
    }
    results[type]=text;
    completeProgress(type);
  })
  .catch(function(err){
    console.error("error for "+type,err);
    results[type]="";
    completeProgress(type);
  });
});

Promise.all(calls).then(function(){
  clearInterval(msgInterval);
  Object.keys(progressTimers).forEach(function(k){clearInterval(progressTimers[k]);});
  
  var parsed={
    talkScript:results.script,
    objectionHandling:results.objection,
    faq:results.faq
  };
  var ver={
    id:Date.now(),
    timestamp:new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}),
    data:parsed
  };
  setVersions(function(v){return v.concat([ver]);});
  setCurrentId(ver.id);
  setOutput(parsed);
  
  // Delay to show completion animation
  setTimeout(function(){setLoading(false);},1500);
}).catch(function(err){
  console.error("Promise.all error",err);
  alert("生成に失敗しました。");
  clearInterval(msgInterval);
  Object.keys(progressTimers).forEach(function(k){clearInterval(progressTimers[k]);});
  setLoading(false);
});
}
function regenerateSection(section,fb){
setRegenLoading(true);
fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({model:"claude-opus-4-5",max_tokens:section==="script"?4000:3000,
messages:[{role:"user",content:buildPrompt(section,fb)}]})})
.then(function(res){return res.json();})
.then(function(data){
var text=data.content?data.content.map(function(c){return c.text||"";}).join(""):"";
setOutput(function(o){
var n=Object.assign({},o);
if(section==="script")n.talkScript=text;
if(section==="objection")n.objectionHandling=text;
if(section==="faq")n.faq=text;
return n;
});
setSaved(false);setRegenLoading(false);
}).catch(function(){setRegenLoading(false);});
}
function saveResult(){
if(!output||!user)return;
addDoc(collection(db,"generations"),{uid:user.uid,email:user.email,companyName:form.companyName,serviceName:form.serviceName,callPattern:form.callPattern,output:output,createdAt:serverTimestamp()})
.then(function(){setSaved(true);}).catch(function(err){
console.error("Save error:",err);
alert("保存に失敗しました: "+err.message);
});
}
function resetToTop(){
setStep(1);setOutput(null);setVersions([]);setCurrentId(null);setSaved(false);
setForm({companyName:"",serviceName:"",serviceOverview:"",serviceUrl:"",talkScript:"",voiceNote:"",callPattern:"",industries:[],employeeRange:[],departments:[],area:"",contactRole:"",goal:"",appealPoints:"",differentiation:"",competitors:"",rcptObjections:"",contactObjections:"",situationNotes:""});
}
return(
<div style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif",paddingBottom:80}}>
{/* HEADER - ここを修正 */}
<div style={{background:DARK,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)",position:"sticky",top:0,zIndex:100}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div>
<div>
<div style={{color:WHITE,fontWeight:900,fontSize:17,letterSpacing:"0.05em",lineHeight:1}}>テレアポの達人</div>
<div style={{color:GOLD,fontSize:9,fontWeight:700,letterSpacing:"0.1em",marginTop:1}}>AI SCRIPT GENERATOR</div>
</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:12}}>
{user?<>
<span style={{color:"#aaa",fontSize:11}}>{user.email}</span>
<a href="/admin" style={{padding:"6px 14px",borderRadius:8,background:RED,color:WHITE,fontSize:11,fontWeight:700,textDecoration:"none"}}>📊 管理画面</a>
<button onClick={function(){signOut(auth);}} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:11,fontWeight:700,cursor:"pointer"}}>ログアウト</button>
</>:<a href="/admin" style={{padding:"6px 14px",borderRadius:8,background:"transparent",border:"1px solid #444",color:"#ccc",fontSize:11,fontWeight:700,textDecoration:"none"}}>管理画面</a>}
<div style={{color:"#555",fontSize:11,fontWeight:600}}>by 株式会社Canvi</div>
</div>
</div>
  <div style={{background:"linear-gradient(135deg,"+DARK+" 0%,#1a0005 50%,"+DARK+" 100%)",padding:"24px 40px",borderBottom:"3px solid "+RED}}>
    <div style={{maxWidth:860,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:RED,letterSpacing:"0.15em",marginBottom:4}}>🔥 AI POWERED TELEAPO TOOL</div>
        <div style={{fontSize:22,fontWeight:900,color:WHITE,lineHeight:1.3}}>最強のトークスクリプトを、<span style={{color:GOLD}}>AIが瞬時に設計する。</span></div>
      </div>
      <div style={{display:"flex",gap:12,color:"#555",fontSize:11,fontWeight:600}}>
        <span>STEP 1-6で簡単入力</span><span style={{color:RED}}>→</span><span>AIが自動生成</span><span style={{color:RED}}>→</span><span>即使えるスクリプト</span>
      </div>
    </div>
  </div>

  <div style={{maxWidth:860,margin:"0 auto",padding:"36px 24px 0"}}>
    <StepIndicator current={step}/>

    {step===1&&(<Card><H sub="クライアントのサービス情報を入力してください">📦 サービス基本情報</H>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
        <div><Lbl req={true}>クライアント会社名</Lbl><Inp value={form.companyName} onChange={function(v){set("companyName",v);}} placeholder="例：株式会社〇〇"/></div>
        <div><Lbl req={true}>サービス名</Lbl><Inp value={form.serviceName} onChange={function(v){set("serviceName",v);}} placeholder="例：〇〇クラウド"/></div>
      </div>
      <div style={{marginBottom:24}}><Lbl req={true}>サービス概要</Lbl><ToggleInput mode={overviewMode} setMode={setOverviewMode} textValue={form.serviceOverview} onTextChange={function(v){set("serviceOverview",v);}} textPlaceholder="サービスの特徴・解決できる課題・実績などを入力" onPdfText={function(t){set("serviceOverview",t);}} uploaded={overviewUploaded} setUploaded={setOverviewUploaded} fileName={overviewFileName} setFileName={setOverviewFileName}/></div>
      <div style={{marginBottom:24}}><Lbl>サービスURL（任意）</Lbl><Inp value={form.serviceUrl} onChange={function(v){set("serviceUrl",v);}} placeholder="https://..."/></div>
      <div style={{marginBottom:24}}><Lbl>既存トークスクリプト（任意）</Lbl><ToggleInput mode={scriptMode} setMode={setScriptMode} textValue={form.talkScript} onTextChange={function(v){set("talkScript",v);}} textPlaceholder="既存スクリプトがあれば貼り付けてください" onPdfText={function(t){set("talkScript",t);}} uploaded={scriptUploaded} setUploaded={setScriptUploaded} fileName={scriptFileName} setFileName={setScriptFileName}/></div>
      <div><Lbl>音声データの文字起こし（任意）</Lbl><Inp value={form.voiceNote} onChange={function(v){set("voiceNote",v);}} placeholder="音声データを文字起こしして貼り付けてください" multi={true} rows={3}/></div>
    </Card>)}

    {step===2&&(<Card><H sub="架電の目的・状況に合ったパターンを選んでください">📞 架電パターン選択</H>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {CALL_PATTERNS.map(function(p){return(
          <button key={p.id} onClick={function(){set("callPattern",p.id);}} style={{padding:"18px 22px",borderRadius:12,border:"2px solid "+(form.callPattern===p.id?RED:BORDER),background:form.callPattern===p.id?RED_LIGHT:WHITE,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16,boxShadow:form.callPattern===p.id?"0 4px 16px rgba(232,0,29,0.15)":"none"}}>
            <span style={{fontSize:30}}>{p.icon}</span>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:15,color:form.callPattern===p.id?RED:TEXT}}>{p.label}</div><div style={{fontSize:12,color:TEXT_MUTED,marginTop:3}}>{p.desc}</div></div>
            {form.callPattern===p.id&&<div style={{width:28,height:28,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:900,fontSize:14}}>✓</div>}
          </button>
        );})}
      </div>
    </Card>)}

    {step===3&&(<Card><H sub="架電するターゲットの条件を設定してください">🎯 ターゲット設定</H>
      <div style={{marginBottom:24}}><Lbl req={true}>業界（複数選択可）</Lbl><MultiSelect options={INDUSTRIES} selected={form.industries} onChange={function(v){set("industries",v);}} cols={4}/></div>
      <div style={{marginBottom:24}}><Lbl>従業員数（複数選択可）</Lbl><MultiSelect options={EMPLOYEE_RANGES} selected={form.employeeRange} onChange={function(v){set("employeeRange",v);}} cols={4}/></div>
      <div style={{marginBottom:24}}><Lbl>担当部署（複数選択可）</Lbl><MultiSelect options={DEPARTMENTS} selected={form.departments} onChange={function(v){set("departments",v);}} cols={4}/></div>
      <div style={{marginBottom:24}}><Lbl req={true}>エリア</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{AREA_OPTIONS.map(function(a){return <button key={a} onClick={function(){set("area",a);}} style={{padding:"9px 18px",borderRadius:20,border:"2px solid "+(form.area===a?RED:BORDER),background:form.area===a?RED_LIGHT:WHITE,color:form.area===a?RED:TEXT,fontSize:13,fontWeight:form.area===a?700:400,cursor:"pointer"}}>{form.area===a&&"✓ "}{a}</button>;})}</div></div>
      <div><Lbl>担当者役職（任意）</Lbl><Inp value={form.contactRole} onChange={function(v){set("contactRole",v);}} placeholder="例：部長クラス、IT担当者、経営者"/></div>
    </Card>)}

    {step===4&&(<Card><H sub="勝てる営業戦略の核心を入力してください">⚡ 営業戦略</H>
      <div style={{marginBottom:20}}><Lbl>架電目標・KPI</Lbl><Inp value={form.goal} onChange={function(v){set("goal",v);}} placeholder="例：1時間のオンライン商談アポ獲得"/></div>
      <div style={{marginBottom:20}}><Lbl req={true}>主な訴求ポイント・強み</Lbl><Inp value={form.appealPoints} onChange={function(v){set("appealPoints",v);}} placeholder="例：導入実績500社、コスト30%削減、初月無料トライアル可能" multi={true} rows={4}/></div>
      <div style={{marginBottom:20}}><Lbl>競合との差別化ポイント</Lbl><Inp value={form.differentiation} onChange={function(v){set("differentiation",v);}} placeholder="例：API連携が業界最多、24時間サポート" multi={true} rows={3}/></div>
      <div><Lbl>主な競合（任意）</Lbl><Inp value={form.competitors} onChange={function(v){set("competitors",v);}} placeholder="例：Salesforce、HubSpot、kintone"/></div>
    </Card>)}

    {step===5&&(<Card><H sub="よくある断り文句を入力すると切り返しトークの精度が上がります">🛡️ 断り文句・想定状況</H>
      <div style={{background:"#fff8ed",border:"1px solid #f5a62344",borderRadius:10,padding:"12px 16px",marginBottom:24,fontSize:13,color:"#92400e",fontWeight:600}}>💡 受付突破トークと担当者トーク、それぞれの切り返しを生成します。</div>
      <div style={{marginBottom:24}}><Lbl>受付での断り文句</Lbl><Inp value={form.rcptObjections} onChange={function(v){set("rcptObjections",v);}} placeholder='例：「担当者不在」「折り返し不可」「資料送って」' multi={true} rows={4}/></div>
      <div style={{marginBottom:24}}><Lbl>担当者からの断り文句</Lbl><Inp value={form.contactObjections} onChange={function(v){set("contactObjections",v);}} placeholder='例：「予算がない」「他社使ってる」「忙しい」' multi={true} rows={4}/></div>
      <div><Lbl>その他・特記事項</Lbl><Inp value={form.situationNotes} onChange={function(v){set("situationNotes",v);}} placeholder="例：競合が強い業界、規制がある" multi={true} rows={3}/></div>
    </Card>)}

    {step===6&&(<div>
      {!output&&!loading&&(
        <Card>
          <H sub="入力内容をもとにAIがトーク素材を設計します">✨ 生成準備完了</H>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
            {[["📋 PART1","受付突破トーク（パターン別+ゴールデンルール）"],["📋 PART2","担当者トーク（HOOK→PAIN→VALUE→CLOSE→CONFIRM）"],["🛡️ PART3","切り返しトーク10選（受付5個+担当者5個）"],["❓ PART4","FAQ 10選"]].map(function(item,i){
              return <div key={i} style={{background:GRAY_LIGHT,borderRadius:10,padding:"14px 16px",border:"1px solid "+BORDER}}><div style={{fontWeight:800,fontSize:13,color:DARK,marginBottom:4}}>{item[0]}</div><div style={{fontSize:12,color:TEXT_MUTED}}>{item[1]}</div></div>;
            })}
          </div>
          <button onClick={function(){generate();}} style={{width:"100%",padding:"18px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:900,fontSize:17,border:"none",cursor:"pointer",boxShadow:"0 6px 24px rgba(232,0,29,0.35)",letterSpacing:"0.05em"}}>
            🚀 トーク素材を生成する
          </button>
        </Card>
      )}
      {loading&&(
        <GeneratingProgress progress={genProgress} status={genStatus} messages={messages} currentMsg={currentMsg}/>
      )}
      {output&&!loading&&(
        <div>
          <VersionHistory versions={versions} currentId={currentId} onRestore={function(v){setOutput(v.data);setCurrentId(v.id);setSaved(false);}}/>
          <OutputViewer output={output} form={form} onSave={saveResult} saved={saved} onRegenerate={regenerateSection} regenLoading={regenLoading}/>
          <div style={{marginTop:14,textAlign:"center"}}>
            <button onClick={resetToTop} style={{padding:"11px 28px",borderRadius:10,border:"2px solid "+BORDER,background:WHITE,color:TEXT_MUTED,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              🔄 全キャンして最初に戻る
            </button>
          </div>
        </div>
      )}
    </div>)}

    <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
      {step>1&&!(step===6&&output)&&(
        <button onClick={function(){setStep(function(s){return s-1;});}} style={{padding:"13px 30px",borderRadius:10,border:"2px solid "+BORDER,background:WHITE,color:TEXT,fontWeight:700,fontSize:14,cursor:"pointer"}}>← 戻る</button>
      )}
      {step<6&&(
        <button onClick={function(){setStep(function(s){return s+1;});}} disabled={!canNext()} style={{padding:"13px 36px",borderRadius:10,border:"none",background:canNext()?"linear-gradient(135deg,"+RED+","+RED_DARK+")":"#ddd",color:WHITE,fontWeight:800,fontSize:14,cursor:canNext()?"pointer":"not-allowed",marginLeft:"auto",boxShadow:canNext()?"0 4px 16px rgba(232,0,29,0.25)":"none"}}>
          次へ →
        </button>
      )}
    </div>
  </div>
</div>
  );
}
