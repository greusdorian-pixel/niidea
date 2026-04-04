import { useState, useEffect, useRef, useContext, createContext } from "react";
import { supabase } from "../lib/supabase";

const ImgCtx = createContext({imgs:{}, onErr:()=>{}});

const C = {
  bg:"#070710", bg2:"#0c0c1e", bg3:"#111128",
  pink:"#e040fb", cyan:"#00e5ff", gold:"#ffd54f",
  red:"#ff1744", green:"#00e676", purple:"#7c4dff",
  text:"#e8e8f8", muted:"#5a5a7a", border:"#ffffff0d",
  divine:"#ffffff",
};

const RARITY = {
  common:    { label:"Común",      color:"#78909c", glow:"#78909c22", tier:0, stars:1 },
  uncommon:  { label:"Poco Común", color:"#26a69a", glow:"#26a69a22", tier:1, stars:2 },
  rare:      { label:"Raro",       color:"#1e88e5", glow:"#1e88e522", tier:2, stars:3 },
  epic:      { label:"Épico",      color:"#ab47bc", glow:"#ab47bc33", tier:3, stars:4 },
  legendary: { label:"Legendario", color:"#ffd54f", glow:"#ffd54f44", tier:4, stars:5 },
  divine:    { label:"DIVINA",     color:"#ffffff", glow:"#ffffff55", tier:5, stars:6 },
};
const FUSION_MAP = ["common","uncommon","rare","epic","legendary"];

const CHARS = [
  { name:"Yoru",  role:"Asesina",    cls:"Sombra",  atkT:"Filo",         c:"#e040fb", hair:"#1a1a1a", outfit:"#2d0040" },
  { name:"Akari", role:"Maga Oscura",cls:"Maga",    atkT:"Magia",        c:"#7c4dff", hair:"#0d0d2e", outfit:"#1a0040" },
  { name:"Sera",  role:"Sanadora",   cls:"Clérigo", atkT:"Luz",          c:"#00e676", hair:"#1a3300", outfit:"#003322" },
  { name:"Nyx",   role:"Cazadora",   cls:"Arquera", atkT:"Flecha",       c:"#00e5ff", hair:"#001a2e", outfit:"#002233" },
  { name:"Rein",  role:"Guardiana",  cls:"Paladín", atkT:"Escudo",       c:"#ffd54f", hair:"#2e1a00", outfit:"#2e2000" },
  { name:"Vex",   role:"Invocadora", cls:"Maga",    atkT:"Caos",         c:"#ff4081", hair:"#2e0010", outfit:"#1a0015" },
  { name:"Lyra",  role:"Bardo",      cls:"Soporte", atkT:"Sonido",       c:"#ff9800", hair:"#2e1500", outfit:"#2e1a00" },
  { name:"Kaine", role:"Berserker",  cls:"Guerrera",atkT:"Fuerza",       c:"#ff1744", hair:"#1a0000", outfit:"#2e0010" },
  { name:"Faye",  role:"Espía",      cls:"Sombra",  atkT:"Veneno",       c:"#00bfa5", hair:"#001a18", outfit:"#001510" },
  { name:"Mira",  role:"Druida",     cls:"Maga",    atkT:"Natura",       c:"#76ff03", hair:"#0a1a00", outfit:"#0d2000" },
  { name:"Dusk",  role:"Nigromante", cls:"Maga",    atkT:"Muerte",       c:"#7e57c2", hair:"#110011", outfit:"#1a0030" },
  { name:"Rin",   role:"Kunoichi",   cls:"Sombra",  atkT:"Shuriken",     c:"#ff4081", hair:"#1a0a00", outfit:"#2e1a00" },
  { name:"Zero",  role:"La Absoluta",cls:"Vacío",   atkT:"Aniquilación", c:"#ffffff", hair:"#ffffff", outfit:"#050505" },
];

const BASE_STYLE = "masterpiece, ultra detailed, 8k, beautiful anime fantasy girl, perfect face, slim waist, sexy revealing fantasy armor bikini style, alluring pose, full body portrait, professional card game illustration, vibrant colors, fantasy lighting";

const CHAR_PROMPTS = {
  Yoru:  `${BASE_STYLE}, assassin, long straight black hair, dark purple skimpy armor with cutouts, katana, dramatic dark purple lighting`,
  Akari: `${BASE_STYLE}, dark mage, long dark purple hair, revealing violet arcane robes, glowing magical orbs around her, mystical purple energy`,
  Sera:  `${BASE_STYLE}, healer cleric, long green hair, revealing white and gold holy bikini armor, divine golden light glow, holy symbols`,
  Nyx:   `${BASE_STYLE}, huntress archer, long blue hair, revealing teal leather strap armor, bow and arrow, ethereal teal glow, forest fantasy`,
  Rein:  `${BASE_STYLE}, paladin guardian, long blonde hair, revealing gold plate bikini armor, shining holy shield, radiant warm light`,
  Vex:   `${BASE_STYLE}, summoner sorceress, long pink hair, revealing dark magenta magical outfit, summoning circles, chaotic pink energy swirls`,
  Lyra:  `${BASE_STYLE}, bard musician, long orange hair, revealing orange fantasy stage costume, glowing magical lute, musical notes floating`,
  Kaine: `${BASE_STYLE}, berserker warrior, long red hair, revealing scarlet battle bikini armor, massive battle axe, fierce intense expression, red aura`,
  Faye:  `${BASE_STYLE}, spy rogue, long teal hair, revealing dark teal leather bodysuit, twin daggers, shadows and mist, mysterious`,
  Mira:  `${BASE_STYLE}, druid nature mage, long green hair, revealing nature outfit with vines and flowers, glowing green nature energy, forest background`,
  Dusk:  `${BASE_STYLE}, necromancer, long purple wavy hair, revealing dark gothic outfit, floating skulls, dark purple magical aura, ethereal`,
  Rin:   `${BASE_STYLE}, kunoichi ninja, long black hair, revealing red and black ninja outfit, shurikens, smoke wisps, moonlight`,
  Zero:  `masterpiece, ultra detailed, 8k, transcendent divine anime girl, perfect ethereal beauty, long flowing pure white hair, radiant white energy, minimalist white and void black revealing divine outfit, cosmic black void background, floating geometric void particles, omnipotent calm expression, glowing white eyes, she is THE ABSOLUTE ZERO, professional card game illustration, divine otherworldly lighting, white energy trails`,
};

/* Precios de venta */
const SELL_PRICES = { common:20, uncommon:50, rare:120, epic:260, legendary:600 };

/* Enemigos de arena */
const ARENA_ENEMIES = [
  { name:"Golem Roto",      emoji:"🗿", tier:0, hp:80,   atk:14,  def:6,   reward:25,  xp:8  },
  { name:"Lobo Sombra",     emoji:"🐺", tier:0, hp:110,  atk:20,  def:8,   reward:35,  xp:10 },
  { name:"Arquera Oscura",  emoji:"🏹", tier:1, hp:160,  atk:32,  def:15,  reward:60,  xp:15 },
  { name:"Espectro Maldito",emoji:"👻", tier:1, hp:140,  atk:38,  def:12,  reward:70,  xp:18 },
  { name:"Caballero Roto",  emoji:"⚔️", tier:2, hp:240,  atk:52,  def:28,  reward:110, xp:25 },
  { name:"Dragón Menor",    emoji:"🐉", tier:2, hp:300,  atk:60,  def:35,  reward:140, xp:30 },
  { name:"Demonio Élite",   emoji:"😈", tier:3, hp:450,  atk:88,  def:48,  reward:230, xp:45 },
  { name:"Ángel Caído",     emoji:"😇", tier:3, hp:500,  atk:95,  def:55,  reward:260, xp:50 },
  { name:"Dragón Arcano",   emoji:"🔥", tier:4, hp:800,  atk:140, def:80,  reward:420, xp:80 },
  { name:"Titán del Vacío", emoji:"🌌", tier:5, hp:2000, atk:400, def:280, reward:900, xp:150},
];

/* Costo de entrenamiento progresivo */
const TRAIN_COST = (lvl) => 30 + lvl * 15;

/* ── ANIME ART ── */
function AnimeArt({ char, rarity, w=160, h=200 }) {
  const {imgs, onErr} = useContext(ImgCtx);
  const imageUrl = imgs[char.name];

  const isDivine = rarity === "divine";

  if (imageUrl === "__loading__") {
    return (
      <div style={{width:w, height:h, background:C.bg3, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden"}}>
        <style>{`@keyframes img_pulse{0%,100%{opacity:.25}50%{opacity:.55}}`}</style>
        <div style={{
          position:"absolute", inset:0,
          background:`linear-gradient(135deg, ${char.c}12 0%, ${char.c}06 50%, ${char.c}12 100%)`,
          animation:"img_pulse 1.8s ease-in-out infinite",
        }}/>
        <div style={{fontSize:w>80?22:14, marginBottom:4, opacity:.5}}>{["✨","🎨","⭐","💫","🌟"][Math.floor(Date.now()/600)%5]}</div>
        <div style={{fontSize:w>80?10:8, color:char.c, opacity:.45, fontWeight:700, letterSpacing:1}}>GENERANDO</div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div style={{width:w, height:h, overflow:"hidden", display:"block", position:"relative"}}>
        <img src={imageUrl} alt={char.name} onError={()=>onErr(char.name)}
          style={{width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block"}}/>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}
          viewBox="0 0 160 200" preserveAspectRatio="none">
          <rect x="5" y="5" width="16" height="2" fill={char.c} opacity=".7"/>
          <rect x="5" y="5" width="2" height="16" fill={char.c} opacity=".7"/>
          <rect x="139" y="5" width="16" height="2" fill={char.c} opacity=".7"/>
          <rect x="153" y="5" width="2" height="16" fill={char.c} opacity=".7"/>
          <rect x="0" y="175" width="160" height="25" fill={C.bg} opacity=".55"/>
        </svg>
        {isDivine && <div style={{position:"absolute",inset:0,boxShadow:"inset 0 0 30px #ffffff33",pointerEvents:"none"}}/>}
      </div>
    );
  }

  return (
    <div style={{width:w, height:h, background:C.bg3, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden"}}>
      <div style={{
        position:"absolute", inset:0,
        background:`linear-gradient(135deg,${char.c}12 0%,${char.c}06 50%,${char.c}12 100%)`,
        animation:"img_pulse 1.8s ease-in-out infinite",
      }}/>
      <div style={{fontSize:w>80?20:13, opacity:.4}}>{["✨","🎨","⭐","💫","🌟"][Math.floor(Date.now()/600)%5]}</div>
      <div style={{fontSize:w>80?9:7, color:char.c, opacity:.4, fontWeight:700, letterSpacing:1, marginTop:4}}>AI</div>
    </div>
  );
}

/* ITEMS */
const ITEMS = {
  health_potion:{ name:"Poción HP",    emoji:"🧪", color:C.green,  desc:"Restaura HP al 100%",       effect:c=>({...c,hp:c.maxHp,status:c.status==="injured"?"idle":c.status}) },
  medicine:     { name:"Medicina",     emoji:"🌿", color:C.cyan,   desc:"+40 HP, cura herida",        effect:c=>({...c,hp:Math.min(c.maxHp,c.hp+40),status:c.status==="injured"?"idle":c.status}) },
  food:         { name:"Comida",       emoji:"🍖", color:"#ff9800", desc:"+20 HP",                    effect:c=>({...c,hp:Math.min(c.maxHp,c.hp+20)}) },
  ration:       { name:"Ración",       emoji:"🥩", color:"#ffd54f", desc:"+15 HP +5% éxito misión",  effect:c=>({...c,hp:Math.min(c.maxHp,c.hp+15),missionBonus:(c.missionBonus||0)+0.05}) },
  atk_potion:   { name:"Elixir ATK",   emoji:"⚔️", color:C.red,    desc:"+20 ATK próxima misión",    effect:c=>({...c,atk:c.atk+20,atkBuff:(c.atkBuff||0)+1}) },
  shield:       { name:"Escudo",       emoji:"🛡️", color:C.pink,   desc:"Absorbe 1 fallo en misión", effect:c=>({...c,shielded:true}) },
  antidote:     { name:"Antídoto",     emoji:"🧪", color:"#ea80fc", desc:"Cura estado traumatizado",  effect:c=>({...c,emotionalState:"idle"}) },
  elixir:       { name:"Elixir Épico", emoji:"✨", color:C.gold,   desc:"+50HP +10ATK permanente",   effect:c=>({...c,hp:Math.min(c.maxHp+20,c.hp+50),atk:c.atk+10,maxHp:c.maxHp+20}) },
  revive:       { name:"Revive",       emoji:"👻", color:C.gold,   desc:"Revive con 50% HP",         effect:c=>({...c,hp:Math.floor(c.maxHp*0.5),status:"idle",emotionalState:"traumatized"}) },
};
const ITEM_ORDER=["health_potion","medicine","food","ration","atk_potion","shield","antidote","elixir","revive"];

const CARD_PACKS = [
  { id:"cp1", name:"Sobre Común",      price:40,  color:"#78909c", rates:{common:75,uncommon:18,rare:6,epic:1,legendary:0},   desc:"Una carta aleatoria" },
  { id:"cp2", name:"Sobre Plata",      price:110, color:C.cyan,    rates:{common:45,uncommon:35,rare:16,epic:3,legendary:1},  desc:"Una carta con mejores odds" },
  { id:"cp3", name:"Sobre Oro",        price:260, color:C.gold,    rates:{common:20,uncommon:30,rare:32,epic:14,legendary:4}, desc:"Alta probabilidad rara+" },
  { id:"cp4", name:"Sobre Legendario", price:600, color:C.pink,    rates:{common:5,uncommon:15,rare:30,epic:30,legendary:20}, desc:"Garantía épica o mejor" },
];

const ITEM_PACKS = [
  { id:"ip1", name:"Kit Sanación", price:35,  color:C.green, emoji:"🧪", pool:[["health_potion",0.5],["medicine",0.5]],                                               desc:"1 ítem de curación" },
  { id:"ip2", name:"Kit Combate",  price:45,  color:C.red,   emoji:"⚔️", pool:[["atk_potion",0.5],["ration",0.3],["shield",0.2]],                                    desc:"1 ítem de combate" },
  { id:"ip3", name:"Kit Soporte",  price:55,  color:C.cyan,  emoji:"🛡️", pool:[["shield",0.4],["antidote",0.4],["food",0.2]],                                        desc:"1 ítem de soporte" },
  { id:"ip4", name:"Kit Premium",  price:180, color:C.pink,  emoji:"✨", pool:[["elixir",0.3],["revive",0.25],["shield",0.2],["atk_potion",0.15],["health_potion",0.1]], count:2, desc:"2 ítems raros" },
];

const MISSIONS = [
  { id:"m1", name:"Bosque Oscuro",    time:15,  baseReward:25,  baseRisk:0.35, minTier:0, emoji:"🌲", bg:"#071007" },
  { id:"m2", name:"Mina Maldita",     time:30,  baseReward:55,  baseRisk:0.45, minTier:1, emoji:"⛏️", bg:"#130a07" },
  { id:"m3", name:"Torre del Abismo", time:50,  baseReward:100, baseRisk:0.55, minTier:2, emoji:"🏰", bg:"#07071a" },
  { id:"m4", name:"Cripta Eterna",    time:90,  baseReward:190, baseRisk:0.65, minTier:3, emoji:"💀", bg:"#13071a" },
  { id:"m5", name:"El Imposible",     time:150, baseReward:480, baseRisk:0.78, minTier:4, emoji:"⚠️", bg:"#150505" },
];

function rollRarity(rates){
  let r=Math.random()*100;
  for(const[k,v]of Object.entries(rates)){r-=v;if(r<=0)return k;}
  return "common";
}
function rollItemFromPool(pool){
  let r=Math.random();
  for(const[k,p]of pool){r-=p;if(r<=0)return k;}
  return pool[0][0];
}
function makeCard(rarity,rates){
  const r=rarity||rollRarity(rates||{common:100});
  const ch=CHARS.filter(c=>c.name!=="Zero")[Math.floor(Math.random()*(CHARS.length-1))];
  const tier=RARITY[r].tier;
  return{
    id:Math.random().toString(36).slice(2,10),
    charIdx:CHARS.indexOf(ch),
    name:ch.name,role:ch.role,cls:ch.cls,atkT:ch.atkT,color:ch.c,
    rarity:r,
    hp:70+tier*28+Math.floor(Math.random()*18),
    maxHp:88+tier*28,
    atk:10+tier*13+Math.floor(Math.random()*9),
    def:4+tier*5+Math.floor(Math.random()*4),
    spd:8+tier*7+Math.floor(Math.random()*7),
    level:1,xp:0,trainLevel:0,
    status:"idle",emotionalState:"idle",
    shielded:false,atkBuff:0,missionBonus:0,
    missionEnd:null,currentMission:null,restEnd:null,
  };
}
function makeZeroCard(){
  const ch=CHARS.find(c=>c.name==="Zero");
  return{
    id:"zero_"+Math.random().toString(36).slice(2,8),
    charIdx:CHARS.indexOf(ch),
    name:"Zero",role:"La Absoluta",cls:"Vacío",atkT:"Aniquilación",color:"#ffffff",
    rarity:"divine",
    hp:9999,maxHp:9999,
    atk:999,def:999,spd:999,
    level:99,xp:0,trainLevel:0,
    status:"idle",emotionalState:"motivated",
    shielded:true,atkBuff:0,missionBonus:-0.95,
    missionEnd:null,currentMission:null,restEnd:null,
    unique:true,
  };
}
function calcMissionStats(card,mission){
  if(!card||!mission)return null;
  const tier=RARITY[card.rarity].tier;
  let fail=mission.baseRisk;
  fail-=tier*0.05;
  fail-=(card.def/150)*0.07;
  fail-=(card.spd/120)*0.04;
  if(card.shielded)fail-=0.12;
  if(card.emotionalState==="traumatized")fail+=0.15;
  if(card.emotionalState==="motivated")fail-=0.07;
  fail-=(card.missionBonus||0);
  fail=Math.max(0.05,Math.min(0.95,fail));
  const rew=Math.round(mission.baseReward*(1+tier*0.18+(card.atk/250)*0.15+(card.atkBuff>0?0.12:0)));
  const bonusPct=Math.min(55,tier*9+(card.atk/400)*10);
  return{
    failPct:Math.round(fail*100),
    successPct:Math.round((1-fail)*100),
    reward:rew,bonusReward:Math.round(rew*1.6),
    bonusPct:Math.round(bonusPct),
    xpGain:12+tier*7,
  };
}

function CatLogo({size=28}){
  return(
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="19" rx="10" ry="9" fill="#111"/>
      <polygon points="8,11 5,3 12,9" fill="#111"/>
      <polygon points="24,11 27,3 20,9" fill="#111"/>
      <circle cx="12.5" cy="19" r="2.8" fill={C.gold} opacity=".95"/>
      <circle cx="19.5" cy="19" r="2.8" fill={C.gold} opacity=".95"/>
      <circle cx="12.5" cy="19" r="1.3" fill="#07071a"/>
      <circle cx="19.5" cy="19" r="1.3" fill="#07071a"/>
      <path d="M14 23 Q16 25 18 23" stroke={C.gold} strokeWidth="1.1" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Stars({count,color}){
  const total=Math.max(5,count);
  return(
    <span style={{display:"inline-flex",gap:1}}>
      {Array.from({length:total},(_,i)=>(
        <span key={i} style={{fontSize:8,color:i<count?color:"#2a2a3a",lineHeight:1,
          textShadow:i<count&&color==="#ffffff"?`0 0 6px #fff`:undefined}}>★</span>
      ))}
    </span>
  );
}

function CardUI({card,selected,onClick,mini=false}){
  const r=RARITY[card.rarity]||RARITY.common;
  const ch=CHARS[card.charIdx]||CHARS[0];
  const hpPct=Math.round((card.hp/card.maxHp)*100);
  const stCol={idle:C.green,mission:C.gold,injured:C.red,resting:C.cyan}[card.status]||C.muted;
  const isDivine=card.rarity==="divine";

  if(mini)return(
    <div onClick={onClick} style={{
      background:selected?`${r.color}18`:isDivine?"#0a0a16":C.bg3,
      border:`1.5px solid ${selected?r.color:isDivine?"#ffffff30":"#ffffff0e"}`,
      borderRadius:10,padding:8,cursor:"pointer",
      width:92,textAlign:"center",userSelect:"none",
      boxShadow:selected?`0 0 16px ${r.glow}`:isDivine?"0 0 20px #ffffff18":"none",
      transition:"all .18s",position:"relative",
    }}>
      {selected&&<div style={{position:"absolute",top:-7,right:-7,background:r.color,color:isDivine?"#000":"#000",
        borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>✓</div>}
      <div style={{height:72,overflow:"hidden",borderRadius:6,marginBottom:4}}>
        <AnimeArt char={ch} rarity={card.rarity} w={92} h={72}/>
      </div>
      <div style={{fontSize:11,fontWeight:700,color:isDivine?"#fff":"#fff",
        textShadow:isDivine?"0 0 8px #fff":undefined}}>{card.name}</div>
      <Stars count={r.stars} color={r.color}/>
    </div>
  );

  return(
    <div onClick={onClick} style={{
      background:isDivine?`linear-gradient(170deg,#0a0a1a,#1a1a2e)`:`linear-gradient(170deg,${C.bg3} 60%,${r.color}0d)`,
      border:`1.5px solid ${isDivine?"#ffffff40":r.color+"28"}`,
      borderRadius:14,overflow:"hidden",
      cursor:onClick?"pointer":"default",
      width:160,flexShrink:0,userSelect:"none",
      boxShadow:isDivine?"0 0 40px #ffffff22,0 4px 20px #00000080":selected?`0 0 26px ${r.glow},0 4px 20px #00000080`:`0 4px 16px #00000055`,
      transition:"transform .2s,box-shadow .2s",position:"relative",
    }}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=isDivine?"0 0 60px #ffffff33,0 8px 28px #00000090":`0 0 30px ${r.glow},0 8px 28px #00000090`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=isDivine?"0 0 40px #ffffff22,0 4px 20px #00000080":selected?`0 0 26px ${r.glow},0 4px 20px #00000080`:`0 4px 16px #00000055`;}}
    >
      {selected&&<div style={{position:"absolute",top:8,right:8,background:r.color,color:"#000",
        borderRadius:"50%",width:22,height:22,fontSize:12,fontWeight:900,
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:4}}>✓</div>}
      {isDivine&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#ffffff04,#ffffff08,#ffffff04)",pointerEvents:"none",zIndex:1}}/>}
      <div style={{height:190,overflow:"hidden",position:"relative"}}>
        <AnimeArt char={ch} rarity={card.rarity} w={160} h={190}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:55,
          background:`linear-gradient(transparent,${C.bg3})`}}/>
        <div style={{position:"absolute",top:8,left:8,
          background:isDivine?"#00000099":"#00000088",border:`1px solid ${r.color}55`,
          borderRadius:20,padding:"2px 8px",fontSize:9,color:r.color,
          fontWeight:700,backdropFilter:"blur(6px)",zIndex:2,
          textShadow:isDivine?"0 0 8px #fff":undefined}}>
          {r.label}
        </div>
        {card.status!=="idle"&&<div style={{position:"absolute",bottom:12,right:8,
          background:"#00000099",border:`1px solid ${stCol}44`,borderRadius:20,
          padding:"2px 8px",fontSize:9,color:stCol,fontWeight:700,zIndex:2}}>
          {card.status==="mission"?"🎯 Misión":card.status==="injured"?"🩹 Herida":"😴 Desc."}
        </div>}
        {card.shielded&&<div style={{position:"absolute",top:8,right:8,fontSize:13,zIndex:2}}>🛡️</div>}
        {card.atkBuff>0&&<div style={{position:"absolute",top:28,right:8,fontSize:11,
          color:C.red,fontWeight:700,textShadow:`0 0 8px ${C.red}`,zIndex:2}}>+ATK</div>}
      </div>
      <div style={{padding:"10px 12px 12px",position:"relative",zIndex:2}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:.3,
              textShadow:isDivine?"0 0 10px #fff":undefined}}>{card.name}</div>
            <div style={{fontSize:10,color:ch.c,marginTop:1}}>{card.role}</div>
          </div>
          <Stars count={r.stars} color={r.color}/>
        </div>
        <div style={{marginTop:7,marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:2}}>
            <span>HP</span><span style={{color:isDivine?C.divine:hpPct>60?C.green:hpPct>30?C.gold:C.red}}>{card.hp}/{card.maxHp}</span>
          </div>
          <div style={{height:3,background:"#ffffff0e",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,
              background:isDivine?C.divine:hpPct>60?C.green:hpPct>30?C.gold:C.red,
              width:(isDivine?100:hpPct)+"%",transition:"width .4s",
              boxShadow:isDivine?"0 0 10px #fff88":hpPct>60?`0 0 6px ${C.green}88`:hpPct>30?`0 0 6px ${C.gold}88`:`0 0 6px ${C.red}88`}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,fontSize:10}}>
          <span style={{color:"#ff7043"}}>⚔️ {card.atk}</span>
          <span style={{color:"#42a5f5"}}>🛡️ {card.def}</span>
          <span style={{color:"#ab47bc"}}>💨 {card.spd}</span>
          {card.level>1&&<span style={{color:C.gold,marginLeft:"auto"}}>Lv{card.level}</span>}
        </div>
      </div>
    </div>
  );
}

function CardPackReveal({card,onClose}){
  const[visible,setVisible]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVisible(true),150);return()=>clearTimeout(t);},[]);
  const r=RARITY[card.rarity]||RARITY.common;
  const isDivine=card.rarity==="divine";
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(40px) scale(.7)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes pulse_ring{0%,100%{opacity:.6}50%{opacity:1}}@keyframes divine_glow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}`}</style>
      <div style={{fontSize:16,fontWeight:900,letterSpacing:5,color:isDivine?"#fff":C.pink,textShadow:`0 0 20px ${isDivine?"#fff":C.pink}`}}>
        {isDivine?"✦ CARTA DIVINA OBTENIDA ✦":"✦ CARTA OBTENIDA ✦"}
      </div>
      <div style={{opacity:visible?1:0,animation:visible?"rise .6s cubic-bezier(.34,1.56,.64,1) both":"none"}}>
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{position:"absolute",inset:-20,borderRadius:30,
            background:`radial-gradient(circle,${r.glow} 0%,transparent 70%)`,
            animation:isDivine?"divine_glow 1.5s infinite":"pulse_ring 1.5s infinite"}}/>
          <CardUI card={card}/>
        </div>
      </div>
      {visible&&(
        <button onClick={onClose} style={{
          background:"transparent",color:isDivine?"#fff":C.pink,border:`2px solid ${isDivine?"#fff":C.pink}`,
          borderRadius:10,padding:"10px 44px",fontSize:15,fontWeight:900,
          cursor:"pointer",letterSpacing:2,boxShadow:`0 0 20px ${isDivine?"#ffffff44":C.pink+"44"}`,transition:"all .2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=isDivine?"#fff":C.pink;e.currentTarget.style.color="#000";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=isDivine?"#fff":C.pink;}}>
          CONTINUAR
        </button>
      )}
    </div>
  );
}

function ItemPackReveal({items:got,onClose}){
  const[vis,setVis]=useState([]);
  useEffect(()=>{got.forEach((_,i)=>setTimeout(()=>setVis(p=>[...p,i]),300+i*400));},[]);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <div style={{fontSize:16,fontWeight:900,letterSpacing:4,color:C.cyan,textShadow:`0 0 20px ${C.cyan}`}}>✦ ÍTEMS OBTENIDOS ✦</div>
      <div style={{display:"flex",gap:20}}>
        {got.map((k,i)=>{
          const it=ITEMS[k];
          return(
            <div key={i} style={{
              opacity:vis.includes(i)?1:0,
              transform:vis.includes(i)?"scale(1)":"scale(.5)",
              transition:"all .5s cubic-bezier(.34,1.56,.64,1)",
              background:C.bg3,border:`2px solid ${it.color}`,borderRadius:18,
              padding:"28px 28px",textAlign:"center",minWidth:140,
              boxShadow:`0 0 40px ${it.color}44`,
            }}>
              <div style={{fontSize:52,marginBottom:8}}>{it.emoji}</div>
              <div style={{fontSize:15,fontWeight:800,color:it.color}}>{it.name}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>{it.desc}</div>
            </div>
          );
        })}
      </div>
      {vis.length===got.length&&(
        <button onClick={onClose} style={{background:"transparent",color:C.cyan,border:`2px solid ${C.cyan}`,
          borderRadius:10,padding:"10px 44px",fontSize:15,fontWeight:900,cursor:"pointer",letterSpacing:2}}>
          CONTINUAR
        </button>
      )}
    </div>
  );
}

function MissionModal({mission,cards,onSend,onClose}){
  const[sel,setSel]=useState(null);
  const sc=sel?cards.find(c=>c.id===sel):null;
  const stats=calcMissionStats(sc,mission);
  const avail=cards.filter(c=>c.status==="idle"&&RARITY[c.rarity].tier>=mission.minTier);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.pink}28`,borderRadius:20,
        maxWidth:860,width:"100%",maxHeight:"90vh",overflow:"auto",position:"relative"}}>
        <div style={{background:`linear-gradient(90deg,${mission.bg},${C.bg2})`,
          borderBottom:`1px solid ${C.pink}18`,padding:"18px 24px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:5,backdropFilter:"blur(8px)"}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:1}}>{mission.emoji} {mission.name}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              ⏱ {mission.time}s · Min: {RARITY[FUSION_MAP[mission.minTier]]?.label} · Base: {mission.baseReward} COIN · Riesgo: {Math.round(mission.baseRisk*100)}%
            </div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.muted}33`,
            color:C.muted,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap"}}>
          <div style={{flex:"1 1 360px",padding:20}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:14,letterSpacing:2}}>SELECCIONA PERSONAJE</div>
            {avail.length===0&&<div style={{color:C.red,fontSize:13}}>Sin personajes disponibles.</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {avail.map(c=>(
                <div key={c.id} onClick={()=>setSel(c.id===sel?null:c.id)}>
                  <CardUI card={c} selected={sel===c.id} mini/>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:"0 0 264px",borderLeft:`1px solid ${C.border}`,padding:20,minHeight:320}}>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:14,letterSpacing:2}}>ESTADÍSTICAS</div>
            {!sc&&<div style={{color:C.muted,fontSize:13,textAlign:"center",marginTop:40}}>👉 Elige un personaje</div>}
            {sc&&stats&&(
              <div>
                <div style={{background:C.bg3,border:`1px solid ${RARITY[sc.rarity].color}22`,
                  borderRadius:12,padding:10,marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:48,height:60,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                    <AnimeArt char={CHARS[sc.charIdx]||CHARS[0]} rarity={sc.rarity} w={48} h={60}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{sc.name}</div>
                    <div style={{fontSize:10,color:RARITY[sc.rarity].color}}>{RARITY[sc.rarity].label}</div>
                    <Stars count={RARITY[sc.rarity].stars} color={RARITY[sc.rarity].color}/>
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>⚔{sc.atk} 🛡{sc.def} 💨{sc.spd}</div>
                  </div>
                </div>
                {[["✓ Éxito",stats.successPct,C.green],["✕ Fallo",stats.failPct,C.red]].map(([l,v,col])=>(
                  <div key={l} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:col}}>{l}</span>
                      <span style={{fontSize:15,fontWeight:900,color:col,textShadow:`0 0 10px ${col}88`}}>{v}%</span>
                    </div>
                    <div style={{height:8,background:"#ffffff08",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",background:col,borderRadius:4,width:v+"%",boxShadow:`0 0 12px ${col}88`,transition:"width .4s"}}/>
                    </div>
                  </div>
                ))}
                <div style={{background:C.bg3,border:`1px solid ${C.gold}18`,borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8,letterSpacing:1}}>RECOMPENSAS</div>
                  {[["COIN base",`+${stats.reward}`,C.gold],[`Bonus (${stats.bonusPct}%)`,`+${stats.bonusReward}`,C.gold],["XP",`+${stats.xpGain}`,C.cyan]].map(([l,v,col])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:C.muted}}>{l}</span>
                      <span style={{fontSize:12,color:col,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
                {(sc.shielded||sc.atkBuff>0||sc.emotionalState!=="idle")&&(
                  <div style={{background:C.bg3,border:`1px solid ${C.pink}18`,borderRadius:10,padding:10,marginBottom:12}}>
                    {sc.shielded&&<div style={{fontSize:11,color:C.pink,marginBottom:2}}>🛡️ Escudo activo</div>}
                    {sc.atkBuff>0&&<div style={{fontSize:11,color:C.red,marginBottom:2}}>⚔️ +20 ATK buff</div>}
                    {sc.emotionalState==="motivated"&&<div style={{fontSize:11,color:C.green}}>💪 Motivada</div>}
                    {sc.emotionalState==="traumatized"&&<div style={{fontSize:11,color:C.red}}>😰 Traumatizada</div>}
                  </div>
                )}
                <button onClick={()=>onSend(sc.id,mission)}
                  style={{width:"100%",background:C.pink,color:"#000",border:"none",
                    borderRadius:10,padding:"12px 0",fontWeight:900,fontSize:14,cursor:"pointer",
                    letterSpacing:1,boxShadow:`0 0 22px ${C.pink}55`,transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.cyan;e.currentTarget.style.boxShadow=`0 0 22px ${C.cyan}55`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=C.pink;e.currentTarget.style.boxShadow=`0 0 22px ${C.pink}55`;}}>
                  🚀 ENVIAR (5 COIN)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CODE MODAL ── */
function CodeModal({onClose,onRedeem}){
  const[val,setVal]=useState("");
  return(
    <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.cyan}30`,borderRadius:20,padding:"32px 36px",width:"100%",maxWidth:380,boxShadow:`0 0 60px ${C.cyan}15`}}>
        <div style={{fontSize:18,fontWeight:900,color:C.cyan,letterSpacing:3,marginBottom:6,textAlign:"center",textShadow:`0 0 16px ${C.cyan}88`}}>🔑 CÓDIGO SECRETO</div>
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:20}}>Ingresa un código para desbloquear recompensas únicas</div>
        <input value={val} onChange={e=>setVal(e.target.value.toUpperCase())}
          placeholder="CÓDIGO..."
          style={{width:"100%",background:C.bg3,border:`1px solid ${C.cyan}30`,borderRadius:10,
            padding:"12px 16px",color:C.text,fontSize:16,outline:"none",
            textAlign:"center",letterSpacing:4,fontWeight:700,marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"transparent",color:C.muted,
            border:`1px solid ${C.muted}22`,borderRadius:10,padding:"10px 0",cursor:"pointer",fontSize:13}}>
            Cancelar
          </button>
          <button onClick={()=>onRedeem(val)} style={{flex:2,background:C.cyan,color:"#000",
            border:"none",borderRadius:10,padding:"10px 0",fontWeight:900,fontSize:14,cursor:"pointer",
            boxShadow:`0 0 20px ${C.cyan}44`}}>
            CANJEAR
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── DAILY BONUS MODAL ── */
function DailyModal({reward,streak,onClaim}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`2px solid ${C.gold}44`,borderRadius:24,padding:"40px 44px",textAlign:"center",boxShadow:`0 0 80px ${C.gold}22`}}>
        <style>{`@keyframes bonus_pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{fontSize:52,marginBottom:8,animation:"bonus_pop .6s cubic-bezier(.34,1.56,.64,1) both"}}>🎁</div>
        <div style={{fontSize:22,fontWeight:900,color:C.gold,letterSpacing:2,textShadow:`0 0 20px ${C.gold}88`}}>BONUS DIARIO</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4,marginBottom:20}}>Racha: {streak} {streak>1?"días consecutivos":"día"}</div>
        <div style={{fontSize:48,fontWeight:900,color:C.gold,textShadow:`0 0 30px ${C.gold}`,marginBottom:24}}>
          +{reward} COIN
        </div>
        <button onClick={onClaim} style={{background:C.gold,color:"#000",border:"none",
          borderRadius:12,padding:"14px 50px",fontWeight:900,fontSize:16,cursor:"pointer",
          boxShadow:`0 0 30px ${C.gold}55`,letterSpacing:1}}>
          ¡RECLAMAR!
        </button>
      </div>
    </div>
  );
}

/* ── ARENA RESULT MODAL ── */
function ArenaResultModal({result,onClose}){
  const won=result.won;
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`2px solid ${won?C.gold:C.red}44`,borderRadius:22,padding:"32px 36px",textAlign:"center",maxWidth:360,width:"100%",boxShadow:`0 0 60px ${won?C.gold:C.red}22`}}>
        <div style={{fontSize:44,marginBottom:8}}>{won?"🏆":"💀"}</div>
        <div style={{fontSize:22,fontWeight:900,color:won?C.gold:C.red,letterSpacing:2,textShadow:`0 0 16px ${won?C.gold:C.red}`}}>
          {won?"¡VICTORIA!":"DERROTA"}
        </div>
        <div style={{fontSize:13,color:C.muted,marginTop:4,marginBottom:16}}>
          {result.card.name} vs {result.enemy.emoji} {result.enemy.name}
        </div>
        <div style={{background:C.bg3,borderRadius:12,padding:14,marginBottom:20,textAlign:"left"}}>
          {[
            [won?"COIN ganado":"COIN ganado",`+${result.coinGain}`,won?C.gold:C.muted],
            ["XP ganado",`+${result.xpGain}`,C.cyan],
            ["Rondas",`${result.rounds}`,C.muted],
          ].map(([l,v,col])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.muted}}>{l}</span>
              <span style={{fontSize:13,fontWeight:700,color:col}}>{v}</span>
            </div>
          ))}
          {result.leveledUp&&<div style={{fontSize:12,color:C.gold,marginTop:4}}>⬆️ {result.card.name} subió de nivel!</div>}
        </div>
        <button onClick={onClose} style={{width:"100%",background:won?C.gold:C.red,color:"#000",
          border:"none",borderRadius:10,padding:"11px 0",fontWeight:900,fontSize:14,cursor:"pointer"}}>
          CONTINUAR
        </button>
      </div>
    </div>
  );
}

/* ── LOGIN SCREEN ── */
function LoginScreen({onAuth}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[mode,setMode]=useState("login");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);

  async function handle(e){
    e.preventDefault();
    setErr("");setLoading(true);
    let res;
    if(mode==="register") res=await supabase.auth.signUp({email,password:pass});
    else                  res=await supabase.auth.signInWithPassword({email,password:pass});
    setLoading(false);
    if(res.error){setErr(res.error.message);return;}
    if(mode==="register"&&!res.data?.session){
      setErr("Revisa tu correo para confirmar la cuenta.");return;
    }
    onAuth(res.data.session||res.data.user);
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.pink}28`,borderRadius:20,padding:"40px 36px",width:"100%",maxWidth:380,boxShadow:`0 0 60px ${C.pink}12`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <CatLogo size={44}/>
          <div style={{fontSize:28,fontWeight:900,color:C.pink,letterSpacing:3,marginTop:8,textShadow:`0 0 20px ${C.pink}88`}}>COIN</div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:4}}>CARD UNIVERSE</div>
        </div>
        <form onSubmit={handle}>
          <div style={{marginBottom:12}}>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              type="email" placeholder="Correo" required
              style={{width:"100%",background:C.bg3,border:`1px solid ${C.pink}22`,borderRadius:10,
                padding:"11px 14px",color:C.text,fontSize:14,outline:"none"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <input value={pass} onChange={e=>setPass(e.target.value)}
              type="password" placeholder="Contraseña (mín. 6 chars)" required minLength={6}
              style={{width:"100%",background:C.bg3,border:`1px solid ${C.pink}22`,borderRadius:10,
                padding:"11px 14px",color:C.text,fontSize:14,outline:"none"}}/>
          </div>
          {err&&<div style={{color:C.red,fontSize:12,marginBottom:12,textAlign:"center"}}>{err}</div>}
          <button type="submit" disabled={loading}
            style={{width:"100%",background:C.pink,color:"#000",border:"none",borderRadius:10,
              padding:"12px 0",fontWeight:900,fontSize:15,cursor:"pointer",
              boxShadow:`0 0 24px ${C.pink}44`,marginBottom:12}}>
            {loading?"...":(mode==="login"?"Entrar":"Registrarse")}
          </button>
          <div style={{textAlign:"center"}}>
            <button type="button" onClick={()=>{setMode(m=>m==="login"?"register":"login");setErr("");}}
              style={{background:"none",border:"none",color:C.cyan,cursor:"pointer",fontSize:12}}>
              {mode==="login"?"¿No tienes cuenta? Regístrate":"¿Ya tienes cuenta? Entra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TABS=["Colección","Tienda","Fusión","Misiones","Arena"];

const DEFAULT_ITEMS={health_potion:2,medicine:1,food:1,ration:0,atk_potion:0,shield:0,antidote:0,elixir:0,revive:0};

export default function App(){
  const[user,setUser]=useState(null);
  const[authChecked,setAuthChecked]=useState(false);
  const[tab,setTab]=useState("Colección");
  const[lili,setLili]=useState(300);
  const[cards,setCards]=useState([makeCard("common"),makeCard("common"),makeCard("uncommon")]);
  const[items,setItems]=useState(DEFAULT_ITEMS);
  const[cardReveal,setCardReveal]=useState(null);
  const[itemReveal,setItemReveal]=useState(null);
  const[pendingRewards,setPendingRewards]=useState([]);
  const[fusionA,setFusionA]=useState(null);
  const[fusionB,setFusionB]=useState(null);
  const[fusionResult,setFusionResult]=useState(null);
  const[autoFusing,setAutoFusing]=useState(false);
  const[activeMission,setActiveMission]=useState(null);
  const[activeCard,setActiveCard]=useState(null);
  const[collFilter,setCollFilter]=useState("all");
  const[toast,setToast]=useState(null);
  const[now,setNow]=useState(Date.now());
  /* imagen */
  const[cardImages,setCardImages]=useState(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem("lili_imgs")||"{}");
      return Object.fromEntries(Object.entries(saved).filter(([,v])=>v!=="__loading__"));
    }catch{ return {}; }
  });
  const genRef=useRef(new Set());
  const saveTimer=useRef(null);
  /* nuevas mecánicas */
  const[codeModal,setCodeModal]=useState(false);
  const[arenaEnemy,setArenaEnemy]=useState(null);
  const[arenaFighter,setArenaFighter]=useState(null);
  const[arenaResult,setArenaResult]=useState(null);
  const[dailyModal,setDailyModal]=useState(false);
  const[dailyReward,setDailyReward]=useState(0);
  const[dailyStreak,setDailyStreak]=useState(1);
  const[redeemed,setRedeemed]=useState(()=>{
    try{return new Set(JSON.parse(localStorage.getItem("redeemed")||"[]"));}
    catch{return new Set();}
  });
  const[trainTarget,setTrainTarget]=useState(null); // cardId siendo entrenada

  // Auth init
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      setAuthChecked(true);
      if(session?.user)loadState(session.user.id);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
      if(session?.user)loadState(session.user.id);
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function loadState(uid){
    const{data}=await supabase.from("player_state").select("*").eq("user_id",uid).single();
    if(data){
      setLili(data.lili);
      setCards(data.cards?.length?data.cards:[makeCard("common"),makeCard("common"),makeCard("uncommon")]);
      setItems(data.items||DEFAULT_ITEMS);
    }
  }

  // Debounced save
  function scheduleSave(newLili,newCards,newItems){
    if(!user)return;
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      await supabase.from("player_state").upsert({
        user_id:user.id,lili:newLili,cards:newCards,items:newItems,updated_at:new Date().toISOString()
      },{onConflict:"user_id"});
    },2000);
  }

  function setLiliS(val){const v=typeof val==="function"?val(lili):val;setLili(v);scheduleSave(v,cards,items);}
  function setCardsS(val){const v=typeof val==="function"?val(cards):val;setCards(v);scheduleSave(lili,v,items);}
  function setItemsS(val){const v=typeof val==="function"?val(items):val;setItems(v);scheduleSave(lili,cards,v);}

  async function logout(){
    await supabase.auth.signOut();
    setUser(null);setLili(300);
    setCards([makeCard("common"),makeCard("common"),makeCard("uncommon")]);
    setItems(DEFAULT_ITEMS);
  }

  // Timers
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);

  // Mission + rest resolution
  useEffect(()=>{
    let dirty=false;
    const next=cards.map(c=>{
      // Auto-curación de heridas (45s gratis)
      if(c.status==="injured"&&c.restEnd&&now>=c.restEnd){
        dirty=true;
        return{...c,status:"idle",hp:Math.min(c.maxHp,Math.floor(c.maxHp*0.5)),restEnd:null};
      }
      if(c.status==="mission"&&c.missionEnd&&now>=c.missionEnd){
        dirty=true;
        const m=MISSIONS.find(x=>x.id===c.currentMission);
        const stats=calcMissionStats(c,m);
        const fail=(stats?.failPct||50)/100;
        const success=!c.shielded?Math.random()>fail:true;
        const atkWas=c.atkBuff>0;
        if(success){
          const bonus=Math.random()<(stats?.bonusPct||10)/100;
          const liliGain=bonus?stats.bonusReward:stats.reward;
          const xpGain=stats?.xpGain||15;
          setPendingRewards(pr=>[...pr,{id:Date.now()+Math.random(),lili:liliGain,bonus,xp:xpGain,charName:c.name,missionName:m?.name,cardId:c.id}]);
          const newXp=c.xp+xpGain;
          const levelUp=newXp>=(c.level*20);
          return{...c,status:"idle",missionEnd:null,currentMission:null,shielded:false,
            atkBuff:Math.max(0,c.atkBuff-1),missionBonus:c.unique?c.missionBonus:0,
            atk:atkWas?c.atk-20:c.atk,
            xp:levelUp?newXp-c.level*20:newXp,
            level:levelUp?c.level+1:c.level,
            def:levelUp?c.def+2:c.def,
            emotionalState:"motivated"};
        } else {
          const dmg=22+Math.floor(Math.random()*32);
          setPendingRewards(pr=>[...pr,{id:Date.now()+Math.random(),lili:0,bonus:false,xp:0,charName:c.name,missionName:m?.name,failed:true,dmg,cardId:c.id}]);
          return{...c,status:"injured",missionEnd:null,currentMission:null,shielded:false,missionBonus:0,
            hp:Math.max(5,c.hp-dmg),emotionalState:"traumatized",
            restEnd:Date.now()+45000}; // auto-cura en 45s
        }
      }
      return c;
    });
    if(dirty)setCardsS(next);
  },[now]);

  function toast_(msg){setToast(msg);setTimeout(()=>setToast(null),2600);}

  // Genera imágenes
  async function genImages(names){
    for(const name of names){
      if(genRef.current.has(name))continue;
      genRef.current.add(name);
      const ch=CHARS.find(c=>c.name===name);
      if(!ch){genRef.current.delete(name);continue;}
      setCardImages(prev=>({...prev,[name]:"__loading__"}));
      try{
        const r=await fetch("/api/gen",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({prompt:CHAR_PROMPTS[name]||`${BASE_STYLE}, ${ch.role}`})});
        const d=await r.json();
        if(d.image){
          setCardImages(prev=>{
            const next={...prev,[name]:d.image};
            try{localStorage.setItem("lili_imgs",JSON.stringify(Object.fromEntries(Object.entries(next).filter(([,v])=>v!=="__loading__"))));}catch{}
            return next;
          });
        }else{
          setCardImages(prev=>{const n={...prev};if(n[name]==="__loading__")delete n[name];return n;});
        }
      }catch{
        setCardImages(prev=>{const n={...prev};if(n[name]==="__loading__")delete n[name];return n;});
      }finally{genRef.current.delete(name);}
    }
  }

  function clearAndRegen(name){
    genRef.current.delete(name);
    setCardImages(prev=>{
      const next={...prev};delete next[name];
      try{const s=JSON.parse(localStorage.getItem("lili_imgs")||"{}");delete s[name];localStorage.setItem("lili_imgs",JSON.stringify(s));}catch{}
      return next;
    });
    genImages([name]);
  }

  // Auto-generar al montar
  useEffect(()=>{
    try{localStorage.removeItem("lili_imgs");}catch{}
    setCardImages({});
    genImages(CHARS.map(c=>c.name));
  },[]);

  // Auto-generar cartas nuevas
  useEffect(()=>{
    const missing=[...new Set(cards.map(c=>c.name))].filter(n=>!cardImages[n]&&!genRef.current.has(n));
    if(missing.length>0)genImages(missing);
  },[cards]);

  // Bonus diario
  useEffect(()=>{
    const today=new Date().toDateString();
    const last=localStorage.getItem("last_daily");
    if(last!==today){
      const streak=Math.min(10,parseInt(localStorage.getItem("daily_streak")||"0")+1);
      const reward=Math.min(600,100+(streak-1)*60);
      setDailyReward(reward);setDailyStreak(streak);setDailyModal(true);
      localStorage.setItem("last_daily",today);
      localStorage.setItem("daily_streak",streak.toString());
    }
  },[]);

  // Arena: generar enemigo al entrar al tab
  useEffect(()=>{
    if(tab==="Arena"&&!arenaEnemy)rollArenaEnemy_();
  },[tab]);

  /* ── FUNCIONES ── */
  function buyCardPack(pack){
    if(lili<pack.price){toast_("COIN insuficiente ❌");return;}
    const newLili=lili-pack.price;
    const nc=makeCard(null,pack.rates);
    const newCards=[...cards,nc];
    setLili(newLili);setCards(newCards);scheduleSave(newLili,newCards,items);
    setCardReveal(nc);
  }
  function buyItemPack(pack){
    if(lili<pack.price){toast_("COIN insuficiente ❌");return;}
    const newLili=lili-pack.price;
    const count=pack.count||1;
    const got=Array.from({length:count},()=>rollItemFromPool(pack.pool));
    const newItems={...items};got.forEach(k=>{newItems[k]=(newItems[k]||0)+1;});
    setLili(newLili);setItems(newItems);scheduleSave(newLili,cards,newItems);
    setItemReveal(got);
  }
  function applyItem(itemId,cardId){
    if(!items[itemId]||items[itemId]<1){toast_("Sin ese ítem");return;}
    const newCards=cards.map(c=>c.id===cardId?ITEMS[itemId].effect(c):c);
    const newItems={...items,[itemId]:items[itemId]-1};
    setCards(newCards);setItems(newItems);scheduleSave(lili,newCards,newItems);
    toast_(`${ITEMS[itemId].emoji} Usado en ${cards.find(c=>c.id===cardId)?.name}`);
  }
  function claimReward(rw){
    const newLili=rw.lili>0?lili+rw.lili:lili;
    if(rw.lili>0)setLili(newLili);
    setPendingRewards(pr=>pr.filter(r=>r.id!==rw.id));
    scheduleSave(newLili,cards,items);
    if(!rw.failed) toast_(`✨ +${rw.lili} COIN · ${rw.charName}${rw.bonus?" · BONUS!":""}`);
    else           toast_(`💔 ${rw.charName} falló${rw.dmg?` (-${rw.dmg} HP)`:""}`);
  }
  function claimDailyBonus(){
    const newLili=lili+dailyReward;
    setLiliS(newLili);
    setDailyModal(false);
    toast_(`🎁 +${dailyReward} COIN — Día ${dailyStreak}`);
  }
  function redeemCode(code){
    const c=code.trim().toUpperCase();
    if(c==="NOPEGA1"){
      if(redeemed.has("NOPEGA1")||cards.some(x=>x.name==="Zero")){toast_("Código ya canjeado ❌");return;}
      const zc=makeZeroCard();
      const newCards=[...cards,zc];
      setCardsS(newCards);
      const nr=new Set(redeemed);nr.add("NOPEGA1");setRedeemed(nr);
      try{localStorage.setItem("redeemed",JSON.stringify([...nr]));}catch{}
      setCodeModal(false);
      toast_("⚡ ZERO desbloqueada — LA ABSOLUTA");
      setTimeout(()=>setCardReveal(zc),300);
    } else {
      toast_("Código inválido ❌");
    }
  }
  function sellCard(cardId){
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.unique||card.status==="mission")return;
    const price=SELL_PRICES[card.rarity]||20;
    const newCards=cards.filter(c=>c.id!==cardId);
    const newLili=lili+price;
    setActiveCard(null);
    setCardsS(newCards);
    setLiliS(newLili);
    toast_(`💰 Vendida ${card.name} → +${price} COIN`);
  }
  function sellItem(itemId){
    if(!items[itemId]||items[itemId]<1){toast_("Sin ítems para vender");return;}
    const price=5;
    const newItems={...items,[itemId]:items[itemId]-1};
    const newLili=lili+price;
    setItemsS(newItems);
    setLiliS(newLili);
    toast_(`💰 Vendido ${ITEMS[itemId].name} → +${price} COIN`);
  }
  function trainStat(cardId,stat){
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.unique)return;
    const cost=TRAIN_COST(card.trainLevel||0);
    if(lili<cost){toast_(`Necesitas ${cost} COIN ❌`);return;}
    const boost={hp:15,atk:5,def:4,spd:3}[stat]||5;
    const newCards=cards.map(c=>c.id===cardId?{
      ...c,
      hp:stat==="hp"?c.hp+boost:c.hp,
      maxHp:stat==="hp"?c.maxHp+boost:c.maxHp,
      atk:stat==="atk"?c.atk+boost:c.atk,
      def:stat==="def"?c.def+boost:c.def,
      spd:stat==="spd"?c.spd+boost:c.spd,
      trainLevel:(c.trainLevel||0)+1,
    }:c);
    setCardsS(newCards);
    setLiliS(lili-cost);
    toast_(`💪 +${boost} ${stat.toUpperCase()} en ${card.name} (-${cost} COIN)`);
  }
  function rollArenaEnemy_(){
    const maxTier=cards.length?Math.max(...cards.map(c=>RARITY[c.rarity].tier)):0;
    const tier=Math.min(5,Math.max(0,maxTier+Math.floor(Math.random()*3)-1));
    const pool=ARENA_ENEMIES.filter(e=>e.tier<=Math.max(1,tier));
    setArenaEnemy(pool[Math.floor(Math.random()*pool.length)]);
    setArenaFighter(null);
  }
  function startArenaBattle(){
    const card=cards.find(c=>c.id===arenaFighter);
    const enemy=arenaEnemy;
    if(!card||!enemy){toast_("Selecciona un personaje");return;}
    if(card.status!=="idle"){toast_("El personaje debe estar libre");return;}
    // Simulación de batalla
    let pHP=card.hp,eHP=enemy.hp,rounds=0,leveledUp=false;
    while(pHP>0&&eHP>0&&rounds<200){
      const pDmg=Math.max(1,card.atk-Math.floor(enemy.def*0.6)+Math.floor(Math.random()*12));
      eHP-=pDmg;if(eHP<=0)break;
      const eDmg=Math.max(1,enemy.atk-Math.floor(card.def*0.6)+Math.floor(Math.random()*10));
      if(!card.shielded)pHP-=eDmg;
      else{pHP-=Math.floor(eDmg*0.3);}
      rounds++;
    }
    const won=eHP<=0;
    const coinGain=won?enemy.reward:Math.max(5,Math.floor(enemy.reward*0.08));
    const xpGain=won?enemy.xp:Math.floor(enemy.xp*0.2);
    const newLili=lili+coinGain;
    const newCards=cards.map(c=>{
      if(c.id!==card.id)return c;
      if(c.unique)return{...c,xp:c.xp+xpGain}; // Zero no pierde HP
      const newHP=Math.max(1,Math.floor(c.hp*(pHP/card.hp)));
      const newXp=c.xp+xpGain;
      const lUp=newXp>=(c.level*20);
      if(lUp)leveledUp=true;
      return{
        ...c,
        hp:newHP,
        status:!won&&newHP<c.maxHp*0.25?"injured":c.status,
        restEnd:!won&&newHP<c.maxHp*0.25?Date.now()+45000:c.restEnd,
        emotionalState:won?"motivated":c.emotionalState,
        xp:lUp?newXp-c.level*20:newXp,
        level:lUp?c.level+1:c.level,
        atk:lUp?c.atk+3:c.atk,
        def:lUp?c.def+2:c.def,
      };
    });
    setLiliS(newLili);
    setCardsS(newCards);
    setArenaResult({won,enemy,card,coinGain,xpGain,rounds,leveledUp});
  }
  function doFusion(idA,idB){
    const ca=cards.find(c=>c.id===idA),cb=cards.find(c=>c.id===idB);
    if(!ca||!cb)return null;
    if(ca.rarity!==cb.rarity||ca.rarity==="legendary"||ca.unique||cb.unique)return null;
    if(lili<25){toast_("Necesitas 25 COIN para fusionar");return null;}
    const nxt=FUSION_MAP[FUSION_MAP.indexOf(ca.rarity)+1];
    const result=makeCard(nxt);
    const newLili=lili-25;
    const newCards=cards.filter(c=>c.id!==ca.id&&c.id!==cb.id).concat(result);
    setLili(newLili);setCards(newCards);scheduleSave(newLili,newCards,items);
    return result;
  }
  function manualFusion(){
    const ca=cards.find(c=>c.id===fusionA),cb=cards.find(c=>c.id===fusionB);
    if(!ca||!cb){toast_("Selecciona 2 cartas");return;}
    if(ca.rarity!==cb.rarity){toast_("Misma rareza");return;}
    const result=doFusion(fusionA,fusionB);
    if(result){setFusionResult(result);setFusionA(null);setFusionB(null);toast_(`🔥 Fusión → ${RARITY[result.rarity].label}`);}
  }
  function autoFusion(){
    setAutoFusing(true);
    let current=[...cards],totalFused=0,cost=0,changed=true;
    while(changed){
      changed=false;
      for(const tier of[0,1,2,3]){
        const rar=FUSION_MAP[tier];
        const pool=current.filter(c=>c.status==="idle"&&c.rarity===rar&&!c.unique);
        if(pool.length>=2&&lili-cost>=25){
          const[a,b]=pool;
          const result=makeCard(FUSION_MAP[tier+1]);
          current=current.filter(c=>c.id!==a.id&&c.id!==b.id).concat(result);
          cost+=25;totalFused++;changed=true;break;
        }
      }
    }
    if(totalFused===0){toast_("Sin pares para fusionar");setAutoFusing(false);return;}
    const newLili=lili-cost;
    setLili(newLili);setCards(current);scheduleSave(newLili,current,items);
    toast_(`⚡ Auto-fusión: ${totalFused} fusión${totalFused>1?"es":""} (-${cost} COIN)`);
    setAutoFusing(false);
  }
  function sendOnMission(cardId,mission){
    if(lili<5){toast_("Sin COIN");return;}
    const card=cards.find(c=>c.id===cardId);if(!card)return;
    const newCards=cards.map(c=>c.id===cardId?{...c,status:"mission",missionEnd:Date.now()+mission.time*1000,currentMission:mission.id}:c);
    const newLili=lili-5;
    setCards(newCards);setLili(newLili);scheduleSave(newLili,newCards,items);
    setActiveMission(null);
    toast_(`🎯 ${card.name} → "${mission.name}"`);
  }

  const filterFn={all:()=>true,idle:c=>c.status==="idle",mission:c=>c.status==="mission",injured:c=>c.status==="injured"};
  const filteredCards=cards.filter(filterFn[collFilter]||filterFn.all);
  const pendingCount=pendingRewards.length;

  const NavBtn=({t})=>{
    const isPending=t==="Misiones"&&pendingCount>0;
    return(
      <button onClick={()=>setTab(t)} style={{
        background:tab===t?C.pink:"transparent",color:tab===t?"#000":C.muted,
        border:`1px solid ${tab===t?C.pink:"#ffffff10"}`,
        borderRadius:8,padding:"7px 16px",cursor:"pointer",
        fontWeight:tab===t?800:500,fontSize:13,letterSpacing:.5,
        transition:"all .15s",position:"relative",
        boxShadow:tab===t?`0 0 16px ${C.pink}44`:undefined,
      }}>
        {t}
        {isPending&&<span style={{
          position:"absolute",top:-6,right:-6,background:C.red,color:"#fff",
          borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 8px ${C.red}`,
        }}>{pendingCount}</span>}
      </button>
    );
  };

  if(!authChecked) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:C.muted,fontSize:13}}>...</div></div>;
  if(!user) return <LoginScreen onAuth={u=>setUser(u)}/>;

  return(
    <ImgCtx.Provider value={{imgs:cardImages, onErr:clearAndRegen}}>
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`
        @keyframes fade_in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes img_pulse{0%,100%{opacity:.25}50%{opacity:.55}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0c0c1e}
        ::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:4px}
      `}</style>
      <div style={{position:"fixed",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,#ffffff01 3px,#ffffff01 4px)",pointerEvents:"none",zIndex:0}}/>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:30,background:"#07071099",backdropFilter:"blur(18px)",
        borderBottom:`1px solid ${C.pink}18`,padding:"12px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <CatLogo size={38}/>
          <div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:3,color:C.pink,textShadow:`0 0 20px ${C.pink}88`}}>COIN</div>
            <div style={{fontSize:8,color:C.muted,letterSpacing:4,marginTop:-3}}>CARD UNIVERSE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{TABS.map(t=><NavBtn key={t} t={t}/>)}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}28`,borderRadius:24,padding:"5px 14px",display:"flex",alignItems:"center",gap:7}}>
            <CatLogo size={15}/>
            <span style={{color:C.gold,fontWeight:900,fontSize:16,textShadow:`0 0 10px ${C.gold}66`}}>{lili}</span>
            <span style={{color:C.muted,fontSize:11}}>COIN</span>
          </div>
          <span style={{fontSize:12,color:C.muted}}>🎴{cards.length}</span>
          {(()=>{
            const loading=Object.values(cardImages).filter(v=>v==="__loading__").length;
            const done=Object.values(cardImages).filter(v=>v&&v!=="__loading__").length;
            const total=CHARS.length;
            if(loading>0)return(
              <div style={{display:"flex",alignItems:"center",gap:6,background:`${C.purple}15`,
                border:`1px solid ${C.purple}30`,borderRadius:8,padding:"5px 10px"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.purple,animation:"img_pulse 1s infinite"}}/>
                <span style={{fontSize:10,color:C.purple,fontWeight:700}}>{done}/{total}</span>
              </div>
            );
            if(done===total)return<div style={{fontSize:10,color:C.muted,opacity:.5}}>🎨 {done}/{total}</div>;
            return null;
          })()}
          <button onClick={()=>setCodeModal(true)}
            style={{background:`${C.cyan}10`,color:C.cyan,border:`1px solid ${C.cyan}30`,
              borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>
            🔑
          </button>
          <button onClick={logout}
            style={{background:"transparent",color:C.muted,border:`1px solid ${C.muted}22`,
              borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11}}>
            Salir
          </button>
        </div>
      </div>

      <div style={{padding:16,maxWidth:1040,margin:"0 auto",position:"relative",zIndex:1}}>

        {/* ── COLECCIÓN ── */}
        {tab==="Colección"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              {[["all","Todas"],["idle","Libres"],["mission","En misión"],["injured","Heridas"]].map(([v,l])=>(
                <button key={v} onClick={()=>setCollFilter(v)} style={{
                  background:collFilter===v?`${C.pink}12`:"transparent",
                  color:collFilter===v?C.pink:C.muted,
                  border:`1px solid ${collFilter===v?C.pink+"40":"#ffffff0e"}`,
                  borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:12,transition:"all .15s",
                }}>{l}</button>
              ))}
              <div style={{marginLeft:"auto",background:C.bg3,border:`1px solid ${C.border}`,
                borderRadius:12,padding:"7px 14px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:10,color:C.pink,fontWeight:700}}>🎁</span>
                {ITEM_ORDER.map(k=>{
                  const it=ITEMS[k],qty=items[k]||0;
                  return(
                    <div key={k} title={`${it.name}: ${it.desc}`}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",opacity:qty>0?1:.22}}>
                      <span style={{fontSize:17}}>{it.emoji}</span>
                      <span style={{fontSize:10,color:it.color,fontWeight:700}}>{qty}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14}}>
              {filteredCards.map(c=>(
                <div key={c.id} style={{display:"flex",flexDirection:"column"}}>
                  <CardUI card={c} selected={activeCard===c.id} onClick={()=>setActiveCard(activeCard===c.id?null:c.id)}/>
                  {activeCard===c.id&&(
                    <div style={{background:C.bg3,border:`1px solid ${RARITY[c.rarity]?.color||"#fff"}1a`,
                      borderRadius:"0 0 12px 12px",padding:10,width:160,marginTop:-2}}>
                      {/* VENDER */}
                      {!c.unique&&c.status!=="mission"&&(
                        <button onClick={()=>sellCard(c.id)}
                          style={{width:"100%",background:`${C.gold}10`,color:C.gold,
                            border:`1px solid ${C.gold}30`,borderRadius:7,padding:"6px 0",
                            cursor:"pointer",fontSize:11,fontWeight:700,marginBottom:8,
                            display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                          💰 Vender ({SELL_PRICES[c.rarity]||20} COIN)
                        </button>
                      )}
                      {/* ENTRENAR */}
                      {!c.unique&&(
                        <div>
                          <div style={{fontSize:9,color:C.cyan,marginBottom:4,fontWeight:700,letterSpacing:1}}>
                            ENTRENAR ({TRAIN_COST(c.trainLevel||0)} COIN)
                          </div>
                          <div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>
                            {[["hp","❤️ HP"],["atk","⚔️ ATK"],["def","🛡️ DEF"],["spd","💨 SPD"]].map(([s,l])=>(
                              <button key={s} onClick={()=>trainStat(c.id,s)}
                                disabled={lili<TRAIN_COST(c.trainLevel||0)}
                                style={{flex:1,minWidth:34,background:lili>=TRAIN_COST(c.trainLevel||0)?`${C.cyan}12`:"transparent",
                                  color:lili>=TRAIN_COST(c.trainLevel||0)?C.cyan:"#2a2a3a",
                                  border:`1px solid ${lili>=TRAIN_COST(c.trainLevel||0)?C.cyan+"30":"#ffffff06"}`,
                                  borderRadius:5,padding:"4px 2px",cursor:lili>=TRAIN_COST(c.trainLevel||0)?"pointer":"not-allowed",
                                  fontSize:10,fontWeight:700}}>
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* ÍTEMS */}
                      <div style={{fontSize:9,color:C.pink,marginBottom:6,fontWeight:700,letterSpacing:1}}>USAR ÍTEM</div>
                      {ITEM_ORDER.map(k=>{
                        const it=ITEMS[k],qty=items[k]||0;
                        const off=qty<1||c.status==="mission";
                        return(
                          <button key={k} onClick={()=>applyItem(k,c.id)} disabled={off} title={it.desc}
                            style={{width:"100%",display:"flex",alignItems:"center",gap:5,
                              background:!off?it.color+"10":"transparent",
                              color:!off?it.color:"#2a2a3a",
                              border:`1px solid ${!off?it.color+"25":"#ffffff06"}`,
                              borderRadius:6,padding:"3px 7px",cursor:!off?"pointer":"not-allowed",
                              fontSize:11,marginBottom:3,textAlign:"left"}}>
                            <span style={{fontSize:13}}>{it.emoji}</span>
                            <span style={{flex:1}}>{it.name}</span>
                            <span style={{fontWeight:800,fontSize:10}}>×{qty}</span>
                          </button>
                        );
                      })}
                      {c.status==="injured"&&c.restEnd&&(
                        <div style={{fontSize:9,color:C.cyan,textAlign:"center",marginTop:4}}>
                          🩹 Auto-cura en {Math.max(0,Math.ceil((c.restEnd-now)/1000))}s
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {filteredCards.length===0&&<div style={{color:C.muted,fontSize:13}}>Sin cartas.</div>}
            </div>
          </div>
        )}

        {/* ── TIENDA ── */}
        {tab==="Tienda"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:12,letterSpacing:2}}>SOBRES DE CARTAS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:28}}>
              {CARD_PACKS.map(pack=>(
                <div key={pack.id} style={{background:C.bg3,border:`1.5px solid ${pack.color}22`,
                  borderRadius:16,padding:18,minWidth:190,maxWidth:220,flex:"1 1 190px",boxShadow:`0 0 25px ${pack.color}07`}}>
                  <div style={{fontSize:17,fontWeight:900,color:pack.color,marginBottom:3,textShadow:`0 0 12px ${pack.color}55`}}>{pack.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{pack.desc}</div>
                  {Object.entries(pack.rates).filter(([,v])=>v>0).map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:RARITY[k].color}}>{RARITY[k].label}</span>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <div style={{height:3,width:50,background:"#ffffff07",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:v+"%",background:RARITY[k].color,borderRadius:3,boxShadow:`0 0 5px ${RARITY[k].color}`}}/>
                        </div>
                        <span style={{fontSize:10,color:C.muted,minWidth:24,textAlign:"right"}}>{v}%</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>buyCardPack(pack)} disabled={lili<pack.price}
                    style={{marginTop:14,width:"100%",background:lili>=pack.price?pack.color:"#ffffff08",
                      color:lili>=pack.price?"#000":"#333",border:"none",borderRadius:9,
                      padding:"9px 0",fontWeight:900,fontSize:14,cursor:lili>=pack.price?"pointer":"not-allowed",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                      boxShadow:lili>=pack.price?`0 0 18px ${pack.color}44`:undefined}}>
                    <CatLogo size={14}/> {pack.price} COIN
                  </button>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:12,letterSpacing:2}}>KITS DE ÍTEMS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:28}}>
              {ITEM_PACKS.map(pack=>(
                <div key={pack.id} style={{background:C.bg3,border:`1.5px solid ${pack.color}22`,
                  borderRadius:16,padding:18,minWidth:190,maxWidth:220,flex:"1 1 190px"}}>
                  <div style={{fontSize:26,marginBottom:6}}>{pack.emoji}</div>
                  <div style={{fontSize:16,fontWeight:900,color:pack.color,marginBottom:3}}>{pack.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{pack.desc}</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:8}}>Posibles ítems:</div>
                  {pack.pool.map(([k,p])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:ITEMS[k]?.color}}>{ITEMS[k]?.emoji} {ITEMS[k]?.name}</span>
                      <span style={{fontSize:10,color:C.muted}}>{Math.round(p*100)}%</span>
                    </div>
                  ))}
                  <button onClick={()=>buyItemPack(pack)} disabled={lili<pack.price}
                    style={{marginTop:12,width:"100%",background:lili>=pack.price?pack.color:"#ffffff08",
                      color:lili>=pack.price?"#000":"#333",border:"none",borderRadius:9,
                      padding:"9px 0",fontWeight:900,fontSize:14,cursor:lili>=pack.price?"pointer":"not-allowed",
                      boxShadow:lili>=pack.price?`0 0 18px ${pack.color}44`:undefined}}>
                    {pack.price} COIN
                  </button>
                </div>
              ))}
            </div>
            {/* VENDER ÍTEMS */}
            <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:12,letterSpacing:2}}>VENDER ÍTEMS (5 COIN c/u)</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {ITEM_ORDER.map(k=>{
                const it=ITEMS[k],qty=items[k]||0;
                return(
                  <div key={k} style={{background:C.bg3,border:`1px solid ${it.color}22`,borderRadius:12,
                    padding:"12px 16px",display:"flex",alignItems:"center",gap:10,opacity:qty>0?1:.3}}>
                    <span style={{fontSize:24}}>{it.emoji}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:it.color}}>{it.name}</div>
                      <div style={{fontSize:10,color:C.muted}}>×{qty} disponibles</div>
                    </div>
                    <button onClick={()=>sellItem(k)} disabled={qty<1}
                      style={{marginLeft:"auto",background:qty>0?`${C.gold}15`:"transparent",color:qty>0?C.gold:"#2a2a3a",
                        border:`1px solid ${qty>0?C.gold+"40":"#ffffff06"}`,borderRadius:7,
                        padding:"5px 10px",cursor:qty>0?"pointer":"not-allowed",fontSize:11,fontWeight:700}}>
                      Vender
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FUSIÓN ── */}
        {tab==="Fusión"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{background:C.bg3,border:`1px solid ${C.pink}18`,borderRadius:14,padding:14,marginBottom:16}}>
              <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:8,letterSpacing:2}}>FÓRMULA – 25 COIN</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                {FUSION_MAP.map((r,i)=>(
                  <span key={r} style={{display:"flex",alignItems:"center",gap:3}}>
                    <span style={{color:RARITY[r].color,fontSize:11}}>{RARITY[r].label}</span>
                    {i<4&&<>
                      <span style={{color:"#2a2a3a",fontSize:14}}>+</span>
                      <span style={{color:RARITY[r].color,fontSize:11}}>{RARITY[r].label}</span>
                      <span style={{color:C.gold,margin:"0 4px",fontWeight:900}}>→</span>
                      <span style={{color:RARITY[FUSION_MAP[i+1]].color,fontSize:11}}>{RARITY[FUSION_MAP[i+1]].label}</span>
                      {i<3&&<span style={{color:"#1a1a2e",margin:"0 8px"}}>|</span>}
                    </>}
                  </span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <button onClick={autoFusion} disabled={autoFusing}
                style={{background:`linear-gradient(90deg,${C.pink},${C.purple})`,color:"#fff",border:"none",
                  borderRadius:12,padding:"12px 28px",fontWeight:900,fontSize:14,cursor:"pointer",
                  letterSpacing:1,boxShadow:`0 0 24px ${C.pink}44`,display:"flex",alignItems:"center",gap:8}}>
                ⚡ AUTO-FUSIÓN
                <span style={{fontSize:11,color:"#ffffff88",fontWeight:400}}>(fusiona todos los pares)</span>
              </button>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:10}}>O selecciona 2 cartas libres de la misma rareza:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:20}}>
              {cards.filter(c=>c.status==="idle"&&!c.unique).map(c=>{
                const sel=fusionA===c.id||fusionB===c.id;
                return(
                  <div key={c.id} onClick={()=>{
                    if(fusionA===c.id){setFusionA(null);return;}
                    if(fusionB===c.id){setFusionB(null);return;}
                    if(!fusionA)setFusionA(c.id);else if(!fusionB)setFusionB(c.id);
                  }}><CardUI card={c} selected={sel}/></div>
                );
              })}
            </div>
            {fusionA&&fusionB&&(()=>{
              const ca=cards.find(c=>c.id===fusionA),cb=cards.find(c=>c.id===fusionB);
              const ok=ca&&cb&&ca.rarity===cb.rarity&&ca.rarity!=="legendary";
              const nxt=ok?FUSION_MAP[FUSION_MAP.indexOf(ca.rarity)+1]:null;
              return(
                <div style={{background:C.bg3,border:`1px solid ${ok?C.pink+"30":C.red+"30"}`,
                  borderRadius:14,padding:16,display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                  {ca&&<CardUI card={ca}/>}
                  <div style={{fontSize:32,color:C.pink,textShadow:`0 0 20px ${C.pink}`}}>+</div>
                  {cb&&<CardUI card={cb}/>}
                  <div style={{fontSize:32,color:C.gold,textShadow:`0 0 20px ${C.gold}`}}>→</div>
                  <div>
                    <div style={{color:ok?RARITY[nxt]?.color:C.red,fontSize:17,fontWeight:900,marginBottom:10}}>
                      {ok?`✨ ${RARITY[nxt]?.label}`:"Rareza diferente ❌"}
                    </div>
                    <button onClick={manualFusion} disabled={!ok||lili<25}
                      style={{background:ok&&lili>=25?C.pink:"#ffffff0a",color:ok&&lili>=25?"#000":"#333",
                        border:"none",borderRadius:10,padding:"11px 26px",fontWeight:900,fontSize:14,
                        cursor:ok&&lili>=25?"pointer":"not-allowed",
                        boxShadow:ok&&lili>=25?`0 0 20px ${C.pink}55`:undefined}}>
                      Fusionar (25 COIN)
                    </button>
                  </div>
                </div>
              );
            })()}
            {fusionResult&&(
              <div style={{marginTop:18,display:"flex",gap:14,alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:12,color:C.gold,fontWeight:700,marginBottom:8}}>✨ Resultado:</div>
                  <CardUI card={fusionResult}/>
                </div>
                <button onClick={()=>setFusionResult(null)}
                  style={{marginTop:36,background:"transparent",border:`1px solid ${C.muted}33`,
                    color:C.muted,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12}}>Cerrar</button>
              </div>
            )}
          </div>
        )}

        {/* ── MISIONES ── */}
        {tab==="Misiones"&&(
          <div style={{animation:"fade_in .3s both",display:"flex",gap:16,flexWrap:"wrap"}}>
            <div style={{flex:"2 1 300px"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:12,letterSpacing:1}}>MISIONES DISPONIBLES</div>
              {MISSIONS.map(m=>(
                <div key={m.id} onClick={()=>setActiveMission(m)}
                  style={{background:`linear-gradient(90deg,${m.bg},${C.bg3})`,
                    border:`1.5px solid ${C.pink}14`,borderRadius:13,padding:14,
                    marginBottom:9,cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.pink}44`;e.currentTarget.style.transform="translateX(5px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=`${C.pink}14`;e.currentTarget.style.transform="";}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <span style={{fontSize:28}}>{m.emoji}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{m.name}</div>
                        <div style={{fontSize:11,color:C.muted}}>⏱ {m.time}s · 📊 {Math.round(m.baseRisk*100)}% riesgo · 💰 {m.baseReward} COIN</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <div style={{fontSize:9,color:RARITY[FUSION_MAP[m.minTier]]?.color,
                        background:RARITY[FUSION_MAP[m.minTier]]?.color+"15",
                        border:`1px solid ${RARITY[FUSION_MAP[m.minTier]]?.color}30`,
                        borderRadius:20,padding:"2px 8px",fontWeight:700}}>
                        {RARITY[FUSION_MAP[m.minTier]]?.label}+
                      </div>
                      <div style={{fontSize:11,color:C.pink,fontWeight:700}}>Seleccionar →</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{flex:"1 1 220px"}}>
              {pendingRewards.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:8,letterSpacing:2}}>
                    ✓ COMPLETADAS ({pendingRewards.length})
                  </div>
                  {pendingRewards.map(rw=>(
                    <div key={rw.id} style={{
                      background:rw.failed?`linear-gradient(135deg,#1a0505,${C.bg3})`:`linear-gradient(135deg,#071a05,${C.bg3})`,
                      border:`1.5px solid ${rw.failed?C.red+"45":C.gold+"55"}`,
                      borderRadius:12,padding:"10px 12px",marginBottom:8,
                    }}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:700,color:rw.failed?C.red:C.gold}}>
                            {rw.failed?"✕ Fallida":"✓ "+rw.charName}
                          </div>
                          <div style={{fontSize:10,color:C.muted,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {rw.missionName}{rw.failed&&rw.dmg?` · -${rw.dmg} HP`:""}
                          </div>
                          {!rw.failed&&(
                            <div style={{fontSize:15,fontWeight:900,color:C.gold,marginTop:2}}>
                              +{rw.lili}{rw.bonus&&<span style={{fontSize:10,color:C.pink,marginLeft:5}}>BONUS</span>}
                            </div>
                          )}
                        </div>
                        <button onClick={()=>claimReward(rw)} style={{
                          flexShrink:0,background:rw.failed?`${C.red}20`:`${C.gold}20`,
                          color:rw.failed?C.red:C.gold,border:`1.5px solid ${rw.failed?C.red+"50":C.gold+"50"}`,
                          borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:800,
                          transition:"all .12s",}}
                          onMouseEnter={e=>{e.currentTarget.style.background=rw.failed?C.red:C.gold;e.currentTarget.style.color="#000";}}
                          onMouseLeave={e=>{e.currentTarget.style.background=rw.failed?`${C.red}20`:`${C.gold}20`;e.currentTarget.style.color=rw.failed?C.red:C.gold;}}>
                          {rw.failed?"OK":"RECLAMAR"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:10,letterSpacing:2}}>EN MISIÓN</div>
              {cards.filter(c=>c.status==="mission").map(c=>{
                const secs=Math.max(0,Math.ceil((c.missionEnd-now)/1000));
                const total=MISSIONS.find(x=>x.id===c.currentMission)?.time||60;
                const pct=Math.round(((total-secs)/total)*100);
                const r=RARITY[c.rarity];
                return(
                  <div key={c.id} style={{background:C.bg3,border:`1px solid ${r.color}18`,borderRadius:12,padding:11,marginBottom:10}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                      <div style={{width:44,height:55,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                        <AnimeArt char={CHARS[c.charIdx]||CHARS[0]} rarity={c.rarity} w={44} h={55}/>
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{c.name}</div>
                        <div style={{fontSize:10,color:r.color}}>{r.label}</div>
                        <div style={{fontSize:10,color:C.gold}}>⏳ {secs}s</div>
                      </div>
                    </div>
                    <div style={{height:4,background:"#ffffff08",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",background:C.gold,borderRadius:4,
                        width:pct+"%",transition:"width 1s linear",boxShadow:`0 0 8px ${C.gold}88`}}/>
                    </div>
                  </div>
                );
              })}
              {cards.filter(c=>c.status==="mission").length===0&&pendingRewards.length===0&&(
                <div style={{fontSize:12,color:"#2a2a3a"}}>Sin héroes en misión.</div>
              )}
            </div>
          </div>
        )}

        {/* ── ARENA ── */}
        {tab==="Arena"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,fontWeight:900,color:C.red,textShadow:`0 0 16px ${C.red}88`,letterSpacing:2}}>⚔️ ARENA</div>
              <div style={{fontSize:11,color:C.muted}}>Lucha contra enemigos para ganar COIN y XP</div>
            </div>

            {arenaEnemy&&(
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {/* Enemigo */}
                <div style={{flex:"0 0 240px"}}>
                  <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:10,letterSpacing:2}}>ENEMIGO</div>
                  <div style={{background:`linear-gradient(135deg,#1a0505,${C.bg3})`,
                    border:`2px solid ${C.red}40`,borderRadius:18,padding:22,textAlign:"center",
                    boxShadow:`0 0 40px ${C.red}18`}}>
                    <div style={{fontSize:64,marginBottom:8}}>{arenaEnemy.emoji}</div>
                    <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>{arenaEnemy.name}</div>
                    <div style={{display:"flex",justifyContent:"center",gap:12,fontSize:13,marginBottom:14}}>
                      <span style={{color:"#ff7043"}}>⚔️ {arenaEnemy.atk}</span>
                      <span style={{color:"#42a5f5"}}>🛡️ {arenaEnemy.def}</span>
                      <span style={{color:C.green}}>❤️ {arenaEnemy.hp}</span>
                    </div>
                    <div style={{background:`${C.gold}12`,border:`1px solid ${C.gold}30`,borderRadius:10,padding:"8px 0",marginBottom:8}}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:2}}>Recompensa</div>
                      <div style={{fontSize:20,fontWeight:900,color:C.gold}}>+{arenaEnemy.reward} COIN</div>
                      <div style={{fontSize:11,color:C.cyan}}>+{arenaEnemy.xp} XP</div>
                    </div>
                    <div style={{fontSize:10,color:C.muted}}>Tier {arenaEnemy.tier}</div>
                  </div>
                  <button onClick={rollArenaEnemy_}
                    style={{marginTop:10,width:"100%",background:`${C.muted}12`,color:C.muted,
                      border:`1px solid ${C.muted}25`,borderRadius:10,padding:"8px 0",
                      cursor:"pointer",fontSize:12,fontWeight:700}}>
                    🔄 Otro enemigo
                  </button>
                </div>

                {/* Seleccionar luchador */}
                <div style={{flex:"1 1 300px"}}>
                  <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:10,letterSpacing:2}}>TU LUCHADOR</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:16}}>
                    {cards.filter(c=>c.status==="idle").map(c=>(
                      <div key={c.id} onClick={()=>setArenaFighter(arenaFighter===c.id?null:c.id)}>
                        <CardUI card={c} selected={arenaFighter===c.id} mini/>
                      </div>
                    ))}
                    {cards.filter(c=>c.status==="idle").length===0&&(
                      <div style={{color:C.muted,fontSize:13}}>Sin personajes libres para luchar.</div>
                    )}
                  </div>

                  {arenaFighter&&(()=>{
                    const fc=cards.find(c=>c.id===arenaFighter);
                    if(!fc)return null;
                    // Preview odds
                    const winChance=Math.min(95,Math.max(5,
                      50+Math.round(((fc.atk-arenaEnemy.atk)/2)+((fc.def-arenaEnemy.def)*0.8)+((fc.hp-arenaEnemy.hp)/10))
                    ));
                    return(
                      <div style={{background:C.bg3,border:`1px solid ${C.pink}22`,borderRadius:14,padding:16,marginBottom:14}}>
                        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                          <div style={{width:50,height:62,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                            <AnimeArt char={CHARS[fc.charIdx]||CHARS[0]} rarity={fc.rarity} w={50} h={62}/>
                          </div>
                          <div>
                            <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{fc.name}</div>
                            <div style={{fontSize:10,color:RARITY[fc.rarity].color}}>{RARITY[fc.rarity].label}</div>
                            <div style={{fontSize:10,color:C.muted}}>⚔{fc.atk} 🛡{fc.def} ❤{fc.hp}</div>
                          </div>
                          <div style={{marginLeft:"auto",textAlign:"right"}}>
                            <div style={{fontSize:10,color:C.muted}}>Prob. victoria</div>
                            <div style={{fontSize:22,fontWeight:900,color:winChance>60?C.green:winChance>40?C.gold:C.red,
                              textShadow:`0 0 12px currentColor`}}>{winChance}%</div>
                          </div>
                        </div>
                        {[["Tú",fc.atk,fc.def,fc.hp],["Enemigo",arenaEnemy.atk,arenaEnemy.def,arenaEnemy.hp]].map(([n,a,d,h],i)=>(
                          <div key={n} style={{display:"flex",gap:10,fontSize:11,marginBottom:4,color:i===0?C.cyan:C.red}}>
                            <span style={{width:52,fontWeight:700}}>{n}</span>
                            <span>⚔️{a}</span><span>🛡️{d}</span><span>❤️{h}</span>
                          </div>
                        ))}
                        <button onClick={startArenaBattle}
                          style={{marginTop:14,width:"100%",background:`linear-gradient(90deg,${C.red},${C.pink})`,
                            color:"#fff",border:"none",borderRadius:12,padding:"13px 0",
                            fontWeight:900,fontSize:15,cursor:"pointer",letterSpacing:1,
                            boxShadow:`0 0 28px ${C.red}44`}}>
                          ⚔️ ¡LUCHAR!
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODALS */}
      {cardReveal&&<CardPackReveal card={cardReveal} onClose={()=>setCardReveal(null)}/>}
      {itemReveal&&<ItemPackReveal items={itemReveal} onClose={()=>setItemReveal(null)}/>}
      {activeMission&&<MissionModal mission={activeMission} cards={cards} onSend={sendOnMission} onClose={()=>setActiveMission(null)}/>}
      {codeModal&&<CodeModal onClose={()=>setCodeModal(false)} onRedeem={redeemCode}/>}
      {dailyModal&&<DailyModal reward={dailyReward} streak={dailyStreak} onClaim={claimDailyBonus}/>}
      {arenaResult&&<ArenaResultModal result={arenaResult} onClose={()=>{setArenaResult(null);rollArenaEnemy_();}}/>}

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",
          background:C.bg3,border:`1px solid ${C.pink}30`,borderRadius:12,
          padding:"10px 26px",color:C.pink,fontSize:13,fontWeight:700,
          boxShadow:`0 4px 30px #000000aa,0 0 20px ${C.pink}18`,
          zIndex:600,pointerEvents:"none",whiteSpace:"nowrap",letterSpacing:.4}}>
          {toast}
        </div>
      )}
    </div>
    </ImgCtx.Provider>
  );
}
