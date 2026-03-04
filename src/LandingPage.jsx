import { useState } from "react";

const RED="#e8001d",RED_DARK="#b50017",RED_LIGHT="#fff0f2",GOLD="#f5a623",DARK="#0f0f0f",WHITE="#ffffff",TEXT="#1a1a1a",TEXT_MUTED="#666";
const BG="#0d0d0d",SURFACE="#1a1a1a",SURFACE2="#252525";

// renderLine関数（App.jsxと同じ）
function renderLine(line, j, accentColor){
  var t = line.trim();
  var ac = accentColor || RED;

  if(!t) return <div key={j} style={{height:6}}/>;

  if(/^# /.test(t)){
    return(
      <div key={j} style={{
        background:"linear-gradient(90deg,"+ac+"22,transparent)",
        borderLeft:"4px solid "+ac,
        borderRadius:"0 8px 8px 0",
        padding:"10px 16px",
        marginTop:16, marginBottom:8,
      }}>
        <span style={{fontSize:16,fontWeight:900,color:WHITE,letterSpacing:"0.04em"}}>
          {t.replace(/^# /,"")}
        </span>
      </div>
    );
  }
  if(/^## /.test(t)){
    return(
      <div key={j} style={{
        borderLeft:"3px solid "+ac+"bb",
        paddingLeft:12,
        marginTop:12, marginBottom:6,
      }}>
        <span style={{fontSize:14,fontWeight:800,color:"#e8e8e8"}}>
          {t.replace(/^## /,"")}
        </span>
      </div>
    );
  }

  if(/^💡/.test(t)) return(
    <div key={j} style={{background:"rgba(245,166,35,0.08)",border:"1px solid rgba(245,166,35,0.22)",borderRadius:8,padding:"8px 12px",fontSize:12,color:GOLD,display:"flex",gap:6,lineHeight:1.8,marginTop:4,marginBottom:2}}>
      <span>💡</span><span>{t.replace(/^💡\s*/,"")}</span>
    </div>
  );

  if(/^【あなた】/.test(t)) return(
    <div key={j} style={{fontFamily:"monospace",fontSize:10,color:"#13c0a0",letterSpacing:"1px",marginTop:10,marginBottom:3,display:"flex",alignItems:"center",gap:5}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:"#13c0a0",display:"inline-block"}}></span>あなた（発信者）
    </div>
  );
  if(/^【受付】/.test(t)) return(
    <div key={j} style={{fontFamily:"monospace",fontSize:10,color:"#e87a7a",letterSpacing:"1px",marginTop:10,marginBottom:3,display:"flex",alignItems:"center",gap:5}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:"#e87a7a",display:"inline-block"}}></span>受付
    </div>
  );

  if(t.startsWith("「")&&t.endsWith("」")) return(
    <div key={j} style={{background:"#2e2e2e",borderLeft:"3px solid "+ac,borderRadius:"0 8px 8px 0",padding:"10px 14px",fontSize:13,color:"#ececec",lineHeight:1.9,marginBottom:3}}>
      {t}
    </div>
  );

  if(/^→/.test(t)) return(
    <div key={j} style={{background:"rgba(232,0,29,0.06)",border:"1px solid rgba(232,0,29,0.14)",borderRadius:7,padding:"7px 12px",fontSize:13,color:"#ff9999",lineHeight:1.8,marginLeft:10}}>
      {t}
    </div>
  );

  if(/^❌/.test(t)) return(
    <div key={j} style={{background:"rgba(232,0,29,0.08)",border:"1px solid rgba(232,0,29,0.22)",borderRadius:7,padding:"9px 12px",fontSize:13,color:"#ff6b6b",fontWeight:700,lineHeight:1.8,marginTop:10}}>
      {t}
    </div>
  );

  if(/^Q[\d\.\s：]+/.test(t)||/^Q\d/.test(t)) return(
    <div key={j} style={{fontSize:14,fontWeight:700,color:WHITE,marginTop:16,marginBottom:8}}>
      {t}
    </div>
  );
  
  if(/^A[\d\.\s：]+/.test(t)||/^A\d/.test(t)) return(
    <div key={j} style={{fontSize:13,color:"#c0c0c0",lineHeight:1.9,marginBottom:12,paddingLeft:12,borderLeft:"2px solid "+GOLD}}>
      {t}
    </div>
  );

  if(/^[①-⑥]|^\d+\.\s/.test(t)) return(
    <div key={j} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"2px 0"}}>
      <span style={{color:ac,fontWeight:700,flexShrink:0,fontSize:13,marginTop:2}}>▶</span>
      <span style={{fontSize:13,color:"#c0c0c0",lineHeight:1.8}}>{t.replace(/^[①-⑥]\s*|^\d+\.\s*/,"")}</span>
    </div>
  );

  return <div key={j} style={{fontSize:13,color:"#a8a8a8",lineHeight:1.9,padding:"1px 0"}}>{t}</div>;
}

export default function LandingPage({onStart}){
  var[previewTab,setPreviewTab]=useState("script");
  
  var sampleOutput = {
    script: `# 株式会社Canvi【営業DX支援サービス】テレアポトークスクリプト

## STEP A: 最初の一言

【あなた】
「お世話になっております。株式会社Canviの〇〇と申します。営業支援関連でご担当者様にお繋ぎいただけますでしょうか？」

💡 ポイント：「お世話になっております」で既存取引先のような雰囲気を演出。用件は簡潔に。

## STEP B: 受付パターン別対応

❌ パターン①「どのようなご用件ですか？」

【受付】
「どのようなご用件でしょうか？」

1. 簡潔に価値を伝える
→ 「営業チームの生産性向上でお役に立てる情報がございまして」

2. 担当部署を特定
→ 「営業部門のご責任者様、もしくは経営企画ご担当者様にお繋ぎいただけますと幸いです」`,
    
    objection: `❌ 「担当者は不在です」

1. 共感：「承知いたしました。お忙しいところ恐れ入ります」
→ 相手の状況を理解していることを示す

2. 転換：「それでは、〇〇様がお戻りになるお時間を教えていただけますか？改めてお電話いたします」
→ 具体的な次のアクションを提案

3. クロージング：「もしくは、簡単な資料をメールでお送りしてもよろしいでしょうか？」
→ 接点を維持する代替案を提示`,
    
    faq: `Q1. どのような企業が導入していますか？

A1. IT・SaaS企業を中心に、製造業、人材、コンサルティングなど幅広い業界で300社以上の導入実績がございます。特に、営業チームが10名以上の成長企業様でご活用いただいております。

Q2. 導入までにどのくらいの期間がかかりますか？

A2. 最短1週間で導入可能です。初回のヒアリングから設定、トレーニングまで、専任のカスタマーサクセスチームが伴走いたします。`
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
          <div style={{fontSize:12,color:WHITE,marginTop:12,animation:"fadeIn 1.4s ease-out"}}>※ STEP1-2まで無料体験可能 | STEP3以降は会員登録（無料）が必要です</div>
        </div>
      </div>

      {/* Sample Output Preview - リッチなデザイン版 */}
      <div style={{background:BG,padding:"80px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <h2 style={{fontSize:32,fontWeight:900,color:WHITE,textAlign:"center",marginBottom:16,margin:"0 0 16px 0"}}>📝 生成されるスクリプトのサンプル</h2>
          <p style={{fontSize:14,color:"#888",textAlign:"center",marginBottom:40,margin:"0 0 40px 0"}}>実際にAIが生成したトークスクリプトの例をご覧いただけます</p>
          
          <div style={{background:SURFACE,borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 8px 40px rgba(0,0,0,0.7)"}}>
            {/* Summary */}
            <div style={{background:SURFACE2,borderRadius:10,padding:"14px 18px",margin:"14px 16px",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div style={{fontSize:10,fontWeight:700,color:GOLD,letterSpacing:"0.12em",marginBottom:10}}>📋 入力内容サマリー</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {icon:"🏢",label:"会社名",value:"株式会社Canvi"},
                  {icon:"📦",label:"サービス名",value:"営業DX支援サービス"},
                  {icon:"📞",label:"架電パターン",value:"新規リスト向け"},
                  {icon:"📍",label:"エリア",value:"全国"}
                ].map(function(item,i){
                  return(
                    <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                      <span style={{fontSize:12,flexShrink:0,marginTop:1}}>{item.icon}</span>
                      <div>
                        <div style={{fontSize:9,color:"#666",fontWeight:600,letterSpacing:"0.05em",marginBottom:1}}>{item.label}</div>
                        <div style={{fontSize:11,color:"#c0c0c0",lineHeight:1.5}}>{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabs */}
            <div style={{background:SURFACE,padding:"5px 5px 0",display:"flex",gap:3,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              {[
                {id:"script",label:"📋 トークスクリプト",color:RED},
                {id:"objection",label:"🛡️ 切り返しトーク",color:RED_DARK},
                {id:"faq",label:"❓ FAQ",color:GOLD}
              ].map(function(t){
                var active=previewTab===t.id;
                return <button key={t.id} onClick={function(){setPreviewTab(t.id);}} style={{flex:1,padding:"9px 6px",borderRadius:"6px 6px 0 0",border:"none",cursor:"pointer",background:active?BG:"transparent",color:active?t.color:"#555",fontWeight:active?800:500,fontSize:12,fontFamily:"inherit",borderBottom:active?"2px solid "+t.color:"2px solid transparent",transition:"all 0.2s"}}>{t.label}</button>;
              })}
            </div>
            
            {/* Content */}
            <div style={{padding:"16px 14px",minHeight:260,maxHeight:450,overflowY:"auto",background:SURFACE}}>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {sampleOutput[previewTab].split("\n").map(function(line,j){
                  return renderLine(line, j, previewTab==="script"?RED:previewTab==="objection"?RED_DARK:GOLD);
                })}
              </div>
            </div>
            
            {/* CTA in Preview */}
            <div style={{padding:"12px 14px",background:SURFACE,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#666",marginBottom:10,textAlign:"center"}}>👆 このようなスクリプトが、わずか5分で完成します</div>
              <button onClick={onStart} style={{width:"100%",padding:"14px",borderRadius:8,background:"linear-gradient(135deg,"+RED+","+RED_DARK+")",color:WHITE,fontWeight:800,fontSize:14,border:"none",cursor:"pointer",boxShadow:"0 4px 16px rgba(232,0,29,0.3)",transition:"transform 0.2s"}} onMouseEnter={function(e){e.target.style.transform="scale(1.02)";}} onMouseLeave={function(e){e.target.style.transform="scale(1)";}}>
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
        <div style={{color:WHITE,fontSize:12}}>© 2026 株式会社Canvi. All rights reserved.</div>
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
