import { useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const RED="#e8001d",WHITE="#ffffff",DARK="#0f0f0f",GOLD="#f5a623";

const INDUSTRIES = ["IT・ソフトウェア","SaaS・クラウド","製造業","建設・不動産","金融・保険","医療・ヘルスケア","小売・EC","物流・運輸","教育・研修","人材・採用","コンサルティング","飲食・ホスピタリティ","メディア・広告","その他"];

const SALES_CHALLENGES = [
  { id: "script", label: "トークスクリプトの作成に時間がかかる", category: "トーク", icon: "📋" },
  { id: "objection", label: "断り文句への対応が弱い", category: "トーク", icon: "🛡️" },
  { id: "conversion", label: "アポ獲得率が低い", category: "トーク", icon: "📞" },
  { id: "quality", label: "トークの質がバラバラ", category: "トーク", icon: "📊" },
  
  { id: "hiring", label: "テレアポ人材の採用が難しい", category: "人材", icon: "👥" },
  { id: "training", label: "新人教育に時間がかかる", category: "人材", icon: "📚" },
  { id: "turnover", label: "離職率が高い", category: "人材", icon: "🔄" },
  
  { id: "list_quality", label: "架電リストの質が悪い", category: "リスト", icon: "📋" },
  { id: "list_shortage", label: "架電先が足りない", category: "リスト", icon: "📉" },
  { id: "list_update", label: "リストの更新が追いつかない", category: "リスト", icon: "🔄" },
  
  { id: "management", label: "KPI管理・数値分析が不十分", category: "マネジメント", icon: "📈" },
  { id: "process", label: "オペレーション効率化が必要", category: "マネジメント", icon: "⚙️" },
  { id: "other", label: "その他", category: "その他", icon: "💬" }
];

var challengesByCategory = {};
SALES_CHALLENGES.forEach(function(c){
  if(!challengesByCategory[c.category]) challengesByCategory[c.category] = [];
  challengesByCategory[c.category].push(c);
});

export default function OnboardingPage(){
  var[name,setName]=useState("");
  var[companyName,setCompanyName]=useState("");
  var[phone,setPhone]=useState("");
  var[industry,setIndustry]=useState("");
  var[salesChallenges,setSalesChallenges]=useState([]);
  var[loading,setLoading]=useState(false);
  var[error,setError]=useState("");

  function toggleChallenge(id){
    if(salesChallenges.includes(id)){
      setSalesChallenges(salesChallenges.filter(function(x){return x!==id;}));
    } else {
      setSalesChallenges([...salesChallenges, id]);
    }
  }

  function handleSubmit(e){
    e.preventDefault();
    
    if(salesChallenges.length===0){
      setError("営業課題を1つ以上選択してください");
      return;
    }
    
    if(!auth.currentUser){
      setError("ログインしていません");
      return;
    }
    
    setLoading(true);
    setError("");
    
    setDoc(doc(db, "users", auth.currentUser.uid), {
      email: auth.currentUser.email,
      name: name,
      companyName: companyName || "",
      phone: phone || "",
      industry: industry || "",
      salesChallenges: salesChallenges,
      onboardingCompleted: true,
      createdAt: serverTimestamp()
    })
    .then(function(){
      window.location.href = "/";
    })
    .catch(function(err){
      setLoading(false);
      setError("保存に失敗しました: " + err.message);
    });
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif",padding:"40px 20px"}}>
      <div style={{background:WHITE,borderRadius:16,padding:"40px 48px",maxWidth:700,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:12,background:"linear-gradient(135deg,"+RED+",#b50017)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>📞</div>
          <div style={{fontSize:24,fontWeight:900,color:DARK,marginBottom:8}}>あと少しです！</div>
          <div style={{fontSize:14,color:"#666",lineHeight:1.8}}>簡単なアンケートにご協力ください<br/>（所要時間：約30秒）</div>
        </div>

        {error&&<div style={{background:"#fee",border:"1px solid #fcc",borderRadius:8,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#c00"}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:700,color:DARK,marginBottom:6}}>お名前 <span style={{color:RED}}>*</span></label>
            <input type="text" value={name} onChange={function(e){setName(e.target.value);}} required style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:700,color:DARK,marginBottom:6}}>会社名</label>
              <input type="text" value={companyName} onChange={function(e){setCompanyName(e.target.value);}} style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:700,color:DARK,marginBottom:6}}>電話番号</label>
              <input type="tel" value={phone} onChange={function(e){setPhone(e.target.value);}} style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",boxSizing:"border-box"}} placeholder="03-1234-5678"/>
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <label style={{display:"block",fontSize:13,fontWeight:700,color:DARK,marginBottom:6}}>業界</label>
            <select value={industry} onChange={function(e){setIndustry(e.target.value);}} style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",boxSizing:"border-box",background:WHITE}}>
              <option value="">選択してください</option>
              {INDUSTRIES.map(function(ind){
                return <option key={ind} value={ind}>{ind}</option>;
              })}
            </select>
          </div>

          <div style={{background:"#f9f9f9",borderRadius:12,padding:"20px 24px",marginBottom:24,border:"2px solid "+(salesChallenges.length===0?"#e8e8e8":RED)}}>
            <div style={{fontSize:14,fontWeight:800,color:DARK,marginBottom:4}}>📊 営業課題アンケート <span style={{color:RED}}>*</span></div>
            <div style={{fontSize:12,color:"#666",marginBottom:16}}>複数選択可</div>
            
            {Object.keys(challengesByCategory).map(function(category){
              return(
                <div key={category} style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#888",marginBottom:8,letterSpacing:"0.05em"}}>【{category}】</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {challengesByCategory[category].map(function(c){
                      var selected = salesChallenges.includes(c.id);
                      return(
                        <label key={c.id} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",borderRadius:8,border:"2px solid "+(selected?RED:"#e8e8e8"),background:selected?"#fff0f2":WHITE,transition:"all 0.2s"}}>
                          <input type="checkbox" checked={selected} onChange={function(){toggleChallenge(c.id);}} style={{width:18,height:18,cursor:"pointer"}}/>
                          <span style={{fontSize:13,color:DARK,fontWeight:selected?600:400}}>{c.icon} {c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",borderRadius:8,background:loading?"#ccc":"linear-gradient(135deg,"+RED+",#b50017)",color:WHITE,fontWeight:800,fontSize:15,border:"none",cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":"0 4px 16px rgba(232,0,29,0.3)"}}>
            {loading?"保存中...":"完了して始める 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
