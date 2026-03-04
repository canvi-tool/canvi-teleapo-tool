import { useState } from "react";

const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",GOLD="#f5a623",DARK="#0f0f0f",WHITE="#ffffff",TEXT="#1a1a1a",TEXT_MUTED="#666";

export default function LandingPage({onStart}){
  var[previewTab,setPreviewTab]=useState("script");
  
  var sampleOutput = {
    script: `# 株式会社ミステック【住設net】テレアポトークスクリプト

■ PART1 受付突破（ナチュラル型）

## STEP A: 最初の一言

【あなた】
「お世話になっております。株式会社ミステックの〇〇と申します。住宅設備関連でご担当者様にお繋ぎいただけますでしょうか？」

💡 ポイント：「お世話になっております」で既存取引先のような雰囲気を演出。用件は簡潔に。

## STEP B: 受付パターン別対応

❌ パターン①「どのようなご用件ですか？」

【受付】
「どのようなご用件でしょうか？」

1. 簡潔に価値を伝える
→ 「住宅設備の仕入れコスト見直しでお役に立てる情報がございまして」

2. 担当部署を特定
→ 「設備ご担当者様、もしくは購買ご担当者様にお繋ぎいただけますと幸いです」`,
    
    objection: `# 受付用 切り返しトーク

❌ 「担当者は不在です」

1. 共感：「承知いたしました。お忙しいところ恐れ入ります」
→ 相手の状況を理解していることを示す

2. 転換：「それでは、〇〇様がお戻りになるお時間を教えていただけますか？改めてお電話いたします」
→ 具体的な次のアクションを提案

3. クロージング：「もしくは、簡単な資料をメールでお送りしてもよろしいでしょうか？」
→ 接点を維持する代替案を提示`,
    
    faq: `Q1. 加盟するのに初期費用はかかりますか？

A1. 初期費用は一切かかりません。面倒な加盟手続きも不要で、月額ロイヤリティ9,800円（税別）からすぐに開始できます。自由な経営が可能なボランタリーチェーンの仕組みです。

Q2. 仕入れやノルマはありますか？

A2. 販売ノルマも仕入れノルマも一切ありません。必要な時に必要な分だけ仕入れていただけます。自由な経営スタイルを維持したまま加盟いただけます。`
  };
  
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
          <div style={{fontSize:11,fontWeight:700,color:RED,letterSpacing:"0.15em",marginBottom:12,animation:"fadeInDown 0.6s ease-out"}}>🔥 AI POWERED TELEAPO TOOL</div>
          <h1 style={{fontSize:48,fontWeight:900,color:WHITE,lineHeight:1.3,marginBottom:20,margin:"0 0 20px 0",animation:"fadeInUp 0.8s ease-out"}}>
            最強のトークスクリプトを、<br/>
            <span style={{color:GOLD}}>AIが瞬時に設計する。</span>
          </h1>
          <p style={{fontSize:18,color:WHITE,marginBottom:40,lineHeight:1.8,margin:"0 0 40px 0",animation:"fadeInUp 1s ease-out"}}>
            STEP 1-5で簡単入力 → AIが自動生成 → トークスクリプト完成<br/>
            受付突破・担当者トーク・切り返し・FAQを一気に作成
          </p>
          <button onClick={onStart} style={{padding:"20px 60px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:900,fontSize:20,border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(232,0,29,0.4)",letterSpacing:"0.05em",animation:"fadeInUp 1.2s ease-out, pulse 2s infinite",transition:"transform 0.2s"}} onMouseEnter={function(e){e.target.style.transform="scale(1.05)";}} onMouseLeave={function(e){e.target.style.transform="scale(1)";}}>
            🚀 無料で始める
          </button>
          <div style={{fontSize:12,color:WHITE,marginTop:12,animation:"fadeIn 1.4s ease-out"}}>※ STEP2まで無料体験可能 | STEP3以降は会員登録（無料）が必要です</div>
        </div>
      </div>

      {/* Sample Output Preview - NEW! */}
      <div style={{background:"#f0f0f0",padding:"80px 40px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <h2 style={{fontSize:32,fontWeight:900,color:DARK,textAlign:"center",marginBottom:16,margin:"0 0 16px 0"}}>📝 生成されるスクリプトのサンプル</h2>
          <p style={{fontSize:14,color:TEXT_MUTED,textAlign:"center",marginBottom:40,margin:"0 0 40px 0"}}>実際にAIが生成したトークスクリプトの例をご覧いただけます</p>
          
          <div style={{background:WHITE,borderRadius:16,overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.1)"}}>
            {/* Tabs */}
            <div style={{background:"#f9f9f9",padding:"0 24px",display:"flex",gap:8,borderBottom:"2px solid #e8e8e8"}}>
              {[
                {id:"script",label:"📋 トークスクリプト"},
                {id:"objection",label:"🛡️ 切り返しトーク"},
                {id:"faq",label:"❓ FAQ"}
              ].map(function(t){
                var active=previewTab===t.id;
                return <button key={t.id} onClick={function(){setPreviewTab(t.id);}} style={{padding:"14px 24px",background:active?WHITE:"transparent",border:"none",borderBottom:active?"3px solid "+RED:"3px solid transparent",color:active?RED:TEXT_MUTED,fontWeight:active?800:600,fontSize:14,cursor:"pointer",marginBottom:-2,transition:"all 0.2s"}}>{t.label}</button>;
              })}
            </div>
            
            {/* Content */}
            <div style={{padding:"32px",maxHeight:500,overflowY:"auto",background:WHITE}}>
              <pre style={{whiteSpace:"pre-wrap",fontSize:14,lineHeight:1.9,color:TEXT,fontFamily:"inherit",margin:0}}>{sampleOutput[previewTab]}</pre>
            </div>
            
            {/* CTA in Preview */}
            <div style={{background:"#f9f9f9",padding:"20px 32px",borderTop:"1px solid #e8e8e8",textAlign:"center"}}>
              <div style={{fontSize:13,color:TEXT_MUTED,marginBottom:12}}>👆 このようなスクリプトが、わずか5分で完成します</div>
              <button onClick={onStart} style={{padding:"12px 32px",borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:800,fontSize:14,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(232,0,29,0.3)",transition:"transform 0.2s"}} onMouseEnter={function(e){e.target.style.transform="scale(1.05)";}} onMouseLeave={function(e){e.target.style.transform="scale(1)";}}>
                今すぐ無料で作成する →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{maxWidth:1000,margin:"0 auto",padding:"80px 40px"}}>
        <h2 style={{fontSize:32,fontWeight:900,color:DARK,textAlign:"center",marginBottom:60,margin:"0 0 60px 0",animation:"fadeInUp 0.6s ease-out"}}>✨ 3つの特徴</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40}}>
          {[
            {icon:"⚡",title:"5分で完成",desc:"面倒なスクリプト作成を5分で完了。STEP1-5で必要情報を入力するだけ。",delay:"0.2s"},
            {icon:"🎯",title:"The Model型設計",desc:"受付突破→担当者トーク→切り返し→FAQまで、営業の勝ちパターンを完全網羅。",delay:"0.4s"},
            {icon:"🔄",title:"何度でも修正可能",desc:"セクション別にブラッシュアップ可能。納得いくまで何度でも再生成。",delay:"0.6s"}
          ].map(function(f,i){
            return(
              <div key={i} style={{background:WHITE,borderRadius:16,padding:"32px 24px",border:"1px solid #e8e8e8",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",textAlign:"center",animation:"fadeInUp 0.6s ease-out",animationDelay:f.delay,animationFillMode:"both",transition:"transform 0.3s, box-shadow 0.3s"}} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-8px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.12)";}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.06)";}}>
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
          <h2 style={{fontSize:32,fontWeight:900,color:WHITE,textAlign:"center",marginBottom:60,margin:"0 0 60px 0"}}>📋 使い方</h2>
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {[
              {step:"STEP 1",title:"サービス情報",desc:"会社名・サービス名・概要を入力",color:RED,free:true,delay:"0.2s"},
              {step:"STEP 2",title:"架電パターン",desc:"新規リスト・展示会リードなど、状況に応じて選択",color:RED,free:true,delay:"0.3s"},
              {step:"STEP 3",title:"ターゲット設定",desc:"業界・エリア・従業員数などを設定",color:GOLD,free:false,delay:"0.4s"},
              {step:"STEP 4",title:"営業戦略",desc:"訴求ポイント・差別化ポイントを入力",color:GOLD,free:false,delay:"0.5s"},
              {step:"STEP 5",title:"断り文句",desc:"よくある断り文句を入力して切り返しトークを生成",color:GOLD,free:false,delay:"0.6s"}
            ].map(function(s,i){
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:24,background:"rgba(255,255,255,0.05)",borderRadius:12,padding:"24px 32px",border:"1px solid rgba(255,255,255,0.1)",position:"relative",animation:"fadeInLeft 0.6s ease-out",animationDelay:s.delay,animationFillMode:"both",transition:"transform 0.3s, background 0.3s"}} onMouseEnter={function(e){e.currentTarget.style.transform="translateX(8px)";e.currentTarget.style.background="rgba(255,255,255,0.08)";}} onMouseLeave={function(e){e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.background="rgba(255,255,255,0.05)";}}>
                  <div style={{width:80,height:80,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:WHITE,flexShrink:0}}>{s.step}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:20,fontWeight:800,color:WHITE,marginBottom:8}}>{s.title}</div>
                    <div style={{fontSize:14,color:WHITE}}>{s.desc}</div>
                  </div>
                  {s.free&&<div style={{position:"absolute",top:12,right:12,background:GOLD,color:DARK,fontSize:10,fontWeight:800,padding:"4px 12px",borderRadius:20}}>無料体験OK</div>}
                  {!s.free&&<div style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.1)",color:WHITE,fontSize:10,fontWeight:800,padding:"4px 12px",borderRadius:20,border:"1px solid rgba(255,255,255,0.2)"}}>🔒 要登録</div>}
                </div>
              );
            })}
          </div>
          <div style={{textAlign:"center",marginTop:60,animation:"fadeInUp 1s ease-out"}}>
            <button onClick={onStart} style={{padding:"18px 50px",borderRadius:12,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:900,fontSize:18,border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(232,0,29,0.4)",transition:"transform 0.2s"}} onMouseEnter={function(e){e.target.style.transform="scale(1.05)";}} onMouseLeave={function(e){e.target.style.transform="scale(1)";}}>
              今すぐ始める →
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div style={{maxWidth:1000,margin:"0 auto",padding:"80px 40px"}}>
        <h2 style={{fontSize:32,fontWeight:900,color:DARK,textAlign:"center",marginBottom:60,margin:"0 0 60px 0"}}>💼 こんな方におすすめ</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          {[
            {icon:"🏢",text:"テレアポ代行会社でスクリプトを量産したい",delay:"0.2s"},
            {icon:"📞",text:"営業チームのトークを標準化したい",delay:"0.3s"},
            {icon:"⏱️",text:"スクリプト作成の時間を削減したい",delay:"0.4s"},
            {icon:"📈",text:"アポ率を向上させたい",delay:"0.5s"}
          ].map(function(b,i){
            return(
              <div key={i} style={{background:WHITE,borderRadius:12,padding:"20px 24px",border:"1px solid #e8e8e8",display:"flex",alignItems:"center",gap:16,animation:"fadeInUp 0.6s ease-out",animationDelay:b.delay,animationFillMode:"both",transition:"transform 0.3s, box-shadow 0.3s"}} onMouseEnter={function(e){e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";}} onMouseLeave={function(e){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{fontSize:32,flexShrink:0}}>{b.icon}</div>
                <div style={{fontSize:15,fontWeight:700,color:DARK}}>{b.text}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{background:RED_LIGHT,padding:"60px 40px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontSize:28,fontWeight:900,color:DARK,marginBottom:16,margin:"0 0 16px 0"}}>まずは無料で体験</h2>
          <p style={{fontSize:15,color:TEXT_MUTED,marginBottom:32,lineHeight:1.8,margin:"0 0 32px 0"}}>
            STEP1-2は登録不要でお試し可能。<br/>
            STEP3以降の本格利用は無料会員登録が必要です。
          </p>
          <button onClick={onStart} style={{padding:"16px 40px",borderRadius:10,background:RED,color:WHITE,fontWeight:800,fontSize:16,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(232,0,29,0.3)",transition:"transform 0.2s"}} onMouseEnter={function(e){e.target.style.transform="scale(1.05)";}} onMouseLeave={function(e){e.target.style.transform="scale(1)";}}>
            🚀 無料で始める
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{background:DARK,padding:"40px 40px",textAlign:"center"}}>
        <div style={{color:WHITE,fontSize:12}}>© 2024 株式会社Canvi. All rights reserved.</div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(232,0,29,0.4); }
          50% { box-shadow: 0 8px 48px rgba(232,0,29,0.6); }
        }
      `}</style>
    </div>
  );
}
