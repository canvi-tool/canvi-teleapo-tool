import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";

const RED="#e8001d",RED_DARK="#b50017",WHITE="#ffffff",DARK="#0f0f0f",GOLD="#f5a623",GRAY_LIGHT="#f5f5f5";

// スーパー管理者のメールアドレスリスト
const SUPER_ADMINS = [
  "yuji.okabayashi@canvi.co.jp",
  "admin@canvi.co.jp"
];

const CALL_PATTERN_LABELS = {
  new_list: "新規リスト向け",
  exhibition: "展示会リード向け",
  cold_list: "過去名刺・コールドリスト向け",
  web_inquiry: "Web問い合わせ向け",
  upsell: "既存顧客アップセル向け"
};

export default function SuperAdminPage(){
  var[users,setUsers]=useState([]);
  var[generations,setGenerations]=useState([]);
  var[loading,setLoading]=useState(true);
  var[tab,setTab]=useState("dashboard");
  var[searchQuery,setSearchQuery]=useState("");
  var[filterStatus,setFilterStatus]=useState("all");
  var[selectedUser,setSelectedUser]=useState(null);

  // 権限チェック
  var isSuperAdmin = auth.currentUser && SUPER_ADMINS.includes(auth.currentUser.email);

  useEffect(function(){
    if(!isSuperAdmin) return;
    
    setLoading(true);
    
    // ユーザー情報を取得
    getDocs(collection(db, "users"))
      .then(function(snapshot){
        var userList = [];
        snapshot.forEach(function(doc){
          userList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        setUsers(userList);
        
        // 生成履歴を取得
        return getDocs(query(collection(db, "generations"), orderBy("createdAt", "desc")));
      })
      .then(function(snapshot){
        var genList = [];
        snapshot.forEach(function(doc){
          genList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        setGenerations(genList);
        setLoading(false);
      })
      .catch(function(err){
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [isSuperAdmin]);

  if(!isSuperAdmin){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:GRAY_LIGHT}}>
        <div style={{textAlign:"center",background:WHITE,padding:60,borderRadius:16,boxShadow:"0 4px 24px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:48,marginBottom:16}}>🔒</div>
          <div style={{fontSize:20,fontWeight:700,color:DARK,marginBottom:8}}>アクセス権限がありません</div>
          <div style={{fontSize:14,color:"#666",marginBottom:24}}>このページはスーパー管理者のみアクセス可能です</div>
          <button onClick={function(){window.location.href="/";}} style={{padding:"10px 24px",borderRadius:8,background:RED,color:WHITE,fontSize:14,fontWeight:700,border:"none",cursor:"pointer"}}>
            トップページに戻る
          </button>
        </div>
      </div>
    );
  }

  if(loading){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:GRAY_LIGHT}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>⏳</div>
          <div style={{fontSize:14,color:"#666",fontWeight:600}}>読み込み中...</div>
        </div>
      </div>
    );
  }

  // 統計計算
  var stats = {
    totalUsers: users.length,
    totalGenerations: generations.length,
    thisMonthUsers: users.filter(function(u){
      var now = new Date();
      return u.createdAt.getMonth() === now.getMonth() && u.createdAt.getFullYear() === now.getFullYear();
    }).length,
    activeUsers: new Set(generations.filter(function(g){
      var now = new Date();
      return g.createdAt.getMonth() === now.getMonth() && g.createdAt.getFullYear() === now.getFullYear();
    }).map(function(g){return g.uid;})).size
  };

  // ユーザーごとの生成数を計算
  var userGenCounts = {};
  generations.forEach(function(g){
    if(!userGenCounts[g.uid]) userGenCounts[g.uid] = 0;
    userGenCounts[g.uid]++;
  });

  // ユーザーリストの拡張
  var enrichedUsers = users.map(function(u){
    return {
      ...u,
      genCount: userGenCounts[u.id] || 0,
      lastGenDate: generations.filter(function(g){return g.uid===u.id;}).sort(function(a,b){return b.createdAt - a.createdAt;})[0]?.createdAt || null,
      status: (userGenCounts[u.id] || 0) > 0 ? "active" : "registered"
    };
  });

  // フィルタリング
  var filteredUsers = enrichedUsers.filter(function(u){
    var matchSearch = !searchQuery || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    var matchStatus = filterStatus === "all" || u.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  // CSVエクスポート
  function exportCSV(){
    var headers = ["メールアドレス","氏名","会社名","電話番号","業界","登録日","生成回数","最終利用日","ステータス"];
    var rows = filteredUsers.map(function(u){
      return [
        u.email,
        u.name || "",
        u.companyName || "",
        u.phone || "",
        u.industry || "",
        u.createdAt.toLocaleDateString("ja-JP"),
        u.genCount,
        u.lastGenDate ? u.lastGenDate.toLocaleDateString("ja-JP") : "",
        u.status === "active" ? "利用中" : "登録のみ"
      ].join(",");
    });
    
    var csv = [headers.join(","), ...rows].join("\n");
    var blob = new Blob(["\ufeff" + csv], {type: "text/csv;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "users_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
  }

  return(
    <div style={{minHeight:"100vh",background:GRAY_LIGHT,fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"}}>
      {/* Header */}
      <div style={{background:DARK,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+GOLD+",#d48c1a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👑</div>
          <div>
            <div style={{color:WHITE,fontWeight:900,fontSize:17,letterSpacing:"0.05em",lineHeight:1}}>スーパー管理画面</div>
            <div style={{color:GOLD,fontSize:9,fontWeight:700,letterSpacing:"0.1em",marginTop:1}}>SUPER ADMIN DASHBOARD</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:"#aaa",fontSize:11}}>{auth.currentUser?.email}</span>
          <a href="/" style={{padding:"6px 14px",borderRadius:8,background:"transparent",border:"1px solid #444",color:"#ccc",fontSize:11,fontWeight:700,textDecoration:"none"}}>ツールに戻る</a>
          <button onClick={function(){signOut(auth).then(function(){window.location.href="/";});}} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #444",background:"transparent",color:"#ccc",fontSize:11,fontWeight:700,cursor:"pointer"}}>ログアウト</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:WHITE,borderBottom:"2px solid #e8e8e8"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 24px",display:"flex",gap:8}}>
          {[
            {id:"dashboard",label:"📊 ダッシュボード"},
            {id:"users",label:"👥 ユーザーリスト"}
          ].map(function(t){
            var active = tab === t.id;
            return <button key={t.id} onClick={function(){setTab(t.id);}} style={{padding:"14px 24px",background:active?GRAY_LIGHT:"transparent",border:"none",borderBottom:active?"3px solid "+GOLD:"3px solid transparent",color:active?GOLD:"#666",fontWeight:active?800:600,fontSize:14,cursor:"pointer",marginBottom:-2}}>{t.label}</button>;
          })}
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"40px 24px"}}>
        {/* Dashboard */}
        {tab==="dashboard"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:40}}>
              {[
                {label:"総ユーザー数",value:stats.totalUsers,icon:"👥",color:GOLD},
                {label:"総生成数",value:stats.totalGenerations,icon:"📋",color:RED},
                {label:"今月の新規登録",value:stats.thisMonthUsers,icon:"✨",color:"#22c55e"},
                {label:"アクティブユーザー",value:stats.activeUsers,icon:"🔥",color:"#f97316"}
              ].map(function(s,i){
                return(
                  <div key={i} style={{background:WHITE,borderRadius:12,padding:"24px 28px",border:"1px solid #e8e8e8",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontSize:13,color:"#666",fontWeight:600,marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:32,fontWeight:900,color:s.color}}>{s.value}</div>
                  </div>
                );
              })}
            </div>

            <div style={{background:WHITE,borderRadius:12,padding:"32px 36px",border:"1px solid #e8e8e8"}}>
              <div style={{fontSize:20,fontWeight:900,color:DARK,marginBottom:24}}>📈 利用状況トップ10</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:GRAY_LIGHT,borderBottom:"2px solid #e8e8e8"}}>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>順位</th>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>メールアドレス</th>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>会社名</th>
                    <th style={{padding:"12px 16px",textAlign:"center",fontSize:12,fontWeight:800,color:DARK}}>生成回数</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedUsers.sort(function(a,b){return b.genCount - a.genCount;}).slice(0,10).map(function(u,i){
                    return(
                      <tr key={u.id} style={{borderBottom:"1px solid #e8e8e8"}}>
                        <td style={{padding:"14px 16px",fontSize:13,fontWeight:700,color:i<3?GOLD:"#666"}}>
                          {i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)}
                        </td>
                        <td style={{padding:"14px 16px",fontSize:13,color:DARK}}>{u.email}</td>
                        <td style={{padding:"14px 16px",fontSize:13,color:"#666"}}>{u.companyName || "-"}</td>
                        <td style={{padding:"14px 16px",fontSize:15,fontWeight:700,color:RED,textAlign:"center"}}>{u.genCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users List */}
        {tab==="users"&&(
          <div>
            <div style={{display:"flex",gap:12,marginBottom:24}}>
              <input type="text" value={searchQuery} onChange={function(e){setSearchQuery(e.target.value);}} placeholder="メール、会社名、氏名で検索..." style={{flex:1,padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none"}}/>
              
              <select value={filterStatus} onChange={function(e){setFilterStatus(e.target.value);}} style={{padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",background:WHITE}}>
                <option value="all">すべて</option>
                <option value="active">利用中</option>
                <option value="registered">登録のみ</option>
              </select>
              
              <button onClick={exportCSV} style={{padding:"12px 24px",borderRadius:8,background:GOLD,color:WHITE,fontSize:14,fontWeight:700,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>
                📥 CSVエクスポート
              </button>
            </div>

            <div style={{background:WHITE,borderRadius:12,border:"1px solid #e8e8e8",overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:GRAY_LIGHT,borderBottom:"2px solid #e8e8e8"}}>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>メールアドレス</th>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>氏名</th>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>会社名</th>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>電話番号</th>
                    <th style={{padding:"12px 16px",textAlign:"center",fontSize:12,fontWeight:800,color:DARK}}>生成回数</th>
                    <th style={{padding:"12px 16px",textAlign:"left",fontSize:12,fontWeight:800,color:DARK}}>登録日</th>
                    <th style={{padding:"12px 16px",textAlign:"center",fontSize:12,fontWeight:800,color:DARK}}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(function(u,i){
                    return(
                      <tr key={u.id} style={{borderBottom:i<filteredUsers.length-1?"1px solid #e8e8e8":"none"}}>
                        <td style={{padding:"14px 16px",fontSize:13,color:DARK,fontWeight:600}}>{u.email}</td>
                        <td style={{padding:"14px 16px",fontSize:13,color:"#666"}}>{u.name || "-"}</td>
                        <td style={{padding:"14px 16px",fontSize:13,color:"#666"}}>{u.companyName || "-"}</td>
                        <td style={{padding:"14px 16px",fontSize:13,color:"#666"}}>{u.phone || "-"}</td>
                        <td style={{padding:"14px 16px",fontSize:15,fontWeight:700,color:RED,textAlign:"center"}}>{u.genCount}</td>
                        <td style={{padding:"14px 16px",fontSize:13,color:"#666"}}>{u.createdAt.toLocaleDateString("ja-JP")}</td>
                        <td style={{padding:"14px 16px",textAlign:"center"}}>
                          <button onClick={function(){setSelectedUser(u);}} style={{padding:"6px 16px",borderRadius:6,background:"#f0f0f0",border:"1px solid #e8e8e8",color:DARK,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                            詳細
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length===0&&(
              <div style={{textAlign:"center",padding:60,background:WHITE,borderRadius:12,border:"1px solid #e8e8e8"}}>
                <div style={{fontSize:48,marginBottom:16}}>🔍</div>
                <div style={{fontSize:16,fontWeight:700,color:"#666"}}>該当するユーザーが見つかりません</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser&&(
        <div onClick={function(){setSelectedUser(null);}} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:WHITE,borderRadius:16,width:700,maxWidth:"95%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{background:DARK,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:WHITE}}>{selectedUser.email}</div>
                <div style={{fontSize:12,color:"#aaa"}}>{selectedUser.companyName || "会社名未登録"}</div>
              </div>
              <button onClick={function(){setSelectedUser(null);}} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"none",color:WHITE,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
            
            <div style={{padding:"24px 28px"}}>
              <div style={{marginBottom:24}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12}}>📋 基本情報</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>氏名</div><div style={{fontSize:13,color:DARK}}>{selectedUser.name || "-"}</div></div>
                  <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>電話番号</div><div style={{fontSize:13,color:DARK}}>{selectedUser.phone || "-"}</div></div>
                  <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>業界</div><div style={{fontSize:13,color:DARK}}>{selectedUser.industry || "-"}</div></div>
                  <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>登録日</div><div style={{fontSize:13,color:DARK}}>{selectedUser.createdAt.toLocaleString("ja-JP")}</div></div>
                </div>
              </div>

              <div style={{marginBottom:24}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12}}>📊 利用統計</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>総生成数</div><div style={{fontSize:20,fontWeight:900,color:RED}}>{selectedUser.genCount}</div></div>
                  <div><div style={{fontSize:11,color:"#666",marginBottom:4}}>最終利用日</div><div style={{fontSize:13,color:DARK}}>{selectedUser.lastGenDate ? selectedUser.lastGenDate.toLocaleString("ja-JP") : "-"}</div></div>
                </div>
              </div>

              {selectedUser.salesChallenges && selectedUser.salesChallenges.length > 0 && (
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12}}>💡 営業課題</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {selectedUser.salesChallenges.map(function(c){
                      return <span key={c} style={{padding:"4px 12px",borderRadius:20,background:GRAY_LIGHT,fontSize:12,color:"#666"}}>{c}</span>;
                    })}
                  </div>
                </div>
              )}

              <div style={{marginTop:24}}>
                <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:12}}>📋 生成履歴</div>
                {generations.filter(function(g){return g.uid===selectedUser.id;}).length > 0 ? (
                  <div style={{maxHeight:200,overflowY:"auto",border:"1px solid #e8e8e8",borderRadius:8}}>
                    {generations.filter(function(g){return g.uid===selectedUser.id;}).map(function(g){
                      return(
                        <div key={g.id} style={{padding:"12px 16px",borderBottom:"1px solid #f0f0f0",fontSize:12}}>
                          <div style={{fontWeight:700,color:DARK}}>{g.companyName} - {g.serviceName}</div>
                          <div style={{color:"#666",marginTop:4}}>{g.createdAt.toLocaleString("ja-JP")}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{textAlign:"center",padding:24,background:GRAY_LIGHT,borderRadius:8,fontSize:13,color:"#666"}}>
                    まだ生成履歴がありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
