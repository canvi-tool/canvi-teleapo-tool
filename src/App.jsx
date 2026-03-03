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

function ScriptViewer({content}){
  var[open,setOpen]=useState({});
  if(!content)return <div style={{color:"#aaa",fontSize:13,padding:20,textAlign:"center"}}>データがありません</div>;
  var blocks=content.split(/\n(?=(?:■|STEP|🏆))/).filter(function(b){return b.trim();});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {blocks.map(function(block,i){
        var lines=block.split("\n").filter(function(l){return l.trim();});
        var title=lines[0]||"";
        var isPart1=/PART1|受付|STEP\s*A|STEP\s*B/.test(title);
        var isGolden=/🏆/.test(title);
        var accent=isGolden?GOLD:isPart1?"#2563eb":RED;
        var isOpen=open[i]!==false;
        return(
          <div key={i} style={{borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid "+accent+"33"}}>
            <button onClick={function(){setOpen(function(o){var n=Object.assign({},o);n[i]=!isOpen;return n;});}} style={{width:"100%",background:"linear-gradient(135deg,"+accent+","+accent+"cc)",padding:"14px 20px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <span style={{fontWeight:800,fontSize:13,color:WHITE,textAlign:"left"}}>{title}</span>
              <span style={{color:WHITE,fontSize:12,opacity:0.8,flexShrink:0}}>{isOpen?"▲":"▼"}</span>
            </button>
            {isOpen&&<div style={{background:WHITE,padding:"16px 20px",display:"flex",flexDirection:"column",gap:8}}>
              {lines.slice(1).map(function(line,j){
                if(/💡|ポイント/.test(line))return <div key={j} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#92400e",lineHeight:1.8}}>{line}</div>;
                if(line.startsWith("「")&&line.endsWith("」"))return <div key={j} style={{background:"#1a1a2e",borderLeft:"4px solid "+accent,borderRadius:"0 10px 10px 0",padding:"12px 16px",fontSize:13,color:"#e2e8f0",lineHeight:1.8}}>{line}</div>;
                if(line.includes("→"))return <div key={j} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#166534",lineHeight:1.8}}>{line}</div>;
                if(/^\s*[①-⑩]|^\s*\d+[\.\)]|^[-・]/.test(line))return <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"4px 0"}}><span style={{color:accent,fontWeight:700,flexShrink:0}}>▶</span><span style={{fontSize:13,color:TEXT,lineHeight:1.8}}>{line.replace(/^[-・①-⑩\d\.\)]\s*/,"")}</span></div>;
                if(/❌/.test(line))return <div key={j} style={{background:"#fff0f2",border:"2px solid "+RED+"44",borderRadius:10,padding:"10px 14px",fontSize:13,color:RED,fontWeight:700,lineHeight:1.8}}>{line}</div>;
                if(/✅|※/.test(line))return <div key={j} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#1e40af",lineHeight:1.8}}>{line}</div>;
                return <div key={j} style={{fontSize:13,color:TEXT,lineHeight:1.9,padding:"2px 0"}}>{line}</div>;
              })}
            </div>}
          </div>
        );
      })}
    </div>
  );
}

function ObjectionViewer({content}){
  var[open,setOpen]=useState({});
  if(!content)return <div style={{color:"#aaa",fontSize:13,padding:20,textAlign:"center"}}>データがありません</div>;
  var blocks=content.split(/\n(?=❌)/).filter(function(b){return b.trim();});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {blocks.map(function(block,i){
        var lines=block.split("\n").filter(function(l){return l.trim();});
        var headline=lines[0].replace("❌","").trim();
        var isOpen=open[i]!==false;
        return(
          <div key={i} style={{borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",border:"1px solid #fee2e2"}}>
            <button onClick={function(){setOpen(function(o){var n=Object.assign({},o);n[i]=!isOpen;return n;});}} style={{width:"100%",background:"linear-gradient(135deg,#dc2626,#b91c1c)",padding:"14px 20px",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>❌</span>
              <span style={{fontWeight:800,fontSize:13,color:WHITE,flex:1,textAlign:"left"}}>{headline}</span>
              <span style={{color:WHITE,fontSize:12,opacity:0.8}}>{isOpen?"▲":"▼"}</span>
            </button>
            {isOpen&&<div style={{background:WHITE,padding:"16px 20px",display:"flex",flexDirection:"column",gap:8}}>
              {lines.slice(1).map(function(line,j){
                if(/^1\.|^1．|^①/.test(line))return <div key={j} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#1e40af",fontWeight:700,lineHeight:1.8}}>{line}</div>;
                if(/^2\.|^2．|^②/.test(line))return <div key={j} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#92400e",fontWeight:700,lineHeight:1.8}}>{line}</div>;
                if(/^3\.|^3．|^③/.test(line))return <div key={j} style={{background:"#fff0f2",border:"1px solid "+RED+"44",borderRadius:10,padding:"10px 14px",fontSize:13,color:RED,fontWeight:700,lineHeight:1.8}}>{line}</div>;
                if(line.startsWith("「"))return <div key={j} style={{background:"#1a1a2e",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#e2e8f0",lineHeight:1.8,fontStyle:"italic"}}>{line}</div>;
                if(line.includes("→"))return <div key={j} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#166534",lineHeight:1.8}}>{line}</div>;
                return <div key={j} style={{fontSize:13,color:"#555",lineHeight:1.8}}>{line}</div>;
              })}
            </div>}
          </div>
        );
      })}
    </div>
  );
}

function FaqViewer({content}){
  var[open,setOpen]=useState(null);
  if(!content)return <div style={{color:"#aaa",fontSize:13,padding:20,textAlign:"center"}}>データがありません</div>;
  var pairs=[];var cur=null;
  content.split("\n").forEach(function(line){
    var t=line.trim();if(!t)return;
    if(/^Q[\d\.\s：]+/.test(t)||t.startsWith("Q.")){if(cur)pairs.push(cur);cur={q:t.replace(/^Q[\d\.\s：]+/,"").trim(),a:[]};}
    else if(/^A[\d\.\s：]+/.test(t)||t.startsWith("A.")){if(cur)cur.a.push(t.replace(/^A[\d\.\s：]+/,"").trim());}
    else if(cur)cur.a.push(t);
  });
  if(cur)pairs.push(cur);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {pairs.map(function(p,i){
        return(
          <div key={i} style={{borderRadius:14,border:"1.5px solid "+(open===i?RED:BORDER),overflow:"hidden",boxShadow:open===i?"0 4px 16px rgba(232,0,29,0.1)":"0 1px 4px rgba(0,0,0,0.04)"}}>
            <button onClick={function(){setOpen(open===i?null:i);}} style={{width:"100%",background:open===i?"linear-gradient(135deg,"+DARK+",#1a0005)":WHITE,padding:"14px 20px",border:"none",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:14,textAlign:"left"}}>
              <span style={{minWidth:28,height:28,borderRadius:"50%",background:open===i?RED:GRAY_LIGHT,color:open===i?WHITE:RED,fontSize:12,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,border:"2px solid "+(open===i?RED:BORDER)}}>Q</span>
              <span style={{fontSize:13,fontWeight:700,color:open===i?WHITE:TEXT,flex:1,lineHeight:1.7}}>{p.q}</span>
              <span style={{color:open===i?GOLD:RED,fontSize:14,fontWeight:700,flexShrink:0}}>{open===i?"▲":"▼"}</span>
            </button>
            {open===i&&<div style={{padding:"16px 20px 16px 62px",background:"#fafafa",fontSize:13,color:"#374151",lineHeight:1.9,borderTop:"2px solid "+RED_LIGHT,whiteSpace:"pre-wrap"}}>{p.a.join("\n")}</div>}
          </div>
        );
      })}
    </div>
  );
}

function VersionHistory({versions,currentId,onRestore}){
  if(!versions.length)return null;
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:700,color:TEXT_MUTED,marginBottom:8}}>📁 バージョン履歴</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {versions.map(function(v,i){return <button key={v.id} onClick={function(){onRestore(v);}} style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",border:"2px solid "+(v.id===currentId?RED:BORDER),background:v.id===currentId?RED_LIGHT:WHITE,color:v.id===currentId?RED:"#666"}}>v{i+1} — {v.timestamp}</button>;})}
      </div>
    </div>
  );
}

function OutputViewer({output,form}){
  var[tab,setTab]=useState("script");
  var[copied,setCopied]=useState(false);
  var tabs=[{id:"script",label:"📝 トークスクリプト"},{id:"objection",label:"🛡️ 切り返しトーク"},{id:"faq",label:"❓ FAQ"}];
  function copyAll(){navigator.clipboard.writeText([output.talkScript,output.objectionHandling,output.faq].join("\n\n"+"=".repeat(50)+"\n\n"));setCopied(true);setTimeout(function(){setCopied(false);},2000);}
  function downloadWord(){
    var content=[
      "【"+(form&&form.serviceName||"テレアポ")+"】トークスクリプト\n",
      "=".repeat(60),
      "\n■ トークスクリプト\n",
      output.talkScript,
      "\n\n"+"=".repeat(60),
      "\n■ 切り返しトーク\n",
      output.objectionHandling,
      "\n\n"+"=".repeat(60),
      "\n■ FAQ\n",
      output.faq
    ].join("\n");
    var blob=new Blob(["\ufeff"+content],{type:"application/msword;charset=utf-8"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=(form&&form.serviceName||"teleapo")+"_スクリプト.doc";
    a.click();
  }
  return(
    <div style={{background:WHITE,borderRadius:16,border:"1px solid "+BORDER,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
      <div style={{display:"flex",borderBottom:"2px solid "+GRAY_LIGHT,background:WHITE,padding:"0 20px"}}>
        {tabs.map(function(t){return <button key={t.id} onClick={function(){setTab(t.id);}} style={{padding:"14px 16px",border:"none",cursor:"pointer",background:"transparent",fontWeight:tab===t.id?800:500,fontSize:13,color:tab===t.id?RED:"#888",borderBottom:tab===t.id?"3px solid "+RED:"3px solid transparent",marginBottom:-2,whiteSpace:"nowrap"}}>{t.label}</button>;})}
        <button onClick={copyAll} style={{marginLeft:"auto",padding:"6px 16px",borderRadius:8,border:"2px solid "+(copied?"#22c55e":BORDER),background:copied?"#f0fdf4":WHITE,color:copied?"#22c55e":TEXT_MUTED,fontSize:11,fontWeight:700,cursor:"pointer",alignSelf:"center"}}>{copied?"✓ コピー済み":"📋 全コピー"}</button>
      </div>
      <div style={{padding:"24px 20px",background:GRAY_LIGHT,minHeight:300,maxHeight:620,overflowY:"auto"}}>
        {tab==="script"&&<ScriptViewer content={output.talkScript}/>}
        {tab==="objection"&&<ObjectionViewer content={output.objectionHandling}/>}
        {tab==="faq"&&<FaqViewer content={output.faq}/>}
      </div>
      <div style={{padding:"16px 20px",borderTop:"2px solid "+GRAY_LIGHT,display:"flex",gap:10}}>
        <button onClick={downloadWord} style={{flex:1,padding:"12px",borderRadius:10,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:WHITE,fontWeight:800,fontSize:13,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(37,99,235,0.25)"}}>📄 Wordでダウンロード</button>
        <button onClick={copyAll} style={{flex:1,padding:"12px",borderRadius:10,background:copied?"#f0fdf4":GRAY_LIGHT,color:copied?"#22c55e":TEXT,fontWeight:800,fontSize:13,border:"2px solid "+(copied?"#22c55e":BORDER),cursor:"pointer"}}>{copied?"✓ コピー済み":"📋 全文コピー"}</button>
      </div>
    </div>
  );
}

export default function CanviTool(){
  var[step,setStep]=useState(1);
  var[loading,setLoading]=useState(false);
  var[versions,setVersions]=useState([]);
  var[currentId,setCurrentId]=useState(null);
  var[feedback,setFeedback]=useState("");
  var[output,setOutput]=useState(null);
  var[overviewMode,setOverviewMode]=useState("text");
  var[overviewUploaded,setOverviewUploaded]=useState(false);
  var[overviewFileName,setOverviewFileName]=useState("");
  var[scriptMode,setScriptMode]=useState("text");
  var[scriptUploaded,setScriptUploaded]=useState(false);
  var[scriptFileName,setScriptFileName]=useState("");
  var[user,setUser]=useState(undefined);
  var[page,setPage]=useState("tool");
  var[form,setForm]=useState({companyName:"",serviceName:"",serviceOverview:"",serviceUrl:"",talkScript:"",voiceNote:"",callPattern:"",industries:[],employeeRange:[],departments:[],area:"",contactRole:"",goal:"",appealPoints:"",differentiation:"",competitors:"",rcptObjections:"",contactObjections:"",situationNotes:""});

  useEffect(function(){
    var unsub=onAuthStateChanged(auth,function(u){setUser(u||null);});
    var path=window.location.pathname;
    if(path==="/admin")setPage("admin");
    return unsub;
  },[]);

  if(user===undefined)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",color:TEXT_MUTED}}>読み込み中...</div>;
  if(page==="admin"&&!user)return <AuthPage/>;
  if(page==="admin"&&user)return <AdminPage/>;

  function set(k,v){setForm(function(f){return Object.assign({},f,{[k]:v});});}

  function canNext(){
    if(step===1){var overviewOk=overviewMode==="text"?!!form.serviceOverview:overviewUploaded;return !!(form.companyName&&form.serviceName&&overviewOk);}
    if(step===2)return !!form.callPattern;
    if(step===3)return form.industries.length>0&&!!form.area;
    if(step===4)return !!form.appealPoints;
    return true;
  }

  function buildPrompt(fb){
    var p=CALL_PATTERNS.find(function(x){return x.id===form.callPattern;});
    return "あなたはThe Model型テレアポのトップエキスパートです。以下の情報をもとにアポインターが実際に使えるトーク素材を作成してください。\n\n会社名:"+form.companyName+" / サービス名:"+form.serviceName+"\n概要:"+form.serviceOverview+"\nURL:"+(form.serviceUrl||"なし")+" / 既存スクリプト参考:"+(form.talkScript||"なし")+"\n架電パターン:"+(p?p.label:"")+"("+(p?p.desc:"")+")"+"\n業界:"+form.industries.join("、")+" / 従業員数:"+(form.employeeRange.join("、")||"指定なし")+"\n担当部署:"+(form.departments.join("、")||"指定なし")+" / エリア:"+form.area+" / 役職:"+(form.contactRole||"指定なし")+"\n目標:"+(form.goal||"アポイント獲得")+" / 訴求:"+form.appealPoints+"\n差別化:"+(form.differentiation||"なし")+" / 競合:"+(form.competitors||"なし")+"\n受付断り:"+(form.rcptObjections||"なし")+" / 担当者断り:"+(form.contactObjections||"なし")+"\nその他:"+(form.situationNotes||"なし")+"\n"+(fb?"修正指示:"+fb:"")+"\n\n【重要】出力はJSON形式のみ。Markdownのコードブロック(```)は絶対に使わない。前置き・後書き不要。文字列内の改行は\\nで表現すること。\n\ntalkScript構成:\n■ PART1 受付突破（ナチュラル型）\nSTEP A: 最初の一言（具体セリフ＋💡ポイント）\nSTEP B: 受付の返答パターン別3〜5パターン（各:❌パターン名→具体セリフ→💡ポイント）\n🏆 ゴールデンルール（箇条書き）\n■ PART2 担当者トーク\nSTEP 02 [HOOK] / STEP 03 [PAIN] / STEP 04 [VALUE] / STEP 05 [CLOSE] / STEP 06 [CONFIRM]（各STEP: 具体的セリフ＋💡ポイント）\n\nobjectionHandling構成:受付用5個＋担当者用5個、計10個。各: ❌「断り文句」の見出し＋1.共感→セリフ 2.転換→セリフ 3.クロージング→セリフ\n\nfaq構成: Q1〜Q10の10個\n\n必ず以下の形式で出力:{\"talkScript\":\"...\",\"objectionHandling\":\"...\",\"faq\":\"...\"}";
  }

  function generate(fb){
    setLoading(true);
    fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-opus-4-5",max_tokens:4000,messages:[{role:"user",content:buildPrompt(fb)}]})})
    .then(function(res){return res.json();}).then(function(data){
      var text=data.content?data.content.map(function(c){return c.text||"";}).join(""):"";
      var parsed;
      try{
        var clean=text.replace(/^```json\s*/,"").replace(/^```\s*/,"").replace(/```\s*$/,"").trim();
        parsed=JSON.parse(clean);
      }catch(e){
        try{
          var start=text.indexOf("{");
          var end=text.lastIndexOf("}");
          if(start!==-1&&end!==-1){parsed=JSON.parse(text.slice(start,end+1));}
          else{throw new Error("no json");}
        }catch(e2){
          parsed={talkScript:text,objectionHandling:"",faq:""};
        }
      }
      var ver={id:Date.now(),timestamp:new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}),data:parsed};
      setVersions(function(v){return [...v,ver];});
      setCurrentId(ver.id);setOutput(parsed);setFeedback("");setLoading(false);
      if(user){
        addDoc(collection(db,"generations"),{uid:user.uid,email:user.email,companyName:form.companyName,serviceName:form.serviceName,callPattern:form.callPattern,output:parsed,createdAt:serverTimestamp()}).catch(function(){});
      }
    }).catch(function(){alert("生成に失敗しました。APIキーを確認してください。");setLoading(false);});
  }

  function downloadTxt(){
    if(!output)return;
    var a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([[output.talkScript,output.objectionHandling,output.faq].join("\n\n"+"=".repeat(60)+"\n\n")],{type:"text/plain;charset=utf-8"}));
    a.download=(form.serviceName||"teleapo")+"_スクリプト_v"+versions.length+".txt";
    a.click();
  }

  return(
    <div style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif",paddingBottom:80}}>
      <div style={{background:DARK,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div>
          <div>
            <div style={{color:WHITE,fontWeight:900,fontSize:17,letterSpacing:"0.05em",lineHeight:1}}>テレアポの達人</div>
            <div style={{color:GOLD,fontSize:9,fontWeight:700,letterSpacing:"0.1em",marginTop:1}}>AI SCRIPT GENERATOR</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {user?<><span style={{color:"#aaa",fontSize:11}}>{user.email}</span><button onClick={function(){signOut(auth);}} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:11,fontWeight:700,cursor:"pointer"}}>ログアウト</button></>:<a href="/admin" style={{padding:"6px 14px",borderRadius:8,background:"transparent",border:"1px solid #444",color:"#ccc",fontSize:11,fontWeight:700,textDecoration:"none"}}>管理画面</a>}
          <div style={{color:"#555",fontSize:11,fontWeight:600}}>by 株式会社Canvi</div>
        </div>
      </div>

      <div style={{background:"linear-gradient(135deg,"+DARK+" 0%,#1a0005 50%,"+DARK+" 100%)",padding:"24px 40px",borderBottom:"3px solid "+RED}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:RED,letterSpacing:"0.15em",marginBottom:4}}>🔥 AI POWERED TELEAPO TOOL</div>
            <div style={{fontSize:22,fontWeight:900,color:WHITE,lineHeight:1.3}}>最強のトークスクリプトを、<span style={{color:GOLD}}>AIが瞬時に設計する。</span></div>
          </div>
          <div style={{display:"flex",gap:12,color:"#666",fontSize:11,fontWeight:600}}>
            <span>STEP 1-6で簡単入力</span><span style={{color:RED}}>→</span><span>AIが自動生成</span><span style={{color:RED}}>→</span><span>即使えるスクリプト</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"36px 24px 0"}}>
        <StepIndicator current={step}/>

        {step===1&&(<Card><H sub="クライアントのサービス情報を入力してください">📦 サービス基本情報</H><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}><div><Lbl req={true}>クライアント会社名</Lbl><Inp value={form.companyName} onChange={function(v){set("companyName",v);}} placeholder="例：株式会社〇〇"/></div><div><Lbl req={true}>サービス名</Lbl><Inp value={form.serviceName} onChange={function(v){set("serviceName",v);}} placeholder="例：〇〇クラウド"/></div></div><div style={{marginBottom:24}}><Lbl req={true}>サービス概要</Lbl><ToggleInput mode={overviewMode} setMode={setOverviewMode} textValue={form.serviceOverview} onTextChange={function(v){set("serviceOverview",v);}} textPlaceholder="サービスの特徴・解決できる課題・実績などを入力" onPdfText={function(t){set("serviceOverview",t);}} uploaded={overviewUploaded} setUploaded={setOverviewUploaded} fileName={overviewFileName} setFileName={setOverviewFileName}/></div><div style={{marginBottom:24}}><Lbl>サービスURL（任意）</Lbl><Inp value={form.serviceUrl} onChange={function(v){set("serviceUrl",v);}} placeholder="https://..."/></div><div style={{marginBottom:24}}><Lbl>既存トークスクリプト（任意）</Lbl><ToggleInput mode={scriptMode} setMode={setScriptMode} textValue={form.talkScript} onTextChange={function(v){set("talkScript",v);}} textPlaceholder="既存スクリプトがあれば貼り付けてください" onPdfText={function(t){set("talkScript",t);}} uploaded={scriptUploaded} setUploaded={setScriptUploaded} fileName={scriptFileName} setFileName={setScriptFileName}/></div><div><Lbl>音声データの文字起こし（任意）</Lbl><Inp value={form.voiceNote} onChange={function(v){set("voiceNote",v);}} placeholder="音声データを文字起こしして貼り付けてください" multi={true} rows={3}/></div></Card>)}

        {step===2&&(<Card><H sub="架電の目的・状況に合ったパターンを選んでください">📞 架電パターン選択</H><div style={{display:"flex",flexDirection:"column",gap:12}}>{CALL_PATTERNS.map(function(p){return(<button key={p.id} onClick={function(){set("callPattern",p.id);}} style={{padding:"18px 22px",borderRadius:12,border:"2px solid "+(form.callPattern===p.id?RED:BORDER),background:form.callPattern===p.id?RED_LIGHT:WHITE,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16,boxShadow:form.callPattern===p.id?"0 4px 16px rgba(232,0,29,0.15)":"none"}}><span style={{fontSize:30}}>{p.icon}</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:15,color:form.callPattern===p.id?RED:TEXT}}>{p.label}</div><div style={{fontSize:12,color:TEXT_MUTED,marginTop:3}}>{p.desc}</div></div>{form.callPattern===p.id&&<div style={{width:28,height:28,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:900,fontSize:14}}>✓</div>}</button>);})}</div></Card>)}

        {step===3&&(<Card><H sub="架電するターゲットの条件を設定してください">🎯 ターゲット設定</H><div style={{marginBottom:24}}><Lbl req={true}>業界（複数選択可）</Lbl><MultiSelect options={INDUSTRIES} selected={form.industries} onChange={function(v){set("industries",v);}} cols={4}/></div><div style={{marginBottom:24}}><Lbl>従業員数（複数選択可）</Lbl><MultiSelect options={EMPLOYEE_RANGES} selected={form.employeeRange} onChange={function(v){set("employeeRange",v);}} cols={4}/></div><div style={{marginBottom:24}}><Lbl>担当部署（複数選択可）</Lbl><MultiSelect options={DEPARTMENTS} selected={form.departments} onChange={function(v){set("departments",v);}} cols={4}/></div><div style={{marginBottom:24}}><Lbl req={true}>エリア</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{AREA_OPTIONS.map(function(a){return <button key={a} onClick={function(){set("area",a);}} style={{padding:"9px 18px",borderRadius:20,border:"2px solid "+(form.area===a?RED:BORDER),background:form.area===a?RED_LIGHT:WHITE,color:form.area===a?RED:TEXT,fontSize:13,fontWeight:form.area===a?700:400,cursor:"pointer"}}>{form.area===a&&"✓ "}{a}</button>;})}</div></div><div><Lbl>担当者役職（任意）</Lbl><Inp value={form.contactRole} onChange={function(v){set("contactRole",v);}} placeholder="例：部長クラス、IT担当者、経営者"/></div></Card>)}

        {step===4&&(<Card><H sub="勝てる営業戦略の核心を入力してください">⚡ 営業戦略</H><div style={{marginBottom:20}}><Lbl>架電目標・KPI</Lbl><Inp value={form.goal} onChange={function(v){set("goal",v);}} placeholder="例：1時間のオンライン商談アポ獲得"/></div><div style={{marginBottom:20}}><Lbl req={true}>主な訴求ポイント・強み</Lbl><Inp value={form.appealPoints} onChange={function(v){set("appealPoints",v);}} placeholder="例：導入実績500社、コスト30%削減、初月無料トライアル可能" multi={true} rows={4}/></div><div style={{marginBottom:20}}><Lbl>競合との差別化ポイント</Lbl><Inp value={form.differentiation} onChange={function(v){set("differentiation",v);}} placeholder="例：API連携が業界最多、24時間サポート" multi={true} rows={3}/></div><div><Lbl>主な競合（任意）</Lbl><Inp value={form.competitors} onChange={function(v){set("competitors",v);}} placeholder="例：Salesforce、HubSpot、kintone"/></div></Card>)}

        {step===5&&(<Card><H sub="よくある断り文句を入力すると切り返しトークの精度が上がります">🛡️ 断り文句・想定状況</H><div style={{background:"#fff8ed",border:"1px solid #f5a62344",borderRadius:10,padding:"12px 16px",marginBottom:24,fontSize:13,color:"#92400e",fontWeight:600}}>💡 受付突破トークと担当者トーク、それぞれの切り返しを生成します。</div><div style={{marginBottom:24}}><Lbl>受付での断り文句</Lbl><Inp value={form.rcptObjections} onChange={function(v){set("rcptObjections",v);}} placeholder='例：「担当者不在」「折り返し不可」「資料送って」' multi={true} rows={4}/></div><div style={{marginBottom:24}}><Lbl>担当者からの断り文句</Lbl><Inp value={form.contactObjections} onChange={function(v){set("contactObjections",v);}} placeholder='例：「予算がない」「他社使ってる」「忙しい」' multi={true} rows={4}/></div><div><Lbl>その他・特記事項</Lbl><Inp value={form.situationNotes} onChange={function(v){set("situationNotes",v);}} placeholder="例：競合が強い業界、規制がある" multi={true} rows={3}/></div></Card>)}

        {step===6&&(<div>{!output&&!loading&&(<Card><H sub="入力内容をもとにAIがトーク素材を設計します">✨ 生成準備完了</H><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>{[["📝 PART1","受付突破トーク（パターン別+ゴールデンルール）"],["📝 PART2","担当者トーク（HOOK→PAIN→VALUE→CLOSE→CONFIRM）"],["🛡️ PART3","切り返しトーク10選（受付5個+担当者5個）"],["❓ PART4","FAQ 10選"]].map(function(item,i){return <div key={i} style={{background:GRAY_LIGHT,borderRadius:10,padding:"14px 16px",border:"1px solid "+BORDER}}><div style={{fontWeight:800,fontSize:13,color:DARK,marginBottom:4}}>{item[0]}</div><div style={{fontSize:12,color:TEXT_MUTED}}>{item[1]}</div></div>;})}</div><button onClick={function(){generate();}} style={{width:"100%",padding:"18px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:900,fontSize:17,border:"none",cursor:"pointer",boxShadow:"0 6px 24px rgba(232,0,29,0.35)",letterSpacing:"0.05em"}}>🚀 トーク素材を生成する</button></Card>)}{loading&&<Card style={{textAlign:"center",padding:"70px 32px"}}><div style={{fontSize:50,marginBottom:16}}>⚡</div><div style={{fontSize:18,fontWeight:900,color:DARK,marginBottom:8}}>AIが設計中...</div><div style={{fontSize:13,color:TEXT_MUTED}}>最強のトーク素材を生成しています（60秒程度）</div></Card>}{output&&!loading&&(<div><VersionHistory versions={versions} currentId={currentId} onRestore={function(v){setOutput(v.data);setCurrentId(v.id);}}/><OutputViewer output={output} form={form}/><Card style={{background:GRAY_LIGHT,marginTop:16}}><div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12}}>🔄 フィードバック・ブラッシュアップ</div><Inp value={feedback} onChange={setFeedback} placeholder='例：「切り返しをより共感的に」「FAQに価格の質問を追加」' multi={true} rows={3}/><button onClick={function(){generate(feedback);}} disabled={!feedback} style={{marginTop:12,padding:"11px 28px",borderRadius:10,background:feedback?DARK:"#ddd",color:WHITE,fontWeight:700,fontSize:14,border:"none",cursor:feedback?"pointer":"not-allowed"}}>再生成する</button></Card><div style={{display:"flex",gap:12,marginTop:12}}><button onClick={downloadTxt} style={{flex:1,padding:"15px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:800,fontSize:14,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(232,0,29,0.25)"}}>📥 テキストでダウンロード</button><button onClick={function(){window.print();}} style={{flex:1,padding:"15px",borderRadius:12,background:DARK,color:WHITE,fontWeight:800,fontSize:14,border:"none",cursor:"pointer"}}>🖨️ 印刷 / PDF保存</button></div></div>)}</div>)}

        <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
          {step>1&&<button onClick={function(){setStep(function(s){return s-1;});}} style={{padding:"13px 30px",borderRadius:10,border:"2px solid "+BORDER,background:WHITE,color:TEXT,fontWeight:700,fontSize:14,cursor:"pointer"}}>← 戻る</button>}
          {step<6&&<button onClick={function(){setStep(function(s){return s+1;});}} disabled={!canNext()} style={{padding:"13px 36px",borderRadius:10,border:"none",background:canNext()?"linear-gradient(135deg,"+RED+","+RED_DARK+")":"#ddd",color:WHITE,fontWeight:800,fontSize:14,cursor:canNext()?"pointer":"not-allowed",marginLeft:"auto",boxShadow:canNext()?"0 4px 16px rgba(232,0,29,0.25)":"none"}}>次へ →</button>}
        </div>
      </div>
    </div>
  );
}
