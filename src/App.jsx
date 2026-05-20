import { useState } from "react";

const LI_BLUE = "#0A66C2";
const LI_BG = "#F3F2EF";

const CANDIDATURES = [
  { id:1,  entreprise:"Radio France",          poste:"Assistant Chef de projets Réseaux Sociaux",             statut:"attente",   date:"2026-05-13", source:"Email",    lien:"https://www.radiofrance.fr/offres-emploi",               vuePar:false },
  { id:2,  entreprise:"CANAL+",                poste:"Alternance Marketing Digital (2ème)",                   statut:"attente",   date:"2026-05-13", source:"Email",    lien:"https://www.canalplus.com/careers",                      vuePar:false },
  { id:3,  entreprise:"Société Générale",      poste:"Acheteur Marketing, Travel et Mobility",                statut:"attente",   date:"2026-05-13", source:"Email",    lien:"https://careers.societegenerale.com",                    vuePar:false },
  { id:4,  entreprise:"AXA",                   poste:"Chargé de campagnes marketing (2ème)",                  statut:"attente",   date:"2026-05-13", source:"Email",    lien:"https://careers.axa.com",                               vuePar:false },
  { id:5,  entreprise:"Crédit Agricole Immo",  poste:"Chargé(e) de communication - Montrouge",               statut:"refus",     date:"2026-05-13", source:"Email",    lien:"https://recrutement.credit-agricole.fr",                 vuePar:false },
  { id:6,  entreprise:"Sharp DX",              poste:"Chargé(e) de Marketing alternance",                    statut:"refus",     date:"2026-05-13", source:"Email",    lien:"https://www.linkedin.com/company/sharp-dx",              vuePar:false },
  { id:7,  entreprise:"Volkswagen Group",      poste:"Assistant communication et marketing",                  statut:"attente",   date:"2026-05-12", source:"Email",    lien:"https://www.linkedin.com/company/vgrf",                  vuePar:false },
  { id:8,  entreprise:"Fnac Darty",            poste:"Chargé Satisfaction Client Marketplace",               statut:"attente",   date:"2026-05-12", source:"Email",    lien:"https://recrutement.fnacdarty.com",                      vuePar:false },
  { id:9,  entreprise:"Burda Bleu",            poste:"Assistant.e Social Media",                             statut:"entretien", date:"2026-05-11", source:"LinkedIn", lien:"https://www.linkedin.com/company/burda-bleu",            vuePar:true  },
  { id:10, entreprise:"WEBCK (Topela)",        poste:"Stage marketing",                                      statut:"entretien", date:"2026-04-15", source:"Email",    lien:"https://www.webck.fr",                                  vuePar:false },
  { id:11, entreprise:"EDF",                   poste:"Stage - Appui Relations Clients",                      statut:"refus",     date:"2026-04-01", source:"Email",    lien:"https://recrutement.edf.fr",                            vuePar:false },
  { id:12, entreprise:"Bouquet Communication", poste:"Associate Digital Project Manager",                    statut:"attente",   date:"2026-05-13", source:"LinkedIn", lien:"https://www.linkedin.com/company/bouquet-communication",  vuePar:true  },
  { id:13, entreprise:"UNEDIC",                poste:"Assistant communications alternance",                  statut:"attente",   date:"2026-05-14", source:"LinkedIn", lien:"https://www.linkedin.com/jobs/view/4414131162/",         vuePar:false },
  { id:14, entreprise:"Brevo",                 poste:"Alternance Marketing",                                 statut:"attente",   date:"2026-05-19", source:"LinkedIn", lien:"https://www.linkedin.com/jobs/search/?company=brevo",    vuePar:false },
  { id:15, entreprise:"IMCP Institut",         poste:"Chargé(e) Développement Commercial & Stratégie",      statut:"attente",   date:"2026-05-19", source:"LinkedIn", lien:"https://www.linkedin.com/jobs/view/4410703757/",         vuePar:true  },
  { id:17, entreprise:"Pass Culture",         poste:"Chargé(e) de marketing - Alternance",                   statut:"refus",     date:"2026-05-20", source:"Email",    lien:"https://www.passculture.app",                           vuePar:false },
];

const ENTRETIENS_INIT = [
  { id:1, entreprise:"Crédit Agricole S.A.", poste:"Alternance Assistant Marketing Marché Entreprises", date:"2026-05-26", heure:"12:00", lieu:"Teams (visio)", notes:"Contact: Maxime GANNE · +33 6 70 03 03 71 · Attendre invitation Teams" },
  { id:2, entreprise:"Burda Bleu",           poste:"Assistant Social Media",                           date:"2026-05-28", heure:"",      lieu:"Visio",         notes:"Préparer exemples réseaux sociaux" },
  { id:3, entreprise:"WEBCK (Topela)",       poste:"Stage marketing",                                  date:"2026-06-03", heure:"14:30", lieu:"Paris 9ème",    notes:"Apporter CV papier" },
];

const TESTS_INIT = [
  { id:1, entreprise:"Société Générale", poste:"Acheteur Marketing, Travel et Mobility", type:"Tests en ligne Aon (~15 min/test)", deadline:"2026-05-21", statut:"a_faire", lien:"https://socgen-support-aon.deskpro.com/fr/new-ticket", notes:"Login: JulesG · Deadline jeudi 21 mai 15h38" },
  { id:2, entreprise:"Société Générale", poste:"2ème poste (précisez le sujet du mail)", type:"Tests en ligne", deadline:"2026-05-21", statut:"a_faire", lien:"", notes:"Recu le 18 ou 19 mai sur jwguilbert@gmail.com — precisez le poste" },
];

const POSTITS_INIT = [
  { id:1, texte:"Préparer entretien Crédit Agricole 26 mai", couleur:"#C8E6C9" },
  { id:2, texte:"Faire les tests Société Générale !", couleur:"#FFCCBC" },
  { id:3, texte:"Relancer Burda Bleu", couleur:"#FFF9C4" },
];

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate() + diff); mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { start: mon, end: sun };
}
function fmtDate(d) { return new Date(d).toLocaleDateString("fr-FR", { day:"numeric", month:"short" }); }
function fmtDateLong(d) { return new Date(d).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" }); }
function initiales(n) { return n.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(); }
function couleurEnt(n) {
  const cols = ["#0A66C2","#004182","#00897B","#5E35B1","#E53935","#F57C00","#2E7D32"];
  let h = 0; for (let c of n) h = (h * 31 + c.charCodeAt(0)) % cols.length;
  return cols[h];
}

const Badge = ({ statut }) => {
  const m = {
    entretien: { bg:"#E8F5E3", color:"#2E7D32", label:"Entretien ✓" },
    refus:     { bg:"#FDECEA", color:"#C62828", label:"Refus" },
    attente:   { bg:"#FFF8E1", color:"#E65100", label:"En attente" },
    test:      { bg:"#E3F2FD", color:"#1565C0", label:"Test 📝" },
  };
  const s = m[statut] || { bg:"#f5f5f5", color:"#555", label:statut };
  return <span style={{ fontSize:11, padding:"3px 9px", borderRadius:12, background:s.bg, color:s.color, fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>;
};

export default function App() {
  const [tab, setTab] = useState("Accueil");
  const [candidatures] = useState(CANDIDATURES);
  const [entretiens, setEntretiens] = useState(ENTRETIENS_INIT);
  const [tests, setTests] = useState(TESTS_INIT);
  const [postits, setPostits] = useState(POSTITS_INIT);
  const [statutFiltre, setStatutFiltre] = useState("tous");
  const [periode, setPeriode] = useState("semaine");
  const [newNote, setNewNote] = useState("");
  const [noteCouleur, setNoteCouleur] = useState("#FFF9C4");
  const [showAddEntretien, setShowAddEntretien] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [newEntretien, setNewEntretien] = useState({ entreprise:"", poste:"", date:"", heure:"", lieu:"", notes:"" });
  const [newTest, setNewTest] = useState({ entreprise:"", poste:"", type:"", deadline:"", lien:"", notes:"" });

  const { start: wStart, end: wEnd } = getWeekBounds();
  const semaine = candidatures.filter(c => { const d = new Date(c.date); return d >= wStart && d <= wEnd; });
  const liste = periode === "semaine" ? semaine : candidatures;
  const listeFiltree = statutFiltre === "tous" ? liste : liste.filter(c => c.statut === statutFiltre);

  const totalAll = candidatures.length;
  const totalEntretiens = candidatures.filter(c => c.statut === "entretien").length;
  const totalRefus = candidatures.filter(c => c.statut === "refus").length;
  const totalVues = candidatures.filter(c => c.vuePar).length;
  const totalTests = tests.filter(t => t.statut === "a_faire").length;
  const tauxEntretien = Math.round((totalEntretiens / totalAll) * 100);

  const parJour = {}; const jours = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(wStart); d.setDate(wStart.getDate() + i);
    const key = d.toLocaleDateString("fr-FR", { weekday:"short", day:"numeric" });
    const iso = d.toISOString().slice(0, 10);
    parJour[key] = candidatures.filter(c => c.date === iso).length;
    jours.push(key);
  }
  const maxJour = Math.max(1, ...Object.values(parJour));

  const addPostit = () => { if (!newNote.trim()) return; setPostits(p => [...p, { id:Date.now(), texte:newNote, couleur:noteCouleur }]); setNewNote(""); };
  const delPostit = id => setPostits(p => p.filter(x => x.id !== id));
  const addEntretien = () => { if (!newEntretien.entreprise || !newEntretien.date) return; setEntretiens(e => [...e, { ...newEntretien, id:Date.now() }]); setNewEntretien({ entreprise:"", poste:"", date:"", heure:"", lieu:"", notes:"" }); setShowAddEntretien(false); };
  const delEntretien = id => setEntretiens(e => e.filter(x => x.id !== id));
  const addTest = () => { if (!newTest.entreprise) return; setTests(t => [...t, { ...newTest, id:Date.now(), statut:"a_faire" }]); setNewTest({ entreprise:"", poste:"", type:"", deadline:"", lien:"", notes:"" }); setShowAddTest(false); };
  const delTest = id => setTests(t => t.filter(x => x.id !== id));
  const toggleTest = id => setTests(t => t.map(x => x.id === id ? { ...x, statut: x.statut === "a_faire" ? "fini" : "a_faire" } : x));

  const TABS = ["Accueil","Candidatures","Tests","Calendrier","Notes"];
  const testsAFaire = tests.filter(t => t.statut === "a_faire");
  const testsFinis = tests.filter(t => t.statut === "fini");

  const btn = (label, active, onClick) => (
    <button onClick={onClick} style={{ fontSize:12, padding:"4px 12px", borderRadius:16, cursor:"pointer", background:active ? LI_BLUE : "#fff", color:active ? "#fff" : "#555", border:active ? `1px solid ${LI_BLUE}` : "1px solid #ccc", fontWeight:active ? 600 : 400 }}>{label}</button>
  );

  return (
    <div style={{ background:LI_BG, minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e0e0e0", padding:"0 1rem", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ maxWidth:740, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0 0" }}>
            <div style={{ width:34, height:34, background:LI_BLUE, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <i className="ti ti-briefcase" style={{ color:"#fff", fontSize:17 }} />
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:15, color:"#191919" }}>Job Tracker · Jules Guilbert</div>
              <div style={{ fontSize:11, color:"#888" }}>jwguilbert@gmail.com · jjw09190@gmail.com</div>
            </div>
            <button onClick={() => sendPrompt("update")} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:16, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <i className="ti ti-refresh" style={{ fontSize:13 }} />Actualiser
            </button>
          </div>
          <div style={{ display:"flex", gap:0, marginTop:6, overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:"9px 12px", fontSize:13, fontWeight:tab===t?600:400, color:tab===t?LI_BLUE:"#666", background:"none", border:"none", borderBottom:tab===t?`2px solid ${LI_BLUE}`:"2px solid transparent", cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4 }}>
                {t === "Tests" && totalTests > 0 && <span style={{ background:"#E53935", color:"#fff", fontSize:10, fontWeight:700, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" }}>{totalTests}</span>}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:740, margin:"0 auto", padding:"1rem" }}>

        {/* ═══ ACCUEIL ═══ */}
        {tab === "Accueil" && <>
          {testsAFaire.length > 0 && (
            <div onClick={() => setTab("Tests")} style={{ background:"#E3F2FD", border:"1px solid #90CAF9", borderRadius:8, padding:"12px 16px", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>📝</span>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"#1565C0" }}>{testsAFaire.length} test{testsAFaire.length > 1 ? "s" : ""} à effectuer !</div>
                <div style={{ fontSize:12, color:"#1976D2" }}>{testsAFaire.map(t => t.entreprise).join(" · ")} → Cliquez pour voir</div>
              </div>
            </div>
          )}

          {/* Post-its */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#666", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>Mes notes</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {postits.map(p => (
                <div key={p.id} style={{ background:p.couleur, borderRadius:2, padding:"12px 14px", minWidth:140, maxWidth:200, boxShadow:"2px 2px 6px rgba(0,0,0,0.12)", position:"relative", flex:"1 1 140px" }}>
                  <button onClick={() => delPostit(p.id)} style={{ position:"absolute", top:4, right:6, background:"none", border:"none", cursor:"pointer", fontSize:14, color:"#999" }}>×</button>
                  <p style={{ margin:0, fontSize:13, color:"#333", lineHeight:1.5, paddingRight:16 }}>{p.texte}</p>
                </div>
              ))}
              <div style={{ background:"#fff", borderRadius:8, border:"1.5px dashed #ccc", padding:"10px 12px", minWidth:140, flex:"1 1 140px", display:"flex", flexDirection:"column", gap:8 }}>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Nouvelle note..." style={{ border:"none", outline:"none", resize:"none", fontSize:13, color:"#333", minHeight:48, background:"transparent", fontFamily:"inherit" }} />
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  {["#FFF9C4","#C8E6C9","#BBDEFB","#FFCCBC","#E1BEE7"].map(c => (
                    <div key={c} onClick={() => setNoteCouleur(c)} style={{ width:16, height:16, borderRadius:"50%", background:c, border:noteCouleur===c?"2px solid #333":"2px solid transparent", cursor:"pointer" }} />
                  ))}
                  <button onClick={addPostit} style={{ marginLeft:"auto", padding:"2px 10px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:10, fontSize:11, cursor:"pointer" }}>+ Ajouter</button>
                </div>
              </div>
            </div>
          </div>

          {/* Prochains entretiens */}
          {entretiens.filter(e => new Date(e.date) >= new Date()).length > 0 && (
            <div style={{ background:"#EAF3DE", borderRadius:8, border:"1px solid #C8E6C9", padding:"12px 16px", marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#2E7D32", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>🎯 Prochains entretiens</div>
              {entretiens.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date)-new Date(b.date)).map(e => (
                <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#2E7D32", flexShrink:0 }} />
                  <div style={{ flex:1 }}><span style={{ fontWeight:600, fontSize:13 }}>{e.entreprise}</span><span style={{ fontSize:12, color:"#555", marginLeft:6 }}>{e.poste}</span></div>
                  <span style={{ fontSize:12, color:"#2E7D32", fontWeight:500 }}>{fmtDateLong(e.date)}{e.heure && ` · ${e.heure}`}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raccourcis */}
          <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#666", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>Rechercher une alternance</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                { label:"LinkedIn", sub:"≤10 candidats · Paris", url:"https://www.linkedin.com/jobs/search/?keywords=alternance+marketing&location=Paris&f_TPR=r604800&f_EA=true", color:LI_BLUE, bg:"#EEF3F8" },
                { label:"HelloWork", sub:"Alternance · Paris", url:"https://www.hellowork.com/fr-fr/emploi/recherche.html?k=alternance+marketing&l=Paris&k_types=Alternance", color:"#FF6B35", bg:"#FFF4F0" },
                { label:"Welcome to the Jungle", sub:"Alternance · Paris", url:"https://www.welcometothejungle.com/fr/jobs?refinementList%5Bcontract_type_names.fr%5D%5B%5D=Alternance&query=marketing", color:"#3D1F6A", bg:"#F3F0F8" },
              ].map(({ label, sub, url, color, bg }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", flex:"1 1 130px" }}>
                  <div style={{ border:`2px solid ${color}`, borderRadius:8, padding:"10px 12px", background:bg, display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                    <div><div style={{ fontSize:12, fontWeight:700, color }}>{label}</div><div style={{ fontSize:10, color:"#555" }}>{sub}</div></div>
                    <i className="ti ti-external-link" style={{ fontSize:12, color, marginLeft:"auto" }} />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Stats semaine */}
          <div style={{ fontSize:12, fontWeight:600, color:"#666", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Cette semaine ({wStart.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} – {wEnd.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})})
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10, marginBottom:14 }}>
            {[
              { icon:"ti-send",    label:"Déposées",  val:semaine.length,                                     color:LI_BLUE },
              { icon:"ti-x",      label:"Refus",      val:semaine.filter(c=>c.statut==="refus").length,       color:"#C62828" },
              { icon:"ti-clock",  label:"En attente", val:semaine.filter(c=>c.statut==="attente").length,     color:"#E65100" },
              { icon:"ti-users",  label:"Entretiens", val:semaine.filter(c=>c.statut==="entretien").length,   color:"#2E7D32" },
              { icon:"ti-writing",label:"Tests",      val:totalTests,                                         color:"#1565C0" },
            ].map(({ icon, label, val, color }) => (
              <div key={label} style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:"#666", marginBottom:4, display:"flex", alignItems:"center", gap:4 }}>
                  <i className={`ti ${icon}`} style={{ fontSize:13, color }} />{label}
                </div>
                <div style={{ fontSize:26, fontWeight:700, color:"#191919" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Graphe */}
          <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#191919", marginBottom:12 }}>Activité cette semaine</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80 }}>
              {jours.map(j => { const n = parJour[j] || 0; const h = Math.round((n/maxJour)*64); return (
                <div key={j} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:12, color:n>0?LI_BLUE:"#bbb", fontWeight:n>0?600:400 }}>{n||""}</span>
                  <div style={{ width:"100%", height:h||4, background:n>0?LI_BLUE:"#e8e8e8", borderRadius:4 }} />
                  <span style={{ fontSize:10, color:"#888" }}>{j}</span>
                </div>
              );})}
            </div>
          </div>

          {/* Stats globales */}
          <div style={{ fontSize:12, fontWeight:600, color:"#666", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Tous les temps</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10 }}>
            {[
              { icon:"ti-file-text", label:"Total",      val:totalAll,            color:LI_BLUE },
              { icon:"ti-star",      label:"Entretiens", val:totalEntretiens,     color:"#2E7D32" },
              { icon:"ti-x",         label:"Refus",      val:totalRefus,          color:"#C62828" },
              { icon:"ti-eye",       label:"Vues",       val:totalVues,           color:"#5E35B1" },
              { icon:"ti-chart-pie", label:"Taux",       val:tauxEntretien + "%", color:LI_BLUE },
            ].map(({ icon, label, val, color }) => (
              <div key={label} style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:"#666", marginBottom:4, display:"flex", alignItems:"center", gap:4 }}>
                  <i className={`ti ${icon}`} style={{ fontSize:13, color }} />{label}
                </div>
                <div style={{ fontSize:26, fontWeight:700, color:"#191919" }}>{val}</div>
              </div>
            ))}
          </div>
        </>}

        {/* ═══ CANDIDATURES ═══ */}
        {tab === "Candidatures" && <>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
            {btn("Cette semaine", periode==="semaine", ()=>setPeriode("semaine"))}
            {btn("Toutes", periode==="tous", ()=>setPeriode("tous"))}
            <div style={{ flex:1 }} />
            {["tous","attente","entretien","refus"].map(s => (
              <button key={s} onClick={()=>setStatutFiltre(s)} style={{ fontSize:11, padding:"3px 9px", borderRadius:12, cursor:"pointer", background:statutFiltre===s?"#EEF3F8":"#fff", color:statutFiltre===s?LI_BLUE:"#666", border:statutFiltre===s?`1px solid ${LI_BLUE}`:"1px solid #ddd", fontWeight:statutFiltre===s?600:400 }}>
                {s==="tous"?"Tous":s==="attente"?"Attente":s==="entretien"?"Entretiens":"Refus"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {listeFiltree.map(item => (
              <a key={item.id} href={item.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e0e0e0", padding:"12px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>
                  <div style={{ width:40, height:40, borderRadius:6, background:couleurEnt(item.entreprise), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13, fontWeight:700, color:"#fff" }}>{initiales(item.entreprise)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#191919", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.entreprise}</div>
                    <div style={{ fontSize:12, color:"#666", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.poste}</div>
                    <div style={{ fontSize:11, color:"#999", marginTop:2, display:"flex", gap:8 }}>
                      <span>{fmtDate(item.date)}</span>
                      {item.vuePar && <span style={{ color:"#5E35B1", fontWeight:500 }}><i className="ti ti-eye" style={{ fontSize:11, marginRight:2 }} />Vue</span>}
                      <span>{item.source}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                    <Badge statut={item.statut} />
                    <i className="ti ti-external-link" style={{ fontSize:12, color:"#bbb" }} />
                  </div>
                </div>
              </a>
            ))}
            {listeFiltree.length === 0 && <div style={{ textAlign:"center", padding:"2rem", color:"#999" }}>Aucune candidature</div>}
          </div>
        </>}

        {/* ═══ TESTS ═══ */}
        {tab === "Tests" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#666", textTransform:"uppercase", letterSpacing:"0.05em" }}>📝 Tests de recrutement</div>
            <button onClick={() => setShowAddTest(!showAddTest)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:16, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <i className="ti ti-plus" style={{ fontSize:13 }} />Ajouter
            </button>
          </div>

          {showAddTest && (
            <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${LI_BLUE}`, padding:"16px", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Nouveau test</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                {[
                  { key:"entreprise", label:"Entreprise", placeholder:"Ex: Société Générale" },
                  { key:"poste",      label:"Poste",      placeholder:"Ex: Chargé marketing" },
                  { key:"type",       label:"Type",       placeholder:"Ex: Logique, personnalité..." },
                  { key:"deadline",   label:"Deadline",   type:"date" },
                  { key:"lien",       label:"Lien",       placeholder:"https://..." },
                  { key:"notes",      label:"Notes",      placeholder:"Infos..." },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <div style={{ fontSize:11, color:"#666", marginBottom:3 }}>{label}</div>
                    <input type={type||"text"} value={newTest[key]} onChange={e => setNewTest(p => ({ ...p, [key]:e.target.value }))} placeholder={placeholder}
                      style={{ width:"100%", padding:"6px 10px", border:"1px solid #ddd", borderRadius:6, fontSize:13, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={addTest} style={{ padding:"7px 18px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:16, fontSize:13, fontWeight:600, cursor:"pointer" }}>Enregistrer</button>
                <button onClick={() => setShowAddTest(false)} style={{ padding:"7px 18px", background:"#f5f5f5", color:"#555", border:"1px solid #ddd", borderRadius:16, fontSize:13, cursor:"pointer" }}>Annuler</button>
              </div>
            </div>
          )}

          {testsAFaire.length > 0 && <>
            <div style={{ fontSize:12, fontWeight:600, color:"#1565C0", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ background:"#E53935", color:"#fff", fontSize:10, fontWeight:700, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center" }}>{testsAFaire.length}</span>
              À FAIRE
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {testsAFaire.map(t => (
                <div key={t.id} style={{ background:"#fff", borderRadius:8, border:"1.5px solid #90CAF9", padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
                  <button onClick={() => toggleTest(t.id)} style={{ width:22, height:22, borderRadius:4, border:"2px solid #90CAF9", background:"#fff", cursor:"pointer", flexShrink:0, marginTop:2 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#191919" }}>{t.entreprise}</div>
                    <div style={{ fontSize:12, color:"#555", marginBottom:4 }}>{t.poste}</div>
                    {t.type && <div style={{ fontSize:12, color:"#1565C0", fontWeight:500, marginBottom:4 }}>📋 {t.type}</div>}
                    {t.deadline && <div style={{ fontSize:12, color:"#E53935", fontWeight:500 }}>⏰ Deadline : {fmtDate(t.deadline)}</div>}
                    {t.notes && <div style={{ fontSize:12, color:"#888", marginTop:4, fontStyle:"italic" }}>{t.notes}</div>}
                    {t.lien && <a href={t.lien} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:LI_BLUE, display:"block", marginTop:6 }}>🔗 Accéder au test</a>}
                  </div>
                  <button onClick={() => delTest(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", fontSize:18, lineHeight:1 }}>×</button>
                </div>
              ))}
            </div>
          </>}

          {testsFinis.length > 0 && <>
            <div style={{ fontSize:12, fontWeight:600, color:"#2E7D32", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>✅ Terminés</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {testsFinis.map(t => (
                <div key={t.id} style={{ background:"#F9FBE7", borderRadius:8, border:"1px solid #C8E6C9", padding:"12px 16px", display:"flex", gap:12, alignItems:"center", opacity:0.8 }}>
                  <button onClick={() => toggleTest(t.id)} style={{ width:22, height:22, borderRadius:4, border:"2px solid #2E7D32", background:"#2E7D32", cursor:"pointer", flexShrink:0, color:"#fff", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>✓</button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"#555", textDecoration:"line-through" }}>{t.entreprise}</div>
                    <div style={{ fontSize:12, color:"#888" }}>{t.poste}{t.type && ` · ${t.type}`}</div>
                  </div>
                  <button onClick={() => delTest(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", fontSize:18, lineHeight:1 }}>×</button>
                </div>
              ))}
            </div>
          </>}

          {tests.length === 0 && <div style={{ textAlign:"center", padding:"3rem", color:"#999" }}>Aucun test pour le moment</div>}
        </>}

        {/* ═══ CALENDRIER ═══ */}
        {tab === "Calendrier" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#666", textTransform:"uppercase", letterSpacing:"0.05em" }}>Entretiens planifiés</div>
            <button onClick={() => setShowAddEntretien(!showAddEntretien)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:16, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              <i className="ti ti-plus" style={{ fontSize:13 }} />Ajouter
            </button>
          </div>
          {showAddEntretien && (
            <div style={{ background:"#fff", borderRadius:8, border:`1px solid ${LI_BLUE}`, padding:"16px", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Nouvel entretien</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                {[
                  { key:"entreprise", label:"Entreprise", placeholder:"Ex: Crédit Agricole" },
                  { key:"poste",      label:"Poste",      placeholder:"Ex: Assistant Marketing" },
                  { key:"date",       label:"Date",       type:"date" },
                  { key:"heure",      label:"Heure",      type:"time" },
                  { key:"lieu",       label:"Lieu",       placeholder:"Ex: Teams / Paris" },
                  { key:"notes",      label:"Notes",      placeholder:"Préparer..." },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <div style={{ fontSize:11, color:"#666", marginBottom:3 }}>{label}</div>
                    <input type={type||"text"} value={newEntretien[key]} onChange={e => setNewEntretien(p => ({ ...p, [key]:e.target.value }))} placeholder={placeholder}
                      style={{ width:"100%", padding:"6px 10px", border:"1px solid #ddd", borderRadius:6, fontSize:13, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={addEntretien} style={{ padding:"7px 18px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:16, fontSize:13, fontWeight:600, cursor:"pointer" }}>Enregistrer</button>
                <button onClick={() => setShowAddEntretien(false)} style={{ padding:"7px 18px", background:"#f5f5f5", color:"#555", border:"1px solid #ddd", borderRadius:16, fontSize:13, cursor:"pointer" }}>Annuler</button>
              </div>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {entretiens.sort((a,b) => new Date(a.date)-new Date(b.date)).map(e => {
              const isPast = new Date(e.date) < new Date();
              return (
                <div key={e.id} style={{ background:"#fff", borderRadius:8, border:`1px solid ${isPast?"#e0e0e0":"#C8E6C9"}`, padding:"14px 16px", opacity:isPast?0.6:1 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:isPast?"#bbb":"#2E7D32", flexShrink:0 }} />
                        <span style={{ fontWeight:600, fontSize:15, color:"#191919" }}>{e.entreprise}</span>
                        {isPast && <span style={{ fontSize:11, color:"#999", background:"#f5f5f5", padding:"1px 8px", borderRadius:10 }}>Passé</span>}
                      </div>
                      <div style={{ fontSize:13, color:"#555", marginLeft:18, marginBottom:4 }}>{e.poste}</div>
                      <div style={{ fontSize:12, color:"#2E7D32", marginLeft:18, fontWeight:500 }}>
                        📅 {fmtDateLong(e.date)}{e.heure && ` à ${e.heure}`}
                        {e.lieu && <span style={{ color:"#888", fontWeight:400 }}> · {e.lieu}</span>}
                      </div>
                      {e.notes && <div style={{ fontSize:12, color:"#888", marginLeft:18, marginTop:4, fontStyle:"italic" }}>{e.notes}</div>}
                    </div>
                    <button onClick={() => delEntretien(e.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#bbb", fontSize:18, lineHeight:1 }}>×</button>
                  </div>
                </div>
              );
            })}
            {entretiens.length === 0 && <div style={{ textAlign:"center", padding:"2rem", color:"#999" }}>Aucun entretien planifié</div>}
          </div>
        </>}

        {/* ═══ NOTES ═══ */}
        {tab === "Notes" && <>
          <div style={{ fontSize:12, fontWeight:600, color:"#666", marginBottom:14, textTransform:"uppercase", letterSpacing:"0.05em" }}>Mes post-its & to-do</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:16 }}>
            {postits.map(p => (
              <div key={p.id} style={{ background:p.couleur, borderRadius:2, padding:"16px", boxShadow:"3px 3px 8px rgba(0,0,0,0.14)", position:"relative", minHeight:100 }}>
                <button onClick={() => delPostit(p.id)} style={{ position:"absolute", top:6, right:8, background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#999" }}>×</button>
                <p style={{ margin:0, fontSize:13, color:"#333", lineHeight:1.6, paddingRight:16 }}>{p.texte}</p>
              </div>
            ))}
            <div style={{ background:"#fff", borderRadius:8, border:"1.5px dashed #ccc", padding:"14px", display:"flex", flexDirection:"column", gap:8, minHeight:100 }}>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Nouvelle note ou to-do..." style={{ border:"none", outline:"none", resize:"none", fontSize:13, color:"#333", flex:1, background:"transparent", fontFamily:"inherit" }} />
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {["#FFF9C4","#C8E6C9","#BBDEFB","#FFCCBC","#E1BEE7"].map(c => (
                  <div key={c} onClick={() => setNoteCouleur(c)} style={{ width:18, height:18, borderRadius:"50%", background:c, border:noteCouleur===c?"2px solid #333":"2px solid transparent", cursor:"pointer" }} />
                ))}
                <button onClick={addPostit} style={{ marginLeft:"auto", padding:"3px 12px", background:LI_BLUE, color:"#fff", border:"none", borderRadius:10, fontSize:12, cursor:"pointer" }}>+ Ajouter</button>
              </div>
            </div>
          </div>
        </>}

      </div>
    </div>
  );
}
