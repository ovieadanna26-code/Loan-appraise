/* Products step - stable editor with direct wizard navigation. */
(function(){
'use strict';
const money=v=>'₦'+(Number(String(v??'').replace(/,/g,''))||0).toLocaleString('en-NG',{maximumFractionDigits:0});
const num=v=>Number(String(v??'').replace(/,/g,''))||0;
const draft=()=>{try{return JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}')}catch{return {}}};
const save=rows=>{const s=draft();s.products=rows;localStorage.setItem('loanappraise_v2_draft',JSON.stringify(s));window.loanAppraiseProducts=rows};
let mounted=null, rendering=false;
function rowsData(){return [...document.querySelectorAll('#productsRows .product-row')].map(r=>({name:r.querySelector('[data-p="name"]')?.value||'',sales:num(r.querySelector('[data-p="sales"]')?.value),cost:num(r.querySelector('[data-p="cost"]')?.value)})).filter(p=>p.name||p.sales||p.cost)}
function mount(){
 const form=document.querySelector('.form');
 if(!form||!form.innerHTML.includes('Product rows will calculate gross profit')||mounted===form)return;
 rendering=true;mounted=form;const existing=draft().products||[];
 form.innerHTML='<div class="card"><h3>Products / Trading Lines</h3><p class="muted">Add the main products or services sold by the customer. Gross profit and margin calculate automatically.</p><div id="productsRows"></div><button type="button" class="secondary" id="addProduct">+ Add Product</button><div class="cards" style="margin-top:16px"><div class="card"><small>Total Sales</small><div class="stat" id="productSales">₦0</div></div><div class="card"><small>Total Cost</small><div class="stat" id="productCost">₦0</div></div><div class="card"><small>Gross Profit</small><div class="stat" id="productProfit">₦0</div></div><div class="card"><small>Gross Margin</small><div class="stat" id="productMargin">0%</div></div></div></div><div class="actions"><button type="button" class="secondary" id="productsBack">Back</button><button type="button" class="primary" id="productsNext">Save & Continue</button></div>';
 const rows=document.getElementById('productsRows');
 function totals(){const data=rowsData(),sales=data.reduce((a,p)=>a+p.sales,0),cost=data.reduce((a,p)=>a+p.cost,0),profit=sales-cost;document.getElementById('productSales').textContent=money(sales);document.getElementById('productCost').textContent=money(cost);document.getElementById('productProfit').textContent=money(profit);document.getElementById('productMargin').textContent=(sales?((profit/sales)*100).toFixed(1):'0')+'%';save(data)}
 function add(p={}){const r=document.createElement('div');r.className='product-row card';r.style.marginBottom='12px';r.innerHTML='<div class="grid"><div class="field"><label>Product / Service</label><input data-p="name" type="text"></div><div class="field"><label>Monthly Sales</label><input data-p="sales" inputmode="numeric" type="text"></div><div class="field"><label>Monthly Cost</label><input data-p="cost" inputmode="numeric" type="text"></div><div class="field"><label>Gross Profit</label><input data-p="profit" readonly type="text"></div><div class="field"><label>Gross Margin</label><input data-p="margin" readonly type="text"></div></div><button type="button" class="secondary removeProduct">Remove</button>';r.querySelector('[data-p="name"]').value=p.name||'';r.querySelector('[data-p="sales"]').value=p.sales?Number(p.sales).toLocaleString('en-NG'):'';r.querySelector('[data-p="cost"]').value=p.cost?Number(p.cost).toLocaleString('en-NG'):'';const calcRow=()=>{const s=num(r.querySelector('[data-p="sales"]').value),c=num(r.querySelector('[data-p="cost"]').value),g=s-c;r.querySelector('[data-p="profit"]').value=money(g);r.querySelector('[data-p="margin"]').value=(s?((g/s)*100).toFixed(1):'0')+'%';totals()};r.querySelectorAll('[data-p="sales"],[data-p="cost"]').forEach(x=>x.addEventListener('input',()=>{x.value=x.value.replace(/[^0-9,]/g,'');calcRow()}));r.querySelector('[data-p="name"]').addEventListener('input',totals);r.querySelector('.removeProduct').onclick=()=>{r.remove();totals()};rows.appendChild(r);calcRow()}
 existing.forEach(add);if(!rows.children.length)add();document.getElementById('addProduct').onclick=()=>add();totals();
 document.getElementById('productsBack').onclick=()=>{save(rowsData());if(typeof step!=='undefined'&&typeof renderWizard==='function'){step=Math.max(0,step-1);renderWizard()}};
 document.getElementById('productsNext').onclick=()=>{save(rowsData());if(typeof step!=='undefined'&&typeof renderWizard==='function'){step=5;renderWizard()}else{window.location.hash='#balance-sheet'}};
 rendering=false;
}
const obs=new MutationObserver(()=>{if(!rendering)requestAnimationFrame(mount)});obs.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});requestAnimationFrame(mount);
})();
