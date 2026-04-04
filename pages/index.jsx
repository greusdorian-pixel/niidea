import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const C = {
  bg:"#070710", bg2:"#0c0c1e", bg3:"#111128",
  pink:"#e040fb", cyan:"#00e5ff", gold:"#ffd54f",
  red:"#ff1744", green:"#00e676", purple:"#7c4dff",
  text:"#e8e8f8", muted:"#5a5a7a", border:"#ffffff0d",
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
  { name:"Yoru",  img:"/chars/yoru.png",  role:"Asesina",    cls:"Sombra",  atkT:"Filo",         c:"#e040fb" },
  { name:"Akari", img:"/chars/akari.png", role:"Maga Oscura",cls:"Maga",    atkT:"Magia",        c:"#7c4dff" },
  { name:"Sera",  img:"/chars/sera.png",  role:"Sanadora",   cls:"Clérigo", atkT:"Luz",          c:"#00e676" },
  { name:"Nyx",   img:"/chars/nyx.png",   role:"Cazadora",   cls:"Arquera", atkT:"Flecha",       c:"#00e5ff" },
  { name:"Rein",  img:"/chars/rein.png",  role:"Guardiana",  cls:"Paladín", atkT:"Escudo",       c:"#ffd54f" },
  { name:"Vex",   img:"/chars/vex.png",   role:"Invocadora", cls:"Maga",    atkT:"Caos",         c:"#ff4081" },
  { name:"Lyra",  img:"/chars/lyra.png",  role:"Bardo",      cls:"Soporte", atkT:"Sonido",       c:"#ff9800" },
  { name:"Kaine", img:"/chars/kaine.png", role:"Berserker",  cls:"Guerrera",atkT:"Fuerza",       c:"#ff1744" },
  { name:"Faye",  img:"/chars/faye.png",  role:"Espía",      cls:"Sombra",  atkT:"Veneno",       c:"#00bfa5" },
  { name:"Mira",  img:"/chars/mira.png",  role:"Druida",     cls:"Maga",    atkT:"Natura",       c:"#76ff03" },
  { name:"Dusk",  img:"/chars/dusk.png",  role:"Nigromante", cls:"Maga",    atkT:"Muerte",       c:"#7e57c2" },
  { name:"Rin",   img:"/chars/rin.png",   role:"Kunoichi",   cls:"Sombra",  atkT:"Shuriken",     c:"#ff4081" },
  { name:"Zero",  img:"/chars/zero.png",  role:"La Absoluta",cls:"Vacío",   atkT:"Aniquilación", c:"#ffffff" },
];

/* Precios venta */
const SELL_PRICES = { common:20, uncommon:50, rare:120, epic:260, legendary:600 };

/* Arena enemies */
const ARENA_ENEMIES = [
  { name:"Golem Roto",      icon:"enemy_golem",    tier:0, hp:80,   atk:14,  def:6,   reward:25,  xp:8  },
  { name:"Lobo Sombra",     icon:"enemy_wolf",     tier:0, hp:110,  atk:20,  def:8,   reward:35,  xp:10 },
  { name:"Arquera Oscura",  icon:"enemy_archer",   tier:1, hp:160,  atk:32,  def:15,  reward:60,  xp:15 },
  { name:"Espectro Maldito",icon:"skull_horns",    tier:1, hp:140,  atk:38,  def:12,  reward:70,  xp:18 },
  { name:"Caballero Roto",  icon:"enemy_knight",   tier:2, hp:240,  atk:52,  def:28,  reward:110, xp:25 },
  { name:"Dragón Menor",    icon:"enemy_dragon",   tier:2, hp:300,  atk:60,  def:35,  reward:140, xp:30 },
  { name:"Demonio Élite",   icon:"enemy_demon",    tier:3, hp:450,  atk:88,  def:48,  reward:230, xp:45 },
  { name:"Ángel Caído",     icon:"enemy_demon",    tier:3, hp:500,  atk:95,  def:55,  reward:260, xp:50 },
  { name:"Dragón Arcano",   icon:"enemy_dragon",   tier:4, hp:800,  atk:140, def:80,  reward:420, xp:80 },
  { name:"Titán del Vacío", icon:"enemy_golem",    tier:5, hp:2000, atk:400, def:280, reward:900, xp:150},
];

const TRAIN_COST = (lvl) => 30 + lvl * 15;

/* ── CARTA CON MARCO FANTASY ── */
/* mode: "col" = colección (stats), "mission" = enviar misión (botón), "mini" = compacta, "arena" = arena */
function CardUI({ card, selected, onClick, mode="col", onSendMission }) {
  const r = RARITY[card.rarity] || RARITY.common;
  const ch = CHARS[card.charIdx] || CHARS[0];
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
            <div style={{position:"absolute",bottom:38,right:4,fontSize:10}}>{card.status==="mission"?"🎯":card.status==="injured"?"🩹":"😴"}</div>
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
  const cardH = 280;

  return (
    <div onClick={onClick} style={{
      position:"relative", width:cardW, height:cardH, userSelect:"none",
      cursor:onClick?"pointer":"default",
      transition:"transform .2s, filter .2s",
      filter: selected ? `drop-shadow(0 0 18px ${col})` : undefined,
      transform: selected ? "scale(1.03)" : undefined,
    }}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-6px) scale(1.02)";e.currentTarget.style.filter=`drop-shadow(0 0 20px ${col})`;} }}
      onMouseLeave={e=>{e.currentTarget.style.transform=selected?"scale(1.03)":"";e.currentTarget.style.filter=selected?`drop-shadow(0 0 18px ${col})`:"";}}
    >
      {/* ── CARD BODY ── */}
      <div style={{
        position:"absolute", inset: 0,
        borderRadius:14,
        overflow:"hidden",
        backgroundColor:"#07071a",
      }}>
        {/* Character image */}
        <img src={ch.img} alt={ch.name} style={{
          width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center top",
          display:"block",
          filter: isDivine ? "brightness(0.9) contrast(1.15)" : "brightness(0.75) contrast(1.1)"
        }}/>
      </div>

      {/* Frame overlay */}
      <img src="/marco.png" style={{
        position:"absolute", inset: "-4%", width:"108%", height:"108%",
        objectFit:"fill", pointerEvents:"none",
        filter: `drop-shadow(0 0 10px ${col}66)` // suave glow del color de rareza detrás del marco
      }} alt="marco"/>

        {/* Top gradient overlay */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:70,
          background:`linear-gradient(${col}44 0%, transparent 100%)`,
          pointerEvents:"none", borderRadius:"14px 14px 0 0"
        }}/>

        {/* Rarity badge */}
        <div style={{
          position:"absolute", top:8, left:8,
          background:"#000000bb", backdropFilter:"blur(6px)",
          border:`1px solid ${col}66`, borderRadius:20,
          padding:"2px 8px", fontSize:9, color:col, fontWeight:700,
          textShadow: isDivine ? `0 0 8px #fff` : undefined,
        }}>{r.label}</div>

        {/* Stars top right */}
        <div style={{position:"absolute",top:8,right:8,display:"flex",gap:1}}>
          {Array.from({length:Math.max(5,r.stars)},(_,i)=>(
            <span key={i} style={{fontSize:8,color:i<r.stars?col:"#ffffff18",
              textShadow:i<r.stars?`0 0 5px ${col}`:undefined}}>★</span>
          ))}
        </div>

        {/* Status badge */}
        {card.status !== "idle" && (
          <div style={{position:"absolute",top:28,right:8,background:"#000000aa",
            border:`1px solid ${stCol}44`,borderRadius:20,padding:"2px 7px",
            fontSize:8,color:stCol,fontWeight:700}}>
            {card.status==="mission"?"🎯 Misión":card.status==="injured"?"🩹 Herida":"😴 Desc."}
          </div>
        )}
        {card.shielded && <div style={{position:"absolute",top:48,right:8,fontSize:12}}>🛡️</div>}

        {/* Bottom gradient */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height: mode==="mission" ? 72 : 90,
          background:`linear-gradient(transparent, ${col}18 30%, #000000ee)`,
          pointerEvents:"none",
        }}/>

        {/* BOTTOM PANEL */}
        {mode === "mission" ? (
          /* ── MISIONES: nombre + botón ENVIAR ── */
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 8px 8px"}}>
            <div style={{fontSize:13,fontWeight:900,color:"#fff",textAlign:"center",marginBottom:5,
              textShadow:`0 0 10px ${col}`}}>{card.name}</div>
            <button
              onClick={e=>{e.stopPropagation();onSendMission&&onSendMission();}}
              disabled={card.status!=="idle"}
              style={{
                width:"100%",
                background: card.status==="idle"
                  ? `linear-gradient(90deg, ${col}cc, ${col}88)`
                  : "#ffffff10",
                color: card.status==="idle" ? "#000" : "#333",
                border:`1.5px solid ${card.status==="idle"?col:"#333"}`,
                borderRadius:8, padding:"7px 0",
                fontWeight:900, fontSize:11, letterSpacing:1,
                cursor: card.status==="idle" ? "pointer" : "not-allowed",
                boxShadow: card.status==="idle" ? `0 0 14px ${col}66` : undefined,
              }}>
              {card.status==="idle" ? "ENVIAR MISIÓN" : card.status==="mission" ? "EN MISIÓN" : "NO DISPONIBLE"}
            </button>
          </div>
        ) : (
          /* ── COLECCIÓN / ARENA: estadísticas ── */
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 8px 8px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
              <span style={{fontSize:13,fontWeight:900,color:"#fff",textShadow:`0 0 8px ${col}`}}>{card.name}</span>
              {card.level>1&&<span style={{fontSize:9,color:C.gold,fontWeight:700}}>Lv{card.level}</span>}
            </div>
            {/* HP bar */}
            <div style={{height:3,background:"#ffffff12",borderRadius:3,overflow:"hidden",marginBottom:4}}>
              <div style={{height:"100%",borderRadius:3,
                background:isDivine?C.divine:hpPct>60?C.green:hpPct>30?C.gold:C.red,
                width:(isDivine?100:hpPct)+"%",
                boxShadow:`0 0 6px currentColor`}}/>
            </div>
            {/* Stats */}
            <div style={{display:"flex",gap:6,fontSize:10,justifyContent:"space-around"}}>
              <span style={{color:"#ff7043",fontWeight:700}}>⚔{card.atk}</span>
              <span style={{color:"#42a5f5",fontWeight:700}}>🛡{card.def}</span>
              <span style={{color:"#ab47bc",fontWeight:700}}>💨{card.spd}</span>
              <span style={{color:hpPct>60?C.green:hpPct>30?C.gold:C.red,fontWeight:700}}>❤{card.hp}</span>
            </div>
          </div>
        )}

      {/* Removed the old decorative gems, hearts, and sidebars here. */}

      {/* Selected check */}
      {selected && (
        <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",
          background:col,color:"#000",borderRadius:"50%",width:22,height:22,
          fontSize:12,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 12px ${col}`,zIndex:5}}>✓</div>
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
  return (
    <div style={{
      width: s.wide ? size*2 : size, height: size,
      backgroundImage: "url('/spritesheet.png')",
      backgroundSize: "500% 600%",
      backgroundPosition: `${s.col * 25}% ${s.row * 20}%`,
      display: "inline-block", verticalAlign: "middle", ...style
    }} />
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
  const eligibleChars=CHARS.filter(c=>c.name!=="Zero");
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
        <div style={{fontSize:18,fontWeight:900,color:C.cyan,letterSpacing:3,marginBottom:6,textAlign:"center"}}>🔑 CÓDIGO SECRETO</div>
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
        <div style={{fontSize:52,marginBottom:8,animation:"bonus_pop .6s cubic-bezier(.34,1.56,.64,1) both"}}>🎁</div>
        <div style={{fontSize:22,fontWeight:900,color:C.gold,letterSpacing:2}}>BONUS DIARIO</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4,marginBottom:20}}>Racha: {streak} día{streak!==1?"s":""}</div>
        <div style={{fontSize:48,fontWeight:900,color:C.gold,marginBottom:24}}>+{reward} COIN</div>
        <button onClick={onClaim} style={{background:C.gold,color:"#000",border:"none",
          borderRadius:12,padding:"14px 50px",fontWeight:900,fontSize:16,cursor:"pointer"}}>¡RECLAMAR!</button>
      </div>
    </div>
  );
}

/* ── ARENA RESULT ── */
function ArenaResultModal({result,onClose}){
  const won=result.won;
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`2px solid ${won?C.gold:C.red}44`,borderRadius:22,padding:"32px 36px",textAlign:"center",maxWidth:360,width:"100%"}}>
        <div style={{fontSize:44,marginBottom:8}}>{won?"🏆":"💀"}</div>
        <div style={{fontSize:22,fontWeight:900,color:won?C.gold:C.red,letterSpacing:2}}>{won?"¡VICTORIA!":"DERROTA"}</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4,marginBottom:16,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
          {result.card.name} vs <Sprite icon={result.enemy.icon} size={20} /> {result.enemy.name}
        </div>
        <div style={{background:C.bg3,borderRadius:12,padding:14,marginBottom:20,textAlign:"left"}}>
          {[["COIN",`+${result.coinGain}`,won?C.gold:C.muted],["XP",`+${result.xpGain}`,C.cyan],["Rondas",`${result.rounds}`,C.muted]].map(([l,v,col])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.muted}}>{l}</span>
              <span style={{fontSize:13,fontWeight:700,color:col}}>{v}</span>
            </div>
          ))}
          {result.leveledUp&&<div style={{fontSize:12,color:C.gold,marginTop:4}}>⬆️ {result.card.name} subió de nivel!</div>}
        </div>
        <button onClick={onClose} style={{width:"100%",background:won?C.gold:C.red,color:"#000",
          border:"none",borderRadius:10,padding:"11px 0",fontWeight:900,fontSize:14,cursor:"pointer"}}>CONTINUAR</button>
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
        <div style={{fontSize:52,marginBottom:8}}>{ok?"🎉":"💔"}</div>
        <div style={{fontSize:22,fontWeight:900,color:ok?C.gold:C.red,letterSpacing:2}}>{ok?"¡MISIÓN EXITOSA!":"MISIÓN FALLIDA"}</div>
        <div style={{fontSize:14,color:"#fff",marginTop:6,fontWeight:700}}>{reward.charName}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2,marginBottom:16}}>{reward.missionName}</div>
        <div style={{background:C.bg3,borderRadius:12,padding:14,marginBottom:20,textAlign:"left"}}>
          {ok?(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:C.muted}}>COIN</span>
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
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>🩹 Tu personaje necesita descansar...</div>
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
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>⏱ {mission.time}s · Base: {mission.baseReward} COIN · Riesgo: {Math.round(mission.baseRisk*100)}%</div>
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
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>⚔{sc.atk} 🛡{sc.def} 💨{sc.spd}</div>
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
                  {[["COIN base",`+${stats.reward}`,C.gold],[`Bonus (${stats.bonusPct}%)`,`+${stats.bonusReward}`,C.gold],["XP",`+${stats.xpGain}`,C.cyan]].map(([l,v,col])=>(
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
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.pink}28`,borderRadius:20,padding:"40px 36px",width:"100%",maxWidth:380,boxShadow:`0 0 60px ${C.pink}12`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <CatLogo size={44}/>
          <div style={{fontSize:28,fontWeight:900,color:C.pink,letterSpacing:3,marginTop:8}}>COIN</div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:4}}>CARD UNIVERSE</div>
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
  /* nuevas mecánicas */
  const[codeModal,setCodeModal]=useState(false);
  const[arenaEnemy,setArenaEnemy]=useState(null);
  const[arenaFighter,setArenaFighter]=useState(null);
  const[arenaResult,setArenaResult]=useState(null);
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
  function scheduleSave(newLili,newCards,newItems){
    if(!user)return;
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      await supabase.from("player_state").upsert({
        user_id:user.id,lili:newLili,cards:newCards,items:newItems,updated_at:new Date().toISOString()
      },{onConflict:"user_id"});
    },2000);
  }
  function setLiliS(v){setLili(v);scheduleSave(v,cards,items);}
  function setCardsS(v){setCards(v);scheduleSave(lili,v,items);}
  function setItemsS(v){setItems(v);scheduleSave(lili,cards,v);}

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

  // Arena enemy
  useEffect(()=>{if(tab==="Arena"&&!arenaEnemy)rollArenaEnemy_();},[tab]);

  function toast_(msg){setToast(msg);setTimeout(()=>setToast(null),2600);}

  /* ── GAME ACTIONS ── */
  function buyCardPack(pack){
    if(lili<pack.price){toast_("COIN insuficiente ❌");return;}
    const nc=makeCard(null,pack.rates);
    const newCards=[...cards,nc];
    setLiliS(lili-pack.price);setCards(newCards);scheduleSave(lili-pack.price,newCards,items);
    setCardReveal(nc);
  }
  function buyItemPack(pack){
    if(lili<pack.price){toast_("COIN insuficiente ❌");return;}
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
    toast_(`✨ Usado ${ITEMS[itemId].name} en ${cards.find(c=>c.id===cardId)?.name}`);
  }
  function claimReward(rw){
    const newLili=rw.lili>0?lili+rw.lili:lili;
    if(rw.lili>0)setLili(newLili);
    setPendingRewards(pr=>pr.filter(r=>r.id!==rw.id));
    scheduleSave(newLili,cards,items);
    if(!rw.failed)toast_(`✨ +${rw.lili} COIN · ${rw.charName}${rw.bonus?" · BONUS!":""}`);
    else toast_(`💔 ${rw.charName} falló${rw.dmg?` (-${rw.dmg} HP)`:""}`);
  }
  function claimDailyBonus(){
    setLiliS(lili+dailyReward);
    setDailyModal(false);
    toast_(`🎁 +${dailyReward} COIN — Día ${dailyStreak}`);
  }
  function redeemCode(code){
    const c=code.trim().toUpperCase();
    if(c==="NOPEGA1"){
      if(redeemed.has("NOPEGA1")||cards.some(x=>x.name==="Zero")){toast_("Código ya canjeado ❌");return;}
      const zc=makeZeroCard();
      setCardsS([...cards,zc]);
      const nr=new Set(redeemed);nr.add("NOPEGA1");setRedeemed(nr);
      try{localStorage.setItem("redeemed",JSON.stringify([...nr]));}catch{}
      setCodeModal(false);
      toast_("⚡ ZERO desbloqueada — LA ABSOLUTA");
      setTimeout(()=>setCardReveal(zc),300);
    }else{toast_("Código inválido ❌");}
  }
  function sellCard(cardId){
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.unique||card.status==="mission")return;
    const price=SELL_PRICES[card.rarity]||20;
    setActiveCard(null);
    setCardsS(cards.filter(c=>c.id!==cardId));
    setLiliS(lili+price);
    toast_(`💰 Vendida ${card.name} → +${price} COIN`);
  }
  function sellItem(itemId){
    if(!items[itemId]||items[itemId]<1){toast_("Sin ítems para vender");return;}
    setItemsS({...items,[itemId]:items[itemId]-1});
    setLiliS(lili+5);
    toast_(`💰 Vendido ${ITEMS[itemId].name} → +5 COIN`);
  }
  function trainStat(cardId,stat){
    const card=cards.find(c=>c.id===cardId);
    if(!card||card.unique)return;
    const cost=TRAIN_COST(card.trainLevel||0);
    if(lili<cost){toast_(`Necesitas ${cost} COIN ❌`);return;}
    const boost={hp:15,atk:5,def:4,spd:3}[stat]||5;
    setCardsS(cards.map(c=>c.id===cardId?{...c,
      hp:stat==="hp"?c.hp+boost:c.hp,maxHp:stat==="hp"?c.maxHp+boost:c.maxHp,
      atk:stat==="atk"?c.atk+boost:c.atk,def:stat==="def"?c.def+boost:c.def,
      spd:stat==="spd"?c.spd+boost:c.spd,trainLevel:(c.trainLevel||0)+1,
    }:c));
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
    let pHP=card.hp,eHP=enemy.hp,rounds=0,leveledUp=false;
    while(pHP>0&&eHP>0&&rounds<200){
      const pDmg=Math.max(1,card.atk-Math.floor(enemy.def*0.6)+Math.floor(Math.random()*12));
      eHP-=pDmg;if(eHP<=0)break;
      const eDmg=Math.max(1,enemy.atk-Math.floor(card.def*0.6)+Math.floor(Math.random()*10));
      if(!card.shielded)pHP-=eDmg;else pHP-=Math.floor(eDmg*0.3);
      rounds++;
    }
    const won=eHP<=0;
    const coinGain=won?enemy.reward:Math.max(5,Math.floor(enemy.reward*0.08));
    const xpGain=won?enemy.xp:Math.floor(enemy.xp*0.2);
    const newCards=cards.map(c=>{
      if(c.id!==card.id)return c;
      if(c.unique)return{...c,xp:c.xp+xpGain};
      const newHP=Math.max(1,Math.floor(c.hp*(pHP/card.hp)));
      const newXp=c.xp+xpGain; const lUp=newXp>=(c.level*20);
      if(lUp)leveledUp=true;
      return{...c,hp:newHP,status:!won&&newHP<c.maxHp*0.25?"injured":c.status,
        restEnd:!won&&newHP<c.maxHp*0.25?Date.now()+45000:c.restEnd,
        emotionalState:won?"motivated":c.emotionalState,
        xp:lUp?newXp-c.level*20:newXp,level:lUp?c.level+1:c.level,
        atk:lUp?c.atk+3:c.atk,def:lUp?c.def+2:c.def};
    });
    setLiliS(lili+coinGain);setCardsS(newCards);
    setArenaResult({won,enemy,card,coinGain,xpGain,rounds,leveledUp});
  }
  function doFusion(idA,idB){
    const ca=cards.find(c=>c.id===idA),cb=cards.find(c=>c.id===idB);
    if(!ca||!cb)return null;
    if(ca.rarity!==cb.rarity||ca.rarity==="legendary"||ca.unique||cb.unique)return null;
    if(lili<25){toast_("Necesitas 25 COIN para fusionar");return null;}
    const nxt=FUSION_MAP[FUSION_MAP.indexOf(ca.rarity)+1];
    const result=makeCard(nxt);
    const newCards=cards.filter(c=>c.id!==ca.id&&c.id!==cb.id).concat(result);
    setLiliS(lili-25);setCards(newCards);scheduleSave(lili-25,newCards,items);
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
    setLiliS(lili-cost);setCards(current);scheduleSave(lili-cost,current,items);
    toast_(`⚡ Auto-fusión: ${totalFused} fusión${totalFused>1?"es":""} (-${cost} COIN)`);
    setAutoFusing(false);
  }
  function sendOnMission(cardId,mission){
    if(lili<5){toast_("Sin COIN");return;}
    const card=cards.find(c=>c.id===cardId);if(!card)return;
    const newCards=cards.map(c=>c.id===cardId?{...c,status:"mission",missionEnd:Date.now()+mission.time*1000,currentMission:mission.id}:c);
    setCards(newCards);setLiliS(lili-5);scheduleSave(lili-5,newCards,items);
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
        {isPending&&<span style={{position:"absolute",top:-6,right:-6,background:C.red,color:"#fff",
          borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,
          display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCount}</span>}
      </button>
    );
  };

  if(!authChecked)return<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:C.muted,fontSize:13}}>...</div></div>;
  if(!user)return<LoginScreen onAuth={u=>setUser(u)}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`
        @keyframes fade_in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes bonus_pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
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
            <span style={{color:C.gold,fontWeight:900,fontSize:16}}>{lili}</span>
            <span style={{color:C.muted,fontSize:11}}>COIN</span>
          </div>
          <span style={{fontSize:12,color:C.muted}}>🎴{cards.length}</span>
          <button onClick={()=>setCodeModal(true)}
            style={{background:`${C.cyan}10`,color:C.cyan,border:`1px solid ${C.cyan}30`,
              borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>🔑</button>
          <button onClick={logout}
            style={{background:"transparent",color:C.muted,border:`1px solid ${C.muted}22`,
              borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11}}>Salir</button>
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
                          💰 Vender ({SELL_PRICES[c.rarity]||20} COIN)
                        </button>
                      )}
                      {!c.unique&&(
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:9,color:C.cyan,marginBottom:4,fontWeight:700,letterSpacing:1}}>
                            ENTRENAR ({TRAIN_COST(c.trainLevel||0)} COIN)
                          </div>
                          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                            {[["hp","❤️"],["atk","⚔️"],["def","🛡️"],["spd","💨"]].map(([s,e])=>(
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
                  borderRadius:16,padding:18,minWidth:190,maxWidth:220,flex:"1 1 190px"}}>
                  <div style={{fontSize:17,fontWeight:900,color:pack.color,marginBottom:3}}>{pack.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{pack.desc}</div>
                  {Object.entries(pack.rates).filter(([,v])=>v>0).map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:RARITY[k].color}}>{RARITY[k].label}</span>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <div style={{height:3,width:50,background:"#ffffff07",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:v+"%",background:RARITY[k].color,borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:10,color:C.muted,minWidth:24,textAlign:"right"}}>{v}%</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>buyCardPack(pack)} disabled={lili<pack.price}
                    style={{marginTop:14,width:"100%",background:lili>=pack.price?pack.color:"#ffffff08",
                      color:lili>=pack.price?"#000":"#333",border:"none",borderRadius:9,
                      padding:"9px 0",fontWeight:900,fontSize:14,cursor:lili>=pack.price?"pointer":"not-allowed",
                      display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                    <CatLogo size={14}/> {pack.price} COIN
                  </button>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:12,letterSpacing:2}}>KITS DE ÍTEMS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:28}}>
              {ITEM_PACKS.map(pack=>(
                <div key={pack.id} style={{background:C.bg3,border:`1.5px solid ${pack.color}22`,borderRadius:16,padding:18,minWidth:190,maxWidth:220,flex:"1 1 190px"}}>
                  <Sprite icon={pack.icon} size={42} style={{marginBottom:6}} />
                  <div style={{fontSize:16,fontWeight:900,color:pack.color,marginBottom:3}}>{pack.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{pack.desc}</div>
                  {pack.pool.map(([k,p])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:ITEMS[k]?.color,display:"flex",alignItems:"center",gap:4}}><Sprite icon={ITEMS[k]?.icon} size={14}/> {ITEMS[k]?.name}</span>
                      <span style={{fontSize:10,color:C.muted}}>{Math.round(p*100)}%</span>
                    </div>
                  ))}
                  <button onClick={()=>buyItemPack(pack)} disabled={lili<pack.price}
                    style={{marginTop:12,width:"100%",background:lili>=pack.price?pack.color:"#ffffff08",
                      color:lili>=pack.price?"#000":"#333",border:"none",borderRadius:9,
                      padding:"9px 0",fontWeight:900,fontSize:14,cursor:lili>=pack.price?"pointer":"not-allowed"}}>
                    {pack.price} COIN
                  </button>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:12,letterSpacing:2}}>VENDER ÍTEMS (5 COIN c/u)</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {ITEM_ORDER.map(k=>{const it=ITEMS[k],qty=items[k]||0;return(
                <div key={k} style={{background:C.bg3,border:`1px solid ${it.color}22`,borderRadius:12,
                  padding:"12px 16px",display:"flex",alignItems:"center",gap:10,opacity:qty>0?1:.3}}>
                  <Sprite icon={it.icon} size={32} />
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:it.color}}>{it.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>×{qty}</div>
                  </div>
                  <button onClick={()=>sellItem(k)} disabled={qty<1}
                    style={{marginLeft:"auto",background:qty>0?`${C.gold}15`:"transparent",color:qty>0?C.gold:"#2a2a3a",
                      border:`1px solid ${qty>0?C.gold+"40":"#ffffff06"}`,borderRadius:7,
                      padding:"5px 10px",cursor:qty>0?"pointer":"not-allowed",fontSize:11,fontWeight:700}}>
                    Vender
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
              <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:8,letterSpacing:2}}>FÓRMULA – 25 COIN</div>
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
                ⚡ AUTO-FUSIÓN
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
                      {ok?`✨ ${RARITY[nxt]?.label}`:"Rareza diferente ❌"}
                    </div>
                    <button onClick={manualFusion} disabled={!ok||lili<25}
                      style={{background:ok&&lili>=25?C.pink:"#ffffff0a",color:ok&&lili>=25?"#000":"#333",
                        border:"none",borderRadius:10,padding:"11px 26px",fontWeight:900,fontSize:14,
                        cursor:ok&&lili>=25?"pointer":"not-allowed"}}>
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
                            <span style={{fontSize:18}}>{rw.failed?"💔":"🎉"}</span>
                            <span style={{fontSize:13,fontWeight:800,color:rw.failed?C.red:C.gold}}>
                              {rw.failed?"Misión Fallida":rw.charName}
                            </span>
                          </div>
                          <div style={{fontSize:10,color:C.muted}}>{rw.missionName}</div>
                          {!rw.failed&&<div style={{fontSize:17,fontWeight:900,color:C.gold,marginTop:4}}>+{rw.lili} COIN{rw.bonus&&<span style={{fontSize:10,color:C.pink,marginLeft:6}}>★BONUS</span>}</div>}
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

            {/* Héroes en misión */}
            {cards.filter(c=>c.status==="mission").length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:10,letterSpacing:2}}>
                  <img src="/icons/in_mission.png" alt="mission" style={{width:14,height:14,verticalAlign:"middle",marginRight:4}}/>
                  EN MISIÓN
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {cards.filter(c=>c.status==="mission").map(c=>{
                    const secs=Math.max(0,Math.ceil((c.missionEnd-now)/1000));
                    const total=MISSIONS.find(x=>x.id===c.currentMission)?.time||60;
                    const pct=Math.round(((total-secs)/total)*100);
                    const r=RARITY[c.rarity];
                    const ch=CHARS[c.charIdx]||CHARS[0];
                    return(
                      <div key={c.id} style={{background:C.bg3,border:`1px solid ${r.color}22`,borderRadius:14,padding:12,
                        minWidth:220,flex:"1 1 220px",maxWidth:320}}>
                        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                          <img src={ch.img} alt={ch.name} style={{width:44,height:55,objectFit:"cover",objectPosition:"center top",borderRadius:8,flexShrink:0,border:`1px solid ${r.color}40`}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{c.name}</div>
                            <div style={{fontSize:10,color:r.color}}>{r.label}</div>
                            <div style={{fontSize:12,color:C.gold,fontWeight:700,marginTop:2}}>
                              <img src="/icons/time.png" alt="tiempo" style={{width:12,height:12,verticalAlign:"middle",marginRight:4}}/>
                              {secs}s
                            </div>
                          </div>
                        </div>
                        <div style={{height:5,background:"#ffffff08",borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",background:`linear-gradient(90deg,${C.cyan},${C.gold})`,borderRadius:4,
                            width:pct+"%",transition:"width 1s linear",boxShadow:`0 0 8px ${C.gold}88`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Misiones disponibles */}
            <div style={{fontSize:11,color:C.muted,marginBottom:12,letterSpacing:1}}>MISIONES DISPONIBLES</div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:16}}>
            {MISSIONS.map(m=>(
              <div key={m.id} onClick={()=>setActiveMission(m)}
                style={{
                  position:"relative",
                  borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.pink}33`,
                  cursor:"pointer", transition:"all .2s",
                  flex:"1 1 280px", minWidth:280, height:140,
                  boxShadow:`0 0 15px #000000aa`
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.pink;e.currentTarget.style.transform="scale(1.02)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${C.pink}33`;e.currentTarget.style.transform="";}}>
                
                <img src={m.img} alt={m.name} style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}} />
                <div style={{
                  position:"absolute", inset:0,
                  background:`linear-gradient(to top, #000000ee 0%, #00000055 45%, transparent 100%)`,
                  pointerEvents:"none"
                }}/>

                <div style={{position:"absolute", bottom:0, left:0, right:0, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", pointerEvents:"none"}}>
                  <div>
                    {/* El usuario mencionó que la imagen ya tiene el nombre, pero mantenemos una versión opcional de refuerzo */}
                    <div style={{fontSize:15,fontWeight:900,color:"#fff",textShadow:"0 2px 4px #000",marginBottom:2}}>
                      <img src="/icons/mission.png" alt="mision" style={{width:16,height:16,verticalAlign:"middle",marginRight:4}}/>
                      {m.name}
                    </div>
                    <div style={{fontSize:11,color:"#ddd",textShadow:"0 1px 2px #000"}}>
                      <img src="/icons/time.png" alt="time" style={{width:12,height:12,verticalAlign:"middle",marginRight:4}}/> {m.time}s · 
                      <img src="/icons/risk.png" alt="risk" style={{width:12,height:12,verticalAlign:"middle",marginLeft:6,marginRight:4}}/> {Math.round(m.baseRisk*100)}% riesgo
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:C.pink,fontWeight:800,marginBottom:2,textShadow:"0 1px 2px #000"}}>RECOMPENSA</div>
                    <div style={{fontSize:14,fontWeight:900,color:C.gold,textShadow:"0 1px 2px #000"}}>
                      <img src="/icons/coin.png" alt="coin" style={{width:14,height:14,verticalAlign:"middle",marginRight:4}}/>
                      {m.baseReward} COIN
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            {/* Cartas disponibles con botón ENVIAR MISIÓN */}
            {activeMission&&(
              <div style={{marginTop:16}}>
                <div style={{fontSize:11,color:C.pink,fontWeight:700,marginBottom:14,letterSpacing:2}}>
                  <img src="/icons/mission.png" alt="mision" style={{width:14,height:14,verticalAlign:"middle",marginRight:4}}/>
                  {activeMission.name} — ELIGE PERSONAJE
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:20,alignItems:"flex-start"}}>
                  {cards.filter(c=>c.status==="idle"&&RARITY[c.rarity].tier>=activeMission.minTier).map(c=>(
                    <CardUI key={c.id} card={c} mode="mission"
                      onSendMission={()=>sendOnMission(c.id,activeMission)}/>
                  ))}
                  {cards.filter(c=>c.status==="idle"&&RARITY[c.rarity].tier>=activeMission.minTier).length===0&&(
                    <div style={{color:C.muted,fontSize:13}}>Sin personajes disponibles para esta misión.</div>
                  )}
                </div>
                <button onClick={()=>setActiveMission(null)}
                  style={{marginTop:16,background:"transparent",color:C.muted,border:`1px solid ${C.muted}22`,
                    borderRadius:8,padding:"6px 16px",cursor:"pointer",fontSize:12}}>
                  ← Volver a misiones
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ARENA ── */}
        {tab==="Arena"&&(
          <div style={{animation:"fade_in .3s both"}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,fontWeight:900,color:C.red,letterSpacing:2}}>⚔️ ARENA</div>
              <div style={{fontSize:11,color:C.muted}}>Lucha contra enemigos — gana COIN y XP sin costo</div>
            </div>
            {arenaEnemy&&(
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                <div style={{flex:"0 0 220px"}}>
                  <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:10,letterSpacing:2}}>ENEMIGO</div>
                  <div style={{background:`linear-gradient(135deg,#1a0505,${C.bg3})`,
                    border:`2px solid ${C.red}40`,borderRadius:18,padding:22,textAlign:"center"}}>
                    <Sprite icon={arenaEnemy.icon} size={64} style={{marginBottom:8, margin:"0 auto"}} />
                    <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>{arenaEnemy.name}</div>
                    <div style={{display:"flex",justifyContent:"center",gap:12,fontSize:13,marginBottom:14}}>
                      <span style={{color:"#ff7043"}}>⚔️{arenaEnemy.atk}</span>
                      <span style={{color:"#42a5f5"}}>🛡️{arenaEnemy.def}</span>
                      <span style={{color:C.green}}>❤️{arenaEnemy.hp}</span>
                    </div>
                    <div style={{background:`${C.gold}12`,border:`1px solid ${C.gold}30`,borderRadius:10,padding:"8px 0",marginBottom:8}}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:2}}>Recompensa</div>
                      <div style={{fontSize:20,fontWeight:900,color:C.gold}}>+{arenaEnemy.reward} COIN</div>
                      <div style={{fontSize:11,color:C.cyan}}>+{arenaEnemy.xp} XP</div>
                    </div>
                  </div>
                  <button onClick={rollArenaEnemy_}
                    style={{marginTop:10,width:"100%",background:`${C.muted}12`,color:C.muted,
                      border:`1px solid ${C.muted}25`,borderRadius:10,padding:"8px 0",
                      cursor:"pointer",fontSize:12,fontWeight:700}}>🔄 Otro enemigo</button>
                </div>
                <div style={{flex:"1 1 300px"}}>
                  <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:14,letterSpacing:2}}>TU LUCHADOR</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:20,marginBottom:16,alignItems:"flex-start"}}>
                    {cards.filter(c=>c.status==="idle").map(c=>(
                      <CardUI key={c.id} card={c} selected={arenaFighter===c.id} mode="col"
                        onClick={()=>setArenaFighter(arenaFighter===c.id?null:c.id)}/>
                    ))}
                    {cards.filter(c=>c.status==="idle").length===0&&(
                      <div style={{color:C.muted,fontSize:13}}>Sin personajes libres.</div>
                    )}
                  </div>
                  {arenaFighter&&(()=>{
                    const fc=cards.find(c=>c.id===arenaFighter);
                    if(!fc)return null;
                    const winChance=Math.min(95,Math.max(5,
                      50+Math.round(((fc.atk-arenaEnemy.atk)/2)+((fc.def-arenaEnemy.def)*0.8)+((fc.hp-arenaEnemy.hp)/10))
                    ));
                    return(
                      <div style={{background:C.bg3,border:`1px solid ${C.pink}22`,borderRadius:14,padding:16,maxWidth:340}}>
                        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                          <img src={(CHARS[fc.charIdx]||CHARS[0]).img} style={{width:50,height:62,objectFit:"cover",objectPosition:"center top",borderRadius:8,border:`1px solid ${RARITY[fc.rarity].color}40`,flexShrink:0}}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{fc.name}</div>
                            <div style={{fontSize:10,color:RARITY[fc.rarity].color}}>{RARITY[fc.rarity].label}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:10,color:C.muted}}>Victoria</div>
                            <div style={{fontSize:22,fontWeight:900,color:winChance>60?C.green:winChance>40?C.gold:C.red}}>{winChance}%</div>
                          </div>
                        </div>
                        <button onClick={startArenaBattle}
                          style={{width:"100%",background:`linear-gradient(90deg,${C.red},${C.pink})`,
                            color:"#fff",border:"none",borderRadius:12,padding:"13px 0",
                            fontWeight:900,fontSize:15,cursor:"pointer",letterSpacing:1}}>
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
      {activeMission&&tab!=="Misiones"&&<MissionModal mission={activeMission} cards={cards} onSend={sendOnMission} onClose={()=>setActiveMission(null)}/>}
      {codeModal&&<CodeModal onClose={()=>setCodeModal(false)} onRedeem={redeemCode}/>}
      {dailyModal&&<DailyModal reward={dailyReward} streak={dailyStreak} onClaim={claimDailyBonus}/>}
      {arenaResult&&<ArenaResultModal result={arenaResult} onClose={()=>{setArenaResult(null);rollArenaEnemy_();}}/>}
      {missionResultModal&&<MissionResultModal reward={missionResultModal} onClaim={()=>{claimReward(missionResultModal);setMissionResultModal(null);}}/>}

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
