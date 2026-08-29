/* LoanAppraise authentication — independent of Supabase/frontend loading. */
(function(){'use strict';
const DEMO_USERS={
 'admin@loanappraise.com':{password:'Admin123!',role:'admin',name:'Administrator'},
 'officer@loanappraise.com':{password:'Officer123!',role:'loan_officer',name:'Loan Officer'},
 'appraiser@loanappraise.com':{password:'Appraiser123!',role:'loan_officer',name:'Loan Appraiser'},
 'supervisor@loanappraise.com':{password:'Supervisor123!',role:'supervisor',name:'Supervisor'},
 'approver@loanappraise.com':{password:'Approver123!',role:'supervisor',name:'Final Approver'}
};
function profile(u){return {id:'demo-'+u.email,role:u.role,name:u.name,email:u.email};}
function announce(u){window.__loanOfficerProfile=profile(u);window.dispatchEvent(new CustomEvent('loanOfficerAuthenticated',{detail:{profile:window.__loanOfficerProfile}}));}
function signIn(e){e.preventDefault();const email=(document.getElementById('loginEmail')||{}).value.trim().toLowerCase();const password=(document.getElementById('loginPassword')||{}).value;const err=document.getElementById('loginError');const u=DEMO_USERS[email];if(!u||u.password!==password){if(err)err.textContent='Invalid email or password.';return false;}localStorage.setItem('loanAppSession','true');localStorage.setItem('loanAppUser',JSON.stringify({email:u.email,name:u.name,role:u.role}));if(err)err.textContent='';announce(u);return false;}
function restore(){try{const x=JSON.parse(localStorage.getItem('loanAppUser')||'null');if(localStorage.getItem('loanAppSession')==='true'&&x&&DEMO_USERS[x.email])announce(DEMO_USERS[x.email]);}catch(e){localStorage.removeItem('loanAppSession');localStorage.removeItem('loanAppUser');}}
function init(){const f=document.getElementById('loginForm');if(f&&!f.dataset.bound){f.dataset.bound='1';f.addEventListener('submit',signIn);}restore();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.loanAppLogout=function(){localStorage.removeItem('loanAppSession');localStorage.removeItem('loanAppUser');location.reload();};
})();