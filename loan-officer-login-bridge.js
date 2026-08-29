/* Stable post-login handoff. The clean Loan Officer UI is the only UI allowed to mount for officer roles. */
(function(){'use strict';
 let handedOff=false;
 async function handoff(){
  if(handedOff||!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_ANON_KEY)return;
  const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.user)return;
  const {data:profile}=await sb.from('profiles').select('*').eq('id',session.user.id).single();
  const role=String(profile?.role||'').toLowerCase().replace(/[ -]/g,'_');
  if(!['officer','loan_officer'].includes(role))return;
  handedOff=true;
  const legacy=document.getElementById('appShell'); if(legacy)legacy.style.display='none';
  const login=document.getElementById('loginScreen'); if(login)login.style.display='none';
  window.dispatchEvent(new CustomEvent('loanOfficerAuthenticated',{detail:{profile}}));
 }
 if(window.supabase){window.supabase.auth.onAuthStateChange(function(event){if(event==='SIGNED_IN'||event==='INITIAL_SESSION')setTimeout(handoff,0);});}
 document.addEventListener('DOMContentLoaded',()=>setTimeout(handoff,0));
 setTimeout(handoff,300);setTimeout(handoff,1000);setTimeout(handoff,2500);
})();
