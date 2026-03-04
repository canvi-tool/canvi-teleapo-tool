import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",GOLD="#f5a623",DARK="#0f0f0f",WHITE="#ffffff",TEXT="#1a1a1a",TEXT_MUTED="#666",BORDER="#e8e8e8",GRAY_LIGHT="#f5f5f5";
const CALL_PATTERN_LABELS = {
new_list: "新規リスト向け",
exhibition: "展示会リード向け",
cold_list: "過去名刺・コールドリスト向け",
web_inquiry: "Web問い合わせ向け",
upsell: "既存顧客アップセル向け"
};
function DetailModal({gen,onClose,onMemoUpdate}){
if(!gen)return null;
var[activeTab,setActiveTab]=useState("script");
var[copied,setCopied]=useState(false);
var[memo,setMemo]=useState(gen.memo||"");
var[memoSaving,setMemoSaving]=useState(false);
function copyContent(){
var text = activeTab==="script" ? gen.output?.talkScript :
activeTab==="objection" ? gen.output?.objectionHandling :
gen.output?.faq;
navigator.clipboard.writeText(text || "");
setCopied(true);
setTimeout(function(){setCopied(false);},2000);
}
function saveMemo(){
setMemoSaving(true);
updateDoc(doc(db, "generations", gen.id), {
memo: memo
})
.then(function(){
setMemoSaving(false);
onMemoUpdate(gen.id, memo);
alert("✅ メモを保存しました");
})
.catch(function(err){
console.error("Memo save error:", err);
setMemoSaving(false);
alert("❌ メモの保存に失敗しました");
});
}
function restoreToResult(){
var restoreData = {
companyName: gen.companyName || "",
serviceName: gen.serviceName || "",
callPattern: gen.callPattern || "",
output: gen.output,
jumpToResult: true
};
// inputHistoryがあれば全て復元
if(gen.inputHistory){
  Object.assign(restoreData, gen.inputHistory);
}

console.log("💾 Saving restore data:", restoreData);
localStorage.setItem('canvi_restore_data', JSON.stringify(restoreData));
window.location.href = '/';
}
return(
<div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,overflowY:"auto"}}>
<div onClick={function(e){e.stopPropagation();}} style={{background:WHITE,borderRadius:16,maxWidth:1000,width:"100%",maxHeight:"95vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",margin:"auto"}}>
{/* Header */}
<div style={{background:DARK,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
<div>
<div style={{fontSize:18,fontWeight:900,color:WHITE,marginBottom:4}}>{gen.serviceName || "無題"}</div>
<div style={{fontSize:12,color:"#aaa"}}>{gen.companyName} • {CALL_PATTERN_LABELS[gen.callPattern] || gen.callPattern}</div>
</div>
<button onClick={onClose} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"none",color:WHITE,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
</div>
    {/* Tabs */}
    <div style={{background:GRAY_LIGHT,padding:"0 24px",display:"flex",gap:8,borderBottom:"2px solid "+BORDER,overflowX:"auto",flexShrink:0}}>
      {[
        {id:"script",label:"📋 トークスクリプト"},
        {id:"objection",label:"🛡️ 切り返しトーク"},
        {id:"faq",label:"❓ FAQ"},
        {id:"history",label:"📝 入力履歴"}
      ].map(function(t){
        var active=activeTab===t.id;
        return <button key={t.id} onClick={function(){setActiveTab(t.id);setCopied(false);}} style={{padding:"12px 20px",background:active?WHITE:"transparent",border:"none",borderBottom:active?"3px solid "+RED:"3px solid transparent",color:active?RED:TEXT_MUTED,fontWeight:active?700:500,fontSize:13,cursor:"pointer",marginBottom:-2,whiteSpace:"nowrap"}}>{t.label}</button>;
      })}
    </div>
    
    {/* Content */}
    <div style={{padding:24,flex:1,overflowY:"auto"}}>
      {activeTab==="script"&&<pre style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.8,color:TEXT,fontFamily:"inherit"}}>{gen.output?.talkScript || "データなし"}</pre>}
      {activeTab==="objection"&&<pre style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.8,color:TEXT,fontFamily:"inherit"}}>{gen.output?.objectionHandling || "データなし"}</pre>}
      {activeTab==="faq"&&<pre style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.8,color:TEXT,fontFamily:"inherit"}}>{gen.output?.faq || "データなし"}</pre>}
      
      {/* Input History Tab */}
      {activeTab==="history"&&(
        <div>
          {gen.inputHistory?(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {/* STEP 1: サービス情報 */}
              <div style={{background:GRAY_LIGHT,borderRadius:10,padding:"16px 20px",border:"1px solid "+BORDER}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>📦</span>STEP 1: サービス基本情報
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>会社名</div>
                    <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.companyName || "-"}</div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>サービス名</div>
                    <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.serviceName || "-"}</div>
                  </div>
                  <div style={{gridColumn:"1 / -1"}}>
                    <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>サービス概要</div>
                    <div style={{fontSize:13,color:TEXT,whiteSpace:"pre-wrap"}}>{gen.inputHistory.serviceOverview || "-"}</div>
                  </div>
                  {gen.inputHistory.serviceUrl&&(
                    <div style={{gridColumn:"1 / -1"}}>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>サービスURL</div>
                      <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.serviceUrl}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: 架電パターン */}
              <div style={{background:GRAY_LIGHT,borderRadius:10,padding:"16px 20px",border:"1px solid "+BORDER}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>📞</span>STEP 2: 架電パターン
                </div>
                <div style={{fontSize:13,color:TEXT}}>
                  {CALL_PATTERN_LABELS[gen.inputHistory.callPattern] || gen.inputHistory.callPattern || "-"}
                </div>
              </div>

              {/* STEP 3: ターゲット設定 */}
              <div style={{background:GRAY_LIGHT,borderRadius:10,padding:"16px 20px",border:"1px solid "+BORDER}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>🎯</span>STEP 3: ターゲット設定
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>業界</div>
                    <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.industries?.join("、") || "-"}</div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>エリア</div>
                    <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.area || "-"}</div>
                  </div>
                  {gen.inputHistory.employeeRange?.length>0&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>従業員数</div>
                      <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.employeeRange.join("、")}</div>
                    </div>
                  )}
                  {gen.inputHistory.departments?.length>0&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>担当部署</div>
                      <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.departments.join("、")}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 4: 営業戦略 */}
              <div style={{background:GRAY_LIGHT,borderRadius:10,padding:"16px 20px",border:"1px solid "+BORDER}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>⚡</span>STEP 4: 営業戦略
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {gen.inputHistory.appealPoints&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>訴求ポイント・強み</div>
                      <div style={{fontSize:13,color:TEXT,whiteSpace:"pre-wrap"}}>{gen.inputHistory.appealPoints}</div>
                    </div>
                  )}
                  {gen.inputHistory.differentiation&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>差別化ポイント</div>
                      <div style={{fontSize:13,color:TEXT,whiteSpace:"pre-wrap"}}>{gen.inputHistory.differentiation}</div>
                    </div>
                  )}
                  {gen.inputHistory.goal&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>架電目標・KPI</div>
                      <div style={{fontSize:13,color:TEXT}}>{gen.inputHistory.goal}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 5: 断り文句 */}
              <div style={{background:GRAY_LIGHT,borderRadius:10,padding:"16px 20px",border:"1px solid "+BORDER}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>🛡️</span>STEP 5: 断り文句・想定状況
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {gen.inputHistory.rcptObjections&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>受付での断り文句</div>
                      <div style={{fontSize:13,color:TEXT,whiteSpace:"pre-wrap"}}>{gen.inputHistory.rcptObjections}</div>
                    </div>
                  )}
                  {gen.inputHistory.contactObjections&&(
                    <div>
                      <div style={{fontSize:11,color:TEXT_MUTED,fontWeight:700,marginBottom:4}}>担当者からの断り文句</div>
                      <div style={{fontSize:13,color:TEXT,whiteSpace:"pre-wrap"}}>{gen.inputHistory.contactObjections}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ):(
            <div style={{textAlign:"center",padding:40,color:TEXT_MUTED}}>
              <div style={{fontSize:48,marginBottom:16}}>📭</div>
              <div style={{fontSize:14,fontWeight:700}}>入力履歴がありません</div>
              <div style={{fontSize:12,marginTop:8}}>この生成は古いバージョンのため、入力履歴が保存されていません。</div>
            </div>
          )}
        </div>
      )}
    </div>
    
    {/* Memo Section */}
    <div style={{padding:"16px 24px",background:GRAY_LIGHT,borderTop:"1px solid "+BORDER,flexShrink:0}}>
      <div style={{fontSize:12,fontWeight:700,color:TEXT,marginBottom:8}}>📝 メモ</div>
      <div style={{display:"flex",gap:8}}>
        <textarea 
          value={memo} 
          onChange={function(e){setMemo(e.target.value);}} 
          placeholder="例：〇〇社向けAパターン、2回目の提案用..."
          rows={2}
          style={{flex:1,padding:"8px 12px",borderRadius:6,border:"2px solid "+BORDER,fontSize:12,resize:"none",fontFamily:"inherit",outline:"none"}}
        />
        <button 
          onClick={saveMemo} 
          disabled={memoSaving}
          style={{padding:"8px 16px",borderRadius:6,background:memoSaving?"#ccc":RED,color:WHITE,fontSize:12,fontWeight:700,border:"none",cursor:memoSaving?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
          {memoSaving?"保存中...":"💾 保存"}
        </button>
      </div>
    </div>
    
    {/* Footer Actions */}
    <div style={{padding:"16px 24px",background:WHITE,borderTop:"1px solid "+BORDER,display:"flex",gap:12,flexShrink:0}}>
      <button onClick={copyContent} style={{flex:1,padding:"12px 20px",borderRadius:8,background:copied?GOLD+"22":WHITE,border:"2px solid "+(copied?GOLD:BORDER),color:copied?GOLD:TEXT,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>
        {copied?"✓ コピー済み":"📋 コピー"}
      </button>
      <button onClick={restoreToResult} style={{flex:1,padding:"12px 20px",borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",border:"none",color:WHITE,fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 16px rgba(232,0,29,0.2)"}}>
        🔄 この設定で新規生成
      </button>
    </div>
  </div>
</div>
);
}
export default function AdminPage(){
var[gens,setGens]=useState([]);
var[loading,setLoading]=useState(true);
var[tab,setTab]=useState("list");
var[selectedGen,setSelectedGen]=useState(null);
var[error,setError]=useState(null);
useEffect(function(){
if(!auth.currentUser){
console.log("⚠️ No user logged in");
setError("ログインしていません");
setLoading(false);
return;
}
setLoading(true);
setError(null);
console.log("📊 Fetching data for user:", auth.currentUser.uid);

var q = query(
  collection(db, "generations"),
  where("uid", "==", auth.currentUser.uid)
);

getDocs(q)
  .then(function(snapshot){
    console.log("✅ Fetched", snapshot.size, "documents");
    var arr = [];
    snapshot.forEach(function(doc){
      var data = doc.data();
      arr.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    arr.sort(function(a, b){
      return b.createdAt - a.createdAt;
    });
    
    setGens(arr);
    setLoading(false);
  })
  .catch(function(err){
    console.error("❌ Firestore error:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    setError("データ取得エラー: " + err.message);
    setLoading(false);
  });
}, []);
function handleMemoUpdate(genId, newMemo){
setGens(function(prevGens){
return prevGens.map(function(g){
if(g.id === genId){
return Object.assign({}, g, {memo: newMemo});
}
return g;
});
});
}
var stats = {
total: gens.length,
clients: new Set(gens.map(function(g){return g.companyName;})).size,
thisMonth: gens.filter(function(g){
var d = g.createdAt;
if(!d) return false;
var now = new Date();
return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}).length
};
if(loading){
return(
<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:GRAY_LIGHT}}>
<div style={{textAlign:"center"}}>
<div style={{fontSize:40,marginBottom:12}}>⏳</div>
<div style={{fontSize:14,color:TEXT_MUTED,fontWeight:600}}>読み込み中...</div>
</div>
</div>
);
}
if(error){
return(
<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:GRAY_LIGHT}}>
<div style={{textAlign:"center",maxWidth:500,background:WHITE,padding:40,borderRadius:16,boxShadow:"0 4px 24px rgba(0,0,0,0.1)"}}>
<div style={{fontSize:48,marginBottom:16}}>⚠️</div>
<div style={{fontSize:18,fontWeight:700,color:DARK,marginBottom:8}}>エラーが発生しました</div>
<div style={{fontSize:13,color:TEXT_MUTED,marginBottom:20,padding:"12px 16px",background:GRAY_LIGHT,borderRadius:8,fontFamily:"monospace",wordBreak:"break-word"}}>{error}</div>
<div style={{display:"flex",gap:8,justifyContent:"center"}}>
<button onClick={function(){window.location.href="/";}} style={{padding:"10px 24px",borderRadius:8,background:RED,color:WHITE,fontSize:13,fontWeight:700,border:"none",cursor:"pointer"}}>
トップページに戻る
</button>
<button onClick={function(){window.location.reload();}} style={{padding:"10px 24px",borderRadius:8,background:GRAY_LIGHT,color:TEXT,fontSize:13,fontWeight:700,border:"1px solid "+BORDER,cursor:"pointer"}}>
再読み込み
</button>
</div>
</div>
</div>
);
}
return(
<div style={{minHeight:"100vh",background:GRAY_LIGHT,fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"}}>
{/* Header */}
<div style={{background:DARK,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)"}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📊</div>
<div>
<div style={{color:WHITE,fontWeight:900,fontSize:17,letterSpacing:"0.05em",lineHeight:1}}>管理画面</div>
<div style={{color:GOLD,fontSize:9,fontWeight:700,letterSpacing:"0.1em",marginTop:1}}>ADMIN DASHBOARD</div>
</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<span style={{color:"#aaa",fontSize:11}}>{auth.currentUser?.email}</span>
<a href="/" style={{padding:"6px 14px",borderRadius:8,background:"transparent",border:"1px solid #444",color:"#ccc",fontSize:11,fontWeight:700,textDecoration:"none"}}>ツールに戻る</a>
<button onClick={function(){signOut(auth).then(function(){window.location.href="/";});}} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:11,fontWeight:700,cursor:"pointer"}}>ログアウト</button>
</div>
</div>
  <div style={{maxWidth:1400,margin:"0 auto",padding:"40px 24px"}}>
    {/* Tabs */}
    <div style={{display:"flex",gap:8,marginBottom:32}}>
      {[{id:"list",label:"📋 生成履歴"},{id:"stats",label:"📊 統計"}].map(function(t){
        var active=tab===t.id;
        return <button key={t.id} onClick={function(){setTab(t.id);}} style={{padding:"12px 24px",borderRadius:10,background:active?WHITE:GRAY_LIGHT,border:"2px solid "+(active?RED:BORDER),color:active?RED:TEXT_MUTED,fontWeight:active?800:600,fontSize:14,cursor:"pointer",boxShadow:active?"0 4px 16px rgba(232,0,29,0.1)":"none"}}>{t.label}</button>;
      })}
    </div>

    {/* Stats Tab */}
    {tab==="stats"&&(
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {[
          {label:"総生成数",value:stats.total,icon:"🚀",color:RED},
          {label:"クライアント数",value:stats.clients,icon:"🏢",color:GOLD},
          {label:"今月の生成数",value:stats.thisMonth,icon:"📅",color:"#22c55e"}
        ].map(function(s,i){
          return(
            <div key={i} style={{background:WHITE,borderRadius:12,padding:"24px 28px",border:"1px solid "+BORDER,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:32,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:13,color:TEXT_MUTED,fontWeight:600,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:32,fontWeight:900,color:s.color}}>{s.value}</div>
            </div>
          );
        })}
      </div>
    )}

    {/* List Tab */}
    {tab==="list"&&(
      <div>
        {gens.length===0?(
          <div style={{background:WHITE,borderRadius:12,padding:60,textAlign:"center",border:"1px solid "+BORDER}}>
            <div style={{fontSize:48,marginBottom:16}}>📭</div>
            <div style={{fontSize:16,fontWeight:700,color:TEXT_MUTED}}>まだ生成履歴がありません</div>
          </div>
        ):(
          <div style={{background:WHITE,borderRadius:12,border:"1px solid "+BORDER,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:GRAY_LIGHT,borderBottom:"2px solid "+BORDER}}>
                  <th style={{padding:"14px 20px",textAlign:"left",fontSize:12,fontWeight:800,color:TEXT,letterSpacing:"0.05em"}}>日時</th>
                  <th style={{padding:"14px 20px",textAlign:"left",fontSize:12,fontWeight:800,color:TEXT,letterSpacing:"0.05em"}}>会社名</th>
                  <th style={{padding:"14px 20px",textAlign:"left",fontSize:12,fontWeight:800,color:TEXT,letterSpacing:"0.05em"}}>サービス名</th>
                  <th style={{padding:"14px 20px",textAlign:"left",fontSize:12,fontWeight:800,color:TEXT,letterSpacing:"0.05em"}}>架電パターン</th>
                  <th style={{padding:"14px 20px",textAlign:"left",fontSize:12,fontWeight:800,color:TEXT,letterSpacing:"0.05em"}}>メモ</th>
                  <th style={{padding:"14px 20px",textAlign:"center",fontSize:12,fontWeight:800,color:TEXT,letterSpacing:"0.05em"}}>操作</th>
                </tr>
              </thead>
              <tbody>
                {gens.map(function(g,i){
                  return(
                    <tr key={g.id} style={{borderBottom:i<gens.length-1?"1px solid "+BORDER:"none"}}>
                      <td style={{padding:"16px 20px",fontSize:13,color:TEXT_MUTED}}>{g.createdAt.toLocaleString("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
                      <td style={{padding:"16px 20px",fontSize:13,fontWeight:700,color:TEXT}}>{g.companyName || "-"}</td>
                      <td style={{padding:"16px 20px",fontSize:13,color:TEXT}}>{g.serviceName || "-"}</td>
                      <td style={{padding:"16px 20px",fontSize:13,color:TEXT}}>{CALL_PATTERN_LABELS[g.callPattern] || g.callPattern || "-"}</td>
                      <td style={{padding:"16px 20px",fontSize:13,color:TEXT_MUTED,maxWidth:200}}>
                        <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {g.memo || <span style={{color:"#ccc",fontStyle:"italic"}}>未記入</span>}
                        </div>
                      </td>
                      <td style={{padding:"16px 20px",textAlign:"center"}}>
                        <button onClick={function(){setSelectedGen(g);}} style={{padding:"6px 16px",borderRadius:6,background:RED_LIGHT,border:"1px solid "+RED,color:RED,fontSize:12,fontWeight:700,cursor:"pointer"}}>📄 内容を見る</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Detail Modal */}
  {selectedGen&&<DetailModal gen={selectedGen} onClose={function(){setSelectedGen(null);}} onMemoUpdate={handleMemoUpdate}/>}
</div>
);
}
