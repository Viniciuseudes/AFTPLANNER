import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { extractTextFromPDF } from './pdfExtractor';

// CATÁLOGO DE COBERTURAS
const KINDS = [
  'WV20G', 'WV30G', 'WV10G', 'WH10G', 'WL10G', 'WL20G', 'WL30G', 'DDPSH', 
  'TP10G', 'TP20G', 'TP30G', 'DT10G', 'DT15G', 'DT20G', 'DT25G', 'DT30G', 
  'TM05G', 'TM10G', 'TM15G', 'TM20G', 'TM25G', 'TM30G', 'TM65G', 'TM75G', 
  'TF20G', 'TF10G', 'TF30G', 'DR10G', 'DR20G', 'DR30G', 'AR10G', 'AP75G', 
  'AP10G', 'PI05G', 'DIMRG', 'DDP5G', 'PA10G', 'PA05G', 'BRB5G', 'CIA5G', 
  'HC05G', 'CIB5G', 'AFF5G', 'AFC5G', 'AF05G', 'AFP5G', 'WR10g'
];

const COV_META = {
  WV20G:{desc:'Vida e Saúde 20 anos',tag:'V&S 20a',tipo:'básica',kind:'death',group:'vitalicio',min:70000,max:null,limtext:'Mín. R$ 70.000'},
  WV30G:{desc:'Vida e Saúde 30 anos',tag:'V&S 30a',tipo:'básica',kind:'death',group:'vitalicio',min:70000,max:null,limtext:'Mín. R$ 70.000'},
  WV10G:{desc:'Vida e Saúde 10 anos',tag:'V&S 10a',tipo:'básica',kind:'death',group:'vitalicio',min:70000,max:null,limtext:'Mín. R$ 70.000'},
  WH10G:{desc:'Vida e Saúde 360',tag:'V&S 360',tipo:'básica',kind:'death',group:'vitalicio',min:70000,max:null,limtext:'Mín. R$ 70.000'},
  WL10G:{desc:'Vida Inteira 10 anos',tag:'Vida Inteira',tipo:'básica',kind:'death',group:'vitalicio',min:65000,max:null,limtext:'Mín. R$ 65.000 (c/ valor de resgate)'},
  WL20G:{desc:'Vida Inteira 20 anos',tag:'Vida Inteira',tipo:'básica',kind:'death',group:'vitalicio',min:65000,max:null,limtext:'Mín. R$ 65.000 (c/ valor de resgate)'},
  WL30G:{desc:'Vida Inteira 30 anos',tag:'Vida Inteira',tipo:'básica',kind:'death',group:'vitalicio',min:65000,max:null,limtext:'Mín. R$ 65.000 (c/ valor de resgate)'},
  DDPSH:{desc:'Doenças Graves Plus 5H',subtype:'Plus (Único)',tipo:'básica',kind:'unico',group:'ddp',min:null,max:null,limtext:'Min. R$ 55.000 Max. R$ 2.500.000'},
  TP10G:{desc:'Temporário Pref. 10 anos (base)',tag:'Pref. 10a (base)',tipo:'básica',kind:'death',group:'temporario',min:1000000,max:null,limtext:'Base: mín. R$ 1.000.000'},
  TP20G:{desc:'Temporário Pref. 20 anos (base)',tag:'Pref. 20a (base)',tipo:'básica',kind:'death',group:'temporario',min:1000000,max:null,limtext:'Base: mín. R$ 1.000.000'},
  TP30G:{desc:'Temporário Pref. 30 anos (base)',tag:'Pref. 30a (base)',tipo:'básica',kind:'death',group:'temporario',min:1000000,max:null,limtext:'Base: mín. R$ 1.000.000'},
  DT10G:{desc:'Temporário Decrescente 10 anos (base)',tag:'Decresc. 10a (base)',tipo:'básica',kind:'death',group:'temporario',min:null,max:null,limtext:'Base - sem mínimo definido'},
  DT15G:{desc:'Temporário Decrescente 15 anos (base)',tag:'Decresc. 15a (base)',tipo:'básica',kind:'death',group:'temporario',min:null,max:null,limtext:'Base - sem mínimo definido'},
  DT20G:{desc:'Temporário Decrescente 20 anos (base)',tag:'Decresc. 20a (base)',tipo:'básica',kind:'death',group:'temporario',min:null,max:null,limtext:'Base - sem mínimo definido'},
  DT25G:{desc:'Temporário Decrescente 25 anos (base)',tag:'Decresc. 25a (base)',tipo:'básica',kind:'death',group:'temporario',min:null,max:null,limtext:'Base - sem mínimo definido'},
  DT30G:{desc:'Temporário Decrescente 30 anos (base)',tag:'Decresc. 30a (base)',tipo:'básica',kind:'death',group:'temporario',min:null,max:null,limtext:'Base - sem mínimo definido'},
  TM05G:{desc:'Temporário 05 anos',tag:'Temp. 05a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM10G:{desc:'Temporário 10 anos',tag:'Temp. 10a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM15G:{desc:'Temporário 15 anos',tag:'Temp. 15a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM20G:{desc:'Temporário 20 anos',tag:'Temp. 20a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM25G:{desc:'Temporário 25 anos',tag:'Temp. 25a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM30G:{desc:'Temporário 30 anos',tag:'Temp. 30a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM65G:{desc:'Temporário até 65 anos',tag:'Temp. até 65a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TM75G:{desc:'Temporário até 75 anos',tag:'Temp. até 75a (base)',tipo:'básica',kind:'death',group:'temporario',min:60000,max:null,limtext:'Base: mín. R$ 60.000'},
  TF20G:{desc:'Temporário Pref. 20 anos',tag:'Pref. 20a',tipo:'opcional',kind:'death',group:'temporario',min:500000,max:null,limtext:'Adicional: mín. R$ 500.000'},
  TF10G:{desc:'Temporário Pref. 10 anos',tag:'Pref. 10a',tipo:'opcional',kind:'death',group:'temporario',min:500000,max:null,limtext:'Adicional: mín. R$ 500.000'},
  TF30G:{desc:'Temporário Pref. 30 anos',tag:'Pref. 30a',tipo:'opcional',kind:'death',group:'temporario',min:500000,max:null,limtext:'Adicional: mín. R$ 500.000'},
  DR10G:{desc:'Temporário Decrescente 10 anos',tag:'Decresc. 10a',tipo:'opcional',kind:'death',group:'temporario',min:null,max:null,limtext:'Soma no MQC - sem mínimo definido'},
  DR20G:{desc:'Temporário Decrescente 20 anos',tag:'Decresc. 20a',tipo:'opcional',kind:'death',group:'temporario',min:null,max:null,limtext:'Soma no MQC - sem mínimo definido'},
  DR30G:{desc:'Temporário Decrescente 30 anos',tag:'Decresc. 30a',tipo:'opcional',kind:'death',group:'temporario',min:null,max:null,limtext:'Soma no MQC - sem mínimo definido'},
  AR10G:{desc:'Morte Acidental Renovável 10 anos',tipo:'opcional',kind:'acc',min:55000,max:null,limtext:'R$ 55.000 - 5x MQC'},
  AP75G:{desc:'Morte Acidental até 75 anos',tipo:'opcional',kind:'acc',min:55000,max:null,limtext:'R$ 55.000 - 5x MQC'},
  AP10G:{desc:'Morte Acidental até 75a (10 anos)',tipo:'opcional',kind:'acc',min:55000,max:null,limtext:'R$ 55.000 - 5x MQC'},
  PI05G:{desc:'Invalidez Total/Parcial Acidente',tipo:'opcional',kind:'pi',min:null,max:null,limtext:'R$ 55.000 - 5x MQC'},
  DIMRG:{desc:'Doenças Graves Modular 2.0',subtype:'Modular',tipo:'opcional',kind:'ddp',group:'ddp',min:null,max:null,limtext:'R$ 55.000 - 5x MQC'},
  DDP5G:{desc:'Doenças Graves Plus 5 anos',subtype:'Plus',tipo:'opcional',kind:'ddp',group:'ddp',min:null,max:null,limtext:'R$ 55.000 - 5x MQC'},
  PA10G:{desc:'Perda Autonomia Pessoal 10 anos',tipo:'opcional',kind:'pa',min:null,max:null,limtext:'R$ 55.000 - 2x MQC'},
  PA05G:{desc:'Perda Autonomia Pessoal 5 anos',tipo:'opcional',kind:'pa',min:null,max:null,limtext:'R$ 55.000 - 2x MQC'},
  BRB5G:{desc:'Quebra de Ossos 5 anos',tipo:'opcional',kind:'var',min:55000,max:300000,limtext:'R$ 55.000 - R$ 300.000'},
  CIA5G:{desc:'Cirurgia Ampliada 5 anos',tipo:'opcional',kind:'cia',min:55000,max:300000,limtext:'R$ 55.000 - R$ 300.000'},
  HC05G:{desc:'Renda Hospitalar 5 anos (diária)',tipo:'opcional',kind:'diaria',min:200,max:3000,limtext:'Diária R$ 200 - R$ 3.000'},
  CIB5G:{desc:'Cirurgia 5 anos',tipo:'opcional',kind:'unico',min:null,max:null,limtext:'Capital Único R$ 10.000'},
  AFF5G:{desc:'Assist. Funeral Familiar ii 5 anos',tipo:'opcional',kind:'unico',min:null,max:null,limtext:'Capital Único (familiar ii)'},
  AFC5G:{desc:'Assist. Funeral Familiar i 5 anos',tipo:'opcional',kind:'unico',min:null,max:null,limtext:'Capital Único (familiar i)'},
  AF05G:{desc:'Assist. Funeral Individual 5 anos',tipo:'opcional',kind:'unico',min:null,max:null,limtext:'Capital Único (individual)'},
  AFP5G:{desc:'Assist. Funeral Familiar iii 5 anos',tipo:'opcional',kind:'unico',min:null,max:null,limtext:'Capital Único (familiar iii)'},
  WR10g:{desc:'Legado Protegido 10 anos',tag:'Legado Protegido',tipo:'básica',kind:'death',group:'vitalicio',min:400000,max:null,limtext:'Mín. R$ 400.000 (s/ valor de resgate)'}
};

const IOF = 1.0038;
const BRL = n => n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const BRL0 = n => Math.round(n).toLocaleString('pt-BR');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const parseDate = s => { const [d,m,y]=s.split('/'); return new Date(+y,+m-1,+d); };

const ADULT_DEFAULTS = {
  BRB5G:{cap:0, rate:0.3211, prem0:0, mqc:false, contracted:false},
  PI05G:{cap:0, rate:0.05851, prem0:0, mqc:false, contracted:false},
  CIB5G:{cap:10000, rate:null, prem0:17.54, mqc:false, contracted:false},
};

function normalizeProject(data){
  const members = data.members.map(m=>({name:m.name, sexo:m.sexo, nasc:m.nasc, idade:m.idade, data:{...m.data}}));
  members.sort((a,b)=>{
    if(b.idade!==a.idade) return b.idade-a.idade;
    return parseDate(a.nasc)-parseDate(b.nasc);
  });

  members.forEach(m=>{
    if(m.idade>=14){
      Object.keys(ADULT_DEFAULTS).forEach(code=>{
        if(!m.data[code]) m.data[code] = {...ADULT_DEFAULTS[code]};
      });
    }
  });

  let coverages;
  if(Array.isArray(data.coverages) && data.coverages.length){
    coverages = data.coverages.map(c => (typeof c==='string')
      ? {code:c, ...(COV_META[c]||{desc:c,tipo:'opcional',kind:'var',min:null,max:null,limtext:''})}
      : {...(COV_META[c.code]||{}), ...c});
  } else {
    const seen = new Set();
    members.forEach(m => { if(m.data) Object.keys(m.data).forEach(k => seen.add(k)); });
    const known = KINDS.filter(k => seen.has(k));
    const unknown = [...seen].filter(k => !KINDS.includes(k)).sort();
    const codes = [...known, ...unknown];
    coverages = codes.map(k=>({code:k, ...(COV_META[k]||{desc:k,tipo:'opcional',kind:'var',min:null,max:null,limtext:'Cobertura nova - verificar limites'})}));
  }
  return {id:uid(), name:data.family, created:Date.now(), members, coverages};
}

function groupRows(proj){
  const rows = [];
  const done = new Set();
  proj.coverages.forEach(c=>{
    if(done.has(c.code)) return;
    if(c.group){
      const groupCodes = proj.coverages.filter(cc=>cc.group===c.group);
      groupCodes.forEach(cc=>done.add(cc.code));
      const label = c.group==='vitalicio' ? 'Cobertura Vitalícia (MQC)'
        : c.group==='temporario' ? 'Cobertura Temporária (MQC)'
        : 'Doenças Graves';
      const section = c.group==='ddp' ? 'opcional' : 'básica';
      rows.push({rowGroup:c.group, label, section, codes:groupCodes});
    } else {
      done.add(c.code);
      rows.push({rowGroup:null, label:c.desc, section:c.tipo, codes:[c], limtext:c.limtext});
    }
  });
  const basicas = rows.filter(r=>r.section==='básica');
  const opcionais = rows.filter(r=>r.section==='opcional');
  return {basicas, opcionais};
}

function initState(proj){
  return proj.members.map(m=>{
    const s={};
    proj.coverages.forEach(c=>{
      const d=m.data[c.code];
      s[c.code] = d ? {cap:d.cap, active:d.contracted!==false, present:true} : {cap:0, active:false, present:false};
    });
    return s;
  });
}

function memCapital(proj, state, mi){
  let t=0;
  proj.coverages.forEach(c=>{
    const st=state[mi][c.code];
    if(!st || !st.present || !st.active) return;
    const cap = Number(st.cap)||0;
    t += c.kind==='diaria' ? cap*1000 : cap;
  });
  return t;
}

function famCapital(proj, state){
  let t=0;
  proj.members.forEach((m,mi)=>t+=memCapital(proj,state,mi));
  return t;
}

function memMQC(proj, state, mi){
  let t=0;
  proj.coverages.forEach(c=>{
    const st=state[mi][c.code];
    const d=proj.members[mi].data[c.code];
    if(st.present && st.active && d && d.mqc) t += Number(st.cap)||0;
  });
  return t;
}

function isBad(proj, state, mi, c){
  const st=state[mi][c.code];
  if(!st.present || !st.active) return false;
  const cap = Number(st.cap)||0; if(cap<=0) return false;
  const mqc = memMQC(proj, state, mi);
  switch(c.kind){
    case 'var': case 'cia': if(c.min!=null && c.max!=null) return cap<c.min || cap>c.max; if(c.min!=null) return cap<c.min; return false;
    case 'diaria': return cap<200 || cap>3000;
    case 'pi': case 'ddp': case 'acc': return cap<55000 || cap>5*mqc;
    case 'pa': return cap<55000 || cap>2*mqc;
    case 'death': return c.min!=null ? cap<c.min : false;
    default: return false;
  }
}

function premium(proj, state, mi, c){
  const st=state[mi][c.code]; if(!st.present || !st.active) return 0;
  const d=proj.members[mi].data[c.code]; if(!d) return 0;
  if(d.rate == null) return d.prem0*IOF;
  const cap=Number(st.cap)||0; if(cap<=0) return 0;
  return cap/1000*d.rate*IOF;
}

function memTotal(proj, state, mi){ let t=0; proj.coverages.forEach(c=>t+=premium(proj,state,mi,c)); return t; }
function famTotal(proj, state){ let t=0; proj.members.forEach((m,mi)=>t+=memTotal(proj,state,mi)); return t; }
function minReq(age){ return age<14 ? 0 : (age<25 ? 200 : 250); }

function warnText(c, mqc){
  const f=n=>BRL0(n);
  switch(c.kind){
    case 'var': case 'cia': return `R$ ${f(c.min)} - ${f(c.max)}`;
    case 'diaria': return 'R$ 200 - 3.000/dia';
    case 'pi': case 'ddp': case 'acc': return `max MQC (R$ ${f(5*mqc)})`;
    case 'pa': return `max MQC (R$ ${f(2*mqc)})`;
    case 'death': return `mín R$ ${f(c.min)}`;
    default: return 'fora do limite';
  }
}

const WarnIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{flex:'none'}}>
    <path d="M12 8v5M12 16.5v.5M10.3 3.6 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" stroke="#B23A2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FONT_LINK_ID = 'aft-planner-fonts';

export default function AFTPlanner(){
  const [projects, setProjects] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [screen, setScreen] = useState('empty');
  const [panelState, setPanelState] = useState([]);
  const [showSub, setShowSub] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  const [wizJson, setWizJson] = useState('');
  const [wizErr, setWizErr] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    if(document.getElementById(FONT_LINK_ID)) return;
    const l1=document.createElement('link'); l1.rel='preconnect'; l1.href='https://fonts.googleapis.com';
    const l2=document.createElement('link'); l2.rel='preconnect'; l2.href='https://fonts.gstatic.com'; l2.crossOrigin='true';
    const l3=document.createElement('link'); l3.id=FONT_LINK_ID; l3.rel='stylesheet';
    l3.href='https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap';
    document.head.appendChild(l1); document.head.appendChild(l2); document.head.appendChild(l3);
  },[]);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await window.storage?.get('aft_projects', false);
        const list = res ? JSON.parse(res.value) : [];
        setProjects(list);
        if(list.length){ openProject(list[0].id, list); }
      } catch(e){
        setProjects([]);
      } finally {
        setLoaded(true);
      }
    })();
  },[]);

  const persist = useCallback(async (list)=>{
    setProjects(list);
    try{ await window.storage?.set('aft_projects', JSON.stringify(list), false); }catch(e){}
  },[]);

  function openProject(id, list){
    const source = list || projects;
    const proj = source.find(p=>p.id===id);
    if(!proj){ setScreen('empty'); setCurrentId(null); return; }
    setCurrentId(id);
    setPanelState(initState(proj));
    setShowSub(false); setShowTotal(false);
    setScreen('panel');
  }

  function backToList(){
    if(currentId) setScreen('panel');
    else setScreen('empty');
  }

  function showWizard(){ setWizJson(''); setWizErr(''); setScreen('wizard'); }

  async function pasteJson(){
    try{
      const text = await navigator.clipboard.readText();
      if(text){ setWizJson(text.trim()); setWizErr(''); }
      else setWizErr('Área de transferência vazia. Copie o código primeiro.');
    } catch(e){
      setWizErr('Não foi possível colar automaticamente. Toque no campo e cole manualmente.');
    }
  }

  function importProject(){
    const raw = wizJson.trim();
    if(!raw){ setWizErr('Cole o código da família primeiro.'); return; }
    let data;
    try{
      const clean = raw.replace(/```json|```/g,'').trim();
      data = JSON.parse(clean);
    } catch(e){
      setWizErr('Código inválido: não é um JSON válido. Verifique se copiou o código completo.');
      return;
    }
    if(!data.family || !Array.isArray(data.members) || !data.members.length){
      setWizErr('Código incompleto: faltam "family" ou "members".');
      return;
    }
    let proj;
    try{ proj = normalizeProject(data); }
    catch(e){ setWizErr('Erro ao montar o projeto: '+e.message); return; }
    const list = [proj, ...projects];
    persist(list);
    setCurrentId(proj.id);
    setPanelState(initState(proj));
    setShowSub(false); setShowTotal(false);
    setScreen('panel');
  }

  function askDelete(id){ setDeleteTarget(id); }
  function closeModal(){ setDeleteTarget(null); }

  function confirmDelete(){
    const list = projects.filter(p=>p.id!==deleteTarget);
    persist(list);
    if(currentId===deleteTarget){ setCurrentId(null); setScreen('empty'); }
    setDeleteTarget(null);
  }

  const proj = useMemo(()=>projects.find(p=>p.id===currentId)||null, [projects, currentId]);

  function updateCap(mi, code, val){
    setPanelState(prev=>{
      const next = prev.map(row=>({...row}));
      next[mi] = {...next[mi], [code]: {...next[mi][code], cap: val}};
      return next;
    });
  }

  function toggleActive(mi, code){
    setPanelState(prev=>{
      const next = prev.map(row=>({...row}));
      next[mi] = {...next[mi], [code]: {...next[mi][code], active: !next[mi][code].active}};
      return next;
    });
  }

  if(!loaded){
    return <div style={{height:'100dvh',background:'#0E1D38'}} />;
  }

  return (
    <div style={{height:'100dvh',overflow:'hidden'}}>
      <style>{CSS}</style>
      <div className="aft-app">
        <Sidebar
          projects={projects}
          currentId={currentId}
          onOpen={(id)=>openProject(id)}
          onNew={showWizard}
          onHelp={()=>setScreen('help')}
          onDelete={askDelete}
        />
        <main className="aft-main">
          {screen==='empty' && <EmptyScreen />}
          {screen==='help' && <HelpScreen onDone={backToList} />}
          {screen==='wizard' && (
            <WizardScreen
              value={wizJson}
              setValue={setWizJson}
              err={wizErr}
              onPaste={pasteJson}
              onCancel={backToList}
              onCreate={importProject}
            />
          )}
          {screen==='panel' && proj && (
            <PanelScreen
              proj={proj}
              state={panelState}
              showSub={showSub}
              showTotal={showTotal}
              setShowSub={setShowSub}
              setShowTotal={setShowTotal}
              onBack={()=>setScreen('empty')}
              updateCap={updateCap}
              toggleActive={toggleActive}
            />
          )}
        </main>
      </div>
      {deleteTarget && (
        <div className="aft-overlay open">
          <div className="aft-modal">
            <h3>Excluir projeto?</h3>
            <p>Excluir "{projects.find(p=>p.id===deleteTarget)?.name}"? Esta ação pode ser desfeita.</p>
            <div className="aft-mbtns">
              <button className="aft-mbtn sec" onClick={closeModal}>Cancelar</button>
              <button className="aft-mbtn danger" onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({projects, currentId, onOpen, onNew, onHelp, onDelete}){
  return (
    <aside className="aft-aside">
      <div className="aft-sb-logo">
        <div className="aft-logo-mark">AFT</div>
        <div className="aft-tt"><b>AFT Planner</b><span>Prudential</span></div>
      </div>
      <div className="aft-sb-section">Projetos</div>
      <div className="aft-proj-list">
        {projects.length===0 && <div className="aft-empty-hint">Nenhum projeto ainda.</div>}
        {projects.map(p=>(
          <div key={p.id} className={"aft-proj-item"+(p.id===currentId?' active':'')} onClick={()=>onOpen(p.id)}>
            <div className="aft-pnm">{p.name}</div>
            <div className="aft-pmeta">{p.members.length} familiar{p.members.length!==1?'es':''} • {new Date(p.created).toLocaleDateString('pt-BR')}</div>
            <button className="aft-pdel" onClick={(e)=>{e.stopPropagation();onDelete(p.id);}}>×</button>
          </div>
        ))}
      </div>
      <div className="aft-sb-new"><button onClick={onNew}>+ Novo projeto</button></div>
      <div className="aft-sb-cfg"><button onClick={onHelp}>? Como usar</button></div>
    </aside>
  );
}

function EmptyScreen(){
  return (
    <div className="aft-screen aft-center">
      <div className="aft-empty-icon">📂</div>
      <div className="aft-empty-t">Nenhum projeto aberto</div>
      <div className="aft-empty-s">Clique em "Novo projeto" para criar o planejamento de uma família.</div>
    </div>
  );
}

function HelpScreen({onDone}){
  return (
    <div className="aft-screen aft-center">
      <div className="aft-cfg-card">
        <h2>Como usar</h2>
        <p style={{textAlign:'left'}}>O processamento de PDFs utiliza a API gratuita do Google Gemini diretamente no seu navegador.</p>
        <ol className="aft-help-steps">
          <li>Gere uma API Key gratuita no <b>Google AI Studio</b>.</li>
          <li>Em "Novo projeto", cole a sua chave (ela ficará salva no seu navegador).</li>
          <li>Você pode fazer o upload de <b>múltiplos PDFs ao mesmo tempo</b> selecionando vários arquivos.</li>
          <li>O sistema extrai, formata e cria o painel da família inteira automaticamente.</li>
        </ol>
        <button className="aft-cfg-btn" onClick={onDone}>Entendi</button>
        <div className="aft-cfg-note">Os dados ficam salvos somente neste navegador.</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MOTOR DEFINITIVO COM SUPORTE A MÚLTIPLOS ARQUIVOS
// -----------------------------------------------------------------------------
async function generateJSONfromText(rawText, apiKey) {
  const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const modelsResponse = await fetch(listModelsUrl);
  
  if (!modelsResponse.ok) {
    throw new Error('Falha ao autenticar sua API Key. Verifique se ela foi gerada corretamente.');
  }
  
  const modelsData = await modelsResponse.json();
  const validModels = modelsData.models
    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
    .map(m => m.name); 

  if (validModels.length === 0) {
    throw new Error('Sua chave não possui acesso a modelos ativos no momento.');
  }

  const modelsToTry = [
    ...validModels.filter(m => m.includes("flash")),
    ...validModels.filter(m => m.includes("pro")),
    ...validModels
  ];
  
  const uniqueModels = [...new Set(modelsToTry)];

  // Prompt ajustado para entender que o texto contém informações de VÁRIAS PESSOAS
  const prompt = `Você é um analista de dados especialista em extração de apólices de seguro.
Analise o texto bruto abaixo, que pode conter o conteúdo de VÁRIOS PDFs de diferentes membros da mesma família.
Retorne ESTRITAMENTE um objeto JSON unificado. Não escreva texto antes nem depois do JSON.

REGRAS DE EXTRAÇÃO E CÁLCULO (Siga rigorosamente):

1. DADOS DOS CLIENTES (Localizados no final/rodapé de cada bloco de texto):
   - O texto contém a proposta de UMA OU MAIS pessoas. Extraia cada pessoa como um novo objeto dentro do array "members".
   - Procure TODAS as linhas que começam com "Simulação para:" ao longo do texto.
   - "name": O nome completo do cliente antes do hífen.
   - "family": Extraia apenas o último sobrenome do "name" da PRIMEIRA pessoa e use como family da família inteira.
   - "sexo": A letra após o hífen (M ou F).
   - "nasc": A data de nascimento (Nasc.: DD/MM/AAAA).
   - "idade": Calcule a idade do cliente com base na data de nascimento e o ano do documento.

2. COBERTURAS E CÁLCULO DE TAXA (rate) - PARA CADA PESSOA:
   - Para cada cobertura listada, identifique o código entre parênteses (ex: WV20G, TF20G).
   - "cap": Extraia o "Cap. Segurado", remova os pontos de milhar e troque vírgula por ponto (ex: 300.000,00 vira 300000).
   - "prem0": Extraia o "Prêmio (Em Meses)" (ex: 50,08 vira 50.08).
   - "mqc": true se o código for uma destas coberturas base (WV10G,WV20G,WV30G, DR20G, WL10G, WL20G, WL30G, WH20G, WH10G,WH30G, TP10G, TP20G, DDPSH, TP30G, DT10G, DT20G, DT30G, TM10G, TM05G, TM15G, TM20G, TM25G, TM30G, TM65G, TM75G, TF10G, TF20G, TF30G, DR10G, DR20G, DR30G, WR10G). Caso contrário, false.
   - "rate": VOCÊ DEVE CALCULAR A TAXA usando a fórmula: (prem0 / cap) * 1000. 
     -> Exceção: Para a cobertura CIB5G, o rate deve ser null.

MODELO DE SAÍDA EXIGIDO:
{
  "family": "Vasconcelos",
  "members": [
    {
      "name": "Thiago César Tinoco Oliveira de Vasconcelos",
      "sexo": "M",
      "nasc": "04/11/1983",
      "idade": 41,
      "data": {
        "WV20G": { "cap": 130000, "rate": 2.840462, "prem0": 369.26, "mqc": true }
      }
    },
    {
      "name": "Clarissa",
      "sexo": "F",
      "nasc": "07/02/1986",
      "idade": 39,
      "data": {
        "PA10G": { "cap": 140000, "rate": 0.144214, "prem0": 20.19, "mqc": false }
      }
    }
  ]
}

TEXTOS BRUTOS COMBINADOS PARA EXTRAÇÃO:
${rawText}`;

  let lastError;

  for (const modelName of uniqueModels) {
    try {
      console.log(`📡 Tentando extração com o modelo: ${modelName}...`);
      
      const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(generateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
         throw new Error('A IA não devolveu candidatos.');
      }

      let rawAiResponse = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = rawAiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0]; 
      }
      
      return rawAiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      
    } catch (error) {
      console.warn(`⚠️ O modelo ${modelName} falhou (${error.message}). Tentando o próximo...`);
      lastError = error;
      continue; 
    }
  }

  throw new Error(`Todos os modelos disponíveis falharam. Último erro: ${lastError?.message}`);
}

function WizardScreen({value, setValue, err, onPaste, onCancel, onCreate}) {
  const fileInputRef = useRef(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [localErr, setLocalErr] = useState('');
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  // Alterada para lidar com múltiplos arquivos
  async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const invalidFiles = files.filter(f => f.type !== 'application/pdf');
    if (invalidFiles.length) {
      setLocalErr('Por favor, selecione apenas arquivos PDF válidos.');
      return;
    }

    if (!apiKey.trim()) {
      setLocalErr('Você precisa inserir uma API Key do Gemini antes de processar.');
      return;
    }

    setIsExtracting(true);
    setLocalErr('');
    setValue('Lendo conteúdo dos PDFs...');

    try {
      // Loop para extrair e concatenar os PDFs
      let combinedText = '';
      for (let i = 0; i < files.length; i++) {
        const text = await extractTextFromPDF(files[i]);
        combinedText += `\n\n--- INÍCIO DO DOCUMENTO ${i + 1} (${files[i].name}) ---\n${text}\n--- FIM DO DOCUMENTO ${i + 1} ---\n\n`;
      }

      setValue('Processando dados com a Inteligência Artificial (Isso pode levar alguns segundos)...');
      
      const structuredJson = await generateJSONfromText(combinedText, apiKey);
      setValue(structuredJson);
    } catch (error) {
      setLocalErr(error.message);
    } finally {
      setIsExtracting(false);
      event.target.value = '';
    }
  }

  return (
    <div className="aft-screen aft-center" style={{overflowY:'auto'}}>
      <div className="aft-wiz-card">
        <h2>Novo projeto de família</h2>
        <div className="aft-sub">Selecione UM ou VÁRIOS PDFs (Segurando a tecla Ctrl/Shift). A IA juntará todos na mesma família.</div>
        
        <div className="aft-wiz-field">
          <label>Google Gemini API Key (Gratuita)</label>
          <input 
            type="password"
            className="aft-json-box"
            style={{ minHeight: '40px', padding: '10px' }}
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </div>

        <div className="aft-wiz-field" style={{ marginBottom: '24px', marginTop: '16px' }}>
          <input 
            type="file" 
            multiple /* Adicionado suporte a múltiplos arquivos */
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button 
            className="aft-btn-pri" 
            style={{ width: '100%', padding: '14px', background: 'var(--teal)' }}
            onClick={() => fileInputRef.current.click()}
            disabled={isExtracting}
          >
            {isExtracting ? 'Processando dados...' : '📄 Importar PDF(s) da Prudential'}
          </button>
        </div>

        <div className="aft-wiz-field">
          <label>Código Estruturado (Resultado da Extração)</label>
          <textarea
            className="aft-json-box"
            placeholder='O resultado do processamento aparecerá aqui...'
            spellCheck={false}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <button className="aft-key-paste" onClick={onPaste}>Colar da área de transferência</button>
        </div>
        
        <div className="aft-wiz-err">{err || localErr}</div>
        
        <div className="aft-wiz-actions">
          <button className="aft-btn-sec" onClick={onCancel}>Cancelar</button>
          <button className="aft-btn-pri" onClick={onCreate}>Criar projeto</button>
        </div>
      </div>
    </div>
  );
}

function PanelScreen({proj, state, showSub, showTotal, setShowSub, setShowTotal, onBack, updateCap, toggleActive}){
  const [editing, setEditing] = useState({});
  const tmpl = `minmax(150px,200px) repeat(${proj.members.length},1fr)`;
  const ft = famTotal(proj, state);
  const fc = famCapital(proj, state);
  const {basicas, opcionais} = useMemo(()=>groupRows(proj), [proj]);

  function renderCell(c, mi, tag){
    const st = state[mi][c.code];
    if(!st || !st.present){
      return <div className="aft-cell na" key={c.code}><span style={{color:'#9A927F',fontSize:12}}>-</span></div>;
    }
    const bad = isBad(proj, state, mi, c);
    const fixed = c.kind==='unico';
    const mqc = memMQC(proj, state, mi);
    const editKey = mi+'-'+c.code;
    const displayVal = editKey in editing ? editing[editKey] : BRL0(st.cap);
    return (
      <div className={"aft-cell"+(st.active?'':' off')+(bad?' bad':'')} key={c.code}>
        {tag && <div className="aft-cell-tag">{tag}</div>}
        <div className="aft-caprow">
          <div className="aft-capbig">
            <span className="aft-pre">R$</span>
            <input
              className="aft-capinp"
              inputMode="numeric"
              disabled={fixed || !st.active}
              value={displayVal}
              onFocus={()=>setEditing(prev=>({...prev,[editKey]:String(st.cap)}))}
              onChange={e=>{
                const raw = e.target.value.replace(/\D/g,'');
                setEditing(prev=>({...prev,[editKey]:raw}));
                updateCap(mi, c.code, raw?parseInt(raw,10):0);
              }}
              onBlur={()=>setEditing(prev=>{const n={...prev};delete n[editKey];return n;})}
              aria-label={`Capital ${c.desc}`}
            />
            {c.kind==='diaria' && <span className="aft-un">/dia</span>}
          </div>
          <div className={"aft-tgl"+(st.active?' on':'')} onClick={()=>toggleActive(mi,c.code)} role="switch" aria-checked={st.active} tabIndex={0}
            onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggleActive(mi,c.code);}}}
          />
        </div>
        {fixed && <div className="aft-fixed-tag">capital único</div>}
        {bad && <div className="aft-warn"><WarnIcon /> {warnText(c, mqc)}</div>}
      </div>
    );
  }

  function renderRow(row){
    return (
      <div className="aft-crow" style={{'--tmpl':tmpl}} key={row.rowGroup || row.codes[0].code}>
        <div className="aft-rlabel">
          <div className="aft-rn"><span className={"aft-rdot "+row.section}></span><span className="aft-rnm">{row.label}</span></div>
          <div className="aft-rlim">{row.limtext||(row.rowGroup?'Uma cobertura por pessoa':'')}</div>
        </div>
        {proj.members.map((m,mi)=>{
          const owned = row.codes.find(c=>state[mi][c.code] && state[mi][c.code].present);
          if(!owned){
            return <div className="aft-cell na" key={mi}><span style={{color:'#9A927F',fontSize:12}}>-</span></div>;
          }
          const tag = row.rowGroup ? (owned.tag || owned.subtype || owned.code) : null;
          return renderCell(owned, mi, tag);
        })}
      </div>
    );
  }

  return (
    <div className="aft-screen" style={{background:'#0E1D38'}}>
      <div className="aft-panel-topbar">
        <button className="aft-ptb-back" onClick={onBack}>← Projetos</button>
        <div className="aft-ptb-fam">
          <div className="aft-ey">Solução de Proteção Personalizada</div>
          <div className="aft-nm">Família {proj.name}</div>
        </div>
        <div className="aft-toggles">
          <Toggle label="Individual" on={showSub} onClick={()=>setShowSub(v=>!v)} />
          <Toggle label="Total" on={showTotal} onClick={()=>setShowTotal(v=>!v)} />
        </div>
      </div>
      <div className="aft-panel-body">
        <div className="aft-board">
          <div className="aft-head-band">
            <div className="aft-mgrid" style={{'--tmpl':tmpl}}>
              <div className="aft-head-corner"><div className="aft-t">Coberturas</div><div className="aft-s">Capital segurado</div></div>
              {proj.members.map((m,mi)=>(
                <div className="aft-head-person" key={mi}>
                  <div className="aft-pnm2">{m.name}</div>
                  <div className="aft-pmeta2">{m.sexo==='M'?'Masc.':'Fem.'} • {m.idade}a</div>
                  <div className="aft-mqc-k">MQC</div>
                  <div className="aft-mqc-v mono">R$ {BRL0(memMQC(proj,state,mi))}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="aft-rows">
            <div className="aft-section-div" style={{'--tmpl':tmpl}}>
              <div className="aft-section-lbl">Coberturas Básicas</div>
            </div>
            {basicas.map(renderRow)}
            <div className="aft-section-div" style={{'--tmpl':tmpl}}>
              <div className="aft-section-lbl">Coberturas Opcionais</div>
            </div>
            {opcionais.map(renderRow)}
            <div className="aft-crow aft-sub" style={{'--tmpl':tmpl}}>
              <div className="aft-rlabel" style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:12,color:'#0E1D38'}}>Subtotal mensal</div>
              {proj.members.map((m,mi)=>{
                const t = memTotal(proj, state, mi);
                const cap = memCapital(proj, state, mi);
                const req = minReq(m.idade);
                const ok = t>=req;
                return (
                  <div className="aft-cell" key={mi} style={{justifyContent:'center'}}>
                    <div className={"aft-st"+(showSub?'':' hid')}>R$ {BRL(t)}</div>
                    <div className={"aft-mc "+(ok?'ok':'no')+(showSub?'':' hid')}>{req===0?'sem mínimo':(ok?'≥ R$'+req:'< R$'+req)}</div>
                    <div className={"aft-capsum"+(showSub?'':' hid')}>Capital: R$ {BRL0(cap)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={"aft-ftotal"+(showTotal?'':' hid')}>
          <div className="aft-fl">
            <div className="aft-fk">Total da família – mensal com IOF</div>
            <div className="aft-fd">Valores proporcionais às propostas Prudential.</div>
          </div>
          <div>
            <div className={"aft-fv mono"+(showTotal?'':' hid')}>R$ {BRL(ft)}</div>
            <div className="aft-fyr">R$ {BRL(ft*12)} ao ano</div>
          </div>
        </div>
        <div className="aft-fcapital">Capital segurado total da família: <b>R$ {BRL0(fc)}</b></div>
        <div className="aft-legend">
          <div className="aft-it"><span className="aft-ld" style={{background:'#2F7A45'}}></span>Básica</div>
          <div className="aft-it"><span className="aft-ld" style={{background:'#E4B860',border:'1px solid #C6892B'}}></span>Opcional</div>
          <div className="aft-it"><span style={{color:'#F4A261',fontWeight:700}}>Vermelho</span> = fora dos limites</div>
          <div className="aft-it">💡 Toque no capital para editar</div>
        </div>
      </div>
    </div>
  );
}

function Toggle({label, on, onClick}){
  return (
    <div className={"aft-tgbtn"+(on?' on':'')} onClick={onClick} role="switch" aria-checked={on} tabIndex={0}
      onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();onClick();}}}
    >
      <div className="aft-swi"></div><span className="aft-lab">{label}</span>
    </div>
  );
}

const CSS = `
:root{
  --navy:#0E1D38;--navy2:#16294a;
  --ink:#0b1526;--paper:#F2EFE8;--card:#FFFFFF;
  --line:#E7E1D4;--line2:#EDE8DC;
  --amber:#C6892B;--amber-s:#E4B860;
  --teal:#2C6E6A;--red:#B23A2E;--green:#2F7A45;
  --muted:#6C6656;--muted2:#9A927F;
  --sidebar:230px;
  --sh:0 1px 2px rgba(14,29,56,.05),0 8px 28px rgba(14,29,56,.10);
}
.aft-app *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.aft-app{height:100dvh;overflow:hidden;font-family:'Inter',system-ui,sans-serif;background:var(--navy);color:var(--ink);-webkit-font-smoothing:antialiased;display:flex}
.aft-app .mono{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}
.aft-app button{font-family:inherit;cursor:pointer;border:none;outline:none}
.aft-app input,.aft-app textarea{font-family:inherit;outline:none}
.aft-aside{width:var(--sidebar);flex:none;background:linear-gradient(180deg,var(--navy),var(--navy2));color:#fff;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.07);overflow:hidden}
.aft-sb-logo{padding:14px 16px 12px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px}
.aft-logo-mark{height:30px;width:52px;border-radius:8px;background:var(--amber);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:700;font-size:13px;color:var(--navy);flex:none}
.aft-tt{line-height:1.15}
.aft-tt b{font-size:13px;font-weight:600;display:block}
.aft-tt span{font-size:9.5px;color:#B9C4DA;letter-spacing:.1em;text-transform:uppercase}
.aft-sb-section{padding:10px 12px 6px;font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:#7B8EAB;font-weight:700}
.aft-proj-list{flex:1;overflow-y:auto;padding:4px 8px}
.aft-empty-hint{padding:12px 10px;font-size:12px;color:#4A6080}
.aft-proj-item{padding:9px 10px;border-radius:9px;cursor:pointer;transition:.15s;margin-bottom:3px;position:relative}
.aft-proj-item:hover{background:rgba(255,255,255,.07)}
.aft-proj-item.active{background:rgba(255,255,255,.12)}
.aft-pnm{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-pmeta{font-size:10.5px;color:#9DADC8;margin-top:2px}
.aft-pdel{position:absolute;right:8px;top:50%;transform:translateY(-50%);opacity:0;background:rgba(255,80,60,.7);border:none;color:#fff;border-radius:5px;padding:2px 6px;font-size:10px;cursor:pointer;transition:.15s}
.aft-proj-item:hover .aft-pdel{opacity:1}
.aft-sb-new{margin:8px;flex:none}
.aft-sb-new button{width:100%;padding:10px;border-radius:10px;background:var(--amber);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;transition:.15s}
.aft-sb-new button:hover{background:var(--amber-s)}
.aft-sb-cfg{padding:10px 12px;border-top:1px solid rgba(255,255,255,.07);flex:none}
.aft-sb-cfg button{width:100%;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.07);color:#9DADC8;font-size:12px;display:flex;align-items:center;gap:8px;transition:.15s;text-align:left}
.aft-sb-cfg button:hover{background:rgba(255,255,255,.12);color:#fff}
.aft-main{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--navy)}
.aft-screen{display:flex;flex:1;min-height:0;flex-direction:column}
.aft-center{align-items:center;justify-content:center}
.aft-empty-icon{font-size:52px;margin-bottom:16px;opacity:.4;color:#4A6080}
.aft-empty-t{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#6B84A3;margin-bottom:8px}
.aft-empty-s{font-size:13px;color:#4A6080;max-width:280px;text-align:center;line-height:1.6}
.aft-cfg-card{background:var(--card);border-radius:20px;padding:36px;max-width:520px;width:100%;box-shadow:var(--sh)}
.aft-cfg-card h2{font-family:'Fraunces',serif;font-size:22px;color:var(--navy);margin-bottom:6px}
.aft-cfg-card p{font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6}
.aft-help-steps{text-align:left;font-size:13.5px;color:var(--ink);line-height:1.7;margin:0 0 20px;padding-left:20px}
.aft-help-steps li{margin-bottom:8px}
.aft-cfg-btn{width:100%;padding:12px;border-radius:10px;background:var(--navy);color:#fff;font-size:14px;font-weight:700;transition:.15s}
.aft-cfg-btn:hover{background:var(--navy2)}
.aft-cfg-note{margin-top:14px;font-size:11.5px;color:var(--muted2);line-height:1.5;text-align:center}
.aft-wiz-card{background:var(--card);border-radius:20px;padding:34px;max-width:560px;width:100%;margin:20px;box-shadow:var(--sh)}
.aft-wiz-card h2{font-family:'Fraunces',serif;font-size:22px;color:var(--navy);margin-bottom:4px}
.aft-sub{font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.5}
.aft-wiz-field{margin-bottom:18px}
.aft-wiz-field label{font-size:11.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px}
.aft-json-box{width:100%;min-height:150px;border:1.5px solid var(--line);border-radius:10px;padding:12px 13px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--navy);line-height:1.5;resize:vertical;transition:.15s}
.aft-json-box:focus{border-color:var(--amber)}
.aft-key-paste{margin-top:8px;width:100%;padding:11px;border-radius:10px;background:var(--navy);color:#fff;font-size:13px;font-weight:700;transition:.15s}
.aft-key-paste:hover{background:var(--navy2)}
.aft-wiz-err{margin-top:12px;font-size:12.5px;color:var(--red);font-weight:600;line-height:1.4;min-height:16px}
.aft-wiz-actions{display:flex;gap:10px;margin-top:10px}
.aft-btn-sec{flex:1;padding:11px;border-radius:10px;background:var(--paper);border:1.5px solid var(--line);color:var(--muted);font-size:14px;font-weight:600;transition:.15s}
.aft-btn-sec:hover{border-color:var(--amber);color:var(--amber)}
.aft-btn-pri{flex:2;padding:11px;border-radius:10px;background:var(--navy);color:#fff;font-size:14px;font-weight:700;transition:.15s;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}
.aft-btn-pri:hover{background:var(--navy2)}
.aft-btn-pri:disabled{background:#A0AABF;cursor:not-allowed}
.aft-panel-topbar{flex:none;background:linear-gradient(180deg,var(--navy),var(--navy2));color:#fff;border-bottom:2px solid var(--amber);padding:7px 14px;display:flex;align-items:center;gap:12px}
.aft-ptb-back{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;padding:6px 11px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s;flex:none}
.aft-ptb-back:hover{background:rgba(255,255,255,.14)}
.aft-ptb-fam{flex:1;text-align:center;min-width:0}
.aft-ey{font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--amber-s);font-weight:700}
.aft-nm{font-family:'Fraunces',serif;font-weight:600;font-size:16px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-toggles{display:flex;gap:6px;flex-wrap:nowrap;justify-content:flex-end;flex:none}
.aft-tgbtn{display:inline-flex;align-items:center;gap:7px;cursor:pointer;user-select:none;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);padding:6px 11px;border-radius:999px;transition:.2s;white-space:nowrap}
.aft-tgbtn:active{transform:scale(.97)}
.aft-tgbtn .aft-lab{font-size:11px;font-weight:600}
.aft-swi{width:30px;height:18px;border-radius:999px;background:rgba(255,255,255,.22);position:relative;transition:.22s;flex:none}
.aft-swi::after{content:"absolute";top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.22s}
.aft-tgbtn.on .aft-swi{background:var(--amber)}
.aft-tgbtn.on .aft-swi::after{left:14px}
.aft-panel-body{flex:1;min-height:0;padding:8px 10px 8px;display:flex;flex-direction:column;gap:6px;overflow:hidden}
.aft-board{flex:1;min-height:0;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--sh);overflow:hidden;display:flex;flex-direction:column}
.aft-mgrid{display:grid;grid-template-columns:var(--tmpl)}
.aft-head-band{flex:none;background:linear-gradient(180deg,var(--navy),var(--navy2));color:#fff}
.aft-head-corner{padding:7px 12px;display:flex;flex-direction:column;justify-content:flex-end;border-right:1px solid rgba(255,255,255,.08)}
.aft-head-corner .aft-t{font-family:'Fraunces',serif;font-weight:600;font-size:12px}
.aft-head-corner .aft-s{font-size:8.5px;color:#AEB9D2;letter-spacing:.07em;text-transform:uppercase;margin-top:1px}
.aft-head-person{padding:7px 11px;border-left:1px solid rgba(255,255,255,.08);position:relative;min-width:0}
.aft-head-person::after{content:"";position:absolute;left:11px;right:11px;bottom:0;height:2px;background:linear-gradient(90deg,var(--amber),transparent)}
.aft-pnm2{font-family:'Fraunces',serif;font-weight:600;font-size:15px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-pmeta2{font-size:9px;color:#C3CDE0;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-mqc-k{font-size:7.5px;letter-spacing:.08em;text-transform:uppercase;color:#9DA9C4;margin-top:4px}
.aft-mqc-v{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:12px}
.aft-rows{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.aft-crow{display:grid;grid-template-columns:var(--tmpl);border-top:1px solid var(--line2);flex:1;min-height:0}
.aft-crow:last-child{border-top:2px solid var(--navy)}
.aft-rlabel{padding:2px 11px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid var(--line);background:var(--card);position:relative;min-width:0}
.aft-crow:nth-child(even) .aft-rlabel,.aft-crow:nth-child(even) .aft-cell{background:#FAFAF6}
.aft-rn{display:flex;align-items:center;gap:6px;min-width:0}
.aft-rdot{width:6px;height:6px;border-radius:50%;flex:none}
.aft-rdot.básica{background:var(--green)}
.aft-rdot.opcional{background:var(--amber-s);border:1px solid var(--amber)}
.aft-rnm{font-size:10.5px;font-weight:600;color:var(--ink);line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-rlim{font-size:8.5px;color:var(--muted2);margin-top:0;margin-left:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-cell{padding:2px 9px;border-left:1px solid var(--line2);display:flex;flex-direction:column;justify-content:center;gap:1px;min-width:0}
.aft-cell.na{background:repeating-linear-gradient(135deg,#F8F6F0,#F8F6F0 5px,#F2EFE6 5px,#F2EFE6 10px)!important}
.aft-cell.off .aft-capbig{opacity:.4}
.aft-caprow{display:flex;align-items:center;gap:6px;min-width:0}
.aft-capbig{flex:1;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px;color:var(--navy);letter-spacing:-.2px;line-height:1;min-width:0;display:flex;align-items:baseline}
.aft-cell.bad .aft-capbig{color:var(--red)}
.aft-pre{font-size:9px;color:var(--muted);font-weight:500;margin-right:2px;flex:none}
.aft-capinp{background:transparent;border:none;outline:none;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px;color:inherit;width:100%;min-width:0;padding:0;border-bottom:1.5px solid transparent;transition:border-color .15s}
.aft-capinp:focus{border-bottom-color:var(--amber)}
.aft-cell.bad .aft-capinp{color:var(--red)}
.aft-capinp:disabled{color:var(--muted);cursor:not-allowed}
.aft-un{font-size:9px;color:var(--muted);flex:none}
.aft-tgl{width:28px;height:17px;border-radius:999px;background:#CFC8B8;position:relative;cursor:pointer;flex:none;transition:.18s}
.aft-tgl::after{content:"";position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:#fff;transition:.18s;box-shadow:0 1px 3px rgba(0,0,0,.22)}
.aft-tgl.on{background:var(--teal)}
.aft-tgl.on::after{left:13px}
.aft-warn{font-size:8px;color:var(--red);display:flex;align-items:center;gap:2px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-fixed-tag{font-size:8.5px;color:var(--muted);font-style:italic}
.aft-sub .aft-rlabel{background:linear-gradient(90deg,#EFEDE5,#F5F2EB)}
.aft-sub .aft-cell{background:linear-gradient(90deg,#F4F1E6,#FAF8F2)!important}
.aft-st{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px;color:var(--navy);text-align:center}
.aft-st.hid{filter:blur(7px);opacity:.5}
.aft-mc{font-size:8.5px;text-align:center}
.aft-mc.ok{color:var(--green)}
.aft-mc.no{color:var(--red)}
.aft-mc.hid{filter:blur(5px);opacity:.5}
.aft-ftotal{flex:none;background:linear-gradient(100deg,var(--navy),var(--navy2));color:#fff;border-radius:12px;padding:9px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:var(--sh)}
.aft-fl .aft-fk{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--amber-s);font-weight:700}
.aft-fl .aft-fd{font-size:10px;color:#C3CDE0;margin-top:1px}
.aft-fv{font-family:'Fraunces',serif;font-weight:600;font-size:26px;line-height:1}
.aft-fv.hid{filter:blur(10px);opacity:.55}
.aft-fyr{font-size:10px;color:#B9C4DA;margin-top:1px;text-align:right}
.aft-legend{flex:none;display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:9px;color:#B9C4DA;padding:0 2px}
.aft-section-div{display:grid;grid-template-columns:var(--tmpl);background:linear-gradient(90deg,#0E1D38,#16294a);border-top:2px solid var(--amber);border-bottom:1px solid rgba(255,255,255,.08)}
.aft-section-lbl{grid-column:1/-1;padding:3px 12px;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-s);font-weight:700}
.aft-cell-tag{font-size:7.5px;color:var(--muted2);text-transform:uppercase;letter-spacing:.04em;line-height:1;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aft-capsum{font-size:7.5px;color:var(--muted2);text-align:center;margin-top:1px}
.aft-capsum.hid{filter:blur(4px);opacity:.5}
.aft-fcapital{flex:none;font-size:10px;color:#C3CDE0;text-align:right;padding:0 4px}
.aft-fcapital b{color:#fff;font-family:'IBM Plex Mono',monospace}
.aft-it{display:flex;align-items:center;gap:4px}
.aft-ld{width:7px;height:7px;border-radius:50%}
.aft-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;display:none;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.aft-overlay.open{display:flex}
.aft-modal{background:var(--card);border-radius:20px;padding:32px;max-width:480px;width:100%;margin:20px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.aft-modal h3{font-family:'Fraunces',serif;font-size:20px;color:var(--navy);margin-bottom:8px}
.aft-modal p{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:20px}
.aft-mbtns{display:flex;gap:10px;justify-content:flex-end}
.aft-mbtn{padding:9px 18px;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;border:none;transition:.15s}
.aft-mbtn.sec{background:var(--paper);border:1.5px solid var(--line);color:var(--muted)}
.aft-mbtn.sec:hover{border-color:var(--amber);color:var(--amber)}
.aft-mbtn.danger{background:var(--red);color:#fff}
.aft-mbtn.danger:hover{opacity:.9}
@media (min-width:768px) and (max-width:1200px){
  .aft-aside{width:200px}
  .aft-panel-topbar{padding:6px 12px;gap:8px}
  .aft-nm{font-size:14.5px}
  .aft-tgbtn{padding:5px 9px}
  .aft-tgbtn .aft-lab{font-size:10px}
  .aft-swi{width:26px;height:15px}
  .aft-swi::after{width:11px;height:11px}
  .aft-tgbtn.on .aft-swi::after{left:11px}
  .aft-panel-body{padding:6px 8px;gap:5px}
  .aft-head-corner{padding:6px 10px}
  .aft-head-corner .aft-t{font-size:11px}
  .aft-head-person{padding:6px 9px}
  .aft-pnm2{font-size:13.5px}
  .aft-pmeta2{font-size:8px}
  .aft-mqc-k{font-size:7px;margin-top:3px}
  .aft-mqc-v{font-size:11px}
  .aft-rlabel{padding:1px 9px}
  .aft-rnm{font-size:9.5px}
  .aft-rlim{font-size:7.5px;margin-left:11px}
  .aft-cell{padding:1px 7px}
  .aft-capbig{font-size:12.5px}
  .aft-pre{font-size:8px}
  .aft-capinp{font-size:12.5px}
  .aft-tgl{width:24px;height:15px}
  .aft-tgl::after{width:11px;height:11px}
  .aft-tgl.on::after{left:9px}
  .aft-warn{font-size:7px}
  .aft-st{font-size:12px}
  .aft-ftotal{padding:7px 14px}
  .aft-fv{font-size:22px}
  .aft-fl .aft-fk{font-size:8px}
  .aft-fl .aft-fd{font-size:9px}
  .aft-fyr{font-size:8.5px}
  .aft-legend{font-size:8px;gap:9px}
}
@media (max-width: 767px) {
  .aft-app { flex-direction: column; }
  .aft-aside { width: 100%; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; padding: 10px 12px; gap: 10px; border-right: none; border-bottom: 1px solid rgba(255,255,255,.08); }
  .aft-sb-logo { border-bottom: none; padding: 0; flex: 1; }
  .aft-sb-section { display: none; }
  .aft-sb-new, .aft-sb-cfg { padding: 0; margin: 0; border: none; flex: none; }
  .aft-sb-new button, .aft-sb-cfg button { padding: 8px 12px; font-size: 11px; }
  .aft-proj-list { flex: 1 1 100%; display: flex; flex-direction: row; overflow-x: auto; padding: 4px 0; gap: 8px; -webkit-overflow-scrolling: touch; }
  .aft-proj-item { margin: 0; flex: 0 0 auto; min-width: 140px; }
  .aft-panel-body { padding: 10px 5px; }
  .aft-board { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }
  .aft-mgrid, .aft-crow, .aft-section-div { min-width: max-content; }
  .aft-head-corner, .aft-rlabel, .aft-section-lbl { position: sticky; left: 0; z-index: 10; }
  .aft-head-corner { background: var(--navy); }
  .aft-rlabel { background: var(--card); box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
  .aft-crow:nth-child(even) .aft-rlabel { background: #FAFAF6; }
  .aft-section-lbl { background: #0E1D38; }
  .aft-panel-topbar { flex-wrap: wrap; }
  .aft-toggles { width: 100%; justify-content: flex-start; margin-top: 8px; }
  .aft-wiz-card, .aft-cfg-card, .aft-modal { margin: 15px; padding: 24px; }
}
@media (prefers-reduced-motion:reduce){
  .aft-app *{transition:none!important;animation:none!important}
}
`;