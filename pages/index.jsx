import { useState, useEffect, useRef } from "react";

/* ââââââââââââââââââââââââââââââââââââââââââ
   PALETTE
ââââââââââââââââââââââââââââââââââââââââââ */
const C = {
  bg:"#070710", bg2:"#0c0c1e", bg3:"#111128",
  pink:"#e040fb", cyan:"#00e5ff", gold:"#ffd54f",
  red:"#ff1744", green:"#00e676", purple:"#7c4dff",
  text:"#e8e8f8", muted:"#5a5a7a", border:"#ffffff0d",
};

/* ââââââââââââââââââââââââââââââââââââââââââ
   RARITY  â made harder
ââââââââââââââââââââââââââââââââââââââââââ */
const RARITY = {
  common:    { label:"Común",      color:"#78909c", glow:"#78909c22", tier:0, stars:1 },
  uncommon:  { label:"Poco Común", color:"#26a69a", glow:"#26a69a22", tier:1, stars:2 },
  rare:      { label:"Raro",       color:"#1e88e5", glow:"#1e88e522", tier:2, stars:3 },
  epic:      { label:"Épico",      color:"#ab47bc", glow:"#ab47bc33", tier:3, stars:4 },
  legendary: { label:"Legendario", color:"#ffd54f", glow:"#ffd54f44", tier:4, stars:5 },
};
const FUSION_MAP = ["common","uncommon","rare","epic","legendary"];

/* ââââââââââââââââââââââââââââââââââââââââââ
   CHARACTERS â 12 female anime
ââââââââââââââââââââââââââââââââââââââââââ */
const CHARS = [
  { name:"Yoru",  role:"Asesina",    cls:"Sombra",  atkT:"Filo",    c:"#e040fb", hair:"#1a1a1a", outfit:"#2d0040" },
  { name:"Akari", role:"Maga Oscura",cls:"Maga",    atkT:"Magia",   c:"#7c4dff", hair:"#0d0d2e", outfit:"#1a0040" },
  { name:"Sera",  role:"Sanadora",   cls:"Clérigo", atkT:"Luz",     c:"#00e676", hair:"#1a3300", outfit:"#003322" },
  { name:"Nyx",   role:"Cazadora",   cls:"Arquera", atkT:"Flecha",  c:"#00e5ff", hair:"#001a2e", outfit:"#002233" },
  { name:"Rein",  role:"Guardiana",  cls:"Paladín", atkT:"Escudo",  c:"#ffd54f", hair:"#2e1a00", outfit:"#2e2000" },
  { name:"Vex",   role:"Invocadora", cls:"Maga",    atkT:"Caos",    c:"#ff4081", hair:"#2e0010", outfit:"#1a0015" },
  { name:"Lyra",  role:"Bardo",      cls:"Soporte", atkT:"Sonido",  c:"#ff9800", hair:"#2e1500", outfit:"#2e1a00" },
  { name:"Kaine", role:"Berserker",  cls:"Guerrera",atkT:"Fuerza",  c:"#ff1744", hair:"#1a0000", outfit:"#2e0010" },
  { name:"Faye",  role:"Espía",      cls:"Sombra",  atkT:"Veneno",  c:"#00bfa5", hair:"#001a18", outfit:"#001510" },
  { name:"Mira",  role:"Druida",     cls:"Maga",    atkT:"Natura",  c:"#76ff03", hair:"#0a1a00", outfit:"#0d2000" },
  { name:"Dusk",  role:"Nigromante", cls:"Maga",    atkT:"Muerte",  c:"#7e57c2", hair:"#110011", outfit:"#1a0030" },
  { name:"Rin",   role:"Kunoichi",   cls:"Sombra",  atkT:"Shuriken",c:"#ff4081", hair:"#1a0a00", outfit:"#2e1a00" },
];

/* ââââââââââââââââââââââââââââââââââââââââââ
   ANIME CARD ART SVG â improved
ââââââââââââââââââââââââââââââââââââââââââ */
function AnimeArt({ char, rarity, w=160, h=200 }) {
  const r = RARITY[rarity];
  const seed = char.name.charCodeAt(0)*7 + char.name.charCodeAt(1||1)*3;
  const eyeColor = {common:"#cc2222",uncommon:"#00cc88",rare:"#00aaff",epic:"#dd00ff",legendary:"#ffcc00"}[rarity];
  const hasBraid = seed%2===0;
  const hairStyle = seed%3;
  // Hair colors per char
  const hairCol = char.hair || "#111";
  const outfitCol = char.outfit || "#1a1a2e";

  return (
    <svg width={w} height={h} viewBox="0 0 160 200" style={{display:"block"}}>
      <defs>
        <radialGradient id={`bg_${char.name}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={char.c} stopOpacity=".22"/>
          <stop offset="70%" stopColor={char.c} stopOpacity=".05"/>
          <stop offset="100%" stopColor={C.bg} stopOpacity="1"/>
        </radialGradient>
        <radialGradient id={`face_${char.name}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#f8d5b0"/>
          <stop offset="100%" stopColor="#e8b890"/>
        </radialGradient>
        <filter id={`glow_${char.name}`}>
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id={`clip_${char.name}`}><rect width="160" height="200" rx="10"/></clipPath>
      </defs>
      <g clipPath={`url(#clip_${char.name})`}>
      {/* Background */}
      <rect width="160" height="200" fill={C.bg}/>
      <rect width="160" height="200" fill={`url(#bg_${char.name})`}/>
      {/* Ambient lines */}
      <line x1="0" y1="160" x2="160" y2="120" stroke={char.c} strokeWidth=".4" strokeOpacity=".2"/>
      <line x1="0" y1="180" x2="160" y2="140" stroke={char.c} strokeWidth=".3" strokeOpacity=".12"/>

      {/* ââ BODY / OUTFIT ââ */}
      <ellipse cx="80" cy="185" rx="46" ry="35" fill={outfitCol} opacity=".95"/>
      {/* collar/neckline */}
      <path d={`M60 148 Q80 162 100 148 L104 175 Q80 182 56 175 Z`}
        fill={outfitCol} stroke={char.c} strokeWidth=".8" strokeOpacity=".5"/>
      {/* Shoulder highlights */}
      <ellipse cx="56" cy="155" rx="12" ry="8" fill={char.c} opacity=".08"/>
      <ellipse cx="104" cy="155" rx="12" ry="8" fill={char.c} opacity=".08"/>
      {/* chest accent */}
      {char.atkT==="Magia"&&<circle cx="80" cy="162" r="5" fill="none" stroke={char.c} strokeWidth="1.2" strokeOpacity=".6"/>}
      {char.atkT==="Filo"&&<line x1="74" y1="158" x2="86" y2="158" stroke={char.c} strokeWidth="1.5" strokeOpacity=".6"/>}
      {char.atkT==="Escudo"&&<path d="M74,156 L80,152 L86,156 L80,163 Z" fill={char.c} opacity=".4"/>}

      {/* Neck */}
      <rect x="73" y="138" width="14" height="16" rx="6" fill={`url(#face_${char.name})`}/>

      {/* ââ HAIR BACK ââ */}
      {hairStyle===0&&<>
        <path d={`M38 95 Q30 150 35 195`} fill={hairCol} strokeWidth="0"/>
        <path d={`M122 95 Q130 150 125 195`} fill={hairCol} strokeWidth="0"/>
      </>}
      {hairStyle===1&&<>
        <path d={`M40 88 Q25 140 30 200`} fill={hairCol}/>
        <path d={`M120 88 Q135 140 130 200`} fill={hairCol}/>
      </>}
      {hairStyle===2&&<>
        <path d={`M38 90 Q20 130 45 200`} fill={hairCol}/>
        <path d={`M122 90 Q140 130 115 200`} fill={hairCol}/>
      </>}

      {/* ââ FACE ââ */}
      {/* Jaw/chin */}
      <path d="M46 95 Q46 140 80 148 Q114 140 114 95" fill={`url(#face_${char.name})`}/>
      {/* Cheeks */}
      <ellipse cx="80" cy="100" rx="34" ry="38" fill={`url(#face_${char.name})`}/>

      {/* ââ HAIR FRONT / TOP ââ */}
      {/* Main hair mass */}
      <ellipse cx="80" cy="72" rx="40" ry="32" fill={hairCol}/>
      {/* Bangs */}
      <path d={`M42 80 Q52 58 80 55 Q108 58 118 80 Q110 85 100 78 Q90 72 80 74 Q70 72 60 78 Q50 85 42 80 Z`}
        fill={hairCol}/>
      {/* Side pieces */}
      <path d={`M46 90 Q40 105 43 125 Q46 112 50 100 Z`} fill={hairCol}/>
      <path d={`M114 90 Q120 105 117 125 Q114 112 110 100 Z`} fill={hairCol}/>
      {/* Hair detail lines */}
      <path d={`M56 66 Q60 58 80 55`} stroke={char.c} strokeWidth=".6" fill="none" strokeOpacity=".35"/>
      <path d={`M104 66 Q100 58 80 55`} stroke={char.c} strokeWidth=".6" fill="none" strokeOpacity=".35"/>

      {/* ââ EYES ââ */}
      {/* Eye shadows */}
      <ellipse cx="63" cy="100" rx="13" ry="8" fill="#00000033"/>
      <ellipse cx="97" cy="100" rx="13" ry="8" fill="#00000033"/>
      {/* Eye whites */}
      <ellipse cx="63" cy="99" rx="11" ry="9" fill="#f0e8e0"/>
      <ellipse cx="97" cy="99" rx="11" ry="9" fill="#f0e8e0"/>
      {/* Iris */}
      <ellipse cx="63" cy="100" rx="8" ry="9" fill={eyeColor} filter={`url(#glow_${char.name})`}/>
      <ellipse cx="97" cy="100" rx="8" ry="9" fill={eyeColor} filter={`url(#glow_${char.name})`}/>
      {/* Pupil */}
      <ellipse cx="63" cy="101" rx="4.5" ry="5.5" fill="#0a0508"/>
      <ellipse cx="97" cy="101" rx="4.5" ry="5.5" fill="#0a0508"/>
      {/* Eye shine */}
      <ellipse cx="60" cy="97" rx="2.5" ry="2" fill="white" opacity=".9"/>
      <ellipse cx="94" cy="97" rx="2.5" ry="2" fill="white" opacity=".9"/>
      <circle cx="65" cy="103" r="1" fill="white" opacity=".5"/>
      <circle cx="99" cy="103" r="1" fill="white" opacity=".5"/>
      {/* Eyelashes top */}
      <path d="M52 93 Q56 89 63 91 Q70 89 74 93" stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M86 93 Q90 89 97 91 Q104 89 108 93" stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Eyelids bottom */}
      <path d="M53 106 Q63 110 73 106" stroke="#cc9988" strokeWidth=".8" fill="none" strokeOpacity=".5"/>
      <path d="M87 106 Q97 110 107 106" stroke="#cc9988" strokeWidth=".8" fill="none" strokeOpacity=".5"/>

      {/* ââ NOSE ââ */}
      <path d="M77 112 Q80 116 83 112" stroke="#cc9977" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".6"/>

      {/* ââ MOUTH ââ */}
      <path d="M70 122 Q80 130 90 122" stroke="#cc5566" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M72 122 Q80 126 88 122" fill="#ff8899" opacity=".25"/>

      {/* ââ BLUSH ââ */}
      <ellipse cx="50" cy="112" rx="10" ry="6" fill="#ff6b8a" opacity=".25"/>
      <ellipse cx="110" cy="112" rx="10" ry="6" fill="#ff6b8a" opacity=".25"/>

      {/* ââ ACCESSORY by class ââ */}
      {char.cls==="Maga"&&<>
        <circle cx="130" cy="50" r="10" fill="none" stroke={char.c} strokeWidth="1.2" strokeDasharray="4 2" opacity=".7"/>
        <circle cx="130" cy="50" r="4" fill={char.c} opacity=".4"/>
      </>}
      {char.cls==="Arquera"&&<>
        <line x1="128" y1="38" x2="136" y2="70" stroke={char.c} strokeWidth="2" strokeLinecap="round" opacity=".7"/>
        <line x1="128" y1="38" x2="121" y2="42" stroke={char.c} strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
        <line x1="128" y1="38" x2="135" y2="42" stroke={char.c} strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      </>}
      {char.cls==="Sombra"&&<>
        <path d="M125 40 L140 55 L125 70 L120 55 Z" fill={char.c} opacity=".2" stroke={char.c} strokeWidth=".8"/>
      </>}
      {char.cls==="Paladín"&&<>
        <path d="M125,38 L135,48 L130,60 L120,60 L115,48 Z" fill={char.c} opacity=".15" stroke={char.c} strokeWidth="1"/>
        <line x1="125" y1="40" x2="125" y2="58" stroke={char.c} strokeWidth=".8" opacity=".5"/>
        <line x1="118" y1="49" x2="132" y2="49" stroke={char.c} strokeWidth=".8" opacity=".5"/>
      </>}

      {/* ââ HAIR ACCESSORY ââ */}
      {seed%4===0&&<circle cx="102" cy="68" r="5" fill={char.c} opacity=".7"/>}
      {seed%4===1&&<path d="M97 62 Q102 57 107 62 Q102 67 97 62 Z" fill={char.c} opacity=".8"/>}
      {seed%4===2&&<rect x="99" y="60" width="8" height="4" rx="2" fill={char.c} opacity=".75" transform="rotate(-20 103 62)"/>}
      {seed%4===3&&<>
        <circle cx="100" cy="63" r="3" fill={char.c} opacity=".8"/>
        <circle cx="107" cy="65" r="2" fill={char.c} opacity=".6"/>
      </>}

      {/* Rarity bottom glow */}
      <rect x="0" y="170" width="160" height="30" fill={`url(#bg_${char.name})`} opacity=".8"/>
      {/* Top corner ornaments */}
      <rect x="5" y="5" width="16" height="2" fill={char.c} opacity=".6"/>
      <rect x="5" y="5" width="2" height="16" fill={char.c} opacity=".6"/>
      <rect x="139" y="5" width="16" height="2" fill={char.c} opacity=".6"/>
      <rect x="153" y="5" width="2" height="16" fill={char.c} opacity=".6"/>
      </g>
    </svg>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   ITEMS
ââââââââââââââââââââââââââââââââââââââââââ */
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

/* ââââââââââââââââââââââââââââââââââââââââââ
   CARD PACKS â 1 card only, harder rates
ââââââââââââââââââââââââââââââââââââââââââ */
const CARD_PACKS = [
  { id:"cp1", name:"Sobre Común",     price:40,  color:"#78909c",
    rates:{common:75,uncommon:18,rare:6,epic:1,legendary:0},
    desc:"Una carta aleatoria" },
  { id:"cp2", name:"Sobre Plata",     price:110, color:C.cyan,
    rates:{common:45,uncommon:35,rare:16,epic:3,legendary:1},
    desc:"Una carta con mejores odds" },
  { id:"cp3", name:"Sobre Oro",       price:260, color:C.gold,
    rates:{common:20,uncommon:30,rare:32,epic:14,legendary:4},
    desc:"Alta probabilidad rara+" },
  { id:"cp4", name:"Sobre Legendario",price:600, color:C.pink,
    rates:{common:5,uncommon:15,rare:30,epic:30,legendary:20},
    desc:"Garantía épica o mejor" },
];

/* ââââââââââââââââââââââââââââââââââââââââââ
   ITEM PACKS â 1-2 items, separate economy
ââââââââââââââââââââââââââââââââââââââââââ */
const ITEM_PACKS = [
  { id:"ip1", name:"Kit Sanación",    price:35,  color:C.green,  emoji:"🧪",
    pool:[["health_potion",0.5],["medicine",0.5]],
    desc:"1 ítem de curación" },
  { id:"ip2", name:"Kit Combate",     price:45,  color:C.red,    emoji:"⚔️",
    pool:[["atk_potion",0.5],["ration",0.3],["shield",0.2]],
    desc:"1 ítem de combate" },
  { id:"ip3", name:"Kit Soporte",     price:55,  color:C.cyan,   emoji:"🛡️",
    pool:[["shield",0.4],["antidote",0.4],["food",0.2]],
    desc:"1 ítem de soporte" },
  { id:"ip4", name:"Kit Premium",     price:180, color:C.pink,   emoji:"✨",
    pool:[["elixir",0.3],["revive",0.25],["shield",0.2],["atk_potion",0.15],["health_potion",0.1]],
    count:2,
    desc:"2 ítems raros" },
];

/* ââââââââââââââââââââââââââââââââââââââââââ
   MISSIONS
ââââââââââââââââââââââââââââââââââââââââââ */
const MISSIONS = [
  { id:"m1", name:"Bosque Oscuro",    time:15,  baseReward:25,  baseRisk:0.35, minTier:0, emoji:"🌲", bg:"#071007" },
  { id:"m2", name:"Mina Maldita",     time:30,  baseReward:55,  baseRisk:0.45, minTier:1, emoji:"⛏️", bg:"#130a07" },
  { id:"m3", name:"Torre del Abismo", time:50,  baseReward:100, baseRisk:0.55, minTier:2, emoji:"🏼", bg:"#07071a" },
  { id:"m4", name:"Cripta Eterna",    time:90,  baseReward:190, baseRisk:0.65, minTier:3, emoji:"💀", bg:"#13071a" },
  { id:"m5", name:"El Imposible",     time:150, baseReward:480, baseRisk:0.78, minTier:4, emoji:"⚠️", bg:"#150505" },
];

/* ââââââââââââââââââââââââââââââââââââââââââ
   HELPERS
ââââââââââââââââââââââââââââââââââââââââââ */
function rollRarity(rates) {
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
  const ch=CHARS[Math.floor(Math.random()*CHARS.length)];
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
    level:1,xp:0,
    status:"idle",emotionalState:"idle",
    shielded:false,atkBuff:0,missionBonus:0,
    missionEnd:null,currentMission:null,
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

/* ââââââââââââââââââââââââââââââââââââââââââ
   CAT LOGO
ââââââââââââââââââââââââââââââââââââââââââ */
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
  return(
    <span style={{display:"inline-flex",gap:1}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} style={{fontSize:8,color:i<=count?color:"#2a2a3a",lineHeight:1}}>★</span>
      ))}
    </span>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   CARD UI
ââââââââââââââââââââââââââââââââââââââââââ */
function CardUI({card,selected,onClick,mini=false}){
  const r=RARITY[card.rarity];
  const ch=CHARS[card.charIdx]||CHARS[0];
  const hpPct=Math.round((card.hp/card.maxHp)*100);
  const stCol={idle:C.green,mission:C.gold,injured:C.red,resting:C.cyan}[card.status]||C.muted;

  if(mini)return(
    <div onClick={onClick} style={{
      background:selected?`${r.color}18`:C.bg3,
      border:`1.5px solid ${selected?r.color:"#ffffff0e"}`,
      borderRadius:10,padding:8,cursor:"pointer",
      width:92,textAlign:"center",userSelect:"none",
      boxShadow:selected?`0 0 16px ${r.glow}`:"none",
      transition:"all .18s",position:"relative",
    }}>
      {selected&&<div style={{position:"absolute",top:-7,right:-7,background:r.color,color:"#000",
        borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>✓</div>}
      <div style={{height:72,overflow:"hidden",borderRadius:6,marginBottom:4}}>
        <AnimeArt char={ch} rarity={card.rarity} w={92} h={72}/>
      </div>
      <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{card.name}</div>
      <Stars count={r.stars} color={r.color}/>
    </div>
  );

  return(
    <div onClick={onClick} style={{
      background:`linear-gradient(170deg,${C.bg3} 60%,${r.color}0d)`,
      border:`1.5px solid ${selected?r.color:"#ffffff0e"}`,
      borderRadius:14,overflow:"hidden",
      cursor:onClick?"pointer":"default",
      width:160,flexShrink:0,userSelect:"none",
      boxShadow:selected?`0 0 26px ${r.glow},0 4px 20px #00000080`:`0 4px 16px #00000055`,
      transition:"transform .2s,box-shadow .2s",position:"relative",
    }}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 0 30px ${r.glow},0 8px 28px #00000090`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=selected?`0 0 26px ${r.glow},0 4px 20px #00000080`:`0 4px 16px #00000055`;}}
    >
      {selected&&<div style={{position:"absolute",top:8,right:8,background:r.color,color:"#000",
        borderRadius:"50%",width:22,height:22,fontSize:12,fontWeight:900,
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:4}}>✓</div>}
      {/* Art */}
      <div style={{height:190,overflow:"hidden",position:"relative"}}>
        <AnimeArt char={ch} rarity={card.rarity} w={160} h={190}/>
        {/* Gradient fade bottom */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:55,
          background:`linear-gradient(transparent,${C.bg3})`}}/>
        {/* Rarity tag */}
        <div style={{position:"absolute",top:8,left:8,
          background:"#00000088",border:`1px solid ${r.color}55`,
          borderRadius:20,padding:"2px 8px",fontSize:9,color:r.color,
          fontWeight:700,backdropFilter:"blur(6px)"}}>
          {r.label}
        </div>
        {/* Status */}
        {card.status!=="idle"&&<div style={{position:"absolute",bottom:12,right:8,
          background:"#00000099",border:`1px solid ${stCol}44`,borderRadius:20,
          padding:"2px 8px",fontSize:9,color:stCol,fontWeight:700}}>
          {card.status==="mission"?"🎯 Misión":card.status==="injured"?"🩹 Herida":"😴 Desc."}
        </div>}
        {card.shielded&&<div style={{position:"absolute",top:8,right:8,fontSize:13}}>🛡️</div>}
        {card.atkBuff>0&&<div style={{position:"absolute",top:28,right:8,fontSize:11,
          color:C.red,fontWeight:700,textShadow:`0 0 8px ${C.red}`}}>+ATK</div>}
      </div>
      {/* Info */}
      <div style={{padding:"10px 12px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:.3}}>{card.name}</div>
            <div style={{fontSize:10,color:ch.c,marginTop:1}}>{card.role}</div>
          </div>
          <Stars count={r.stars} color={r.color}/>
        </div>
        <div style={{marginTop:7,marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:2}}>
            <span>HP</span><span style={{color:hpPct>60?C.green:hpPct>30?C.gold:C.red}}>{card.hp}/{card.maxHp}</span>
          </div>
          <div style={{height:3,background:"#ffffff0e",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,
              background:hpPct>60?C.green:hpPct>30?C.gold:C.red,
              width:hpPct+"%",transition:"width .4s",
              boxShadow:hpPct>60?`0 0 6px ${C.green}88`:hpPct>30?`0 0 6px ${C.gold}88`:`0 0 6px ${C.red}88`}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,fontSize:10}}>
          <span style={{color:"#ff7043"}}>⚔️ {card.atk}</span>
          <span style={{color:"#42a5f5"}}>🛡️ {card.def}</span>
          <span style={{color:"#ab47bc"}}>💨 {card.spd}</span>
        </div>
      </div>
    </div>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   CLAIM REWARD OVERLAY  (addictive)
ââââââââââââââââââââââââââââââââââââââââââ */
function ClaimOverlay({reward,onClaim}){
  const[clicked,setClicked]=useState(false);
  const[particles,setParticles]=useState([]);
  const[scratched,setScratched]=useState(false);

  function handleClaim(){
    if(clicked)return;
    setClicked(true);
    setScratched(true);
    setParticles(Array.from({length:22},(_,i)=>({
      id:i,
      x:Math.random()*300-150,
      y:Math.random()*-200-50,
      r:Math.random()*6+3,
      c:[C.gold,C.pink,C.cyan,"#fff",C.green][i%5],
      delay:Math.random()*0.2,
    })));
    setTimeout(()=>onClaim(),1100);
  }

  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:500,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"relative",textAlign:"center"}}>
        {/* Particles */}
        {particles.map(p=>(
          <div key={p.id} style={{
            position:"absolute",left:"50%",top:"50%",
            width:p.r*2,height:p.r*2,borderRadius:"50%",
            background:p.c,pointerEvents:"none",
            animation:`fly_${p.id} .9s ${p.delay}s forwards`,
            transform:"translate(-50%,-50%)",
            boxShadow:`0 0 8px ${p.c}`,
          }}
            onAnimationEnd={e=>e.target.style.opacity="0"}
          />
        ))}
        <style>{`
          @keyframes pulse_claim { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
          @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
          @keyframes pop_in { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        `}</style>

        {!scratched?(
          <div style={{animation:"pop_in .5s both"}}>
            <div style={{fontSize:16,color:C.muted,letterSpacing:3,marginBottom:12}}>RECOMPENSA LISTA</div>
            <div style={{
              background:C.bg3,
              border:`2px solid ${C.gold}`,
              borderRadius:24,padding:"36px 52px",
              boxShadow:`0 0 60px ${C.gold}44,0 0 120px ${C.gold}22`,
              cursor:"pointer",
              animation:"pulse_claim 1.4s infinite",
              position:"relative",overflow:"hidden",
            }} onClick={handleClaim}>
              {/* Shimmer sweep */}
              <div style={{
                position:"absolute",inset:0,
                background:"linear-gradient(90deg,transparent 0%,#ffffff18 50%,transparent 100%)",
                backgroundSize:"200% 100%",
                animation:"shimmer 1.8s linear infinite",
                borderRadius:22,pointerEvents:"none",
              }}/>
              <div style={{fontSize:52,marginBottom:12}}>💎</div>
              <div style={{fontSize:26,fontWeight:900,color:C.gold,letterSpacing:2,
                textShadow:`0 0 30px ${C.gold}`}}>
                RECLAMAR
              </div>
              <div style={{fontSize:14,color:"#fff",marginTop:8}}>
                +{reward.lili} <span style={{color:C.gold}}>LILI</span>
                {reward.bonus&&<span style={{color:C.pink,marginLeft:8}}>🎁 BONUS!</span>}
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>
                +{reward.xp} XP · {reward.charName}
              </div>
              <div style={{fontSize:11,color:C.cyan,marginTop:6,letterSpacing:1}}>
                TOCA PARA RECLAMAR
              </div>
            </div>
          </div>
        ):(
          <div style={{animation:"pop_in .4s both"}}>
            <div style={{fontSize:64,marginBottom:8}}>✨</div>
            <div style={{fontSize:28,fontWeight:900,color:C.gold,
              textShadow:`0 0 40px ${C.gold}`}}>+{reward.lili} LILI</div>
            {reward.bonus&&<div style={{fontSize:18,color:C.pink,marginTop:4}}>🎁 BONUS x1.6!</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   PACK REVEAL â single card
ââââââââââââââââââââââââââââââââââââââââââ */
function CardPackReveal({card,onClose}){
  const[visible,setVisible]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVisible(true),150);return()=>clearTimeout(t);},[]);
  const r=RARITY[card.rarity];
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(40px) scale(.7)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div style={{fontSize:16,fontWeight:900,letterSpacing:5,color:C.pink,
        textShadow:`0 0 20px ${C.pink}`}}>✦ CARTA OBTENIDA ✦</div>
      <div style={{opacity:visible?1:0,animation:visible?"rise .6s cubic-bezier(.34,1.56,.64,1) both":"none"}}>
        {/* Big glow ring */}
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{position:"absolute",inset:-20,borderRadius:30,
            background:`radial-gradient(circle,${r.glow} 0%,transparent 70%)`,
            animation:"pulse_claim 1.5s infinite"}}/>
          <style>{`@keyframes pulse_claim{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
          <CardUI card={card}/>
        </div>
      </div>
      {visible&&(
        <button onClick={onClose} style={{
          background:"transparent",color:C.pink,border:`2px solid ${C.pink}`,
          borderRadius:10,padding:"10px 44px",fontSize:15,fontWeight:900,
          cursor:"pointer",letterSpacing:2,
          boxShadow:`0 0 20px ${C.pink}44`,transition:"all .2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=C.pink;e.currentTarget.style.color="#000";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.pink;}}>
          CONTINUAR
        </button>
      )}
    </div>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   ITEM PACK REVEAL
ââââââââââââââââââââââââââââââââââââââââââ */
function ItemPackReveal({items:got,onClose}){
  const[vis,setVis]=useState([]);
  useEffect(()=>{
    got.forEach((_,i)=>setTimeout(()=>setVis(p=>[...p,i]),300+i*400));
  },[]);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <div style={{fontSize:16,fontWeight:900,letterSpacing:4,color:C.cyan,textShadow:`0 0 20px ${C.cyan}`}}>
        ✦ ÍTEMS OBTENIDOS ✦
      </div>
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
        <button onClick={onClose} style={{
          background:"transparent",color:C.cyan,border:`2px solid ${C.cyan}`,
          borderRadius:10,padding:"10px 44px",fontSize:15,fontWeight:900,
          cursor:"pointer",letterSpacing:2,boxShadow:`0 0 20px ${C.cyan}44`,transition:"all .2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=C.cyan;e.currentTarget.style.color="#000";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.cyan;}}>
          CONTINUAR
        </button>
      )}
    </div>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   MISSION SELECTOR
ââââââââââââââââââââââââââââââââââââââââââ */
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
        {/* Header */}
        <div style={{background:`linear-gradient(90deg,${mission.bg},${C.bg2})`,
          borderBottom:`1px solid ${C.pink}18`,padding:"18px 24px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:5,
          backdropFilter:"blur(8px)"}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:1}}>
              {mission.emoji} {mission.name}
            </div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>
              ⏱ {mission.time}s · Min: {RARITY[FUSION_MAP[mission.minTier]]?.label}
              · Base: {mission.baseReward} LILI · Riesgo base: {Math.round(mission.baseRisk*100)}%
            </div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.muted}33`,
            color:C.muted,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
        </div>

        <div style={{display:"flex",flexWrap:"wrap"}}>
          {/* Left: cards */}
          <div style={{flex:"1 1 360px",padding:20}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:14,letterSpacing:2}}>
              SELECCIONA PERSONAJE
            </div>
            {avail.length===0&&<div style={{color:C.red,fontSize:13}}>Sin personajes disponibles.</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {avail.map(c=>(
                <div key={c.id} onClick={()=>setSel(c.id===sel?null:c.id)}>
                  <CardUI card={c} selected={sel===c.id} mini/>
                </div>
              ))}
            </div>
          </div>

          {/* Right: stats */}
          <div style={{flex:"0 0 264px",borderLeft:`1px solid ${C.border}`,padding:20,minHeight:320}}>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:14,letterSpacing:2}}>
              ESTADÍSTICAS
            </div>
            {!sc&&<div style={{color:C.muted,fontSize:13,textAlign:"center",marginTop:40}}>
              👉 Elige un personaje
            </div>}
            {sc&&stats&&(
              <div>
                {/* Mini card info */}
                <div style={{background:C.bg3,border:`1px solid ${RARITY[sc.rarity].color}22`,
                  borderRadius:12,padding:10,marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:48,height:60,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                    <AnimeArt char={CHARS[sc.charIdx]||CHARS[0]} rarity={sc.rarity} w={48} h={60}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{sc.name}</div>
                    <div style={{fontSize:10,color:RARITY[sc.rarity].color}}>{RARITY[sc.rarity].label}</div>
                    <Stars count={RARITY[sc.rarity].stars} color={RARITY[sc.rarity].color}/>
                    <div style={{fontSize:10,color:C.muted,marginTop:3}}>
                      ⚔{sc.atk} 🛡{sc.def} 💨{sc.spd}
                    </div>
                  </div>
                </div>
                {/* Bars */}
                {[["✓ Éxito",stats.successPct,C.green],["✕ Fallo",stats.failPct,C.red]].map(([l,v,col])=>(
                  <div key={l} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:col}}>{l}</span>
                      <span style={{fontSize:15,fontWeight:900,color:col,textShadow:`0 0 10px ${col}88`}}>{v}%</span>
                    </div>
                    <div style={{height:8,background:"#ffffff08",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",background:col,borderRadius:4,width:v+"%",
                        boxShadow:`0 0 12px ${col}88`,transition:"width .4s"}}/>
                    </div>
                  </div>
                ))}
                {/* Rewards */}
                <div style={{background:C.bg3,border:`1px solid ${C.gold}18`,borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8,letterSpacing:1}}>RECOMPENSAS</div>
                  {[
                    ["LILI base",`+${stats.reward}`,C.gold],
                    [`Bonus loot (${stats.bonusPct}%)`,`+${stats.bonusReward}`,C.gold],
                    ["XP",`+${stats.xpGain}`,C.cyan],
                  ].map(([l,v,col])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:C.muted}}>{l}</span>
                      <span style={{fontSize:12,color:col,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
                {/* Buffs */}
                {(sc.shielded||sc.atkBuff>0||sc.emotionalState!=="idle")&&(
                  <div style={{background:C.bg3,border:`1px solid ${C.pink}18`,borderRadius:10,padding:10,marginBottom:12}}>
                    {sc.shielded&&<div style={{fontSize:11,color:C.pink,marginBottom:2}}>🛡️ Escudo activo</div>}
                    {sc.atkBuff>0&&<div style={{fontSize:11,color:C.red,marginBottom:2}}>⚔️ +20 ATK (buff)</div>}
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
                  🚀 ENVIAR (5 LILI)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ââââââââââââââââââââââââââââââââââââââââââ
   MAIN APP
ââââââââââââââââââââââââââââââââââââââââââ */
const TABS=["Colección","Tienda","Fusión","Misiones"];

export default function App(){
  const[tab,setTab]=useState("Colección");
  const[lili,setLili]=useState(300);
  const[cards,setCards]=useState([makeCard("common"),makeCard("common"),makeCard("uncommon")]);
  const[items,setItems]=useState({health_potion:2,medicine:1,food:1,ration:0,atk_potion:0,shield:0,antidote:0,elixir:0,revive:0});
  // Reveal states
  const[cardReveal,setCardReveal]=useState(null);
  const[itemReveal,setItemReveal]=useState(null);
  // Pending rewards (manual claim)
  const[pendingRewards,setPendingRewards]=useState([]);
  const[claimTarget,setClaimTarget]=useState(null);
  // Fusion
  const[fusionA,setFusionA]=useState(null);
  const[fusionB,setFusionB]=useState(null);
  const[fusionResult,setFusionResult]=useState(null);
  const[autoFusing,setAutoFusing]=useState(false);
  // Mission
  const[activeMission,setActiveMission]=useState(null);
  const[activeCard,setActiveCard]=useState(null);
  const[collFilter,setCollFilter]=useState("all");
  const[toast,setToast]=useState(null);
  const[now,setNow]=useState(Date.now());

  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);

  // Auto-complete missions â put in pending rewards
  useEffect(()=>{
    let dirty=false;
    const next=cards.map(c=>{
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
          // Add to pending
          setPendingRewards(pr=>[...pr,{
            id:Date.now()+Math.random(),
            lili:liliGain,bonus,xp:xpGain,charName:c.name,
            missionName:m?.name,
            cardId:c.id,
          }]);
          return{...c,status:"idle",missionEnd:null,currentMission:null,
            shielded:false,atkBuff:Math.max(0,c.atkBuff-1),missionBonus:0,
            atk:atkWas?c.atk-20:c.atk,xp:c.xp+xpGain,emotionalState:"motivated"};
        } else {
          const dmg=22+Math.floor(Math.random()*32);
          setPendingRewards(pr=>[...pr,{
            id:Date.now()+Math.random(),
            lili:0,bonus:false,xp:0,charName:c.name,
            missionName:m?.name,failed:true,dmg,
            cardId:c.id,
          }]);
          return{...c,status:"injured",missionEnd:null,currentMission:null,
            shielded:false,missionBonus:0,hp:Math.max(5,c.hp-dmg),emotionalState:"traumatized"};
        }
      }
      return c;
    });
    if(dirty)setCards(next);
  },[now]);

  function toast_(msg){setToast(msg);setTimeout(()=>setToast(null),2800);}

  function buyCardPack(pack){
    if(lili<pack.price){toast_("LILI insuficiente ❌");return;}
    setLili(l=>l-pack.price);
    const nc=makeCard(null,pack.rates);
    setCards(p=>[...p,nc]);
    setCardReveal(nc);
  }
  function buyItemPack(pack){
    if(lili<pack.price){toast_("LILI insuficiente ❌");return;}
    setLili(l=>l-pack.price);
    const count=pack.count||1;
    const got=Array.from({length:count},()=>rollItemFromPool(pack.pool));
    setItems(prev=>{const n={...prev};got.forEach(k=>{n[k]=(n[k]||0)+1;});return n;});
    setItemReveal(got);
  }

  function applyItem(itemId,cardId){
    if(!items[itemId]||items[itemId]<1){toast_("Sin ese ítem");return;}
    setCards(prev=>prev.map(c=>c.id===cardId?ITEMS[itemId].effect(c):c));
    setItems(prev=>({...prev,[itemId]:prev[itemId]-1}));
    toast_(`${ITEMS[itemId].emoji} Usado en ${cards.find(c=>c.id===cardId)?.name}`);
  }

  function claimReward(reward){
    if(reward.lili>0)setLili(l=>l+reward.lili);
    setPendingRewards(pr=>pr.filter(r=>r.id!==reward.id));
    setClaimTarget(null);
  }

  // ââ FUSION ââ
  function doFusion(idA,idB){
    const ca=cards.find(c=>c.id===idA),cb=cards.find(c=>c.id===idB);
    if(!ca||!cb)return null;
    if(ca.rarity!==cb.rarity||ca.rarity==="legendary")return null;
    if(lili<25){toast_("Necesitas 25 LILI para fusionar");return null;}
    const nxt=FUSION_MAP[FUSION_MAP.indexOf(ca.rarity)+1];
    const result=makeCard(nxt);
    setLili(l=>l-25);
    setCards(prev=>prev.filter(c=>c.id!==ca.id&&c.id!==cb.id).concat(result));
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
    // Find all pairs of same-rarity idle cards, fuse from lowest tier upward
    setAutoFusing(true);
    let current=[...cards];
    let totalFused=0,cost=0;
    let changed=true;
    while(changed){
      changed=false;
      for(const tier of[0,1,2,3]){
        const rar=FUSION_MAP[tier];
        const pool=current.filter(c=>c.status==="idle"&&c.rarity===rar&&c.rarity!=="legendary");
        if(pool.length>=2&&lili-cost>=25){
          const[a,b]=pool;
          const nxt=FUSION_MAP[tier+1];
          const result=makeCard(nxt);
          current=current.filter(c=>c.id!==a.id&&c.id!==b.id).concat(result);
          cost+=25;totalFused++;changed=true;break;
        }
      }
    }
    if(totalFused===0){toast_("Sin pares para fusionar");setAutoFusing(false);return;}
    setLili(l=>l-cost);
    setCards(current);
    toast_(`⚡ Auto-fusión: ${totalFused} fusión${totalFused>1?"es":""} (-${cost} LILI)`);
    setAutoFusing(false);
  }

  function sendOnMission(cardId,mission){
    if(lili<5){toast_("Sin LILI");return;}
    const card=cards.find(c=>c.id===cardId);if(!card)return;
    setCards(prev=>prev.map(c=>c.id===cardId
      ?{...c,status:"mission",missionEnd:Date.now()+mission.time*1000,currentMission:mission.id}:c));
    setLili(l=>l-5);setActiveMission(null);
    toast_(`🎯 ${card.name} → "${mission.name}"`);
  }

  const filterFn={all:()=>true,idle:c=>c.status==="idle",mission:c=>c.status==="mission",injured:c=>c.status==="injured"};
  const filteredCards=cards.filter(filterFn[collFilter]||filterFn.all);

  // Pending rewards notification badge
  const pendingCount=pendingRewards.length;

  const NavBtn=({t})=>{
    const isPending=t==="Misiones"&&pendingCount>0;
    return(
      <button onClick={()=>setTab(t)} style={{
        background:tab===t?C.pink:"transparent",
        color:tab===t?"#000":C.muted,
        border:`1px solid ${tab===t?C.pink:"#ffffff10"}`,
        borderRadius:8,padding:"7px 16px",cursor:"pointer",
        fontWeight:tab===t?800:500,fontSize:13,letterSpacing:.5,
        transition:"all .15s",position:"relative",
        boxShadow:tab===t?`0 0 16px ${C.pink}44`:undefined,
      }}>
        {t}
        {isPending&&<span style={{
          position:"absolute",top:-6,right:-6,
          background:C.red,color:"#fff",borderRadius:"50%",
          width:18,height:18,fontSize:10,fontWeight:900,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 10px ${C.red}`,
          animation:"pulse_badge .8s infinite alternate",
        }}>{pendingCount}</span>}
      </button>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`
        @keyframes pulse_badge{from{transform:scale(1)}to{transform:scale(1.25)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fade_in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0c0c1e}
        ::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:4px}
      `}</style>
      {/* Scanlines */}
      <div style={{position:"fixed",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,#ffffff01 3px,#ffffff01 4px)",pointerEvents:"none",zIndex:0}}/>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:30,
        background:"#07071099",backdropFilter:"blur(18px)",
        borderBottom:`1px solid ${C.pink}18`,padding:"12px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <CatLogo size={38}/>
          <div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:3,color:C.pink,
              textShadow:`0 0 20px ${C.pink}88`}}>LILI</div>
            <div style={{fontSize:8,color:C.muted,letterSpacing:4,marginTop:-3}}>CARD UNIVERSE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {TABS.map(t=><NavBtn key={t} t={t}/>)}
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}28`,borderRadius:24,
            padding:"5px 14px",display:"flex",alignItems:"center",gap:7}}>
            <CatLogo size={15}/>
            <span style={{color:C.gold,fontWeight:900,fontSize:16,textShadow:`0 0 10px ${C.gold}66`}}>{lili}</span>
            <span style={{color:C.muted,fontSize:11}}>LILI</span>
          </div>
          <span style={{fontSize:12,color:C.muted}}>🎴{cards.length}</span>
        </div>
      </div>

      <div style={{padding:16,maxWidth:1040,margin:"0 auto",position:"relative",zIndex:1}}>

        {/* ââ COLECCIÓN ââ */}
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
                  <CardUI card={c} selected={activeCard===c.id}
                    onClick={()=>setActiveCard(activeCard===c.id?null:c.id)}/>
                  {activeCard===c.id&&(
                    <div style={{background:C.bg3,border:`1px solid ${RARITY[c.rarity].color}1a`,
                      borderRadius:"0 0 12px 12px",padding:10,width:160,marginTop:-2}}>
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
                      {c.status==="mission"&&<div style={{fontSize:9,color:C.red,textAlign:"center",marginTop:3}}>En misión</div>}
                    </div>
                  )}
                </div>
              ))}
              {filteredCards.length===0&&<div style={{color:C.muted,fontSize:13}}>Sin cartas.</div>}
            </div>
          </div>
        )}

        {/* ââ TIENDA ââ */}
        {tab==="Tienda"&&(
          <div style={{animation:"fade_in .3s both"}}>
            {/* Card Packs */}
            <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:12,letterSpacing:2}}>SOBRES DE CARTAS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:28}}>
              {CARD_PACKS.map(pack=>(
                <div key={pack.id} style={{background:C.bg3,border:`1.5px solid ${pack.color}22`,
                  borderRadius:16,padding:18,minWidth:190,maxWidth:220,flex:"1 1 190px",
                  boxShadow:`0 0 25px ${pack.color}07`}}>
                  <div style={{fontSize:17,fontWeight:900,color:pack.color,marginBottom:3,
                    textShadow:`0 0 12px ${pack.color}55`}}>{pack.name}</div>
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
                    <CatLogo size={14}/> {pack.price} LILI
                  </button>
                </div>
              ))}
            </div>
            {/* Item Packs */}
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:12,letterSpacing:2}}>KITS DE ÍTEMS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14}}>
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
                    {pack.price} LILI
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ââ FUSIÓN ââ */}
        {tab==="Fusión"&&(
          <div style={{animation:"fade_in .3s both"}}>
            {/* Formula */}
            <div style={{background:C.bg3,border:`1px solid ${C.pink}18`,borderRadius:14,padding:14,marginBottom:16}}>
              <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:8,letterSpacing:2}}>FÓRMULA – 25 LILI</div>
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
            {/* Auto-fusion button */}
            <div style={{marginBottom:16}}>
              <button onClick={autoFusion} disabled={autoFusing}
                style={{background:`linear-gradient(90deg,${C.pink},${C.purple})`,
                  color:"#fff",border:"none",borderRadius:12,
                  padding:"12px 28px",fontWeight:900,fontSize:14,cursor:"pointer",
                  letterSpacing:1,boxShadow:`0 0 24px ${C.pink}44`,
                  display:"flex",alignItems:"center",gap:8,transition:"all .2s"}}>
                ⚡ AUTO-FUSIÓN
                <span style={{fontSize:11,color:"#ffffff88",fontWeight:400}}>
                  (fusiona todos los pares disponibles)
                </span>
              </button>
            </div>
            {/* Manual */}
            <div style={{fontSize:11,color:C.muted,marginBottom:10}}>
              O selecciona 2 cartas libres de la misma rareza:
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:20}}>
              {cards.filter(c=>c.status==="idle").map(c=>{
                const sel=fusionA===c.id||fusionB===c.id;
                return(
                  <div key={c.id} onClick={()=>{
                    if(fusionA===c.id){setFusionA(null);return;}
                    if(fusionB===c.id){setFusionB(null);return;}
                    if(!fusionA)setFusionA(c.id);
                    else if(!fusionB)setFusionB(c.id);
                  }}>
                    <CardUI card={c} selected={sel}/>
                  </div>
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
                      style={{background:ok&&lili>=25?C.pink:"#ffffff0a",
                        color:ok&&lili>=25?"#000":"#333",border:"none",
                        borderRadius:10,padding:"11px 26px",fontWeight:900,fontSize:14,
                        cursor:ok&&lili>=25?"pointer":"not-allowed",
                        boxShadow:ok&&lili>=25?`0 0 20px ${C.pink}55`:undefined}}>
                      Fusionar (25 LILI)
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
                    color:C.muted,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12}}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ââ MISIONES ââ */}
        {tab==="Misiones"&&(
          <div style={{animation:"fade_in .3s both",display:"flex",gap:16,flexWrap:"wrap"}}>
            {/* Mission list */}
            <div style={{flex:"2 1 300px"}}>
              {/* Pending rewards */}
              {pendingRewards.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:10,letterSpacing:2}}>
                    ⚡ RECOMPENSAS PENDIENTES ({pendingRewards.length})
                  </div>
                  {pendingRewards.map(rw=>(
                    <div key={rw.id}
                      onClick={()=>setClaimTarget(rw)}
                      style={{
                        background:`linear-gradient(90deg,${rw.failed?"#1a0505":"#071a05"},${C.bg3})`,
                        border:`1.5px solid ${rw.failed?C.red+"40":C.gold+"50"}`,
                        borderRadius:12,padding:"12px 16px",marginBottom:8,
                        cursor:"pointer",
                        boxShadow:rw.failed?"none":`0 0 20px ${C.gold}22`,
                        display:"flex",justifyContent:"space-between",alignItems:"center",
                        animation:"pulse_badge .9s infinite alternate",
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.01)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="";}}
                    >
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:rw.failed?C.red:C.gold}}>
                          {rw.failed?"✕ Misión fallida":"✓ Recompensa lista"}
                        </div>
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                          {rw.charName} · {rw.missionName}
                          {rw.failed&&` · -${rw.dmg} HP`}
                        </div>
                      </div>
                      {!rw.failed&&(
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:18,fontWeight:900,color:C.gold,textShadow:`0 0 12px ${C.gold}`}}>
                            +{rw.lili}
                          </div>
                          <div style={{fontSize:10,color:C.pink,fontWeight:700,
                            animation:"shimmer 1.5s linear infinite",
                            backgroundSize:"200% auto",
                            background:`linear-gradient(90deg,${C.pink},${C.gold},${C.pink})`,
                            backgroundClip:"text",WebkitBackgroundClipText:"text",
                            WebkitTextFillColor:"transparent",
                          }}>
                            {rw.bonus?"BONUS ×1.6 ":""}RECLAMAR →
                          </div>
                        </div>
                      )}
                      {rw.failed&&(
                        <button onClick={e=>{e.stopPropagation();claimReward(rw);}}
                          style={{background:C.red+"20",color:C.red,border:`1px solid ${C.red}40`,
                            borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>
                          OK
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{fontSize:11,color:C.muted,marginBottom:12,letterSpacing:1}}>
                MISIONES DISPONIBLES
              </div>
              {MISSIONS.map(m=>(
                <div key={m.id}
                  onClick={()=>setActiveMission(m)}
                  style={{background:`linear-gradient(90deg,${m.bg},${C.bg3})`,
                    border:`1.5px solid ${C.pink}14`,borderRadius:13,padding:14,
                    marginBottom:9,cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.pink}44`;e.currentTarget.style.transform="translateX(5px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=`${C.pink}14`;e.currentTarget.style.transform="";}}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <span style={{fontSize:28}}>{m.emoji}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{m.name}</div>
                        <div style={{fontSize:11,color:C.muted}}>
                          ⏱ {m.time}s · 📊 {Math.round(m.baseRisk*100)}% riesgo · 💰 {m.baseReward} LILI base
                        </div>
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

            {/* Right: active missions */}
            <div style={{flex:"1 1 200px"}}>
              <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:10,letterSpacing:2}}>
                EN MISIÓN
              </div>
              {cards.filter(c=>c.status==="mission").map(c=>{
                const secs=Math.max(0,Math.ceil((c.missionEnd-now)/1000));
                const total=MISSIONS.find(x=>x.id===c.currentMission)?.time||60;
                const pct=Math.round(((total-secs)/total)*100);
                const r=RARITY[c.rarity];
                return(
                  <div key={c.id} style={{background:C.bg3,border:`1px solid ${r.color}18`,
                    borderRadius:12,padding:11,marginBottom:10}}>
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
                        width:pct+"%",transition:"width 1s linear",
                        boxShadow:`0 0 8px ${C.gold}88`}}/>
                    </div>
                  </div>
                );
              })}
              {cards.filter(c=>c.status==="mission").length===0&&(
                <div style={{fontSize:12,color:"#2a2a3a"}}>Sin héroes en misión.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {cardReveal&&<CardPackReveal card={cardReveal} onClose={()=>setCardReveal(null)}/>}
      {itemReveal&&<ItemPackReveal items={itemReveal} onClose={()=>setItemReveal(null)}/>}
      {activeMission&&(
        <MissionModal mission={activeMission} cards={cards}
          onSend={sendOnMission} onClose={()=>setActiveMission(null)}/>
      )}
      {claimTarget&&!claimTarget.failed&&(
        <ClaimOverlay reward={claimTarget} onClaim={()=>claimReward(claimTarget)}/>
      )}

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
  );
}
