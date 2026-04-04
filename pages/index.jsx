import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const C = {
  bg:"#000008", bg2:"#03030e", bg3:"#070714",
  pink:"#ff00cc", cyan:"#00cfff", gold:"#ffc400",
  red:"#ff0044", green:"#00ff88", purple:"#bb00ff",
  text:"#f0f0ff", muted:"#484870", border:"#ffffff08",
};

const RARITY = {
  common:    { label:"COMÚN",      color:"#8899aa", glow:"#8899aa30", tier:0, stars:1 },
  uncommon:  { label:"POCO COMÚN", color:"#00e5cc", glow:"#00e5cc40", tier:1, stars:2 },
  rare:      { label:"RARO",       color:"#2979ff", glow:"#2979ff50", tier:2, stars:3 },
  epic:      { label:"ÉPICO",      color:"#dd00ff", glow:"#dd00ff50", tier:3, stars:4 },
  legendary: { label:"LEGENDARIO", color:"#ffc400", glow:"#ffc40055", tier:4, stars:5 },
  divine:    { label:"DIVINA",     color:"#ffffff", glow:"#ffffff66", tier:5, stars:6 },
};
const FUSION_MAP = ["common","uncommon","rare","epic","legendary"];

const CHARS = [
  // common — SFW
  { name:"Sera",  img:"/chars/sera.png",  pos:"center 15%", role:"Sanadora",   cls:"Clérigo", atkT:"Luz",          c:"#00e676" },
  { name:"Faye",  img:"/chars/faye.png",  pos:"center 25%", role:"Espía",      cls:"Sombra",  atkT:"Veneno",       c:"#00bfa5" },
  { name:"Kaine", img:"/chars/kaine.png", pos:"center 30%", role:"Berserker",  cls:"Guerrera",atkT:"Fuerza",       c:"#ff1744" },
  { name:"Akari", img:"/chars/akari.png", pos:"center 15%", role:"Maga Oscura",cls:"Maga",    atkT:"Magia",        c:"#7c4dff" },
  // uncommon — sugestivas
  { name:"Rein",  img:"/chars/rein.png",  pos:"center 20%", role:"Guardiana",  cls:"Paladín", atkT:"Escudo",       c:"#ffd54f" },
  { name:"Yoru",  img:"/chars/yoru.png",  pos:"center 25%", role:"Asesina",    cls:"Sombra",  atkT:"Filo",         c:"#e040fb" },
  // rare — más sensual
  { name:"Lyra",  img:"/chars/lyra.png",  pos:"center 15%", role:"Bardo",      cls:"Soporte", atkT:"Sonido",       c:"#ff9800" },
  // epic — explícitas
  { name:"Vex",   img:"/chars/vex.png",   pos:"center 20%", role:"Invocadora", cls:"Maga",    atkT:"Caos",         c:"#ff4081" },
  { name:"Mira",  img:"/chars/mira.png",  pos:"center 35%", role:"Druida",     cls:"Maga",    atkT:"Natura",       c:"#76ff03" },
  // legendary — muy explícitas
  { name:"Dusk",  img:"/chars/dusk.png",  pos:"center 30%", role:"Nigromante", cls:"Maga",    atkT:"Muerte",       c:"#7e57c2" },
  { name:"Rin",   img:"/chars/rin.png",   pos:"center 30%", role:"Kunoichi",   cls:"Sombra",  atkT:"Shuriken",     c:"#ff4081" },
  { name:"Zero",  img:"/chars/zero.png",  pos:"center 30%", role:"La Absoluta",cls:"Vacío",   atkT:"Aniquilación", c:"#ffffff" },
  { name:"Nyx",   img:"/chars/nyx.png",   pos:"center 25%", role:"Cazadora",   cls:"Arquera", atkT:"Flecha",       c:"#00e5ff" },
];

const RARITY_POOLS = {
  common:    ["Sera","Faye","Kaine","Akari"],
  uncommon:  ["Rein","Yoru"],
  rare:      ["Lyra"],
  epic:      ["Vex","Mira"],
  legendary: ["Dusk","Rin","Zero","Nyx"],
};

/* Precios venta */
const SELL_PRICES = { common:20, uncommon:50, rare:120, epic:260, legendary:600 };


const TRAIN_COST = (lvl) => 30 + lvl * 15;

/* ── CARTA CON MARCO FANTASY ── */
/* mode: "col" = colección (stats), "mission" = enviar misión (botón), "mini" = compacta, "arena" = arena */
function CardUI({ card, selected, onClick, mode="col", onSendMission }) {
  const r = RARITY[card.rarity] || RARITY.common;
  const ch = CHARS.find(c=>c.name===card.name) || CHARS[card.charIdx] || CHARS[0];
  const isDivine = card.rarity === "divine";
  const col = r.color;
  const hpPct = Math.min(100, Math.round((card.hp / card.maxHp) * 100));
  const stCol = { idle:C.green, mission:C.gold, injured:C.red }[card.status] || C.muted;

  if (mode === "mini") {
    return (
      <div onClick={onClick} style={{
        position:"relative", width:100, cursor:"pointer", userSelect:"none",
        filter: selected ? `drop-shadow(0 0 12px ${col})` : undefined,
        transition:"filter .18s, transform .18s",
        transform: selected ? "scale(1.05)" : undefined,
      }}>
        {/* Mini frame */}
        <div style={{
          borderRadius:10, overflow:"hidden",
          border:`2px solid ${col}`,
          boxShadow:`0 0 14px ${col}55, inset 0 0 10px #00000088`,
          background:"#07071a",
          position:"relative",
        }}>
          <img src={ch.img} alt={ch.name} style={{
            width:"100%", height:130, objectFit:"cover", objectPosition:"center top", display:"block",
            filter: "brightness(0.75) contrast(1.1)"
          }}/>
          {/* bottom overlay */}
          <div style={{
            background:`linear-gradient(transparent,#000000cc)`,
            padding:"18px 6px 6px",
            position:"absolute", bottom:0, left:0, right:0,
          }}>
            <div style={{fontSize:11,fontWeight:800,color:"#fff",textAlign:"center",
              textShadow:`0 0 8px ${col}`}}>{card.name}</div>
            <div style={{display:"flex",justifyContent:"center",marginTop:2}}>
              {Array.from({length:Math.max(5,r.stars)},(_,i)=>(
                <span key={i} style={{fontSize:7,color:i<r.stars?col:"#2a2a3a"}}>★</span>
              ))}
            </div>
          </div>
          {/* Rarity badge */}
          <div style={{position:"absolute",top:4,left:4,background:"#000000aa",
            border:`1px solid ${col}55`,borderRadius:6,padding:"1px 5px",
            fontSize:7,color:col,fontWeight:700}}>{r.label}</div>
          {selected && <div style={{position:"absolute",top:4,right:4,background:col,color:"#000",
            borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,
            display:"flex",alignItems:"center",justifyContent:"center"}}>✓</div>}
          {card.status !== "idle" && (
            <div style={{position:"absolute",bottom:38,right:4,fontSize:10}}>{card.status==="mission"?"":card.status==="injured"?"":""}</div>
          )}
        </div>
        {/* Corner top ornaments */}
        <div style={{position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",
          background:"#07071a",border:`2px solid ${col}`,borderRadius:"50%",
          width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:8,color:col,boxShadow:`0 0 6px ${col}`}}>♥</div>
      </div>
    );
  }

  /* Full card */
  const cardW = 170;
  const cardH = 285;
  const corner = (t,l,r,b)=>({position:"absolute",top:t,left:l,right:r,bottom:b,width:14,height:14,
    borderColor:col,borderStyle:"solid",borderWidth:0,
    ...(t!==undefined&&l!==undefined?{borderTopWidth:2,borderLeftWidth:2}:{}),
    ...(t!==undefined&&r!==undefined?{borderTopWidth:2,borderRightWidth:2}:{}),
    ...(b!==undefined&&l!==undefined?{borderBottomWidth:2,borderLeftWidth:2}:{}),
    ...(b!==undefined&&r!==undefined?{borderBottomWidth:2,borderRightWidth:2}:{}),
    boxShadow:`0 0 8px ${col}88`,pointerEvents:"none",zIndex:4,
  });

  return (
    <div onClick={onClick} style={{
      position:"relative", width:cardW, height:cardH, userSelect:"none",
      cursor:onClick?"pointer":"default",
      borderRadius:12,
      transition:"transform .2s, box-shadow .2s",
      transform: selected ? "scale(1.05) translateY(-4px)" : undefined,
      boxShadow: selected
        ? `0 0 0 1.5px ${col}, 0 0 24px ${col}aa, 0 0 60px ${col}44`
        : `0 0 0 1px ${col}55, 0 0 12px ${col}22`,
    }}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-6px) scale(1.02)";e.currentTarget.style.boxShadow=`0 0 0 1.5px ${col}, 0 0 28px ${col}aa, 0 0 60px ${col}44`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform=selected?"scale(1.05) translateY(-4px)":"";e.currentTarget.style.boxShadow=selected?`0 0 0 1.5px ${col}, 0 0 24px ${col}aa, 0 0 60px ${col}44`:`0 0 0 1px ${col}55, 0 0 12px ${col}22`;}}
    >
      {/* ── CHARACTER ── */}
      <div style={{position:"absolute",inset:0,borderRadius:11,overflow:"hidden",background:"#000"}}>
        <div style={{position:"absolute",top:"-15%",left:"-8%",right:"-8%",bottom:"-5%"}}>
          <img src={ch.img} alt={ch.name} style={{
            width:"100%",height:"100%",objectFit:"cover",objectPosition:ch.pos||"center 12%",display:"block",
            filter:isDivine?"brightness(1.05) contrast(1.1)":"brightness(0.88) contrast(1.05)",
          }}/>
        </div>
      </div>

      {/* ── GRADIENT OVERLAYS ── */}
      {/* Top tint */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"45%",borderRadius:"11px 11px 0 0",
        background:`linear-gradient(to bottom, ${col}33 0%, ${col}11 40%, transparent 100%)`,
        pointerEvents:"none",zIndex:1}}/>
      {/* Bottom dark panel */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:mode==="mission"?"52px":"72px",
        borderRadius:"0 0 11px 11px",
        background:`linear-gradient(to top, #000000f5 0%, #000000cc 50%, transparent 100%)`,
        pointerEvents:"none",zIndex:1}}/>
      {/* Left glow strip */}
      <div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:2,zIndex:2,
        background:`linear-gradient(to bottom,transparent,${col}88,transparent)`,borderRadius:1,pointerEvents:"none"}}/>
      {/* Right glow strip */}
      <div style={{position:"absolute",right:0,top:"20%",bottom:"20%",width:2,zIndex:2,
        background:`linear-gradient(to bottom,transparent,${col}88,transparent)`,borderRadius:1,pointerEvents:"none"}}/>

      {/* ── CORNER BRACKETS ── */}
      <div style={{...corner(4,4,undefined,undefined)}}/>
      <div style={{...corner(4,undefined,4,undefined)}}/>
      <div style={{...corner(undefined,4,undefined,4)}}/>
      <div style={{...corner(undefined,undefined,4,4)}}/>
      {/* Top center gem */}
      <div style={{position:"absolute",top:-5,left:"50%",transform:"translateX(-50%) rotate(45deg)",
        width:10,height:10,background:col,zIndex:5,pointerEvents:"none",
        boxShadow:`0 0 12px ${col}, 0 0 4px #fff`}}/>
      {/* Bottom center gem */}
      <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%) rotate(45deg)",
        width:8,height:8,background:col,zIndex:5,pointerEvents:"none",
        boxShadow:`0 0 10px ${col}`}}/>

      {/* ── RARITY BADGE ── */}
      <div style={{
        position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",
        background:"#000000dd",border:`1px solid ${col}88`,borderRadius:20,
        padding:"2px 10px",fontSize:7,color:col,fontWeight:900,
        letterSpacing:2,textShadow:`0 0 8px ${col}`,whiteSpace:"nowrap",zIndex:3,
      }}>{r.label}</div>

      {/* Stars */}
      <div style={{position:"absolute",top:22,left:"50%",transform:"translateX(-50%)",display:"flex",gap:1,zIndex:3}}>
        {Array.from({length:r.stars},(_,i)=>(
          <span key={i} style={{fontSize:7,color:col,textShadow:`0 0 5px ${col}`}}>★</span>
        ))}
      </div>

      {/* Status badge */}
      {card.status!=="idle"&&(
        <div style={{position:"absolute",top:6,right:8,background:"#000000cc",
          border:`1px solid ${stCol}66`,borderRadius:20,padding:"2px 6px",
          fontSize:7,color:stCol,fontWeight:900,letterSpacing:1,zIndex:3}}>
          {card.status==="mission"?"MISIÓN":card.status==="injured"?"HERIDA":"DESC."}
        </div>
      )}
      {card.shielded&&<div style={{position:"absolute",top:28,right:8,fontSize:10,zIndex:3}}></div>}

      {/* ── BOTTOM CONTENT ── */}
      {mode==="mission" ? (
        <button onClick={e=>{e.stopPropagation();onSendMission&&onSendMission();}}
          disabled={card.status!=="idle"}
          style={{
            position:"absolute",bottom:0,left:0,right:0,height:52,zIndex:3,
            background:card.status==="idle"
              ?`linear-gradient(90deg,${col}cc,${col}66)`:"#ffffff08",
            border:"none",borderRadius:"0 0 11px 11px",
            color:card.status==="idle"?"#000":"#444",
            fontSize:10,fontWeight:900,letterSpacing:2,
            cursor:card.status==="idle"?"pointer":"not-allowed",
            fontFamily:"'Orbitron',sans-serif",
            boxShadow:card.status==="idle"?`inset 0 1px 0 ${col}66`:undefined,
          }}>
          {card.status==="idle"?"ENVIAR MISIÓN":card.status==="mission"?"EN MISIÓN":"NO DISPONIBLE"}
        </button>
      ) : (
        <div style={{position:"absolute",bottom:6,left:8,right:8,zIndex:3}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
            <span style={{fontSize:11,fontWeight:900,color:"#fff",textShadow:`0 0 10px ${col}`,letterSpacing:1}}>{card.name}</span>
            {card.level>1&&<span style={{fontSize:8,color:C.gold,fontWeight:700}}>LV{card.level}</span>}
          </div>
          <div style={{height:2,background:"#ffffff10",borderRadius:2,overflow:"hidden",marginBottom:3}}>
            <div style={{height:"100%",borderRadius:2,
              background:isDivine?C.gold:hpPct>60?C.green:hpPct>30?C.gold:C.red,
              width:(isDivine?100:hpPct)+"%",boxShadow:`0 0 6px currentColor`}}/>
          </div>
          <div style={{display:"flex",gap:4,fontSize:9,justifyContent:"space-around"}}>
            <span style={{color:"#ff6644",fontWeight:700}}>{card.atk}</span>
            <span style={{color:"#44aaff",fontWeight:700}}>{card.def}</span>
            <span style={{color:"#cc44ff",fontWeight:700}}>{card.spd}</span>
            <span style={{color:hpPct>60?C.green:hpPct>30?C.gold:C.red,fontWeight:700}}>{card.hp}</span>
          </div>
        </div>
      )}

      {/* Selected ✓ */}
      {selected&&(
        <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",
          background:col,color:"#000",borderRadius:"50%",width:20,height:20,
          fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 14px ${col}`,zIndex:6}}>✓</div>
      )}
    </div>
  );
}

const SPRITES = {
  health_potion: { col: 0, row: 0 },
  medicine:      { col: 1, row: 0 },
  food:          { col: 2, row: 0 },
  ration:        { col: 3, row: 0 },
  shield:        { col: 4, row: 0 },
  atk_potion:    { col: 0, row: 1 },
  enemy_wolf:    { col: 1, row: 1 },
  item_headphones: { col: 2, row: 1 },
  enemy_archer:  { col: 3, row: 1 },
  antidote:      { col: 4, row: 1 },
  enemy_golem:   { col: 0, row: 2 },
  enemy_wolf2:   { col: 1, row: 2 },
  enemy_knight:  { col: 2, row: 2 },
  enemy_dragon:  { col: 3, row: 2 },
  enemy_demon:   { col: 4, row: 2 },
  pack_healing:  { col: 0, row: 3 },
  pack_skull:    { col: 1, row: 3 },
  pack_support:  { col: 2, row: 3 },
  pack_combat:   { col: 3, row: 3 },
  pack_premium:  { col: 4, row: 3 },
  coin:          { col: 0, row: 4 },
  skull_horns:   { col: 1, row: 4 },
  timer:         { col: 2, row: 4 },
  warning:       { col: 3, row: 4 },
  map:           { col: 4, row: 4 },
  revive:        { col: 0, row: 5 },
  star_badge:    { col: 1, row: 5 },
  elixir:        { col: 2, row: 5 },
  btn_mission:   { col: 3, row: 5, wide: true },
};

function Sprite({ icon, size=40, style={} }) {
  const s = SPRITES[icon];
  if (!s) return null;
  const w = s.wide ? size*2 : size;
  // Sprite sheet: 5 cols × 6 rows
  // backgroundSize in px so positioning is pixel-perfect
  const sheetW = size * 5;
  const sheetH = size * 6;
  const posX = -(s.col * size);
  const posY = -(s.row * size);
  return (
    <div style={{
      width: w, height: size, flexShrink:0,
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      verticalAlign:"middle", ...style,
    }}>
      <div style={{
        width: w, height: size,
        backgroundImage: "url('/spritesheet.png')",
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundPosition: `${posX}px ${posY}px`,
        backgroundRepeat: "no-repeat",
        mixBlendMode: "screen",
        filter: "brightness(1.2) saturate(1.3)",
        flexShrink: 0,
      }}/>
    </div>
  );
}

/* ── ITEMS ── */
const ITEMS = {
  health_potion:{ name:"Poción HP",    icon:"health_potion", color:C.green,  desc:"Restaura HP al 100%",       effect:c=>({...c,hp:c.maxHp,status:c.status==="injured"?"idle":c.status}) },
  medicine:     { name:"Medicina",     icon:"medicine",      color:C.cyan,   desc:"+40 HP, cura herida",        effect:c=>({...c,hp:Math.min(c.maxHp,c.hp+40),status:c.status==="injured"?"idle":c.status}) },
  food:         { name:"Comida",       icon:"food",          color:"#ff9800", desc:"+20 HP",                    effect:c=>({...c,hp:Math.min(c.maxHp,c.hp+20)}) },
  ration:       { name:"Ración",       icon:"ration",        color:"#ffd54f", desc:"+15 HP +5% éxito misión",  effect:c=>({...c,hp:Math.min(c.maxHp,c.hp+15),missionBonus:(c.missionBonus||0)+0.05}) },
  atk_potion:   { name:"Elixir ATK",   icon:"atk_potion",    color:C.red,    desc:"+20 ATK próxima misión",    effect:c=>({...c,atk:c.atk+20,atkBuff:(c.atkBuff||0)+1}) },
  shield:       { name:"Escudo",       icon:"shield",        color:C.pink,   desc:"Absorbe 1 fallo en misión", effect:c=>({...c,shielded:true}) },
  antidote:     { name:"Antídoto",     icon:"antidote",      color:"#ea80fc", desc:"Cura estado traumatizado",  effect:c=>({...c,emotionalState:"idle"}) },
  elixir:       { name:"Elixir Épico", icon:"elixir",        color:C.gold,   desc:"+50HP +10ATK permanente",   effect:c=>({...c,hp:Math.min(c.maxHp+20,c.hp+50),atk:c.atk+10,maxHp:c.maxHp+20}) },
  revive:       { name:"Revive",       icon:"revive",        color:C.gold,   desc:"Revive con 50% HP",         effect:c=>({...c,hp:Math.floor(c.maxHp*0.5),status:"idle",emotionalState:"traumatized"}) },
};
const ITEM_ORDER=["health_potion","medicine","food","ration","atk_potion","shield","antidote","elixir","revive"];

const CARD_PACKS = [
  { id:"cp1", name:"Sobre Común",      price:40,  color:"#78909c", rates:{common:75,uncommon:18,rare:6,epic:1,legendary:0},   desc:"Una carta aleatoria" },
  { id:"cp2", name:"Sobre Plata",      price:110, color:C.cyan,    rates:{common:45,uncommon:35,rare:16,epic:3,legendary:1},  desc:"Una carta con mejores odds" },
  { id:"cp3", name:"Sobre Oro",        price:260, color:C.gold,    rates:{common:20,uncommon:30,rare:32,epic:14,legendary:4}, desc:"Alta probabilidad rara+" },
  { id:"cp4", name:"Sobre Legendario", price:600, color:C.pink,    rates:{common:5,uncommon:15,rare:30,epic:30,legendary:20}, desc:"Garantía épica o mejor" },
];

const ITEM_PACKS = [
  { id:"ip1", name:"Kit Sanación", price:35,  color:C.green, icon:"pack_healing", pool:[["health_potion",0.5],["medicine",0.5]],                                               desc:"1 ítem de curación" },
  { id:"ip2", name:"Kit Combate",  price:45,  color:C.red,   icon:"pack_combat",  pool:[["atk_potion",0.5],["ration",0.3],["shield",0.2]],                                    desc:"1 ítem de combate" },
  { id:"ip3", name:"Kit Soporte",  price:55,  color:C.cyan,  icon:"pack_support", pool:[["shield",0.4],["antidote",0.4],["food",0.2]],                                        desc:"1 ítem de soporte" },
  { id:"ip4", name:"Kit Premium",  price:180, color:C.pink,  icon:"pack_premium", pool:[["elixir",0.3],["revive",0.25],["shield",0.2],["atk_potion",0.15],["health_potion",0.1]], count:2, desc:"2 ítems raros" },
];

const MISSIONS = [
  { id:"m1", name:"Bosque Oscuro",    time:15,  baseReward:25,  baseRisk:0.35, minTier:0, icon:"map", bg:"#071007", img: "/conceptos para misiones/bosque oscuro.webp" },
  { id:"m2", name:"Mina Maldita",     time:30,  baseReward:55,  baseRisk:0.45, minTier:1, icon:"pack_skull", bg:"#130a07", img: "/conceptos para misiones/mina maldita.webp" },
  { id:"m3", name:"Torre del Abismo", time:50,  baseReward:100, baseRisk:0.55, minTier:2, icon:"skull_horns", bg:"#07071a", img: "/conceptos para misiones/torre delabismo.webp" },
  { id:"m4", name:"Cripta Eterna",    time:90,  baseReward:190, baseRisk:0.65, minTier:3, icon:"revive", bg:"#13071a", img: "/conceptos para misiones/crytap eterna.webp" },
  { id:"m5", name:"El Imposible",     time:150, baseReward:480, baseRisk:0.78, minTier:4, icon:"warning", bg:"#150505", img: "/conceptos para misiones/imposible.webp" },
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
  const pool=RARITY_POOLS[r]||RARITY_POOLS.common;
  const eligibleChars=CHARS.filter(c=>pool.includes(c.name));
  const ch=eligibleChars[Math.floor(Math.random()*eligibleChars.length)];
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
  fail-=tier*0.05; fail-=(card.def/150)*0.07; fail-=(card.spd/120)*0.04;
  if(card.shielded)fail-=0.12;
  if(card.emotionalState==="traumatized")fail+=0.15;
  if(card.emotionalState==="motivated")fail-=0.07;
  fail-=(card.missionBonus||0);
  fail=Math.max(0.05,Math.min(0.95,fail));
  const rew=Math.round(mission.baseReward*(1+tier*0.18+(card.atk/250)*0.15+(card.atkBuff>0?0.12:0)));
  const bonusPct=Math.min(55,tier*9+(card.atk/400)*10);
  return{ failPct:Math.round(fail*100), successPct:Math.round((1-fail)*100),
    reward:rew, bonusReward:Math.round(rew*1.6), bonusPct:Math.round(bonusPct), xpGain:12+tier*7 };
}

function Z5Icon({size=28}){
  return(
    <img src="/Z5.png" alt="Z5" style={{
      width:size, height:size,
      objectFit:"contain", display:"inline-block", verticalAlign:"middle",
      mixBlendMode:"screen", flexShrink:0,
    }}/>
  );
}
function CatLogo({size=28}){ return <Z5Icon size={size}/>; }

/* ── CARD PACK REVEAL ── */
function CardPackReveal({card,onClose}){
  const[visible,setVisible]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVisible(true),150);return()=>clearTimeout(t);},[]);
  const r=RARITY[card.rarity]||RARITY.common;
  const isDivine=card.rarity==="divine";
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:300,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24}}>
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(40px) scale(.7)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes pulse_ring{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      <div style={{fontSize:16,fontWeight:900,letterSpacing:5,color:isDivine?"#fff":C.pink,
        textShadow:`0 0 20px ${isDivine?"#fff":C.pink}`}}>
        {isDivine?"✦ CARTA DIVINA ✦":"✦ CARTA OBTENIDA ✦"}
      </div>
      <div style={{opacity:visible?1:0,animation:visible?"rise .6s cubic-bezier(.34,1.56,.64,1) both":"none"}}>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",inset:-30,borderRadius:30,
            background:`radial-gradient(circle,${r.glow} 0%,transparent 70%)`,
            animation:"pulse_ring 1.5s infinite"}}/>
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
      <div style={{fontSize:16,fontWeight:900,letterSpacing:4,color:C.cyan}}>✦ ÍTEMS OBTENIDOS ✦</div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap",justifyContent:"center"}}>
        {got.map((k,i)=>{const it=ITEMS[k];return(
          <div key={i} style={{opacity:vis.includes(i)?1:0,transform:vis.includes(i)?"scale(1)":"scale(.5)",
            transition:"all .5s cubic-bezier(.34,1.56,.64,1)",background:C.bg3,
            border:`2px solid ${it.color}`,borderRadius:18,padding:"28px",textAlign:"center",minWidth:130,
            boxShadow:`0 0 40px ${it.color}44`}}>
            <Sprite icon={it.icon} size={52} style={{marginBottom:8, margin:"0 auto"}} />
            <div style={{fontSize:15,fontWeight:800,color:it.color}}>{it.name}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>{it.desc}</div>
          </div>
        );})}
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

/* ── CODE MODAL ── */
function CodeModal({onClose,onRedeem}){
  const[val,setVal]=useState("");
  return(
    <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.cyan}30`,borderRadius:20,padding:"32px 36px",width:"100%",maxWidth:380}}>
        <div style={{fontSize:18,fontWeight:900,color:C.cyan,letterSpacing:3,marginBottom:6,textAlign:"center"}}> CÓDIGO SECRETO</div>
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:20}}>Ingresa un código para desbloquear recompensas únicas</div>
        <input value={val} onChange={e=>setVal(e.target.value.toUpperCase())}
          placeholder="CÓDIGO..." autoFocus
          style={{width:"100%",background:C.bg3,border:`1px solid ${C.cyan}30`,borderRadius:10,
            padding:"12px 16px",color:C.text,fontSize:16,outline:"none",
            textAlign:"center",letterSpacing:4,fontWeight:700,marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"transparent",color:C.muted,
            border:`1px solid ${C.muted}22`,borderRadius:10,padding:"10px 0",cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={()=>onRedeem(val)} style={{flex:2,background:C.cyan,color:"#000",
            border:"none",borderRadius:10,padding:"10px 0",fontWeight:900,fontSize:14,cursor:"pointer"}}>CANJEAR</button>
        </div>
      </div>
    </div>
  );
}

/* ── DAILY BONUS ── */
function DailyModal({reward,streak,onClaim}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`2px solid ${C.gold}44`,borderRadius:24,padding:"40px 44px",textAlign:"center"}}>
        <style>{`@keyframes bonus_pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
        <div style={{fontSize:52,marginBottom:8,animation:"bonus_pop .6s cubic-bezier(.34,1.56,.64,1) both"}}></div>
        <div style={{fontSize:22,fontWeight:900,color:C.gold,letterSpacing:2}}>BONUS DIARIO</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4,marginBottom:20}}>Racha: {streak} día{streak!==1?"s":""}</div>
        <div style={{fontSize:48,fontWeight:900,color:C.gold,marginBottom:24}}>+{reward} Z5</div>
        <button onClick={onClaim} style={{background:C.gold,color:"#000",border:"none",
          borderRadius:12,padding:"14px 50px",fontWeight:900,fontSize:16,cursor:"pointer"}}>¡RECLAMAR!</button>
      </div>
    </div>
  );
}


/* ── MISSION RESULT MODAL ── */
function MissionResultModal({reward,onClaim}){
  const ok=!reward.failed;
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{`@keyframes mr_pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{background:C.bg2,border:`2px solid ${ok?C.gold:C.red}44`,borderRadius:22,padding:"32px 36px",textAlign:"center",maxWidth:360,width:"100%",
        animation:"mr_pop .5s cubic-bezier(.34,1.56,.64,1) both"}}>
        
        <div style={{fontSize:22,fontWeight:900,color:ok?C.gold:C.red,letterSpacing:2}}>{ok?"¡MISIÓN EXITOSA!":"MISIÓN FALLIDA"}</div>
        <div style={{fontSize:14,color:"#fff",marginTop:6,fontWeight:700}}>{reward.charName}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2,marginBottom:16}}>{reward.missionName}</div>
        <div style={{background:C.bg3,borderRadius:12,padding:14,marginBottom:20,textAlign:"left"}}>
          {ok?(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:C.muted}}>Z5</span>
                <span style={{fontSize:16,fontWeight:900,color:C.gold}}>+{reward.lili}{reward.bonus&&<span style={{fontSize:10,color:C.pink,marginLeft:5}}>★BONUS</span>}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:C.muted}}>XP</span>
                <span style={{fontSize:13,fontWeight:700,color:C.cyan}}>+{reward.xp}</span>
              </div>
            </>
          ):(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:C.muted}}>Daño recibido</span>
                <span style={{fontSize:13,fontWeight:700,color:C.red}}>-{reward.dmg} HP</span>
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}> Personaje en reposo</div>
            </>
          )}
        </div>
        <button onClick={onClaim} style={{width:"100%",background:ok?C.gold:C.red,color:"#000",
          border:"none",borderRadius:10,padding:"12px 0",fontWeight:900,fontSize:15,cursor:"pointer",
          boxShadow:`0 0 20px ${ok?C.gold:C.red}44`}}>
          {ok?"¡RECLAMAR!":"CONTINUAR"}
        </button>
      </div>
    </div>
  );
}

/* ── MISSION SELECT MODAL ── */
function MissionModal({mission,cards,onSend,onClose}){
  const[sel,setSel]=useState(null);
  const sc=sel?cards.find(c=>c.id===sel):null;
  const stats=calcMissionStats(sc,mission);
  const avail=cards.filter(c=>c.status==="idle"&&RARITY[c.rarity].tier>=mission.minTier);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.pink}28`,borderRadius:20,maxWidth:900,width:"100%",maxHeight:"90vh",overflow:"auto"}}>
        <div style={{background:`linear-gradient(90deg,${mission.bg},${C.bg2})`,borderBottom:`1px solid ${C.pink}18`,
          padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",
          borderRadius:"20px 20px 0 0",position:"sticky",top:0,zIndex:5,backdropFilter:"blur(8px)"}}>
          <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Sprite icon={mission.icon||"map"} size={26} />
            <div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:1}}>{mission.name}</div>
          </div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>⏱ {mission.time}s · Base: {mission.baseReward} Z5 · Riesgo: {Math.round(mission.baseRisk*100)}%</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.muted}33`,
            color:C.muted,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap"}}>
          <div style={{flex:"1 1 400px",padding:20}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:14,letterSpacing:2}}>SELECCIONA PERSONAJE</div>
            {avail.length===0&&<div style={{color:C.red,fontSize:13}}>Sin personajes disponibles para esta misión.</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start"}}>
              {avail.map(c=>(
                <CardUI key={c.id} card={c} selected={sel===c.id} mode="mini"
                  onClick={()=>setSel(c.id===sel?null:c.id)}/>
              ))}
            </div>
          </div>
          <div style={{flex:"0 0 260px",borderLeft:`1px solid ${C.border}`,padding:20,minHeight:300}}>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:14,letterSpacing:2}}>ESTADÍSTICAS</div>
            {!sc&&<div style={{color:C.muted,fontSize:13,textAlign:"center",marginTop:40}}>👉 Elige un personaje</div>}
            {sc&&stats&&(
              <div>
                <div style={{background:C.bg3,border:`1px solid ${RARITY[sc.rarity].color}22`,borderRadius:12,padding:10,marginBottom:14}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{sc.name}</div>
                  <div style={{fontSize:10,color:RARITY[sc.rarity].color}}>{RARITY[sc.rarity].label}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{sc.atk} {sc.def} {sc.spd}</div>
                </div>
                {[["✓ Éxito",stats.successPct,C.green],["✕ Fallo",stats.failPct,C.red]].map(([l,v,col])=>(
                  <div key={l} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:col}}>{l}</span>
                      <span style={{fontSize:15,fontWeight:900,color:col}}>{v}%</span>
                    </div>
                    <div style={{height:8,background:"#ffffff08",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",background:col,borderRadius:4,width:v+"%"}}/>
                    </div>
                  </div>
                ))}
                <div style={{background:C.bg3,border:`1px solid ${C.gold}18`,borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:8}}>RECOMPENSAS</div>
                  {[["Z5 base",`+${stats.reward}`,C.gold],[`Bonus (${stats.bonusPct}%)`,`+${stats.bonusReward}`,C.gold],["XP",`+${stats.xpGain}`,C.cyan]].map(([l,v,col])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:C.muted}}>{l}</span>
                      <span style={{fontSize:12,color:col,fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>onSend(sc.id,mission)}
                  style={{width:"100%",background:C.pink,color:"#000",border:"none",
                    borderRadius:10,padding:"12px 0",fontWeight:900,fontSize:14,cursor:"pointer",
                    boxShadow:`0 0 22px ${C.pink}55`}}>
                   ENVIAR (5 Z5)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LOGIN ── */
function LoginScreen({onAuth}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[mode,setMode]=useState("login");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  async function handle(e){
    e.preventDefault();setErr("");setLoading(true);
    let res;
    if(mode==="register")res=await supabase.auth.signUp({email,password:pass});
    else res=await supabase.auth.signInWithPassword({email,password:pass});
    setLoading(false);
    if(res.error){setErr(res.error.message);return;}
    if(mode==="register"&&!res.data?.session){setErr("Revisa tu correo para confirmar.");return;}
    onAuth(res.data.session||res.data.user);
  }
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",
      backgroundImage:`radial-gradient(ellipse at 20% 50%, ${C.pink}08 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${C.purple}08 0%, transparent 50%)`}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;800&family=Orbitron:wght@700;900&display=swap');
      `}</style>
      <div style={{background:"#03030eee",border:`1px solid ${C.pink}44`,borderRadius:16,padding:"40px 36px",width:"100%",maxWidth:380,
        boxShadow:`0 0 80px ${C.pink}22, 0 0 160px ${C.pink}0a, inset 0 0 40px ${C.pink}04`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <Z5Icon size={72}/>
          <div style={{fontSize:28,fontWeight:900,color:C.pink,letterSpacing:6,marginTop:6,fontFamily:"'Orbitron',sans-serif",
            textShadow:`0 0 10px ${C.pink}, 0 0 30px ${C.pink}88, 0 0 60px ${C.pink}44`}}>Z5</div>
          <div style={{fontSize:8,color:C.pink,letterSpacing:6,opacity:.5}}>CARD UNIVERSE</div>
        </div>
        <form onSubmit={handle}>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Correo" required
            style={{width:"100%",background:C.bg3,border:`1px solid ${C.pink}22`,borderRadius:10,
              padding:"11px 14px",color:C.text,fontSize:14,outline:"none",marginBottom:12}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Contraseña (mín. 6)" required minLength={6}
            style={{width:"100%",background:C.bg3,border:`1px solid ${C.pink}22`,borderRadius:10,
              padding:"11px 14px",color:C.text,fontSize:14,outline:"none",marginBottom:20}}/>
          {err&&<div style={{color:C.red,fontSize:12,marginBottom:12,textAlign:"center"}}>{err}</div>}
          <button type="submit" disabled={loading}
            style={{width:"100%",background:C.pink,color:"#000",border:"none",borderRadius:10,
              padding:"12px 0",fontWeight:900,fontSize:15,cursor:"pointer",marginBottom:12}}>
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

const TABS=["Colección","Tienda","Fusión","Misiones"];
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
  const[missionResultModal,setMissionResultModal]=useState(null);
  const[fusionA,setFusionA]=useState(null);
  const[fusionB,setFusionB]=useState(null);
  const[fusionResult,setFusionResult]=useState(null);
  const[autoFusing,setAutoFusing]=useState(false);
  const[activeMission,setActiveMission]=useState(null);
  const[activeCard,setActiveCard]=useState(null);
  const[collFilter,setCollFilter]=useState("all");
  const[toast,setToast]=useState(null);
  const[now,setNow]=useState(Date.now());
  const saveTimer=useRef(null);
  const stateRef=useRef({lili:300,cards:[],items:DEFAULT_ITEMS});
  useEffect(()=>{stateRef.current={lili,cards,items};},[lili,cards,items]);
  /* nuevas mecánicas */
  const[codeModal,setCodeModal]=useState(false);
  const[dailyModal,setDailyModal]=useState(false);
  const[dailyReward,setDailyReward]=useState(0);
  const[dailyStreak,setDailyStreak]=useState(1);
  const[redeemed,setRedeemed]=useState(()=>{
    try{return new Set(JSON.parse(localStorage.getItem("redeemed")||"[]"));}catch{return new Set();}
  });

  // Auth
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null); setAuthChecked(true);
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
  function scheduleSave(){
    if(!user)return;
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      const{lili:l,cards:c,items:i}=stateRef.current;
      await supabase.from("player_state").upsert({
        user_id:user.id,lili:l,cards:c,items:i,updated_at:new Date().toISOString()
      },{onConflict:"user_id"});
    },2000);
  }
  function setLiliS(v){setLili(v);scheduleSave();}
  function setCardsS(v){setCards(v);scheduleSave();}
  function setItemsS(v){setItems(v);scheduleSave();}

  async function logout(){
    await supabase.auth.signOut();
    setUser(null);setLili(300);
    setCards([makeCard("common"),makeCard("common"),makeCard("uncommon")]);
    setItems(DEFAULT_ITEMS);
  }

  // Timers
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);

  // Mission + auto-heal resolution
  useEffect(()=>{
    let dirty=false;
    const next=cards.map(c=>{
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
          const rw={id:Date.now()+Math.random(),lili:liliGain,bonus,xp:xpGain,charName:c.name,missionName:m?.name,cardId:c.id};
          setPendingRewards(pr=>[...pr,rw]);
          setTimeout(()=>setMissionResultModal(rw),300);
          const newXp=c.xp+xpGain; const lUp=newXp>=(c.level*20);
          return{...c,status:"idle",missionEnd:null,currentMission:null,shielded:false,
            atkBuff:Math.max(0,c.atkBuff-1),missionBonus:c.unique?c.missionBonus:0,
            atk:atkWas?c.atk-20:c.atk,xp:lUp?newXp-c.level*20:newXp,
            level:lUp?c.level+1:c.level,def:lUp?c.def+2:c.def,emotionalState:"motivated"};
        }else{
          const dmg=22+Math.floor(Math.random()*32);
          const rwFail={id:Date.now()+Math.random(),lili:0,bonus:false,xp:0,charName:c.name,missionName:m?.name,failed:true,dmg,cardId:c.id};
          setPendingRewards(pr=>[...pr,rwFail]);
          setTimeout(()=>setMissionResultModal(rwFail),300);
          return{...c,status:"injured",missionEnd:null,currentMission:null,shielded:false,missionBonus:0,
            hp:Math.max(5,c.hp-dmg),emotionalState:"traumatized",restEnd:Date.now()+45000};
        }
      }
      return c;
    });
    if(dirty)setCardsS(next);
  },[now]);

  // Daily bonus
  useEffect(()=>{
    const today=new Date().toDateString();
    const last=localStorage.getItem("last_daily");
    if(last!==today){
      const streak=Math.min(10,parseInt(localStorage.getItem("daily_streak")||"0")+1);
      const reward=Math.min(600,100+(streak-1)*60);
      setDailyReward(reward);setDailyStreak(streak);setDailyModal(true);
      localStorage.setItem("last_daily",today);localStorage.setItem("daily_streak",streak.toString());
    }
  },[]);


  function toast_(msg){setToast(msg);setTimeout(()=>setToast(null),2600);}

  /* ── GAME ACTIONS ── */
  function buyCardPack(pack){
    if(lili<pack.price){toast_("Z5 insuficiente ");return;}
    const nc=makeCard(null,pack.rates);
    setLili(lili-pack.price);setCardsS([...cards,nc]);
    setCardReveal(nc);
  }
  function buyItemPack(pack){
    if(lili<pack.price){toast_("Z5 insuficiente ");return;}
    const count=pack.count||1;
    const got=Array.from({length:count},()=>rollItemFromPool(pack.pool));
    const newItems={...items};got.forEach(k=>{newItems[k]=(newItems[k]||0)+1;});
    setLiliS(lili-pack.price);setItemsS(newItems);
    setItemReveal(got);
  }
  function applyItem(itemId,cardId){
    if(!items[itemId]||items[itemId]<1){toast_("Sin ese ítem");return;}
    const newCards=cards.map(c=>c.id===cardId?ITEMS[itemId].effect(c):c);
    const newItems={...items,[itemId]:items[itemId]-1};
    setCards(newCards);setItemsS(newItems);
    toast_(` Usado ${ITEMS[itemId].name} en ${cards.find(c=>c.id===cardId)?.name}`);
  }
  function claimReward(rw){
    if(rw.lili>0)setLiliS(lili+rw.lili);
    setPendingRewards(pr=>pr.filter(r=>r.id!==rw.id));
    if(!rw.failed)toast_(` +${rw.lili} Z5 · ${rw.charName}${rw.bonus?" · BONUS!":""}`);
    else toast_(` ${rw.charName} falló${rw.dmg?` (-${rw.dmg} HP)`:""}`);
  }
  function claimDailyBonus(){
    setLiliS(lili+dailyReward);
    setDailyModal(false);
    toast_(` +${dailyReward} Z5 — Día ${dailyStreak}`);
  }
  function redeemCode(code){
    const c=code.trim().toUpperCase();
    if(c==="NOPEGA1"){
      if(redeemed.has("NOPEGA1")||cards.some(x=>x.name==="Zero")){toast_("Código ya canjeado ");return;}
      const zc=makeZeroCard();
      setCardsS([...cards,zc]);
      const nr=new Set(redeemed);nr.add("NOPEGA1");setRedeemed(nr);
      try{localStorage.setItem("redeemed",JSON.stringify([...nr]));}catch{}
      setCodeModal(false);
      toast_(" ZERO desbloqueada — LA ABSOLUTA");
      setTimeout(()=>setCardReveal(zc),300);
    }else{toast_("Código inválido ");}
  }
  function sellCard(cardId){
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.unique||card.status==="mission")return;
    const price=SELL_PRICES[card.rarity]||20;
    setActiveCard(null);
    setLili(lili+price);
    setCardsS(cards.filter(c=>c.id!==cardId));
    toast_(` Vendida ${card.name} → +${price} Z5`);
  }
  function sellItem(itemId){
    if(!items[itemId]||items[itemId]<1){toast_("Sin ítems para vender");return;}
    setItemsS({...items,[itemId]:items[itemId]-1});
    setLiliS(lili+5);
    toast_(` Vendido ${ITEMS[itemId].name} → +5 Z5`);
  }
  function trainStat(cardId,stat){
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.unique)return;
    const cost=TRAIN_COST(card.trainLevel||0);
    if(lili<cost){toast_(`Necesitas ${cost} Z5`);return;}
    const boost={hp:15,atk:5,def:4,spd:3}[stat]||5;
    setCardsS(cards.map(c=>c.id===cardId?{...c,
      hp:stat==="hp"?c.hp+boost:c.hp,maxHp:stat==="hp"?c.maxHp+boost:c.maxHp,
      atk:stat==="atk"?c.atk+boost:c.atk,def:stat==="def"?c.def+boost:c.def,
      spd:stat==="spd"?c.spd+boost:c.spd,trainLevel:(c.trainLevel||0)+1,
    }:c));
    setLiliS(lili-cost);
    toast_(` +${boost} ${stat.toUpperCase()} en ${card.name} (-${cost} Z5)`);
  }
  function doFusion(idA,idB){
    const ca=cards.find(c=>c.id===idA),cb=cards.find(c=>c.id===idB);
    if(!ca||!cb)return null;
    if(ca.rarity!==cb.rarity||ca.rarity==="legendary"||ca.unique||cb.unique)return null;
    if(lili<25){toast_("Necesitas 25 Z5 para fusionar");return null;}
    const nxt=FUSION_MAP[FUSION_MAP.indexOf(ca.rarity)+1];
    const result=makeCard(nxt);
    const newCards=cards.filter(c=>c.id!==ca.id&&c.id!==cb.id).concat(result);
    setLili(lili-25);setCardsS(newCards);
    return result;
  }
  function manualFusion(){
    const ca=cards.find(c=>c.id===fusionA),cb=cards.find(c=>c.id===fusionB);
    if(!ca||!cb){toast_("Selecciona 2 cartas");return;}
    if(ca.rarity!==cb.rarity){toast_("Misma rareza");return;}
    const result=doFusion(fusionA,fusionB);
    if(result){setFusionResult(result);setFusionA(null);setFusionB(null);toast_(` Fusión → ${RARITY[result.rarity].label}`);}
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
    setLili(lili-cost);setCardsS(current);
    toast_(` Auto-fusión: ${totalFused} fusión${totalFused>1?"es":""} (-${cost} Z5)`);
    setAutoFusing(false);
  }
  function sendOnMission(cardId,mission){
    if(lili<5){toast_("Sin Z5");return;}
    const card=cards.find(c=>c.id===cardId);if(!card)return;
    setLili(lili-5);
    setCardsS(cards.map(c=>c.id===cardId?{...c,status:"mission",missionEnd:Date.now()+mission.time*1000,currentMission:mission.id}:c));
    setActiveMission(null);
    toast_(` ${card.name} → "${mission.name}"`);
  }

  const filterFn={all:()=>true,idle:c=>c.status==="idle",mission:c=>c.status==="mission",injured:c=>c.status==="injured"};
  const filteredCards=cards.filter(filterFn[collFilter]||filterFn.all);
  const pendingCount=pendingRewards.length;

  const NavBtn=({t})=>{
    const isPending=t==="Misiones"&&pendingCount>0;
    return(
      <button onClick={()=>{setTab(t);setActiveMission(null);}} style={{
        background:tab===t?`linear-gradient(135deg,${C.pink}cc,${C.purple}88)`:"transparent",
        color:tab===t?"#fff":C.muted,
        border:`1px solid ${tab===t?C.pink+"66":"#ffffff0d"}`,
        borderRadius:6,padding:"6px 14px",cursor:"pointer",
        fontWeight:900,fontSize:11,letterSpacing:2,
        transition:"all .15s",position:"relative",
        textTransform:"uppercase",fontFamily:"'Orbitron',sans-serif",
        boxShadow:tab===t?`0 0 20px ${C.pink}55, inset 0 0 20px ${C.pink}11`:undefined,
        textShadow:tab===t?`0 0 10px #fff`:undefined,
      }}>
        {t}
        {isPending&&<span style={{position:"absolute",top:-6,right:-6,background:C.red,color:"#fff",
          borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,
          display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCount}</span>}
      </button>
    );
  };

  if(!authChecked)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:C.muted,fontSize:13}}>...</div></div>;
  if(!user)return<LoginScreen onAuth={u=>setUser(u)}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Rajdhani',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;800&family=Orbitron:wght@700;900&display=swap');
        @keyframes fade_in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes bonus_pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes neon_pulse{0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:#000008}
        ::-webkit-scrollbar-thumb{background:${C.pink}66;border-radius:4px}
      `}</style>
      {/* Scanline effect */}
      <div style={{position:"fixed",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,#ffffff04 2px,#ffffff04 4px)",pointerEvents:"none",zIndex:0}}/>
      {/* Ambient glow orbs */}
      <div style={{position:"fixed",top:"-10%",left:"10%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${C.pink}08 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-10%",right:"5%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${C.purple}08 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:"40%",right:"0%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.cyan}06 0%,transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:30,
        background:"#00000599",backdropFilter:"blur(24px)",
        borderBottom:`1px solid ${C.pink}30`,
        boxShadow:`0 0 40px ${C.pink}18, 0 1px 0 ${C.pink}20`,
        padding:"10px 20px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Z5Icon size={42}/>
          <div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:5,color:C.pink,fontFamily:"'Orbitron',sans-serif",
              textShadow:`0 0 10px ${C.pink}, 0 0 30px ${C.pink}88, 0 0 60px ${C.pink}44`}}>Z5</div>
            <div style={{fontSize:7,color:C.pink,letterSpacing:4,marginTop:-2,opacity:.6}}>CARD UNIVERSE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{TABS.map(t=><NavBtn key={t} t={t}/>)}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:`#000000aa`,border:`1px solid ${C.gold}44`,borderRadius:24,padding:"5px 14px",
            display:"flex",alignItems:"center",gap:7,boxShadow:`0 0 16px ${C.gold}22`}}>
            <CatLogo size={14}/>
            <span style={{color:C.gold,fontWeight:900,fontSize:16,textShadow:`0 0 10px ${C.gold}88`}}>{lili}</span>
            <span style={{color:C.muted,fontSize:10,letterSpacing:1}}>Z5</span>
          </div>
          <span style={{fontSize:11,color:C.muted,letterSpacing:1}}>{cards.length} </span>
          <button onClick={()=>setCodeModal(true)}
            style={{background:`${C.cyan}12`,color:C.cyan,border:`1px solid ${C.cyan}44`,
              borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700,
              boxShadow:`0 0 12px ${C.cyan}22`}}></button>
          <button onClick={logout}
            style={{background:"transparent",color:C.muted,border:`1px solid ${C.muted}20`,
              borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,letterSpacing:1}}>SALIR</button>
        </div>
      </div>

      <div style={{padding:16,maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1}}>

        {/* ── COLECCIÓN ── */}
        {tab==="Colección"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              {[["all","Todas"],["idle","Libres"],["mission","En misión"],["injured","Heridas"]].map(([v,l])=>(
                <button key={v} onClick={()=>setCollFilter(v)} style={{
                  background:collFilter===v?`${C.pink}12`:"transparent",color:collFilter===v?C.pink:C.muted,
                  border:`1px solid ${collFilter===v?C.pink+"40":"#ffffff0e"}`,
                  borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:12,transition:"all .15s"}}>{l}</button>
              ))}
              <div style={{marginLeft:"auto",background:C.bg3,border:`1px solid ${C.border}`,
                borderRadius:12,padding:"7px 14px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                <Sprite icon="pack_premium" size={24} />
                {ITEM_ORDER.map(k=>{const it=ITEMS[k],qty=items[k]||0;return(
                  <div key={k} title={`${it.name}: ${it.desc}`}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",opacity:qty>0?1:.22}}>
                    <Sprite icon={it.icon} size={22} style={{marginBottom:2}} />
                    <span style={{fontSize:10,color:it.color,fontWeight:700}}>{qty}</span>
                  </div>
                );})}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:20,alignItems:"flex-start"}}>
              {filteredCards.map(c=>(
                <div key={c.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <CardUI card={c} selected={activeCard===c.id} mode="col"
                    onClick={()=>setActiveCard(activeCard===c.id?null:c.id)}/>
                  {/* Action panel debajo de la carta */}
                  {activeCard===c.id&&(
                    <div style={{background:C.bg2,border:`1px solid ${RARITY[c.rarity]?.color||"#fff"}20`,
                      borderRadius:12,padding:10,width:170}}>
                      {!c.unique&&c.status!=="mission"&&(
                        <button onClick={()=>sellCard(c.id)}
                          style={{width:"100%",background:`${C.gold}10`,color:C.gold,
                            border:`1px solid ${C.gold}30`,borderRadius:7,padding:"6px 0",
                            cursor:"pointer",fontSize:11,fontWeight:700,marginBottom:8}}>
                           Vender ({SELL_PRICES[c.rarity]||20} Z5)
                        </button>
                      )}
                      {!c.unique&&(
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:9,color:C.cyan,marginBottom:4,fontWeight:700,letterSpacing:1}}>
                            ENTRENAR ({TRAIN_COST(c.trainLevel||0)} Z5)
                          </div>
                          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                            {[["hp","HP"],["atk","ATK"],["def","DEF"],["spd","SPD"]].map(([s,e])=>(
                              <button key={s} onClick={()=>trainStat(c.id,s)}
                                disabled={lili<TRAIN_COST(c.trainLevel||0)}
                                style={{flex:1,minWidth:34,background:lili>=TRAIN_COST(c.trainLevel||0)?`${C.cyan}15`:"transparent",
                                  color:lili>=TRAIN_COST(c.trainLevel||0)?C.cyan:"#333",
                                  border:`1px solid ${lili>=TRAIN_COST(c.trainLevel||0)?C.cyan+"30":"#ffffff06"}`,
                                  borderRadius:5,padding:"4px 2px",cursor:lili>=TRAIN_COST(c.trainLevel||0)?"pointer":"not-allowed",
                                  fontSize:12,fontWeight:700}}>{e}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{fontSize:9,color:C.pink,marginBottom:5,fontWeight:700,letterSpacing:1}}>USAR ÍTEM</div>
                      {ITEM_ORDER.map(k=>{
                        const it=ITEMS[k],qty=items[k]||0;
                        const off=qty<1||c.status==="mission";
                        return(
                          <button key={k} onClick={()=>applyItem(k,c.id)} disabled={off} title={it.desc}
                            style={{width:"100%",display:"flex",alignItems:"center",gap:5,
                              background:!off?it.color+"10":"transparent",color:!off?it.color:"#2a2a3a",
                              border:`1px solid ${!off?it.color+"25":"#ffffff06"}`,
                              borderRadius:6,padding:"3px 7px",cursor:!off?"pointer":"not-allowed",
                              fontSize:11,marginBottom:3,textAlign:"left"}}>
                            <Sprite icon={it.icon} size={18} />
                            <span style={{flex:1}}>{it.name}</span>
                            <span style={{fontWeight:800,fontSize:10}}>×{qty}</span>
                          </button>
                        );
                      })}
                      {c.status==="injured"&&c.restEnd&&(
                        <div style={{fontSize:9,color:C.cyan,textAlign:"center",marginTop:4}}>
                           Auto-cura en {Math.max(0,Math.ceil((c.restEnd-now)/1000))}s
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
          <div style={{animation:"fade_in .4s both"}}>
            <style>{`
              @keyframes card_hover{0%,100%{box-shadow:0 0 20px var(--gc)33}50%{box-shadow:0 0 40px var(--gc)66}}
              @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
              .shop-card{transition:transform .2s,box-shadow .2s;}
              .shop-card:hover{transform:translateY(-6px) scale(1.01);}
              .buy-btn{transition:all .15s;letter-spacing:2px;font-family:'Orbitron',sans-serif;}
              .buy-btn:hover:not(:disabled){filter:brightness(1.2);transform:scale(1.02);}
              .buy-btn:active:not(:disabled){transform:scale(0.98);}
            `}</style>

            {/* ── SECTION HEADER ── */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.pink}66,transparent)`}}/>
              <div style={{fontSize:10,fontWeight:900,color:C.pink,letterSpacing:5,fontFamily:"'Orbitron',sans-serif",
                textShadow:`0 0 15px ${C.pink}`}}>SOBRES DE CARTAS</div>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.pink}66)`}}/>
            </div>

            {/* ── CARD PACKS GRID ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16,marginBottom:40}}>
              {CARD_PACKS.map(pack=>{
                const canBuy=lili>=pack.price;
                return(
                <div key={pack.id} className="shop-card" style={{
                  position:"relative",borderRadius:18,overflow:"hidden",
                  background:`linear-gradient(160deg, #0a0018 0%, #020010 60%, ${pack.color}0a 100%)`,
                  border:`1px solid ${pack.color}44`,
                  boxShadow:`0 0 30px ${pack.color}18, inset 0 0 30px ${pack.color}06`,
                }}>
                  {/* Top accent bar */}
                  <div style={{height:3,background:`linear-gradient(90deg,transparent,${pack.color},transparent)`}}/>
                  <div style={{padding:"20px 20px 18px"}}>
                    {/* Pack name + icon */}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <div style={{width:36,height:36,borderRadius:10,
                        background:`linear-gradient(135deg,${pack.color}44,${pack.color}11)`,
                        border:`1px solid ${pack.color}66`,display:"flex",alignItems:"center",justifyContent:"center",
                        boxShadow:`0 0 12px ${pack.color}44`}}>
                        <Z5Icon size={26}/>
                      </div>
                      <div>
                        <div style={{fontSize:15,fontWeight:900,color:"#fff",fontFamily:"'Orbitron',sans-serif",
                          letterSpacing:1,textShadow:`0 0 10px ${pack.color}88`}}>{pack.name}</div>
                        <div style={{fontSize:9,color:pack.color,letterSpacing:2,opacity:.8}}>{pack.desc}</div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{height:1,background:`linear-gradient(90deg,transparent,${pack.color}44,transparent)`,margin:"12px 0"}}/>

                    {/* Rates */}
                    <div style={{marginBottom:14}}>
                      {Object.entries(pack.rates).filter(([,v])=>v>0).map(([k,v])=>(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <span style={{fontSize:9,color:RARITY[k].color,fontWeight:700,letterSpacing:1,
                            textShadow:`0 0 6px ${RARITY[k].color}88`}}>{RARITY[k].label}</span>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <div style={{height:2,width:60,background:"#ffffff08",borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${v}%`,borderRadius:2,
                                background:`linear-gradient(90deg,${RARITY[k].color}88,${RARITY[k].color})`,
                                boxShadow:`0 0 4px ${RARITY[k].color}`}}/>
                            </div>
                            <span style={{fontSize:9,color:RARITY[k].color,fontWeight:700,minWidth:26,textAlign:"right"}}>{v}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Buy button */}
                    <button onClick={()=>buyCardPack(pack)} disabled={!canBuy} className="buy-btn"
                      style={{
                        width:"100%",border:"none",borderRadius:10,padding:"11px 0",
                        cursor:canBuy?"pointer":"not-allowed",fontWeight:900,fontSize:12,
                        background:canBuy
                          ?`linear-gradient(90deg,${pack.color}dd,${pack.color}99)`
                          :"#ffffff08",
                        color:canBuy?"#000":"#333",
                        boxShadow:canBuy?`0 0 20px ${pack.color}55`:undefined,
                        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      }}>
                      <Z5Icon size={16}/> {pack.price} Z5
                    </button>
                  </div>
                  {/* Bottom corner gem */}
                  <div style={{position:"absolute",bottom:-4,right:-4,width:12,height:12,
                    background:pack.color,transform:"rotate(45deg)",
                    boxShadow:`0 0 10px ${pack.color}`}}/>
                </div>
              );})}
            </div>

            {/* ── SECTION HEADER ITEMS ── */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.cyan}66,transparent)`}}/>
              <div style={{fontSize:10,fontWeight:900,color:C.cyan,letterSpacing:5,fontFamily:"'Orbitron',sans-serif",
                textShadow:`0 0 15px ${C.cyan}`}}>KITS DE ÍTEMS</div>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.cyan}66)`}}/>
            </div>

            {/* ── ITEM PACKS ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16,marginBottom:40}}>
              {ITEM_PACKS.map(pack=>{
                const canBuy=lili>=pack.price;
                return(
                <div key={pack.id} className="shop-card" style={{
                  position:"relative",borderRadius:18,overflow:"hidden",
                  background:`linear-gradient(160deg,#0a0018,#020010,${pack.color}0a)`,
                  border:`1px solid ${pack.color}44`,
                  boxShadow:`0 0 30px ${pack.color}18,inset 0 0 30px ${pack.color}06`,
                }}>
                  <div style={{height:3,background:`linear-gradient(90deg,transparent,${pack.color},transparent)`}}/>
                  <div style={{padding:"18px 20px"}}>
                    {/* Icon + name */}
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{
                        width:52,height:52,borderRadius:14,
                        background:`linear-gradient(135deg,${pack.color}33,${pack.color}0a)`,
                        border:`1px solid ${pack.color}55`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        boxShadow:`0 0 20px ${pack.color}44`,flexShrink:0,
                      }}>
                        <Sprite icon={pack.icon} size={38}/>
                      </div>
                      <div>
                        <div style={{fontSize:14,fontWeight:900,color:"#fff",fontFamily:"'Orbitron',sans-serif",
                          letterSpacing:1,textShadow:`0 0 10px ${pack.color}88`}}>{pack.name}</div>
                        <div style={{fontSize:9,color:pack.color,letterSpacing:1,marginTop:2}}>{pack.desc}</div>
                      </div>
                    </div>
                    <div style={{height:1,background:`linear-gradient(90deg,transparent,${pack.color}44,transparent)`,marginBottom:10}}/>
                    {/* Pool items */}
                    {pack.pool.map(([k,p])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontSize:10,color:ITEMS[k]?.color,display:"flex",alignItems:"center",gap:5,fontWeight:700}}>
                          <Sprite icon={ITEMS[k]?.icon} size={16}/> {ITEMS[k]?.name}
                        </span>
                        <span style={{fontSize:10,color:ITEMS[k]?.color,fontWeight:900,
                          textShadow:`0 0 6px ${ITEMS[k]?.color}`}}>{Math.round(p*100)}%</span>
                      </div>
                    ))}
                    <button onClick={()=>buyItemPack(pack)} disabled={!canBuy} className="buy-btn"
                      style={{
                        marginTop:14,width:"100%",border:"none",borderRadius:10,padding:"11px 0",
                        cursor:canBuy?"pointer":"not-allowed",fontWeight:900,fontSize:12,
                        background:canBuy?`linear-gradient(90deg,${pack.color}dd,${pack.color}99)`:"#ffffff08",
                        color:canBuy?"#000":"#333",
                        boxShadow:canBuy?`0 0 20px ${pack.color}55`:undefined,
                      }}>
                      <Z5Icon size={16} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>{pack.price} Z5
                    </button>
                  </div>
                  <div style={{position:"absolute",bottom:-4,right:-4,width:10,height:10,
                    background:pack.color,transform:"rotate(45deg)",boxShadow:`0 0 8px ${pack.color}`}}/>
                </div>
              );})}
            </div>

            {/* ── SECTION HEADER SELL ── */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.gold}66,transparent)`}}/>
              <div style={{fontSize:10,fontWeight:900,color:C.gold,letterSpacing:5,fontFamily:"'Orbitron',sans-serif",
                textShadow:`0 0 15px ${C.gold}`}}>VENDER ÍTEMS · 5 Z5 c/u</div>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.gold}66)`}}/>
            </div>

            {/* ── SELL ITEMS ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {ITEM_ORDER.map(k=>{
                const it=ITEMS[k],qty=items[k]||0;
                return(
                <div key={k} style={{
                  background:`linear-gradient(135deg,#050010,${it.color}06)`,
                  border:`1px solid ${qty>0?it.color+"44":"#ffffff08"}`,
                  borderRadius:14,padding:"12px 14px",
                  display:"flex",flexDirection:"column",gap:8,
                  opacity:qty>0?1:.35,transition:"opacity .2s",
                  boxShadow:qty>0?`0 0 16px ${it.color}11`:undefined,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Sprite icon={it.icon} size={28}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:it.color,
                        textShadow:`0 0 6px ${it.color}88`,letterSpacing:.5}}>{it.name}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:1}}>×{qty} disponibles</div>
                    </div>
                  </div>
                  <button onClick={()=>sellItem(k)} disabled={qty<1} className="buy-btn"
                    style={{
                      width:"100%",border:`1px solid ${qty>0?C.gold+"55":"#ffffff08"}`,borderRadius:8,
                      padding:"6px 0",cursor:qty>0?"pointer":"not-allowed",fontSize:9,fontWeight:900,
                      background:qty>0?`linear-gradient(90deg,${C.gold}22,${C.gold}0a)`:"transparent",
                      color:qty>0?C.gold:"#2a2a3a",
                      boxShadow:qty>0?`0 0 10px ${C.gold}22`:undefined,
                    }}>
                    VENDER · +5 Z5
                  </button>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ── FUSIÓN ── */}
        {tab==="Fusión"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{background:C.bg3,border:`1px solid ${C.pink}18`,borderRadius:14,padding:14,marginBottom:16}}>
              <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:8,letterSpacing:2}}>FÓRMULA – 25 Z5</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                {FUSION_MAP.map((r,i)=>(
                  <span key={r} style={{display:"flex",alignItems:"center",gap:3}}>
                    <span style={{color:RARITY[r].color,fontSize:11}}>{RARITY[r].label}</span>
                    {i<4&&<><span style={{color:"#2a2a3a",fontSize:14}}>+</span>
                      <span style={{color:RARITY[r].color,fontSize:11}}>{RARITY[r].label}</span>
                      <span style={{color:C.gold,margin:"0 4px",fontWeight:900}}>→</span>
                      <span style={{color:RARITY[FUSION_MAP[i+1]].color,fontSize:11}}>{RARITY[FUSION_MAP[i+1]].label}</span>
                      {i<3&&<span style={{color:"#1a1a2e",margin:"0 8px"}}>|</span>}</>}
                  </span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <button onClick={autoFusion} disabled={autoFusing}
                style={{background:`linear-gradient(90deg,${C.pink},${C.purple})`,color:"#fff",border:"none",
                  borderRadius:12,padding:"12px 28px",fontWeight:900,fontSize:14,cursor:"pointer",
                  letterSpacing:1,display:"flex",alignItems:"center",gap:8}}>
                 AUTO-FUSIÓN
                <span style={{fontSize:11,color:"#ffffff88",fontWeight:400}}>(fusiona todos los pares)</span>
              </button>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>O selecciona 2 cartas libres de la misma rareza:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:16,marginBottom:20,alignItems:"flex-start"}}>
              {cards.filter(c=>c.status==="idle"&&!c.unique).map(c=>{
                const sel=fusionA===c.id||fusionB===c.id;
                return(<div key={c.id} onClick={()=>{
                  if(fusionA===c.id){setFusionA(null);return;}
                  if(fusionB===c.id){setFusionB(null);return;}
                  if(!fusionA)setFusionA(c.id);else if(!fusionB)setFusionB(c.id);
                }}><CardUI card={c} selected={sel}/></div>);
              })}
            </div>
            {fusionA&&fusionB&&(()=>{
              const ca=cards.find(c=>c.id===fusionA),cb=cards.find(c=>c.id===fusionB);
              const ok=ca&&cb&&ca.rarity===cb.rarity&&ca.rarity!=="legendary";
              const nxt=ok?FUSION_MAP[FUSION_MAP.indexOf(ca.rarity)+1]:null;
              return(
                <div style={{background:C.bg3,border:`1px solid ${ok?C.pink+"30":C.red+"30"}`,
                  borderRadius:14,padding:16,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                  {ca&&<CardUI card={ca}/>}
                  <div style={{fontSize:32,color:C.pink}}>+</div>
                  {cb&&<CardUI card={cb}/>}
                  <div style={{fontSize:32,color:C.gold}}>→</div>
                  <div>
                    <div style={{color:ok?RARITY[nxt]?.color:C.red,fontSize:17,fontWeight:900,marginBottom:10}}>
                      {ok?` ${RARITY[nxt]?.label}`:"Rareza diferente "}
                    </div>
                    <button onClick={manualFusion} disabled={!ok||lili<25}
                      style={{background:ok&&lili>=25?C.pink:"#ffffff0a",color:ok&&lili>=25?"#000":"#333",
                        border:"none",borderRadius:10,padding:"11px 26px",fontWeight:900,fontSize:14,
                        cursor:ok&&lili>=25?"pointer":"not-allowed"}}>
                      Fusionar (25 Z5)
                    </button>
                  </div>
                </div>
              );
            })()}
            {fusionResult&&(
              <div style={{marginTop:18,display:"flex",gap:14,alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:12,color:C.gold,fontWeight:700,marginBottom:8}}> Resultado:</div>
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
          <div style={{animation:"fade_in .3s both"}}>
            {/* Recompensas pendientes — ARRIBA DE TODO */}
            {pendingRewards.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:10,letterSpacing:2}}>
                  ✦ MISIONES COMPLETADAS ({pendingRewards.length})
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {pendingRewards.map(rw=>(
                    <div key={rw.id} onClick={()=>{claimReward(rw);}} style={{
                      background:rw.failed?`linear-gradient(135deg,#1a0505,${C.bg3})`:`linear-gradient(135deg,#071a07,${C.bg3})`,
                      border:`2px solid ${rw.failed?C.red+"55":C.gold+"66"}`,
                      borderRadius:14,padding:"14px 18px",cursor:"pointer",transition:"all .15s",
                      minWidth:200,flex:"1 1 200px",maxWidth:320,
                      boxShadow:`0 0 20px ${rw.failed?C.red:C.gold}18`}}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 4px 30px ${rw.failed?C.red:C.gold}33`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 0 20px ${rw.failed?C.red:C.gold}18`;}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            
                            <span style={{fontSize:13,fontWeight:800,color:rw.failed?C.red:C.gold}}>
                              {rw.failed?"Misión Fallida":rw.charName}
                            </span>
                          </div>
                          <div style={{fontSize:10,color:C.muted}}>{rw.missionName}</div>
                          {!rw.failed&&<div style={{fontSize:17,fontWeight:900,color:C.gold,marginTop:4}}>+{rw.lili} Z5{rw.bonus&&<span style={{fontSize:10,color:C.pink,marginLeft:6}}>★BONUS</span>}</div>}
                          {rw.failed&&rw.dmg&&<div style={{fontSize:11,color:C.red,marginTop:4}}>-{rw.dmg} HP</div>}
                        </div>
                        <div style={{background:rw.failed?C.red:C.gold,color:"#000",borderRadius:10,
                          padding:"8px 16px",fontWeight:900,fontSize:12,flexShrink:0,
                          boxShadow:`0 0 12px ${rw.failed?C.red:C.gold}55`}}>
                          {rw.failed?"OK":"RECLAMAR"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── EN MISIÓN ── */}
            {cards.filter(c=>c.status==="mission").length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,color:C.cyan,fontWeight:900,marginBottom:10,letterSpacing:3,fontFamily:"'Orbitron',sans-serif"}}>⚔ EN MISIÓN</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {cards.filter(c=>c.status==="mission").map(c=>{
                    const secs=Math.max(0,Math.ceil((c.missionEnd-now)/1000));
                    const total=MISSIONS.find(x=>x.id===c.currentMission)?.time||60;
                    const pct=Math.round(((total-secs)/total)*100);
                    const r=RARITY[c.rarity];
                    const ch=CHARS.find(x=>x.name===c.name)||CHARS[c.charIdx]||CHARS[0];
                    return(
                      <div key={c.id} style={{
                        background:`linear-gradient(135deg,#04001a,${C.bg3})`,
                        border:`1px solid ${C.cyan}33`,borderRadius:12,padding:"10px 14px",
                        minWidth:200,flex:"1 1 200px",maxWidth:300,
                        boxShadow:`0 0 20px ${C.cyan}11`}}>
                        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                          <img src={ch.img} alt={ch.name} style={{width:40,height:52,objectFit:"cover",objectPosition:"center 15%",borderRadius:6,flexShrink:0,border:`1px solid ${r.color}55`}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:900,color:"#fff",letterSpacing:1}}>{c.name}</div>
                            <div style={{fontSize:9,color:r.color,letterSpacing:1}}>{r.label}</div>
                            <div style={{fontSize:13,color:C.gold,fontWeight:900,marginTop:3,fontFamily:"'Orbitron',sans-serif"}}>⏱ {secs}s</div>
                          </div>
                        </div>
                        <div style={{height:3,background:"#ffffff08",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",background:`linear-gradient(90deg,${C.cyan},${C.pink})`,borderRadius:2,
                            width:pct+"%",transition:"width 1s linear",boxShadow:`0 0 6px ${C.pink}`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── GRID DE MISIONES ── */}
            <div style={{fontSize:10,color:C.muted,marginBottom:12,letterSpacing:3,fontFamily:"'Orbitron',sans-serif"}}>MISIONES DISPONIBLES</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,marginBottom:activeMission?0:0}}>
            {MISSIONS.map(m=>{
              const active=activeMission?.id===m.id;
              return(
              <div key={m.id} onClick={()=>setActiveMission(active?null:m)}
                style={{
                  position:"relative",borderRadius:14,overflow:"hidden",
                  border:`1.5px solid ${active?C.pink:C.pink+"28"}`,
                  cursor:"pointer",transition:"all .2s",height:130,
                  boxShadow:active?`0 0 30px ${C.pink}44, 0 0 60px ${C.pink}18`:`0 0 10px #00000088`,
                  transform:active?"scale(1.01)":undefined,
                }}>
                <img src={m.img} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:active
                  ?`linear-gradient(to top,#000000f5 0%,${C.pink}18 100%)`
                  :`linear-gradient(to top,#000000ee 0%,#00000044 55%,transparent 100%)`}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:900,color:"#fff",textShadow:`0 0 10px ${C.pink}`,letterSpacing:1}}>{m.name}</div>
                    <div style={{fontSize:9,color:"#ccc",marginTop:1}}>⏱ {m.time}s &nbsp;⚠ {Math.round(m.baseRisk*100)}%</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:9,color:C.pink,fontWeight:900,letterSpacing:1}}>RECOMPENSA</div>
                    <div style={{fontSize:15,fontWeight:900,color:C.gold,textShadow:`0 0 8px ${C.gold}`}}>{m.baseReward}</div>
                  </div>
                </div>
                {active&&<div style={{position:"absolute",top:8,right:8,background:C.pink,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#000"}}>✓</div>}
              </div>
            );})}
            </div>

            {/* ── SELECTOR DE PERSONAJE (panel deslizable) ── */}
            {activeMission&&(
              <div style={{
                marginTop:16,
                background:`linear-gradient(135deg,#0a0018,#030010)`,
                border:`1px solid ${C.pink}44`,
                borderRadius:16,padding:"18px 20px",
                boxShadow:`0 0 40px ${C.pink}18, inset 0 0 40px ${C.pink}04`,
                animation:"fade_in .25s both",
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:900,color:C.pink,letterSpacing:4,fontFamily:"'Orbitron',sans-serif"}}>
                      ELIGE PERSONAJE
                    </div>
                    <div style={{fontSize:10,color:C.muted,marginTop:2}}>{activeMission.name} · {activeMission.baseReward} Z5 base · {Math.round(activeMission.baseRisk*100)}% riesgo</div>
                  </div>
                  <button onClick={()=>setActiveMission(null)} style={{
                    background:"transparent",color:C.pink,border:`1px solid ${C.pink}44`,
                    borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:14,fontWeight:900,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:`0 0 10px ${C.pink}22`}}>✕</button>
                </div>
                {(()=>{
                  const avail=cards.filter(c=>c.status==="idle"&&RARITY[c.rarity].tier>=activeMission.minTier);
                  if(avail.length===0) return(
                    <div style={{color:C.muted,fontSize:13,padding:"20px 0",textAlign:"center",letterSpacing:1}}>
                      Sin personajes disponibles para esta misión
                    </div>
                  );
                  return(
                    <div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start"}}>
                      {avail.map(c=>(
                        <CardUI key={c.id} card={c} mode="mission"
                          onSendMission={()=>{sendOnMission(c.id,activeMission);setActiveMission(null);}}/>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}


      </div>

      {/* MODALS */}
      {cardReveal&&<CardPackReveal card={cardReveal} onClose={()=>setCardReveal(null)}/>}
      {itemReveal&&<ItemPackReveal items={itemReveal} onClose={()=>setItemReveal(null)}/>}
      {codeModal&&<CodeModal onClose={()=>setCodeModal(false)} onRedeem={redeemCode}/>}
      {dailyModal&&<DailyModal reward={dailyReward} streak={dailyStreak} onClaim={claimDailyBonus}/>}
      {missionResultModal&&<MissionResultModal reward={missionResultModal} onClaim={()=>{claimReward(missionResultModal);setMissionResultModal(null);}}/>}

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
          background:"#000000ee",border:`1px solid ${C.pink}66`,borderRadius:8,
          padding:"10px 28px",color:"#fff",fontSize:12,fontWeight:700,
          boxShadow:`0 0 40px ${C.pink}44, 0 0 80px ${C.pink}18, inset 0 0 20px ${C.pink}08`,
          zIndex:600,pointerEvents:"none",whiteSpace:"nowrap",letterSpacing:2,
          textShadow:`0 0 10px ${C.pink}`,fontFamily:"'Orbitron',sans-serif"}}>
          {toast}
        </div>
      )}
    </div>
  );
}
