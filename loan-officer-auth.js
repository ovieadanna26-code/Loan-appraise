/* Standalone authentication for rebuilt Loan Officer frontend. */
(function(){'use strict';
 async function getProfile(sb,user){const {data,error}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();if(error)console.warn('Profile lookup:',error.message);return data||{id:user.id,role:'loan_officer'};}
 async function announce(sb,session){if(!session)return;const profile=await getProfile(sb,session.user);window.__loanOfficerProfile=profile;window.dispatchEvent(new CustomEvent('loanOfficerAuthenticated',{detail:{session:session,profile:profile}}));}
 async function signIn(e){e.preventDefault();const err=document.getElementById('loginError');if(err)err.textContent='';try{const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {data,error}=await sb.auth.signInWithPassword({email:document.getElementById('loginEmail').value.trim(),password:document.getElementById('loginPassword').value});if(error)throw error;await announce(sb,data.session);}catch(x){if(err)err.textContent=x.message||'Unable to sign in.';}}
 async function restore(){try{const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {data:{session}}=await sb.auth.getSession();if(session)await announce(sb,session);}catch(x){console.warn('Session restore:',x.message);}}
 function init(){const f=document.getElementById('loginForm');if(f&&!f.dataset.bound){f.dataset.bound='1';f.addEventListener('submit',signIn);}restore();}
 document.addEventListener('DOMContentLoaded',init);
})();