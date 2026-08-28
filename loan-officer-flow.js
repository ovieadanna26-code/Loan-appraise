/* Loan Officer Dashboard + Guided Application Flow
   Built as an additive layer over the existing LoanAppraise MVP.
*/
(function(){
  const sbx=window.sb;
  if(!sbx || typeof window.$!=='function') return;
  const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const money2=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(Number(n)||0);
  const num=id=>Number(document.getElementById(id)?.value)||0;
  const val=id=>document.getElementById(id)?.value?.trim()||'';
  const setVal=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??''};
  let wizard={id:null,step:1,products:[{name:'',cost:0,sell:0,qty:0},{name:'',cost:0,sell:0,qty:0},{name:'',cost:0,sell:0,qty:0}]};

  function addStyles(){
    if(document.getElementById('officerFlowStyles'))return;
    const s=document.createElement('style');s.id='officerFlowStyles';s.textContent=`
      .lo-dashboard-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:14px;margin:18px 0}
      .lo-stat{padding:18px;border-radius:12px;background:var(--card,#fff);border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.04)}
      .lo-stat span{display:block;font-size:12px;color:#64748b;margin-bottom:7px}.lo-stat strong{font-size:25px}
      .wizard-wrap{max-width:1100px}.wizard-steps{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 20px}.wizard-step{padding:9px 12px;border-radius:20px;background:#eef2f7;color:#64748b;font-size:13px}.wizard-step.active{background:#0f766e;color:white}.wizard-step.done{background:#d1fae5;color:#065f46}
      .wizard-panel{display:none}.wizard-panel.active{display:block}.wizard-actions{display:flex;justify-content:space-between;gap:10px;margin-top:22px}.wizard-actions .right{display:flex;gap:10px}
      .calc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:15px 0}.calc-box{padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0}.calc-box small{display:block;color:#64748b}.calc-box b{display:block;font-size:18px;margin-top:5px}
      .positive{color:#047857}.negative{color:#b91c1c}.notice{padding:12px;border-radius:9px;background:#fffbeb;border:1px solid #fde68a;margin:12px 0}.success-note{padding:12px;border-radius:9px;background:#ecfdf5;border:1px solid #a7f3d0;margin:12px 0}
      .product-grid{overflow:auto}.product-grid table{min-width:760px}.product-grid input{width:100%}
      .lo-review{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px}.lo-review-row{display:flex;justify-content:space-between;gap:15px;border-bottom:1px solid #e5e7eb;padding:8px 0}.lo-review-row:last-child{border-bottom:0}
      @media(max-width:700px){.wizard-actions{flex-direction:column}.wizard-actions .right{justify-content:space-between}.lo-review-row{flex-direction:column;gap:3px}}
    `;document.head.appendChild(s);
  }

  function dashboard(){
    if(!window.profile || window.profile.role!=='officer') return;
    const d=document.getElementById('dashboard'); if(!d)return;
    let box=document.getElementById('loDashboardEnhancement');
    if(!box){box=document.createElement('div');box.id='loDashboardEnhancement';d.insertBefore(box,d.querySelector('.card'));}
    const list=window.apps||[];
    const count=s=>list.filter(a=>a.status===s).length;
    box.innerHTML=`<div class="lo-dashboard-grid">
      <div class="lo-stat"><span>Drafts</span><strong>${count('draft')}</strong></div>
      <div class="lo-stat"><span>Awaiting Supervisor</span><strong>${count('pending_supervisor')}</strong></div>
      <div class="lo-stat"><span>Returned for Correction</span><strong>${count('returned')}</strong></div>
      <div class="lo-stat"><span>Approved</span><strong>${count('approved')}</strong></div>
      <div class="lo-stat"><span>Declined</span><strong>${count('declined')}</strong></div>
    </div>`;
    const h=d.querySelector('h1'); if(h)h.textContent=`Welcome, ${window.profile.full_name||'Loan Officer'}`;
  }

  function buildApplicationUI(){
    const sec=document.getElementById('application');if(!sec)return;
    sec.innerHTML=`<h1>New Loan Application</h1>
      <div class="card wizard-wrap">
        <div class="notice"><b>Trading business appraisal.</b> Complete each section. You can save a draft and continue later. Calculations are automatic.</div>
        <div class="wizard-steps" id="loSteps"></div>
        <div id="loWizardPanels">
          <div class="wizard-panel active" data-step="1"><h2>1. Customer & Loan Request</h2><div class="grid">
            <label>Customer<select id="loCustomer" required></select></label>
            <label>Loan Type<select id="loLoanType"><option>SME / Business</option><option>Personal</option></select></label>
            <label>Loan Product<input id="loProduct" required placeholder="e.g. Working Capital"></label>
            <label>Purpose<input id="loPurpose" required placeholder="What will the loan finance?"></label>
            <label>Requested Amount (₦)<input id="loAmount" type="number" min="1" required></label>
            <label>Tenure (months)<input id="loTenure" type="number" min="1" value="12"></label>
            <label>Annual Interest Rate (%)<input id="loRate" type="number" min="0" step="0.01" value="25"></label>
            <label>Existing Monthly Debt (₦)<input id="loDebt" type="number" min="0" value="0"></label>
          </div></div>

          <div class="wizard-panel" data-step="2"><h2>2. Business Profile</h2><div class="grid">
            <label>Years in Business<input id="bpYears" type="number" min="0" step="0.1"></label>
            <label>Years at Current Location<input id="bpLocationYears" type="number" min="0" step="0.1"></label>
            <label>Premises Type<select id="bpPremises"><option>Owned</option><option>Rented</option><option>Family</option><option>Other</option></select></label>
            <label>Average Daily Sales (₦)<input id="bpDailySales" type="number" min="0"></label>
            <label>Business Days / Month<input id="bpDays" type="number" min="1" value="26"></label>
            <label>Number of Employees<input id="bpEmployees" type="number" min="0"></label>
            <label>Supplier Credit Days<input id="bpSupplierDays" type="number" min="0"></label>
            <label>Customer Credit Days<input id="bpCustomerDays" type="number" min="0"></label>
            <label>Main Suppliers<input id="bpSuppliers" placeholder="Names / categories"></label>
            <label>Main Customer Types<input id="bpCustomers" placeholder="Retail, wholesale, etc."></label>
          </div></div>

          <div class="wizard-panel" data-step="3"><h2>3. Financial Appraisal</h2><div class="grid">
            <label>Monthly Sales (₦)<input id="faSales" type="number" min="0"></label>
            <label>Monthly Purchases (₦)<input id="faPurchases" type="number" min="0"></label>
            <label>Opening Inventory (₦)<input id="faOpening" type="number" min="0"></label>
            <label>Current Inventory (₦)<input id="faCurrent" type="number" min="0"></label>
            <label>Rent (₦)<input id="faRent" type="number" min="0" value="0"></label>
            <label>Salaries (₦)<input id="faSalaries" type="number" min="0" value="0"></label>
            <label>Utilities (₦)<input id="faUtilities" type="number" min="0" value="0"></label>
            <label>Transport (₦)<input id="faTransport" type="number" min="0" value="0"></label>
            <label>Other Operating Expenses (₦)<input id="faOther" type="number" min="0" value="0"></label>
            <label>Cash at Hand (₦)<input id="faCash" type="number" min="0" value="0"></label>
            <label>Bank Balance 1 (₦)<input id="faBank1" type="number" min="0" value="0"></label>
            <label>Bank Balance 2 (₦)<input id="faBank2" type="number" min="0" value="0"></label>
            <label>Other Cash (₦)<input id="faOtherCash" type="number" min="0" value="0"></label>
            <label>Accounts Receivable (₦)<input id="faAR" type="number" min="0" value="0"></label>
          </div><div class="calc-grid" id="financialCalc"></div></div>

          <div class="wizard-panel" data-step="4"><h2>4. Product Analysis</h2><p>Enter the three main products the customer sells. Margin and monthly sales contribution are calculated automatically.</p><div class="product-grid"><table><thead><tr><th>#</th><th>Product</th><th>Cost Price</th><th>Selling Price</th><th>Qty Sold / Month</th><th>Unit Margin</th><th>Margin %</th><th>Monthly Sales</th></tr></thead><tbody id="productRows"></tbody></table></div><div class="calc-grid" id="productSummary"></div></div>

          <div class="wizard-panel" data-step="5"><h2>5. Simple Balance Sheet</h2><div class="grid">
            <label>Equipment Value (₦)<input id="faEquipment" type="number" min="0" value="0"></label>
            <label>Vehicle Value (₦)<input id="faVehicle" type="number" min="0" value="0"></label>
            <label>Property Value (₦)<input id="faProperty" type="number" min="0" value="0"></label>
            <label>Other Assets (₦)<input id="faAssets" type="number" min="0" value="0"></label>
            <label>Supplier Liabilities (₦)<input id="faSupplierLiab" type="number" min="0" value="0"></label>
            <label>Bank Loans (₦)<input id="faBankLoans" type="number" min="0" value="0"></label>
            <label>Microfinance Loans (₦)<input id="faMfLoans" type="number" min="0" value="0"></label>
            <label>Other Borrowings (₦)<input id="faBorrowings" type="number" min="0" value="0"></label>
            <label>Other Liabilities (₦)<input id="faOtherLiab" type="number" min="0" value="0"></label>
          </div><div class="calc-grid" id="balanceCalc"></div></div>

          <div class="wizard-panel" data-step="6"><h2>6. Collateral</h2><div class="grid">
            <label>Collateral Type<select id="colType"><option>None</option><option>Property</option><option>Vehicle</option><option>Equipment</option><option>Inventory</option><option>Other</option></select></label>
            <label>Owner Name<input id="colOwner"></label><label>Location<input id="colLocation"></label>
            <label>Market Value (₦)<input id="colValue" type="number" min="0" value="0"></label>
            <label>Forced Sale Value (₦)<input id="colFSV" type="number" min="0" value="0"></label>
            <label>Valuation Date<input id="colDate" type="date"></label><label>Existing Encumbrance<input id="colEncumbrance"></label>
            <label>Description<textarea id="colDescription"></textarea></label>
          </div><div class="calc-grid" id="collateralCalc"></div></div>

          <div class="wizard-panel" data-step="7"><h2>7. Review & Submit</h2><div id="loReview" class="lo-review"></div></div>
        </div>
        <div class="wizard-actions"><button type="button" id="loBack">← Back</button><div class="right"><button type="button" id="loSave">Save Draft</button><button type="button" id="loNext">Next →</button></div></div>
        <p id="loMsg"></p>
      </div>`;
    populateCustomer();buildSteps();buildProducts();wire();
  }

  function populateCustomer(){const e=document.getElementById('loCustomer');if(!e)return;e.innerHTML='<option value="">Select customer</option>'+(window.customers||[]).map(c=>`<option value="${esc(c.id)}">${esc(c.full_name)} — ${esc(c.phone)}</option>`).join('');}
  function buildSteps(){const names=['Customer & Loan','Business Profile','Financials','Products','Balance Sheet','Collateral','Review'];document.getElementById('loSteps').innerHTML=names.map((n,i)=>`<span class="wizard-step ${i===0?'active':''}" data-n="${i+1}">${i+1}. ${n}</span>`).join('');}
  function buildProducts(){document.getElementById('productRows').innerHTML=wizard.products.map((p,i)=>`<tr><td>${i+1}</td><td><input id="pn${i}" value="${esc(p.name)}" placeholder="Product ${i+1}"></td><td><input id="pc${i}" type="number" min="0" value="${p.cost||''}"></td><td><input id="ps${i}" type="number" min="0" value="${p.sell||''}"></td><td><input id="pq${i}" type="number" min="0" value="${p.qty||''}"></td><td id="pm${i}">₦0</td><td id="pp${i}">0%</td><td id="pt${i}">₦0</td></tr>`).join('');['pn','pc','ps','pq'].forEach(pre=>[0,1,2].forEach(i=>document.getElementById(pre+i).addEventListener('input',calcProducts)));calcProducts();}
  function calcProducts(){let totalSales=0,totalGross=0;wizard.products=[0,1,2].map(i=>{const name=val('pn'+i),cost=num('pc'+i),sell=num('ps'+i),qty=num('pq'+i),margin=sell-cost,marginPct=sell?margin/sell*100:0,sales=sell*qty;totalSales+=sales;totalGross+=margin*qty;setText('pm'+i,money2(margin));setText('pp'+i,marginPct.toFixed(1)+'%');setText('pt'+i,money2(sales));return{name,cost,sell,qty}});document.getElementById('productSummary').innerHTML=`<div class="calc-box"><small>Total Product Sales</small><b>${money2(totalSales)}</b></div><div class="calc-box"><small>Estimated Gross Profit</small><b>${money2(totalGross)}</b></div><div class="calc-box"><small>Weighted Margin</small><b>${totalSales?(totalGross/totalSales*100).toFixed(1):0}%</b></div>`;}
  function setText(id,t){const e=document.getElementById(id);if(e)e.textContent=t;}
  function financialCalc(){const sales=num('faSales'),purchases=num('faPurchases'),opening=num('faOpening'),current=num('faCurrent'),cogs=purchases+opening-current,gp=sales-cogs,margin=sales?gp/sales*100:0,avg=(opening+current)/2,rotation=avg?cogs/avg:0,opex=num('faRent')+num('faSalaries')+num('faUtilities')+num('faTransport')+num('faOther'),net=gp-opex-num('loDebt'),cash=num('faCash')+num('faBank1')+num('faBank2')+num('faOtherCash'),totalCA=cash+num('faAR')+current,totalAssets=totalCA+num('faEquipment')+num('faVehicle')+num('faProperty')+num('faAssets'),liab=num('faSupplierLiab')+num('faBankLoans')+num('faMfLoans')+num('faBorrowings')+num('faOtherLiab');document.getElementById('financialCalc').innerHTML=`<div class="calc-box"><small>Cost of Sales</small><b>${money2(cogs)}</b></div><div class="calc-box"><small>Gross Profit</small><b>${money2(gp)}</b></div><div class="calc-box"><small>Gross Margin</small><b>${margin.toFixed(1)}%</b></div><div class="calc-box"><small>Average Inventory</small><b>${money2(avg)}</b></div><div class="calc-box"><small>Stock Rotation</small><b>${rotation.toFixed(2)}×</b></div><div class="calc-box"><small>Operating Expenses</small><b>${money2(opex)}</b></div><div class="calc-box"><small>Estimated Net Business Cash Flow</small><b class="${net<0?'negative':'positive'}">${money2(net)}</b></div><div class="calc-box"><small>Cash & Bank Position</small><b>${money2(cash)}</b></div>`;return{cogs,gp,margin,avg,rotation,opex,net,cash,totalAssets,liab,netWorth:totalAssets-liab};}
  function balanceCalc(){const f=financialCalc();document.getElementById('balanceCalc').innerHTML=`<div class="calc-box"><small>Total Assets</small><b>${money2(f.totalAssets)}</b></div><div class="calc-box"><small>Total Liabilities</small><b>${money2(f.liab)}</b></div><div class="calc-box"><small>Net Worth</small><b class="${f.netWorth<0?'negative':'positive'}">${money2(f.netWorth)}</b></div>`;}
  function collateralCalc(){const v=num('colValue'),supported=v*.30,requested=num('loAmount'),max=Math.min(requested,supported);document.getElementById('collateralCalc').innerHTML=`<div class="calc-box"><small>Collateral Market Value</small><b>${money2(v)}</b></div><div class="calc-box"><small>30% Collateral Support</small><b>${money2(supported)}</b></div><div class="calc-box"><small>Maximum Supported by Collateral</small><b>${money2(max)}</b></div>`;}
  function review(){const c=(window.customers||[]).find(x=>x.id===val('loCustomer'))||{};const f=financialCalc(),v=num('colValue'),supported=v*.30;document.getElementById('loReview').innerHTML=`<h3>Application Summary</h3><div class="lo-review-row"><b>Loan Officer</b><span>${esc(window.profile?.full_name||'')}</span></div><div class="lo-review-row"><b>Customer</b><span>${esc(c.full_name||'')} · ${esc(c.phone||'')}</span></div><div class="lo-review-row"><b>Request</b><span>${esc(val('loProduct'))} — ${money2(num('loAmount'))} for ${num('loTenure')} months</span></div><div class="lo-review-row"><b>Financials</b><span>Sales ${money2(num('faSales'))} · COGS ${money2(f.cogs)} · Gross Margin ${f.margin.toFixed(1)}% · Rotation ${f.rotation.toFixed(2)}×</span></div><div class="lo-review-row"><b>Cash Flow</b><span>${money2(f.net)} estimated net business cash flow</span></div><div class="lo-review-row"><b>Balance Sheet</b><span>Assets ${money2(f.totalAssets)} · Liabilities ${money2(f.liab)} · Net Worth ${money2(f.netWorth)}</span></div><div class="lo-review-row"><b>Collateral</b><span>${esc(val('colType'))} — ${money2(v)} · 30% support ${money2(supported)}</span></div>`;}
  function collect(){financialCalc();calcProducts();balanceCalc();collateralCalc();}
  function wire(){
    const inputs=['faSales','faPurchases','faOpening','faCurrent','faRent','faSalaries','faUtilities','faTransport','faOther','faCash','faBank1','faBank2','faOtherCash','faAR','faEquipment','faVehicle','faProperty','faAssets','faSupplierLiab','faBankLoans','faMfLoans','faBorrowings','faOtherLiab','colValue','loAmount','loDebt'];inputs.forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{financialCalc();balanceCalc();collateralCalc();}));
    document.getElementById('loBack').onclick=()=>{if(wizard.step>1)go(wizard.step-1)};
    document.getElementById('loNext').onclick=async()=>{if(wizard.step<7){if(!validateStep(wizard.step))return;go(wizard.step+1)}else await save(false,true)};
    document.getElementById('loSave').onclick=()=>save(true,false);
  }
  function validateStep(s){if(s===1 && !val('loCustomer'))return msg('Please select a customer.');if(s===1 && num('loAmount')<=0)return msg('Enter a valid requested amount.');if(s===3 && num('faSales')<=0)return msg('Enter monthly sales.');return true;}
  function msg(t){const e=document.getElementById('loMsg');e.textContent=t;e.className='notice';return false;}
  function go(s){wizard.step=s;document.querySelectorAll('.wizard-panel').forEach(p=>p.classList.toggle('active',+p.dataset.step===s));document.querySelectorAll('.wizard-step').forEach(p=>{const n=+p.dataset.n;p.classList.toggle('active',n===s);p.classList.toggle('done',n<s)});document.getElementById('loBack').style.visibility=s===1?'hidden':'visible';document.getElementById('loNext').textContent=s===7?'Submit to Supervisor →':'Next →';if(s===3)financialCalc();if(s===4)calcProducts();if(s===5)balanceCalc();if(s===6)collateralCalc();if(s===7)review();}

  async function save(draftOnly,submit){
    try{
      if(!validateStep(1))return;collect();
      const customerId=val('loCustomer');
      const row={customer_id:customerId,loan_type:val('loLoanType'),product:val('loProduct'),purpose:val('loPurpose'),amount:num('loAmount'),tenure:num('loTenure'),annual_rate:num('loRate'),existing_monthly_debt:num('loDebt'),collateral_description:val('colDescription'),collateral_value:num('colValue'),created_by:window.profile.id,status:submit?'pending_supervisor':'draft',submitted_at:submit?new Date().toISOString():null};
      let q;
      if(wizard.id)q=await sbx.from('loan_applications').update(row).eq('id',wizard.id).select().single();
      else q=await sbx.from('loan_applications').insert({...row,reference:`LA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`}).select().single();
      if(q.error)throw q.error;wizard.id=q.data.id;
      const appId=q.data.id;
      const bp={application_id:appId,years_in_business:num('bpYears'),years_at_current_location:num('bpLocationYears'),premises_type:val('bpPremises'),average_daily_sales:num('bpDailySales'),business_days_per_month:num('bpDays'),number_of_employees:num('bpEmployees'),main_suppliers:val('bpSuppliers'),main_customer_types:val('bpCustomers'),supplier_credit_days:num('bpSupplierDays'),customer_credit_days:num('bpCustomerDays'),created_by:window.profile.id};
      const bq=await sbx.from('business_profiles').upsert(bp,{onConflict:'application_id'});if(bq.error)throw bq.error;
      const f=financialCalc();
      const fa={application_id:appId,monthly_sales:num('faSales'),monthly_purchases:num('faPurchases'),opening_inventory:num('faOpening'),current_inventory:num('faCurrent'),rent:num('faRent'),salaries:num('faSalaries'),utilities:num('faUtilities'),transport:num('faTransport'),other_operating_expenses:num('faOther'),cash_at_hand:num('faCash'),bank_balance_1:num('faBank1'),bank_balance_2:num('faBank2'),other_cash:num('faOtherCash'),accounts_receivable:num('faAR'),equipment_value:num('faEquipment'),vehicle_value:num('faVehicle'),property_value:num('faProperty'),other_assets:num('faAssets'),supplier_liabilities:num('faSupplierLiab'),bank_loans:num('faBankLoans'),microfinance_loans:num('faMfLoans'),other_borrowings:num('faBorrowings'),other_liabilities:num('faOtherLiab'),created_by:window.profile.id};
      const fq=await sbx.from('financial_appraisals').upsert(fa,{onConflict:'application_id'});if(fq.error)throw fq.error;
      const del=await sbx.from('financial_products').delete().eq('application_id',appId);if(del.error)throw del.error;
      const prows=wizard.products.filter(p=>p.name).map((p,i)=>({application_id:appId,product_no:i+1,product_name:p.name,cost_price:p.cost,selling_price:p.sell,quantity_sold_monthly:p.qty}));if(prows.length){const pq=await sbx.from('financial_products').insert(prows);if(pq.error)throw pq.error;}
      const cd=await sbx.from('collaterals').delete().eq('application_id',appId);if(cd.error)throw cd.error;
      if(val('colType')!=='None' && num('colValue')>0){const cq=await sbx.from('collaterals').insert({application_id:appId,collateral_type:val('colType'),description:val('colDescription'),owner_name:val('colOwner'),location:val('colLocation'),market_value:num('colValue'),forced_sale_value:num('colFSV'),valuation_date:val('colDate')||null,existing_encumbrance:val('colEncumbrance')});if(cq.error)throw cq.error;}
      if(typeof window.log==='function')await window.log(appId,submit?'Loan application submitted to Supervisor':'Loan application draft saved',submit?`Requested ${money2(num('loAmount'))}`:'Draft saved');
      msg(submit?'Application submitted to Supervisor successfully.':'Draft saved successfully.');document.getElementById('loMsg').className='success-note';
      if(submit){await window.refresh();setTimeout(()=>window.show('applications',false),300);resetWizard();}
      else{await window.refresh();}
    }catch(e){console.error(e);msg(e.message||'Unable to save application.');}
  }
  function resetWizard(){wizard={id:null,step:1,products:[{name:'',cost:0,sell:0,qty:0},{name:'',cost:0,sell:0,qty:0},{name:'',cost:0,sell:0,qty:0}]};buildApplicationUI();}
  function loadDraft(id){const a=(window.apps||[]).find(x=>x.id===id);if(!a)return;wizard.id=id;setVal('loCustomer',a.customer_id);setVal('loLoanType',a.loan_type);setVal('loProduct',a.product);setVal('loPurpose',a.purpose);setVal('loAmount',a.amount);setVal('loTenure',a.tenure);setVal('loRate',a.annual_rate);setVal('loDebt',a.existing_monthly_debt);setVal('colDescription',a.collateral_description);setVal('colValue',a.collateral_value);go(1);}
  window.startLoanApplication=()=>{resetWizard();window.show('application',false);};
  window.openLoanDraft=id=>{loadDraft(id);window.show('application',false);};

  const oldRefresh=window.refresh;
  if(oldRefresh){window.refresh=async function(){const r=await oldRefresh.apply(this,arguments);dashboard();return r;};}
  const oldSetAuth=window.setAuth;
  if(oldSetAuth){window.setAuth=function(){const r=oldSetAuth.apply(this,arguments);dashboard();return r;};}
  addStyles();
  const appSec=document.getElementById('application');if(appSec){buildApplicationUI();}
  setTimeout(()=>{dashboard();},0);
})();