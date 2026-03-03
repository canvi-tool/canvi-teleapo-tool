import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",DARK="#0f0f0f",WHITE="#ffffff",BORDER="#e8e8e8",TEXT="#1a1a1a",TEXT_MUTED="#666",GRAY_LIGHT="#f5f5f5";

export default function AuthPage(){
  var[mode,setMode]=useState("login");
  var[email,setEmail]=useState("");
  var[password,setPassword]=useState("");
  var[error,setError]=useState("");
  var[loading,setLoading]=useState(false);

  function handleSubmit(){
    setError("");setLoading(true);
    var promise=mode==="login"
      ?signInWithEmailAndPassword(auth,email,password)
      :createUserWithEmailAndPassword(auth,email,password);
    promise.catch(function(e){
      var msg=e.code==="auth/user-not-found"?"メールアドレスが見つかりません":e.code==="auth/wrong-password"?"パスワードが間違っています":e.code==="auth/email-already-in-use"?"このメールアドレスは既に使用されています":e.code==="auth/weak-password"?"パスワードは6文字以上必要です":"エラーが発生しました: "+e.code;
      setError(msg);setLoading(false);
    });
  }

  return(
    <div style={{minHeight:"100vh",background:GRAY_LIGHT,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"}}>
      <div style={{background:WHITE,borderRadius:20,padding:"48px 44px",width:"100%",maxWidth:420,boxShadow:"0 8px 40px rgba(0,0,0,0.10)",border:"1px solid "+BORDER}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px"}}>📞</div>
          <div style={{fontSize:22,fontWeight:900,color:DARK}}>テレアポの達人</div>
          <div style={{fontSize:13,color:TEXT_MUTED,marginTop:4}}>{mode==="login"?"管理画面にログイン":"新規アカウント登録"}</div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:28,background:GRAY_LIGHT,borderRadius:10,padding:4}}>
          {[["login","ログイン"],["register","新規登録"]].map(function(item){
            var active=mode===item[0];
            return <button key={item[0]} onClick={function(){setMode(item[0]);setError("");}} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:active?WHITE:"transparent",color:active?RED:TEXT_MUTED,fontWeight:active?800:500,fontSize:13,cursor:"pointer",boxShadow:active?"0 2px 8px rgba(0,0,0,0.08)":"none"}}>{item[1]}</button>;
          })}
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:TEXT,marginBottom:6}}>メールアドレス</div>
          <input value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="example@email.com" type="email" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid "+BORDER,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:700,color:TEXT,marginBottom:6}}>パスワード</div>
          <input value={password} onChange={function(e){setPassword(e.target.value);}} placeholder="6文字以上" type="password" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid "+BORDER,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
        </div>

        {error&&<div style={{background:RED_LIGHT,border:"1px solid "+RED,borderRadius:8,padding:"10px 14px",fontSize:12,color:RED,fontWeight:600,marginBottom:16}}>{error}</div>}

        <button onClick={handleSubmit} disabled={!email||!password||loading} style={{width:"100%",padding:"14px",borderRadius:10,background:email&&password?"linear-gradient(135deg,"+RED+","+RED_DARK+")":"#ddd",color:WHITE,fontWeight:800,fontSize:15,border:"none",cursor:email&&password?"pointer":"not-allowed",boxShadow:email&&password?"0 4px 16px rgba(232,0,29,0.3)":"none"}}>
          {loading?"処理中...":mode==="login"?"ログイン →":"アカウントを作成 →"}
        </button>
      </div>
    </div>
  );
}
