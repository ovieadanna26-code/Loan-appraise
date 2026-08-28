/* Exposes the existing Supabase/session state to the additive Loan Officer UI. */
(function(){
  if(!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY)return;
  const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  window.sb=sb;
  window.$=id=>document.getElementById(id);
  window.profile=null;window.customers=[];window.apps=[];window.audit=[];
  window.show=function(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const p=document.getElementById(id);if(p)p.classList.add('active');};
  window.log=async function(applicationId,action,comment){if(!window.profile)return;const r=await sb.from('audit_logs').insert({application_id:applicationId||null,action,comment:comment||'',performed_by:window.profile.id});if(r.error)console.warn('Audit log:',r.error.message);};
  window.refresh=async function(){
    if(!window.profile)return;
    const isOfficer=window.profile.role==='officer';
    const cq=isOfficer?sb.from('customers').select('*').eq('created_by',window.profile.id).order('created_at',{ascending:false}):sb.from('customers').select('*').order('created_at',{ascending:false});
    const aq=isOfficer?sb.from('loan_applications').select('*,customers(*)').eq('created_by',window.profile.id).order('created_at',{ascending:false}):sb.from('loan_applications').select('*,customers(*)').order('created_at',{ascending:false});
    const [c,a]=await Promise.all([cq,aq]);
    if(!c.error)window.customers=c.data||[];
    if(!a.error)window.apps=a.data||[];
    const sel=document.getElementById('loCustomer');
    if(sel){const current=sel.value;sel.innerHTML='<option value="">Select customer</option>'+window.customers.map(x=>`<option value="${x.id}">${String(x.full_name||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))} — ${x.phone||''}</option>`).join('');if(current)sel.value=current;}
  };
  async function init(){
    const {data:{user}}=await sb.auth.getUser();
    if(!user){window.profile=null;return;}
    const r=await sb.from('profiles').select('*').eq('id',user.id).single();
    if(r.error||!r.data)return;
    window.profile=r.data;
    const ud=document.getElementById('userDisplay');if(ud)ud.textContent=`${r.data.full_name} · ${r.data.role}`;
    document.querySelectorAll('.officer-only').forEach(x=>x.style.display=r.data.role==='officer'?'block':'none');
    document.querySelectorAll('.supervisor-only').forEach(x=>x.style.display=(r.data.role==='supervisor'||r.data.role==='admin')?'block':'none');
    await window.refresh();
    document.dispatchEvent(new CustomEvent('loanOfficerReady'));
  }
  window.loanOfficerReady=init();
  sb.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED')init();if(event==='SIGNED_OUT'){window.profile=null;window.customers=[];window.apps=[];}});
})();