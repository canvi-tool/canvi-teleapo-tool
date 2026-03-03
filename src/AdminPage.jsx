import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, where, deleteDoc, doc } from "firebase/firestore";

const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",GOLD="#f5a623",DARK="#0f0f0f",WHITE="#ffffff",BORDER="#e8e8e8",TEXT="#1a1a1a",TEXT_MUTED="#666",GRAY_LIGHT="#f5f5f5";
const BG="#0a1628",SURFACE="#112240",SURFACE2="#1a2f50",TEAL="#0e9b7e",TEAL_LIGHT="#13c0a0";

function OutputModal({history,onClose}){
  var[tab,setTab]=useState("script");
  if(!history)return null;
  var o=history.output||{};
  var tabs=[{id:"script",label:"📋 トークスクリプト",color:TEAL},{id:"objection",label:"🛡️ 切り返しトーク",color:RED},{id:"faq",label:"❓ FAQ",color:GOLD}];
  var content=tab==="script"?o.talkScript:tab==="objection"?o.objectionHandling:o.faq;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:BG,borderRadius:16,width:"100%",maxWidth:800,maxHeight:"90vh",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}} onClick={function(e){e.stopPropagation();}}>
        <div style={{background:SURFACE,padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div>
            <div style={{fontWeight:900,fontSize:16,color:WHITE}}>{history.serviceName}</div>
            <div style={{fontSize:11,color:TEAL_LIGHT,marginTop:2}}>{history.companyName} / {history.callPattern}</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)",color:WHITE,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{display:"flex",gap:2,padding:"8px 8px 0",background:SURFACE}}>
          {tabs.map(function(t){var active=tab===t.id;return <button key={t.id} onClick={function(){setTab(t.id);}} style={{flex:1,padding:"10px 8px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",background:active?BG:"transparent",color:active?t.color:"#7a96b8",fontWeight:active?800:500,fontSize:12,fontFamily:"inherit",borderBottom:active?"2px solid "+t.color:"2px solid transparent"}}>{t.label}</button>;})}
        </div>
        <div style={{padding:"20px",overflowY:"auto",maxHeight:"calc(90vh - 160px)",background:BG}}>
          <pre style={{fontSize:12,color:"#a8bdd4",lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"'Hiragino Kaku Gothic ProN',sans-serif",margin:0}}>{content||"データなし"}</pre>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage(){
  var[tab,setTab]=useState("history");
  var[histories,setHistories]=useState([]);
  var[loading,setLoading]=useState(true);
  var[selected,setSelected]=useState(null);
  var user=auth.currentUser;

  useEffect(function(){
    if(!user)return;
    var q=query(collection(db,"generations"),where("uid","==",user.uid),orderBy("createdAt","desc"));
    getDocs(q).then(function(snap){
      setHistories(snap.docs.map(function(d){return Object.assign({id:d.id},d.data());}));
      setLoading(false);
    }).catch(function(){setLoading(false);});
  },[user]);

  var CALL_PATTERN_LABELS={"new_list":"新規リスト向け","exhibition":"展示会リード向け","cold_list":"過去名刺・コールドリスト向け","web_inquiry":"Web問い合わせ向け","upsell":"既存顧客アップセル向け"};

  var tabs=[{id:"history",label:"📋 保存済みスクリプト"},{id:"usage",label:"📊 統計"}];

  return(
    <div style={{minHeight:"100vh",background:GRAY_LIGHT,fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"}}>
      {selected&&<OutputModal history={selected} onClose={function(){setSelected(null);}}/>}
      <div style={{background:DARK,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div>
          <div style={{color:WHITE,fontWeight:900,fontSize:16}}>管理画面</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{color:"#aaa",fontSize:12}}>{user&&user.email}</span>
          <button onClick={function(){signOut(auth);}} style={{padding:"7px 18px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:12,fontWeight:700,cursor:"pointer"}}>ログアウト</button>
          <a href="/" style={{padding:"7px 18px",borderRadius:8,background:RED,color:WHITE,fontSize:12,fontWeight:700,textDecoration:"none"}}>ツールへ戻る</a>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",gap:8,marginBottom:28}}>
          {tabs.map(function(t){var active=tab===t.id;return <button key={t.id} onClick={function(){setTab(t.id);}} style={{padding:"10px 24px",borderRadius:10,border:"2px solid "+(active?RED:BORDER),background:active?RED_LIGHT:WHITE,color:active?RED:TEXT_MUTED,fontWeight:active?800:500,fontSize:13,cursor:"pointer"}}>{t.label}</button>;})}
        </div>

        {tab==="history"&&(
          <div>
            <div style={{fontSize:18,fontWeight:900,color:DARK,marginBottom:20}}>保存済みスクリプト <span style={{fontSize:13,fontWeight:500,color:TEXT_MUTED}}>({histories.length}件)</span></div>
            {loading&&<div style={{textAlign:"center",padding:40,color:TEXT_MUTED}}>読み込み中...</div>}
            {!loading&&histories.length===0&&<div style={{background:WHITE,borderRadius:16,padding:"60px 32px",textAlign:"center",border:"1px solid "+BORDER,color:TEXT_MUTED}}>まだ保存されたスクリプトがありません</div>}
            {!loading&&histories.map(function(h){
              var date=h.createdAt?new Date(h.createdAt.toDate()).toLocaleString("ja-JP"):"";
              return(
                <div key={h.id} style={{background:WHITE,borderRadius:14,padding:"20px 24px",border:"1px solid "+BORDER,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,color:DARK}}>{h.serviceName||"(名称なし)"}</div>
                    <div style={{fontSize:12,color:TEXT_MUTED,marginTop:4,display:"flex",gap:12}}>
                      <span>🏢 {h.companyName||"-"}</span>
                      <span>📞 {CALL_PATTERN_LABELS[h.callPattern]||h.callPattern||"-"}</span>
                      <span>🕐 {date}</span>
                    </div>
                  </div>
                  <button onClick={function(){setSelected(h);}} style={{padding:"8px 20px",borderRadius:8,background:"linear-gradient(135deg,"+TEAL+",#0d7a64)",color:WHITE,fontWeight:700,fontSize:12,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>📄 内容を見る</button>
                </div>
              );
            })}
          </div>
        )}

        {tab==="usage"&&(
          <div>
            <div style={{fontSize:18,fontWeight:900,color:DARK,marginBottom:20}}>統計</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              <div style={{background:WHITE,borderRadius:16,padding:"28px 24px",border:"1px solid "+BORDER,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>📋</div>
                <div style={{fontSize:13,fontWeight:700,color:TEXT_MUTED,marginBottom:6}}>総生成回数</div>
                <div style={{fontSize:42,fontWeight:900,color:RED}}>{histories.length}<span style={{fontSize:14,color:TEXT_MUTED,marginLeft:4}}>回</span></div>
              </div>
              <div style={{background:WHITE,borderRadius:16,padding:"28px 24px",border:"1px solid "+BORDER,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>🏢</div>
                <div style={{fontSize:13,fontWeight:700,color:TEXT_MUTED,marginBottom:6}}>クライアント数</div>
                <div style={{fontSize:42,fontWeight:900,color:DARK}}>{new Set(histories.map(function(h){return h.companyName;})).size}<span style={{fontSize:14,color:TEXT_MUTED,marginLeft:4}}>社</span></div>
              </div>
              <div style={{background:WHITE,borderRadius:16,padding:"28px 24px",border:"1px solid "+BORDER,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>📅</div>
                <div style={{fontSize:13,fontWeight:700,color:TEXT_MUTED,marginBottom:6}}>今月の生成数</div>
                <div style={{fontSize:42,fontWeight:900,color:DARK}}>{histories.filter(function(h){var d=h.createdAt&&h.createdAt.toDate();return d&&d.getMonth()===new Date().getMonth();}).length}<span style={{fontSize:14,color:TEXT_MUTED,marginLeft:4}}>回</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
