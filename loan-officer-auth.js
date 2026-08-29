/* LoanAppraise MVP authentication: works without Supabase until backend setup is completed. */
(function(){'use strict';
const DEMO_USERS={
 'admin@loanappraise.com':{password:'Admin123!',role:'admin',name:'Administrator'},
 'officer@loanappraise.com':{password:'Officer123!',role:'loan_officer',name:'Loan Officer'},
 'appraiser@loanappraise.com':{password:'Appraiser123!',role:'loan_officer',name:'Loan Appraiser'},
 'supervisor@loanappraise.com':{password:'Supervisor123!',role:'supervisor',name:'Supervisor'},
 'approver@loanappraise.com':{password:'Approver123!',role:'supervisor',name:'Final Approver'}
};
function announce(user){window.__loanOfficerProfile={id:'demo-'+user.email,role:user.role,name:user.name,email:user.email};window.dispatchEvent(new CustomEvent('loanOfficerAuthenticated',{detail:{profile:window.__loanOfficerProfile}}));}
function signIn(e){e.preventDefault();const email=document.getElementById('loginEmail').value.trim().toLowerCase(),password=document.getElementById('loginPassword').value,err=document.getElementById('loginError'),u=DEMO_USERS[email];if(!u||u.password!==password){if(err)err.textContent='Invalid email or password.';return}localStorage.setItem('loanAppSession','true');localStorage.setItem('loanAppUser',JSON.stringify({email,name:u.name,role:u.role}));if(err)err.textContent='';announce({email,name:u.name,role:u.role});}
function restore(){try{const x=JSON.parse(localStorage.getItem('loanAppUser')||'null');if(localStorage.getItem('loanAppSession')==='true'&&x)announce(x)}catch(e){localStorage.removeItem('loanAppSession');localStorage.removeItem('loanAppUser')}}
function init(){const f=document.getElementById('loginForm');if(f&&!f.dataset.bound){f.dataset.bound='1';f.addEventListener('submit',signIn)}restore()}
document.addEventListener('DOMContentLoaded',init);
window.loanAppLogout=function(){localStorage.removeItem('loanAppSession');localStorage.removeItem('loanAppUser');location.reload()};
})();