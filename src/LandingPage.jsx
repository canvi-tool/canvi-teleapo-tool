import { useState } from "react";

const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",GOLD="#f5a623",DARK="#0f0f0f",WHITE="#ffffff",TEXT="#1a1a1a",TEXT_MUTED="#666";

export default function LandingPage({onStart}){
  return(
    <div style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif"}}>
      {/* Header */}
      <div style={{background:DARK,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 20px rgba(0,0,0,0.3)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📞</div>
          <div>
            <div style={{color:WHITE,fontWeight:900,fontSize:17,letterSpacing:"0.05em",lineHeight:1}}>テレアポの達人</div>
            <div style={{color:GOLD,fontSize:9,fontWeight:700,letterSpacing:"0.1em",marginTop:1}}>AI SCRIPT GENERATOR</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <a href="/admin" style={{padding:"6px 14px",borderRadius:8,background:"transparent",border:"1px solid #444",color:"#ccc",fontSize:11,fontWeight:700,textDecoration:"none"}}>ログイン</a>
          <div style={{color:WHITE,fontSize:11,fontWeight:600}}>by 株式会社Canvi</div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{background:"linear-gradient(135deg,"+DARK+" 0%,#1a0005 50%,"+DARK+" 100%)",padding:"80px 40px",borderBottom:"3px solid "+RED}}>
        <div style={{maxWidth:1000,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:RED,letterSpacing:"0.15em",marginBottom:12}}>🔥 AI POWERED TELEAPO TOOL</div>
          <h1 style={{fontSize:48,fontWeight:900,color:WHITE,lineHeight:1.3,marginBottom:20}}>
            最強のトークスクリプトを、<br/>
            <span style={{color:GOLD}}>AIが瞬時に設計する。</span>
          </h1>
          <p style={{fontSize:18,color:"#ccc",marginBottom:40,lineHeight:1.8}}>
            STEP 1-5で簡単入力 → AIが自動生成 → トークスクリプト完成<br/>
            受付突破・担当者トーク・切り返し・FAQを一気に作成
          </p>
          <button onClick={onStart} style={{padding:"20px 60px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:900,fontSize:20,border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(232,0,29,0.4)",letterSpacing:"0.05em"}}>
            🚀 無料で始める
          </button>
          <div style={{fontSize:12,color:"#888",marginTop:12}}>※ STEP2まで無料体験可能 | STEP3以降は会員登録（無料）が必要です</div>
        </div>
      </div>

      {/* Features */}
      <div style={{maxWidth:1000,margin:"0 auto",padding:"80px 40px"}}>
        <h2 style={{fontSize:32,fontWeight:900,color:DARK,textAlign:"center",marginBottom:60}}>✨ 3つの特徴</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40}}>
          {[
            {icon:"⚡",title:"5分で完成",desc:"面倒なスクリプト作成を5分で完了。STEP1-5で必要情報を入力するだけ。"},
            {icon:"🎯",title:"The Model型設計",desc:"受付突破→担当者トーク→切り返し→FAQまで、営業の勝ちパターンを完全網羅。"},
            {icon:"🔄",title:"何度でも修正可能",desc:"セクション別にブラッシュアップ可能。納得いくまで何度でも再生成。"}
          ].map(function(f,i){
            return(
              <div key={i} style={{background:WHITE,borderRadius:16,padding:"32px 24px",border:"1px solid #e8e8e8",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:16}}>{f.icon}</div>
                <div style={{fontSize:18,fontWeight:800,color:DARK,marginBottom:12}}>{f.title}</div>
                <div style={{fontSize:14,color:TEXT_MUTED,lineHeight:1.8}}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div style={{background:DARK,padding:"80px 40px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <h2 style={{fontSize:32,fontWeight:900,color:WHITE,textAlign:"center",marginBottom:60}}>📋 使い方</h2>
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {[
              {step:"STEP 1",title:"サービス情報",desc:"会社名・サービス名・概要を入力",color:RED},
              {step:"STEP 2",title:"架電パターン",desc:"新規リスト・展示会リードなど、状況に応じて選択",color:RED},
              {step:"STEP 3",title:"ターゲット設定",desc:"業界・エリア・従業員数などを設定",color:GOLD},
              {step:"STEP 4",title:"営業戦略",desc:"訴求ポイント・差別化ポイントを入力",color:GOLD},
              {step:"STEP 5",title:"断り文句",desc:"よくある断り文句を入力して切り返しトークを生成",color:GOLD}
            ].map(function(s,i){
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:24,background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"24px 32px",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div style={{width:80,height:80,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:WHITE,flexShrink:0}}>{s.step}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:20,fontWeight:800,color:WHITE,marginBottom:8}}>{s.title}</div>
                    <div style={{fontSize:14,color:"#aaa"}}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{textAlign:"center",marginTop:60}}>
            <button onClick={onStart} style={{padding:"18px 50px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:900,fontSize:18,border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(232,0,29,0.4)"}}>
              今すぐ始める →
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{background:RED_LIGHT,padding:"60px 40px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontSize:28,fontWeight:900,color:DARK,marginBottom:16}}>まずは無料で体験</h2>
          <p style={{fontSize:15,color:TEXT_MUTED,marginBottom:32,lineHeight:1.8}}>
            STEP1-2は登録不要でお試し可能。<br/>
            STEP3以降の本格利用は無料会員登録が必要です。
          </p>
          <button onClick={onStart} style={{padding:"16px 40px",borderRadius:10,background:RED,color:WHITE,fontWeight:800,fontSize:16,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(232,0,29,0.3)"}}>
            🚀 無料で始める
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{background:DARK,padding:"40px 40px",textAlign:"center"}}>
        <div style={{color:"#666",fontSize:12}}>© 2024 株式会社Canvi. All rights reserved.</div>
      </div>
    </div>
  );
}
