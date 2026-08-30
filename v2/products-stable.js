/* Stable Products step. No MutationObserver. One mount per Products render. */
(function(){'use strict';
const N=v=>Number(String(v??'').replace(/,/g,''))||0;
const M=v=>'₦'+N(v).toLocaleString('en-NG',{maximumFractionDigits:0});
let activeForm=null;
function getState(){try{return JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}')}catch{return {}}}
function put(rows){const s=getState();s.products=rows;localStorage.setItem('loanappraise_v2_draft',JSON.stringify(s));if(window.state)window.state.products=rows}
function rows(){return [...document.querySelectorAll('#productsStableRows .product-row')].map(r=>({name:r.querySelector('.p-name').value.trim(),sales:N(r.querySelector('.p-sales').value),cost:N(r.querySelector('.p-cost').value)})).filter(x=>x.name||x.sales||x.cost)}
function mount(){
 const form=document.querySelector('.form');
 if(!form||activeForm===form||typeof window.step==='undefined'||window.step!==4)return;
 activeForm=form;
 let existing=getState().products||window.state?.products||[];
 form.innerHTML=`<div class="card"><h3>Products / Trading Lines</h3><p class="muted">Add the main products or services sold by the customer. Gross profit and margin calculate automatically.</p><div id="productsStableRows"></div><button type="button" class="secondary" id="productsAdd">+ Add Product</button><div class="cards" style="margin-top:16px"><div class="card"><small>Total Sales</small><div class="stat" id="psSales">₦0</div></div><div class="card"><small>Total Cost</small><div class="stat" id="psCost">₦0</div></div><div class="card"><small>Gross Profit</small><div class="stat" id="psProfit">₦0</div></div><div class="card"><small>Gross Margin</small><div class="stat" id="psMargin">0%</div></div></div></div><div class="actions"><button type="button" class="secondary" id="productsBack">Back</button><button type="button" class="primary" id="productsContinue">Save & Continue</button></div>`;
 const box=document.getElementById('productsStableRows');
 function recalc(){const d=rows(),s=d.reduce((a,x)=>a+x.sales,0),c=d.reduce((a,x)=>a+x.cost,0),g=s-c;document.getElementById('psSales').textContent=M(s);document.getElementById('psCost').textContent=M(c);document.getElementById('psProfit').textContent=M(g);document.getElementById('psMargin').textContent=(s?(g/s*100).toFixed(1):'0')+'%';put(d)}
 function add(p){const r=document.createElement('div');r.className='product-row card';r.style.marginBottom='12px';r.innerHTML='<div class="grid"><div class="field"><label>Product / Service</label><input class="p-name" type="text"></div><div class="field"><label>Monthly Sales</label><input class="p-sales" type="text" inputmode="numeric"></div><div class="field"><label>Monthly Cost</label><input class="p-cost" type="text" inputmode="numeric"></div><div class="field"><label>Gross Profit</label><input class="p-profit" type="text" readonly></div><div class="field"><label>Gross Margin</label><input class="p-margin" type="text" readonly></div></div><button type="button" class="secondary p-remove">Remove</button>';r.querySelector('.p-name').value=p?.name||'';r.querySelector('.p-sales').value=p?.sales?N(p.sales).toLocaleString('en-NG'):'';r.querySelector('.p-cost').value=p?.cost?N(p.cost).toLocaleString('en-NG'):'';function calc(){const s=N(r.querySelector('.p-sales').value),c=N(r.querySelector('.p-cost').value),g=s-c;r.querySelector('.p-profit').value=M(g);r.querySelector('.p-margin').value=(s?(g/s*100).toFixed(1):'0')+'%';recalc()}r.querySelectorAll('.p-name,.p-sales,.p-cost').forEach(e=>e.addEventListener('input',()=>{if(e!==r.querySelector('.p-name'))e.value=e.value.replace(/[^0-9,]/g,'');calc()}));r.querySelector('.p-remove').onclick=()=>{r.remove();recalc()};box.appendChild(r);calc()}
 existing.forEach(add);if(!box.children.length)add({});document.getElementById('productsAdd').onclick=()=>add({});
 document.getElementById('productsBack').onclick=()=>{put(rows());window.step=3;window.renderWizard()};
 document.getElementById('productsContinue').onclick=()=>{put(rows());window.step=5;window.renderWizard()};
}
setInterval(mount,150);
})();
