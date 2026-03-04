import { useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

// カテゴリごとにグループ化
var challengesByCategory = {};
SALES_CHALLENGES.forEach(function(c){
  if(!challengesByCategory[c.category]) challengesByCategory[c.category] = [];
  challengesByCategory[c.category].push(c);
});

export default function AuthPage(){
  var[mode,setMode]=useState("login");
  var[email,setEmail]=useState("");
  var[password,setPassword]=useState("");
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
    
    // 新規登録時のバリデーション
    if(mode==="signup" && salesChallenges.length===0){
      setError("営業課題を1つ以上選択してください");
      return;
    }
    
    setLoading(true);
    setError("");
    
    if(mode==="login"){
      // ログイン
      signInWithEmailAndPassword(auth, email, password)
        .then(function(){
          window.location.href = "/";
        })
        .catch(function(err){
          setLoading(false);
          if(err.code==="auth/user-not-found") setError("ユーザーが見つかりません");
          else if(err.code==="auth/wrong-password") setError("パスワードが間違っています");
          else if(err.code==="auth/invalid-credential") setError("メールアドレスまたはパスワードが正しくありません");
          else setError("ログインエラー: " + err.message);
        });
    } else {
      // 新規登録
      createUserWithEmailAndPassword(auth, email, password)
        .then(function(userCredential){
          // Firestoreにユーザー情報を保存
          return setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            name: name,
            companyName: companyName || "",
            phone: phone || "",
            industry: industry || "",
            salesChallenges: salesChallenges,
            createdAt: serverTimestamp()
          });
        })
        .then(function(){
          window.location.href = "/";
        })
        .catch(function(err){
          setLoading(false);
          if(err.code==="auth/email-already-in-use") setError("このメールアドレスは既に登録されています");
          else if(err.code==="auth/weak-password") setError("パスワードは6文字以上にしてください");
          else if(err.code==="auth/invalid-email") setError("メールアドレスの形式が正しくありません");
          else setError("登録エラー: " + err.message);
        });
    }
  }

  function handleGoogleLogin(){
    setLoading(true);
    setError("");
    
    var provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
      .then(function(result){
        // 新規ユーザーの場合はFirestoreに保存
        return setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          name: result.user.displayName || "",
          companyName: "",
          phone: "",
          industry: "",
          salesChallenges: [],
          createdAt: serverTimestamp()
        }, { merge: true }); // mergeで既存データを上書きしない
      })
      .then(function(){
        window.location.href = "/";
      })
      .catch(function(err){
        setLoading(false);
        if(err.code === "auth/popup-closed-by-user"){
          setError("ログインがキャンセルされました");
        } else if(err.code === "auth/unauthorized-domain"){
          setError("このドメインは承認されていません。管理者にお問い合わせください。");
        } else {
          setError("Googleログインエラー: " + err.message);
        }
      });
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5",fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif",padding:"40px 20px"}}>
      <div style={{background:WHITE,borderRadius:16,padding:"40px 48px",maxWidth:mode==="signup"?700:440,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:12,background:"linear-gradient(135deg,"+RED+",#b50017)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>📞</div>
          <div style={{fontSize:24,fontWeight:900,color:DARK,marginBottom:4}}>テレアポの達人</div>
          <div style={{fontSize:13,color:"#666"}}>{mode==="login"?"ログイン":"新規会員登録"}</div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:24}}>
          <button onClick={function(){setMode("login");setError("");}} style={{flex:1,padding:"10px",borderRadius:8,border:"2px solid "+(mode==="login"?RED:"#e8e8e8"),background:mode==="login"?"#fff0f2":WHITE,color:mode==="login"?RED:"#666",fontWeight:mode==="login"?700:500,fontSize:14,cursor:"pointer"}}>ログイン</button>
          <button onClick={function(){setMode("signup");setError("");}} style={{flex:1,padding:"10px",borderRadius:8,border:"2px solid "+(mode==="signup"?RED:"#e8e8e8"),background:mode==="signup"?"#fff0f2":WHITE,color:mode==="signup"?RED:"#666",fontWeight:mode==="signup"?700:500,fontSize:14,cursor:"pointer"}}>新規登録</button>
        </div>

        {error&&<div style={{background:"#fee",border:"1px solid #fcc",borderRadius:8,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#c00"}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:700,color:DARK,marginBottom:6}}>メールアドレス <span style={{color:RED}}>*</span></label>
            <input type="email" value={email} onChange={function(e){setEmail(e.target.value);}} required style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          
          <div style={{marginBottom:mode==="signup"?16:24}}>
            <label style={{display:"block",fontSize:13,fontWeight:700,color:DARK,marginBottom:6}}>パスワード <span style={{color:RED}}>*</span></label>
            <input type="password" value={password} onChange={function(e){setPassword(e.target.value);}} required style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"2px solid #e8e8e8",fontSize:14,outline:"none",boxSizing:"border-box"}} placeholder={mode==="signup"?"6文字以上":""}/>
          </div>

          {mode==="signup"&&(
            <>
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
            </>
          )}

          <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",borderRadius:8,background:loading?"#ccc":"linear-gradient(135deg,"+RED+",#b50017)",color:WHITE,fontWeight:800,fontSize:15,border:"none",cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":"0 4px 16px rgba(232,0,29,0.3)",marginBottom:16}}>
            {loading?"処理中...":(mode==="login"?"ログイン":"新規登録")}
          </button>
        </form>

        {mode==="login"&&(
          <>
            <div style={{position:"relative",textAlign:"center",margin:"24px 0 16px"}}>
              <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:"#e8e8e8"}}></div>
              <span style={{position:"relative",background:WHITE,padding:"0 12px",fontSize:12,color:"#999"}}>または</span>
            </div>

            <button onClick={handleGoogleLogin} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:8,background:WHITE,border:"2px solid #e8e8e8",display:"flex",alignItems:"center",justifyContent:"center",gap:12,cursor:loading?"not-allowed":"pointer",fontSize:14,fontWeight:700,color:"#333",transition:"all 0.2s"}} onMouseEnter={function(e){if(!loading)e.currentTarget.style.background="#f9f9f9";}} onMouseLeave={function(e){e.currentTarget.style.background=WHITE;}}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Googleでログイン
            </button>
          </>
        )}

        <div style={{marginTop:24,textAlign:"center"}}>
          <a href="/" style={{fontSize:13,color:RED,textDecoration:"none",fontWeight:600}}>← トップページに戻る</a>
        </div>
      </div>
    </div>
  );
}
