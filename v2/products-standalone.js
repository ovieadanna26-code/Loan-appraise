/* Products: single authoritative implementation. No observers, no competing handlers. */
(function(){'use strict';
const KEY='loanappraise_v2_draft';
const num=v=>Number(String(v??'').replace(/,/g,''))||0;
const money=v=>'₦'+num(v).toLocaleString('en-NG',{maximumFractionDigits:0});
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const saveLocal=()=>localStorage.setItem(KEY,JSON.stringify(state));
function productsPage(){
 const existing=Array.isArray(state.products)?state.products:[];
 return `<div class="card"><h3>Products / Trading Lines</h3><p class="muted">Add the main products or services sold by the customer. Gross profit and margin calculate automatically.</p><div id="standaloneProductsRows"></div><button type="button" class="secondary" id="spaAdd">+ Add Product</button><div class="cards" style="margin-top:16px"><div class="card"><small>Total Sales</small><div class="stat" id="spaSales">₦0</div></div><div class="card"><small>Total Cost</small><div class="stat" id="spaCost">₦0</div></div><div class="card"><small>Gross Profit</small><div class="stat" id="spaProfit">₦0</div></div><div class="card"><small>Gross Margin</small><div class="stat" id="spaMargin">0%</div></div></div></div><div class="actions"><button type="button" class="secondary" id="spaBack">Back</button><button type="button" class="primary" id="spaNext">Save & Continue</button></div>`;
}
function installProducts(){
 if(typeof step==='undefined'||step!==4)return;
 const form=document.querySelector('.form');
 if(!form||form.dataset.standaloneProducts==='1')return;
 form.dataset.standaloneProducts='1';form.innerHTML=productsPage();
 const rows=document.getElementById('standaloneProductsRows');
 const totals=()=>{const d=[...rows.querySelectorAll('.spa-row')].map(r=>({name:r.querySelector('.spa-name').value.trim(),sales:num(r.querySelector('.spa-sales').value),cost:num(r.querySelector('.spa-cost').value)})).filter(x=>x.name||x.sales||x.cost);state.products=d;const s=d.reduce((a,x)=>a+x.sales,0),c=d.reduce((a,x)=>a+x.cost,0),g=s-c;document.getElementById('spaSales').textContent=money(s);document.getElementById('spaCost').textContent=money(c);document.getElementById('spaProfit').textContent=money(g);document.getElementById('spaMargin').textContent=(s?((g/s)*100).toFixed(1):'0')+'%';saveLocal();};
 const add=p=>{const r=document.createElement('div');r.className='spa-row card';r.style.marginBottom='12px';r.innerHTML='<div class="grid"><div class="field"><label>Product / Service</label><input class="spa-name" type="text"></div><div class="field"><label>Monthly Sales</label><input class="spa-sales" inputmode="numeric" type="text"></div><div class="field"><label>Monthly Cost</label><input class="spa-cost" inputmode="numeric" type="text"></div><div class="field"><label>Gross Profit</label><input class="spa-profit" readonly type="text"></div><div class="field"><label>Gross Margin</label><input class="spa-margin" readonly type="text"></div></div><button type="button" class="secondary spa-remove">Remove</button>';r.querySelector('.spa-name').value=p?.name||'';r.querySelector('.spa-sales').value=p?.sales?num(p.sales).toLocaleString('en-NG'):'';r.querySelector('.spa-cost').value=p?.cost?num(p.cost).toLocaleString('en-NG'):'';const rowCalc=()=>{const s=num(r.querySelector('.spa-sales').value),c=num(r.querySelector('.spa-cost').value),g=s-c;r.querySelector('.spa-profit').value=money(g);r.querySelector('.spa-margin').value=(s?((g/s)*100).toFixed(1):'0')+'%';totals()};r.querySelectorAll('.spa-sales,.spa-cost').forEach(x=>x.addEventListener('input',()=>{x.value=x.value.replace(/[^0-9,]/g,'');rowCalc()}));r.querySelector('.spa-name').addEventListener('input',totals);r.querySelector('.spa-remove').onclick=()=>{r.remove();totals()};rows.appendChild(r);rowCalc()};
 existing.forEach(add);if(!rows.children.length)add();document.getElementById('spaAdd').onclick=()=>add();totals();
 document.getElementById('spaBack').onclick=()=>{totals();step=3;renderWizard()};
 document.getElementById('spaNext').onclick=async()=>{totals();const b=document.getElementById('spaNext');b.disabled=true;b.textContent='Saving…';try{if(typeof persist==='function'&&session?.user?.id)await persist('draft');step=5;renderWizard()}catch(e){console.error(e);b.disabled=false;b.textContent='Save & Continue';if(typeof toast==='function')toast('Products could not be saved: '+(e.message||e))}};
}
if(typeof renderWizard==='function'){const original=renderWizard;window.renderWizard=function(){original();if(typeof step!=='undefined'&&step===4)requestAnimationFrame(installProducts)};}
})();
