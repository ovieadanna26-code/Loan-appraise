// Direct returned-application correction routing. Uses the app's real globals and handlers.
(()=>{
 const KEY='loanappraise_returned_session';
 const getApps=()=>window.apps||[];
 const byId=id=>getApps().find(a=>String(a.id)===String(id));
 const setVal=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined&&v!==null)e.value=v};
 function start(id){
  const a=byId(id); if(!a){alert('The returned application could not be loaded. Please refresh the page and try again.');return false;}
  const c=a.customers||getApps().find(x=>String(x.customer_id)===String(a.customer_id))?.customers;
  if(!c){alert('The customer record for this returned application could not be loaded.');return false;}
  localStorage.setItem(KEY,JSON.stringify({applicationId:a.id,customerId:c.id,reference:a.reference||'',reason:a.supervisor_comment||''}));
  setVal('appCustomer',c.id);setVal('identityCustomer',c.id);setVal('appraisalApplication',a.id);
  setVal('appType',a.loan_type||'Personal');setVal('appProduct',a.product||'');setVal('appPurpose',a.purpose||'');setVal('appAmount',a.amount??'');setVal('appTenure',a.tenure??12);setVal('appRate',a.annual_rate??25);setVal('appDebt',a.existing_monthly_debt??0);setVal('appCollateralDesc',a.collateral_description||'');setVal('appCollateral',a.collateral_value??0);setVal('appGuarantor',a.guarantor_name||'');setVal('appGuarantorPhone',a.guarantor_phone||'');setVal('overrideRecommended',a.recommended_amount??'');setVal('appraisalNotes',a.appraisal_notes||'');
  const k={kycName:c.full_name,kycDob:c.date_of_birth,kycGender:c.gender||'Male',kycMarital:c.marital_status||'Single',kycPhone:c.phone,kycEmail:c.email,kycNin:c.nin,kycBvn:c.bvn,kycAddress:c.residential_address,kycEmployment:c.employment_type||'Salaried',kycEmployer:c.employer_or_business,kycJob:c.job_or_business_type,kycIncome:c.monthly_income,kycExpenses:c.monthly_expenses};Object.entries(k).forEach(([x,v])=>setVal(x,v));const n=c.next_of_kin||{};setVal('nokName',n.name||'');setVal('nokRelationship',n.relationship||'');setVal('nokPhone',n.phone||'');setVal('nokAddress',n.address||'');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById('customers')?.classList.add('active');return true;
 }
 window.startCorrection=start;
 document.addEventListener('click',e=>{const b=e.target.closest('button[onclick*="startCorrection"]');if(b){e.preventDefault();e.stopImmediatePropagation();const m=b.getAttribute('onclick').match(/startCorrection\(['"]([^'"]+)['"]\)/);if(m)start(m[1])}},true);
})();