import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://voluamatpbsdcuggwsvf.supabase.co";
const SUPABASE_KEY = "sb_publishable_W-32zjDUlUBGV6VFhMuSyQ_HDDT9PuJ";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const LI_BLUE = "#0A66C2";
const LI_BG = "#F3F2EF";

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate()+diff); mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999);
  return { start:mon, end:sun };
}
function fmtDate(d) { return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}); }
function fmtDateLong(d) { return new Date(d).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}); }
function initiales(n) { return n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
function couleurEnt(n) {
  const cols=["#0A66C2","#004182","#00897B","#5E35B1","#E53935","#F57C00","#2E7D32"];
  let h=0; for(let c of n) h=(h*31+c.charCodeAt(0))%cols.length; return cols[h];
}

const Badge = ({statut}) => {
  const m = {
    entretien:{bg:"#E8F5E3",color:"#2E7D32",label:"Entretien ✓"},
    refus:{bg:"#FDECEA",color:"#C62828",label:"Refus"},
    attente:{bg:"#FFF8E1",color:"#E65100",label:"En attente"},
    test:{bg:"#E3F2FD",color:"#1565C0",label:"Test 📝"},
  };
  const s = m[statut]||{bg:"#f5f5f5",color:"#555",label:statut};
  return <span style={{fontSize:11,padding:"3px 9px",borderRadius:12,background:s.bg,color:s.color,fontWeight:600,whiteSpace:"nowrap"}}>{s.label}</span>;
};

export default function App() {
  const [tab, setTab] = useState("Accueil");
  const [candidatures, setCandidatures] = useState([]);
  const [entretiens, setEntretiens] = useState([]);
  const [tests, setTests] = useState([]);
  const [postits, setPostits] = useState([
    {id:1,texte:"Préparer entretien Crédit Agricole 26 mai",couleur:"#C8E6C9"},
    {id:2,texte:"Faire les tests Société Générale !",couleur:"#FFCCBC"},
    {id:3,texte:"Relancer Burda Bleu",couleur:"#FFF9C4"},
  ]);
  const [loading, setLoading] = useState(true);
  const [statutFiltre, setStatutFiltre] = useState("tous");
  const [periode, setPeriode] = useState("semaine");
  const [newNote, setNewNote] = useState("");
  const [noteCouleur, setNoteCouleur] = useState("#FFF9C4");
  const [showAddEntretien, setShowAddEntretien] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [newEntretien, setNewEntretien] = useState({entreprise:"",poste:"",date:"",heure:"",lieu:"",notes:""});
  const [newTest, setNewTest] = useState({entreprise:"",poste:"",type:"",deadline:"",lien:"",notes:""});

  const loadData = async () => {
    setLoading(true);
    const [c, e, t] = await Promise.all([
      sb.from("candidatures").select("*").order("date", {ascending:false}),
      sb.from("entretiens").select("*").order("date", {ascending:true}),
      sb.from("tests").select("*").order("created_at", {ascending:false}),
    ]);
    if (c.data) setCandidatures(c.data);
    if (e.data) setEntretiens(e.data);
    if (t.data) setTests(t.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Realtime subscription
  useEffect(() => {
    const sub = sb.channel("changes")
      .on("postgres_changes", {event:"*", schema:"public"}, () => loadData())
      .subscribe();
    return () => sb.removeChannel(sub);
  }, []);

  const { start:wStart, end:wEnd } = getWeekBounds();
  const semaine = candidatures.filter(c => { const d=new Date(c.date); return d>=wStart&&d<=wEnd; });
  const liste = periode==="semaine" ? semaine : candidatures;
  const listeFiltree = statutFiltre==="tous" ? liste : liste.filter(c=>c.statut===statutFiltre);

  const totalAll = candidatures.length;
  const totalEntretiens = candidatures.filter(c=>c.statut==="entretien").length;
  const totalRefus = candidatures.filter(c=>c.statut==="refus").length;
  const totalVues = candidatures.filter(c=>c.vue_par).length;
  const totalTests = tests.filter(t=>t.statut==="a_faire").length;
  const tauxEntretien = totalAll ? Math.round((totalEntretiens/totalAll)*100) : 0;

  const parJour = {}; const jours = [];
  for(let i=0;i<5;i++){
    const d=new Date(wStart); d.setDate(wStart.getDate()+i);
    const key=d.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"});
    const iso=d.toISOString().slice(0,10);
    parJour[key]=candidatures.filter(c=>c.date===iso).length;
    jours.push(key);
  }
  const maxJour=Math.max(1,...Object.values(parJour));

  const addPostit = () => { if(!newNote.trim())return; setPostits(p=>[...p,{id:Date.now(),texte:newNote,couleur:noteCouleur}]); setNewNote(""); };
  const delPostit = id => setPostits(p=>p.filter(x=>x.id!==id));

  const addEntretien = async () => {
    if(!newEntretien.entreprise||!newEntretien.date) return;
    await sb.from("entretiens").insert([newEntretien]);
    setNewEntretien({entreprise:"",poste:"",date:"",heure:"",lieu:"",notes:""});
    setShowAddEntretien(false);
  };
  const delEntretien = async id => { await sb.from("entretiens").delete().eq("id",id); };

  const addTest = async () => {
    if(!newTest.entreprise) return;
    await sb.from("tests").insert([{...newTest, statut:"a_faire"}]);
    setNewTest({entreprise:"",poste:"",type:"",deadline:"",lien:"",notes:""});
    setShowAddTest(false);
  };
  const delTest = async id => { await sb.from("tests").delete().eq("id",id); };
  const toggleTest = async (id, statut) => {
    await sb.from("tests").update({statut: statut==="a_faire"?"fini":"a_faire"}).eq("id",id);
  };

  const testsAFaire = tests.filter(t=>t.statut==="a_faire");
  const testsFinis = tests.filter(t=>t.statut==="fini");
  const TABS = ["Accueil","Candidatures","Tests","Calendrier","Notes"];

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Segoe UI',sans-serif",color:"#666"}}>
      <div>
        <div style={{width:40,height:40,border:`3px solid ${LI_BLUE}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}></div>
        <div style={{fontSize:14}}>Chargement...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{background:LI_BG,minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #e0e0e0",padding:"0 1rem",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0 0"}}>
            <div style={{width:34,height:34,background:LI_BLUE,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontSize:18}}>💼</span>
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:15,color:"#191919"}}>Job Tracker · Jules Guilbert</div>
              <div style={{fontSize:11,color:"#888"}}>jwguilbert@gmail.com · Mis à jour en temps réel ✦</div>
            </div>
            <button onClick={loadData} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:16,fontSize:12,fontWeight:600,cursor:"pointer"}}>
              ↻ Actualiser
            </button>
          </div>
          <div style={{display:"flex",gap:0,marginTop:6,overflowX:"auto"}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"9px 12px",fontSize:13,fontWeight:tab===t?600:400,color:tab===t?LI_BLUE:"#666",background:"none",border:"none",borderBottom:tab===t?`2px solid ${LI_BLUE}`:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                {t==="Tests"&&totalTests>0&&<span style={{background:"#E53935",color:"#fff",fontSize:10,fontWeight:700,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>{totalTests}</span>}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:740,margin:"0 auto",padding:"1rem"}}>

        {/* ACCUEIL */}
        {tab==="Accueil" && <>
          {testsAFaire.length>0&&(
            <div onClick={()=>setTab("Tests")} style={{background:"#E3F2FD",border:"1px solid #90CAF9",borderRadius:8,padding:"12px 16px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>📝</span>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:"#1565C0"}}>{testsAFaire.length} test{testsAFaire.length>1?"s":""} à effectuer !</div>
                <div style={{fontSize:12,color:"#1976D2"}}>{testsAFaire.map(t=>t.entreprise).join(" · ")} → Cliquez pour voir</div>
              </div>
            </div>
          )}

          {/* Post-its */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#666",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Mes notes</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {postits.map(p=>(
                <div key={p.id} style={{background:p.couleur,borderRadius:2,padding:"12px 14px",minWidth:140,maxWidth:200,boxShadow:"2px 2px 6px rgba(0,0,0,0.12)",position:"relative",flex:"1 1 140px"}}>
                  <button onClick={()=>delPostit(p.id)} style={{position:"absolute",top:4,right:6,background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#999"}}>×</button>
                  <p style={{margin:0,fontSize:13,color:"#333",lineHeight:1.5,paddingRight:16}}>{p.texte}</p>
                </div>
              ))}
              <div style={{background:"#fff",borderRadius:8,border:"1.5px dashed #ccc",padding:"10px 12px",minWidth:140,flex:"1 1 140px",display:"flex",flexDirection:"column",gap:8}}>
                <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Nouvelle note..." style={{border:"none",outline:"none",resize:"none",fontSize:13,color:"#333",minHeight:48,background:"transparent",fontFamily:"inherit"}}/>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  {["#FFF9C4","#C8E6C9","#BBDEFB","#FFCCBC","#E1BEE7"].map(c=>(
                    <div key={c} onClick={()=>setNoteCouleur(c)} style={{width:16,height:16,borderRadius:"50%",background:c,border:noteCouleur===c?"2px solid #333":"2px solid transparent",cursor:"pointer"}}/>
                  ))}
                  <button onClick={addPostit} style={{marginLeft:"auto",padding:"2px 10px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:10,fontSize:11,cursor:"pointer"}}>+ Ajouter</button>
                </div>
              </div>
            </div>
          </div>

          {/* Prochains entretiens */}
          {entretiens.filter(e=>new Date(e.date)>=new Date()).length>0&&(
            <div style={{background:"#EAF3DE",borderRadius:8,border:"1px solid #C8E6C9",padding:"12px 16px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:"#2E7D32",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>🎯 Prochains entretiens</div>
              {entretiens.filter(e=>new Date(e.date)>=new Date()).map(e=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#2E7D32",flexShrink:0}}/>
                  <div style={{flex:1}}><span style={{fontWeight:600,fontSize:13}}>{e.entreprise}</span><span style={{fontSize:12,color:"#555",marginLeft:6}}>{e.poste}</span></div>
                  <span style={{fontSize:12,color:"#2E7D32",fontWeight:500}}>{fmtDateLong(e.date)}{e.heure&&` · ${e.heure}`}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raccourcis */}
          <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#666",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Rechercher une alternance</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {[
                {label:"LinkedIn",sub:"≤10 candidats · Paris",url:"https://www.linkedin.com/jobs/search/?keywords=alternance+marketing&location=Paris&f_TPR=r604800&f_EA=true",color:LI_BLUE,bg:"#EEF3F8"},
                {label:"HelloWork",sub:"Alternance · Paris",url:"https://www.hellowork.com/fr-fr/emploi/recherche.html?k=alternance+marketing&l=Paris&k_types=Alternance",color:"#FF6B35",bg:"#FFF4F0"},
                {label:"Welcome to the Jungle",sub:"Alternance · Paris",url:"https://www.welcometothejungle.com/fr/jobs?refinementList%5Bcontract_type_names.fr%5D%5B%5D=Alternance&query=marketing",color:"#3D1F6A",bg:"#F3F0F8"},
              ].map(({label,sub,url,color,bg})=>(
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",flex:"1 1 130px"}}>
                  <div style={{border:`2px solid ${color}`,borderRadius:8,padding:"10px 12px",background:bg,display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                    <div><div style={{fontSize:12,fontWeight:700,color}}>{label}</div><div style={{fontSize:10,color:"#555"}}>{sub}</div></div>
                    <span style={{fontSize:12,color,marginLeft:"auto"}}>↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Stats semaine */}
          <div style={{fontSize:12,fontWeight:600,color:"#666",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>
            Cette semaine ({wStart.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} – {wEnd.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})})
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:14}}>
            {[
              {label:"Déposées",val:semaine.length,color:LI_BLUE},
              {label:"Refus",val:semaine.filter(c=>c.statut==="refus").length,color:"#C62828"},
              {label:"En attente",val:semaine.filter(c=>c.statut==="attente").length,color:"#E65100"},
              {label:"Entretiens",val:semaine.filter(c=>c.statut==="entretien").length,color:"#2E7D32"},
              {label:"Tests",val:totalTests,color:"#1565C0"},
            ].map(({label,val,color})=>(
              <div key={label} style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"#666",marginBottom:4}}>{label}</div>
                <div style={{fontSize:26,fontWeight:700,color:"#191919"}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Graphe */}
          <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:"#191919",marginBottom:12}}>Activité cette semaine</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
              {jours.map(j=>{const n=parJour[j]||0;const h=Math.round((n/maxJour)*64);return(
                <div key={j} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:12,color:n>0?LI_BLUE:"#bbb",fontWeight:n>0?600:400}}>{n||""}</span>
                  <div style={{width:"100%",height:h||4,background:n>0?LI_BLUE:"#e8e8e8",borderRadius:4}}/>
                  <span style={{fontSize:10,color:"#888"}}>{j}</span>
                </div>
              );})}
            </div>
          </div>

          {/* Stats globales */}
          <div style={{fontSize:12,fontWeight:600,color:"#666",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tous les temps</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10}}>
            {[
              {label:"Total",val:totalAll,color:LI_BLUE},
              {label:"Entretiens",val:totalEntretiens,color:"#2E7D32"},
              {label:"Refus",val:totalRefus,color:"#C62828"},
              {label:"Vues",val:totalVues,color:"#5E35B1"},
              {label:"Taux",val:tauxEntretien+"%",color:LI_BLUE},
            ].map(({label,val,color})=>(
              <div key={label} style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"#666",marginBottom:4}}>{label}</div>
                <div style={{fontSize:26,fontWeight:700,color:"#191919"}}>{val}</div>
              </div>
            ))}
          </div>
        </>}

        {/* CANDIDATURES */}
        {tab==="Candidatures" && <>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
            {["semaine","tous"].map(p=>(
              <button key={p} onClick={()=>setPeriode(p)} style={{fontSize:13,padding:"5px 14px",borderRadius:16,cursor:"pointer",background:periode===p?LI_BLUE:"#fff",color:periode===p?"#fff":"#444",border:periode===p?`1px solid ${LI_BLUE}`:"1px solid #ccc",fontWeight:periode===p?600:400}}>
                {p==="semaine"?"Cette semaine":"Toutes"}
              </button>
            ))}
            <div style={{flex:1}}/>
            {["tous","attente","entretien","refus"].map(s=>(
              <button key={s} onClick={()=>setStatutFiltre(s)} style={{fontSize:11,padding:"3px 9px",borderRadius:12,cursor:"pointer",background:statutFiltre===s?"#EEF3F8":"#fff",color:statutFiltre===s?LI_BLUE:"#666",border:statutFiltre===s?`1px solid ${LI_BLUE}`:"1px solid #ddd",fontWeight:statutFiltre===s?600:400}}>
                {s==="tous"?"Tous":s==="attente"?"Attente":s==="entretien"?"Entretiens":"Refus"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {listeFiltree.map(item=>(
              <a key={item.id} href={item.lien||"#"} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                <div style={{background:"#fff",borderRadius:8,border:"1px solid #e0e0e0",padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.1)"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                  <div style={{width:40,height:40,borderRadius:6,background:couleurEnt(item.entreprise),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,fontWeight:700,color:"#fff"}}>{initiales(item.entreprise)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:14,color:"#191919",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.entreprise}</div>
                    <div style={{fontSize:12,color:"#666",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.poste}</div>
                    <div style={{fontSize:11,color:"#999",marginTop:2,display:"flex",gap:8}}>
                      <span>{fmtDate(item.date)}</span>
                      {item.vue_par&&<span style={{color:"#5E35B1",fontWeight:500}}>👁 Vue</span>}
                      <span>{item.source}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <Badge statut={item.statut}/>
                  </div>
                </div>
              </a>
            ))}
            {listeFiltree.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#999"}}>Aucune candidature{candidatures.length===0?" — les données arrivent via Make automatiquement !":""}</div>}
          </div>
        </>}

        {/* TESTS */}
        {tab==="Tests" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#666",textTransform:"uppercase",letterSpacing:"0.05em"}}>📝 Tests de recrutement</div>
            <button onClick={()=>setShowAddTest(!showAddTest)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:16,fontSize:12,fontWeight:600,cursor:"pointer"}}>
              + Ajouter
            </button>
          </div>
          {showAddTest&&(
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${LI_BLUE}`,padding:"16px",marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                {[{key:"entreprise",label:"Entreprise",ph:"Ex: Société Générale"},{key:"poste",label:"Poste",ph:"Ex: Chargé marketing"},{key:"type",label:"Type",ph:"Ex: Tests Aon"},{key:"deadline",label:"Deadline",type:"date"},{key:"lien",label:"Lien",ph:"https://..."},{key:"notes",label:"Notes",ph:"Infos..."}].map(({key,label,ph,type})=>(
                  <div key={key}>
                    <div style={{fontSize:11,color:"#666",marginBottom:3}}>{label}</div>
                    <input type={type||"text"} value={newTest[key]} onChange={e=>setNewTest(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"6px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={addTest} style={{padding:"7px 18px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:16,fontSize:13,fontWeight:600,cursor:"pointer"}}>Enregistrer</button>
                <button onClick={()=>setShowAddTest(false)} style={{padding:"7px 18px",background:"#f5f5f5",color:"#555",border:"1px solid #ddd",borderRadius:16,fontSize:13,cursor:"pointer"}}>Annuler</button>
              </div>
            </div>
          )}
          {testsAFaire.length>0&&<>
            <div style={{fontSize:12,fontWeight:600,color:"#1565C0",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span style={{background:"#E53935",color:"#fff",fontSize:10,fontWeight:700,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{testsAFaire.length}</span>À FAIRE
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {testsAFaire.map(t=>(
                <div key={t.id} style={{background:"#fff",borderRadius:8,border:"1.5px solid #90CAF9",padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <button onClick={()=>toggleTest(t.id,t.statut)} style={{width:22,height:22,borderRadius:4,border:"2px solid #90CAF9",background:"#fff",cursor:"pointer",flexShrink:0,marginTop:2}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:"#191919"}}>{t.entreprise}</div>
                    <div style={{fontSize:12,color:"#555",marginBottom:4}}>{t.poste}</div>
                    {t.type&&<div style={{fontSize:12,color:"#1565C0",fontWeight:500,marginBottom:4}}>📋 {t.type}</div>}
                    {t.deadline&&<div style={{fontSize:12,color:"#E53935",fontWeight:500}}>⏰ Deadline : {fmtDate(t.deadline)}</div>}
                    {t.notes&&<div style={{fontSize:12,color:"#888",marginTop:4,fontStyle:"italic"}}>{t.notes}</div>}
                    {t.lien&&<a href={t.lien} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:LI_BLUE,display:"block",marginTop:6}}>🔗 Accéder au test</a>}
                  </div>
                  <button onClick={()=>delTest(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:18,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          </>}
          {testsFinis.length>0&&<>
            <div style={{fontSize:12,fontWeight:600,color:"#2E7D32",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>✅ Terminés</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {testsFinis.map(t=>(
                <div key={t.id} style={{background:"#F9FBE7",borderRadius:8,border:"1px solid #C8E6C9",padding:"12px 16px",display:"flex",gap:12,alignItems:"center",opacity:0.8}}>
                  <button onClick={()=>toggleTest(t.id,t.statut)} style={{width:22,height:22,borderRadius:4,border:"2px solid #2E7D32",background:"#2E7D32",cursor:"pointer",flexShrink:0,color:"#fff",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13,color:"#555",textDecoration:"line-through"}}>{t.entreprise}</div>
                    <div style={{fontSize:12,color:"#888"}}>{t.poste}</div>
                  </div>
                  <button onClick={()=>delTest(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:18,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          </>}
          {tests.length===0&&<div style={{textAlign:"center",padding:"3rem",color:"#999"}}>Aucun test pour le moment</div>}
        </>}

        {/* CALENDRIER */}
        {tab==="Calendrier" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:"#666",textTransform:"uppercase",letterSpacing:"0.05em"}}>Entretiens planifiés</div>
            <button onClick={()=>setShowAddEntretien(!showAddEntretien)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:16,fontSize:12,fontWeight:600,cursor:"pointer"}}>
              + Ajouter
            </button>
          </div>
          {showAddEntretien&&(
            <div style={{background:"#fff",borderRadius:8,border:`1px solid ${LI_BLUE}`,padding:"16px",marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                {[{key:"entreprise",label:"Entreprise",ph:"Ex: Crédit Agricole"},{key:"poste",label:"Poste",ph:"Ex: Assistant Marketing"},{key:"date",label:"Date",type:"date"},{key:"heure",label:"Heure",type:"time"},{key:"lieu",label:"Lieu",ph:"Ex: Teams / Paris"},{key:"notes",label:"Notes",ph:"Préparer..."}].map(({key,label,ph,type})=>(
                  <div key={key}>
                    <div style={{fontSize:11,color:"#666",marginBottom:3}}>{label}</div>
                    <input type={type||"text"} value={newEntretien[key]} onChange={e=>setNewEntretien(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"6px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={addEntretien} style={{padding:"7px 18px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:16,fontSize:13,fontWeight:600,cursor:"pointer"}}>Enregistrer</button>
                <button onClick={()=>setShowAddEntretien(false)} style={{padding:"7px 18px",background:"#f5f5f5",color:"#555",border:"1px solid #ddd",borderRadius:16,fontSize:13,cursor:"pointer"}}>Annuler</button>
              </div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {entretiens.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e=>{
              const isPast=new Date(e.date)<new Date();
              return(
                <div key={e.id} style={{background:"#fff",borderRadius:8,border:`1px solid ${isPast?"#e0e0e0":"#C8E6C9"}`,padding:"14px 16px",opacity:isPast?0.6:1}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:isPast?"#bbb":"#2E7D32",flexShrink:0}}/>
                        <span style={{fontWeight:600,fontSize:15,color:"#191919"}}>{e.entreprise}</span>
                        {isPast&&<span style={{fontSize:11,color:"#999",background:"#f5f5f5",padding:"1px 8px",borderRadius:10}}>Passé</span>}
                      </div>
                      <div style={{fontSize:13,color:"#555",marginLeft:18,marginBottom:4}}>{e.poste}</div>
                      <div style={{fontSize:12,color:"#2E7D32",marginLeft:18,fontWeight:500}}>
                        📅 {fmtDateLong(e.date)}{e.heure&&` à ${e.heure}`}
                        {e.lieu&&<span style={{color:"#888",fontWeight:400}}> · {e.lieu}</span>}
                      </div>
                      {e.notes&&<div style={{fontSize:12,color:"#888",marginLeft:18,marginTop:4,fontStyle:"italic"}}>{e.notes}</div>}
                    </div>
                    <button onClick={()=>delEntretien(e.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:18,lineHeight:1}}>×</button>
                  </div>
                </div>
              );
            })}
            {entretiens.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#999"}}>Aucun entretien planifié</div>}
          </div>
        </>}

        {/* NOTES */}
        {tab==="Notes" && <>
          <div style={{fontSize:12,fontWeight:600,color:"#666",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.05em"}}>Mes post-its & to-do</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:16}}>
            {postits.map(p=>(
              <div key={p.id} style={{background:p.couleur,borderRadius:2,padding:"16px",boxShadow:"3px 3px 8px rgba(0,0,0,0.14)",position:"relative",minHeight:100}}>
                <button onClick={()=>delPostit(p.id)} style={{position:"absolute",top:6,right:8,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#999"}}>×</button>
                <p style={{margin:0,fontSize:13,color:"#333",lineHeight:1.6,paddingRight:16}}>{p.texte}</p>
              </div>
            ))}
            <div style={{background:"#fff",borderRadius:8,border:"1.5px dashed #ccc",padding:"14px",display:"flex",flexDirection:"column",gap:8,minHeight:100}}>
              <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Nouvelle note ou to-do..." style={{border:"none",outline:"none",resize:"none",fontSize:13,color:"#333",flex:1,background:"transparent",fontFamily:"inherit"}}/>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {["#FFF9C4","#C8E6C9","#BBDEFB","#FFCCBC","#E1BEE7"].map(c=>(
                  <div key={c} onClick={()=>setNoteCouleur(c)} style={{width:18,height:18,borderRadius:"50%",background:c,border:noteCouleur===c?"2px solid #333":"2px solid transparent",cursor:"pointer"}}/>
                ))}
                <button onClick={addPostit} style={{marginLeft:"auto",padding:"3px 12px",background:LI_BLUE,color:"#fff",border:"none",borderRadius:10,fontSize:12,cursor:"pointer"}}>+ Ajouter</button>
              </div>
            </div>
          </div>
        </>}

      </div>
    </div>
  );
}
