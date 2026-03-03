import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";

const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",DARK="#0f0f0f",WHITE="#ffffff",BORDER="#e8e8e8",TEXT="#1a1a1a",TEXT_MUTED="#666",GRAY_LIGHT="#f5f5f5";

export default function AdminPage(){
  var[tab,setTab]=useState("history");
  var[histories,setHistories]=useState([]);
  var[loading,setLoading]=useState(true);
  var user=auth.currentUser;

  useEffect(function(){
    if(!user)return;
    var q=query(collection(db,"generations"),where("uid","==",user.uid),orderBy("createdAt","desc"));
    getDocs(q).then(function(snap){
      setHistories(snap.docs.map(function(d){return Object.assign({id:d.id},d.data());}));
      setLoading(false);
    }).catch(function(){setLoading(false);});
  },[user]);

  function handleSignOut(){signOut(auth);}

  var tabs=[{id:"history",label:"📋 生成履歴"},{id:"usage",label:"💰 使用量"}];

  return(
    <div style={{minHeight:"100vh",background:GRAY_LIGHT,fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"}}>
      <div style={{background:DARK,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div>
          <div style={{color:"#fff",fontWeight:900,fontSize:16}}>管理画面</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{color:"#aaa",fontSize:12}}>{user&&user.email}</span>
          <button onClick={handleSignOut} style={{padding:"7px 18px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:12,fontWeight:700,cursor:"pointer"}}>ログアウト</button>
          <a href="/" style={{padding:"7px 18px",borderRadius:8,background:RED,color:"#fff",fontSize:12,fontWeight:700,textDecoration:"none"}}>ツールへ戻る</a>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",gap:8,marginBottom:28}}>
          {tabs.map(function(t){var active=tab===t.id;return <button key={t.id} onClick={function(){setTab(t.id);}} style={{padding:"10px 24px",borderRadius:10,border:"2px solid "+(active?RED:BORDER),background:active?RED_LIGHT:WHITE,color:active?RED:TEXT_MUTED,fontWeight:active?800:500,fontSize:13,cursor:"pointer"}}>{t.label}</button>;})}
        </div>

        {tab==="history"&&(
          <div>
            <div style={{fontSize:18,fontWeight:900,color:DARK,marginBottom:20}}>生成履歴</div>
            {loading&&<div style={{textAlign:"center",padding:40,color:TEXT_MUTED}}>読み込み中...</div>}
            {!loading&&histories.length===0&&<div style={{background:WHITE,borderRadius:16,padding:"60px 32px",textAlign:"center",border:"1px solid "+BORDER,color:TEXT_MUTED}}>まだ生成履歴がありません</div>}
            {!loading&&histories.map(function(h){
              return(
                <div key={h.id} style={{background:WHITE,borderRadius:14,padding:"20px 24px",border:"1px solid "+BORDER,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:15,color:DARK}}>{h.serviceName||"(名称なし)"}</div>
                      <div style={{fontSize:12,color:TEXT_MUTED,marginTop:4}}>{h.companyName} / {h.callPattern}</div>
                    </div>
                    <div style={{fontSize:11,color:TEXT_MUTED}}>{h.createdAt&&new Date(h.createdAt.toDate()).toLocaleString("ja-JP")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="usage"&&(
          <div>
            <div style={{fontSize:18,fontWeight:900,color:DARK,marginBottom:20}}>API使用量</div>
            <div style={{background:WHITE,borderRadius:16,padding:"32px",border:"1px solid "+BORDER,textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>📊</div>
              <div style={{fontSize:15,fontWeight:700,color:DARK,marginBottom:8}}>総生成回数</div>
              <div style={{fontSize:48,fontWeight:900,color:RED}}>{histories.length}<span style={{fontSize:16,color:TEXT_MUTED,marginLeft:4}}>回</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
