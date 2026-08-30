/* Final Products runtime adapter. app.js uses lexical step/state, so this adapter works from the rendered DOM. */
(function(){'use strict';
 const app=()=>document.getElementById('app');
 const num=v=>Number(String(v??'').replace(/,/g,''))||0;
 const money=v=>'₦'+num(v).toLocaleString('en-NG',{maximumFractionDigits:0});
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key='loanappraise_products';
 function isProducts(){const f=app()?.querySelector('.form');return !!(f&&/Products \/ Trading Lines/.test(f.innerText||''));}
 function read(){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
 function save(ps){localStorage.setItem(key,JSON.stringify(ps));}
 function render(){if(!isProducts())return;const f=app().querySelector('.form');let ps=read();if(!ps.length)ps=[{name:'',sales:'',cost:''}];
  f.innerHTML=`<div class="card"><h3>Products / Trading Lines</h3><p class="muted">Add the main products or services sold by the customer. Gross profit and margin calculate automatically.</p><div id="pf-rows">${ps.map((p,i)=>`<div class="pf-row" data-i="${i}" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:12px;align-items:end;margin-bottom:12px"><div class="field"><label>Product / Service</label><input data-p="name" value="${esc(p.name)}"></div><div class="field"><label>Monthly Sales</label><input data-p="sales" inputmode="decimal" value="${esc(p.sales)}"></div><div class="field"><label>Monthly Cost</label><input data-p="cost" inputmode="decimal" value="${esc(p.cost)}"></div><div class="metric"><small>Gross Profit</small><b data-gp>${money(num(p.sales)-num(p.cost))}</b></div><button type="button" class="secondary" data-remove="${i}">Remove</button></div>`).join('')}</div><button type="button" class="secondary" id="pf-add">+ Add Product</button><div class="cards" style="margin-top:18px"><div class="metric"><small>Total Sales</small><b id="pf-sales">₦0</b></div><div class="metric"><small>Total Cost</small><b id="pf-cost">₦0</b></div><div class="metric"><small>Gross Profit</small><b id="pf-profit">₦0</b></div><div class="metric"><small>Gross Margin</small><b id="pf-margin">0%</b></div></div></div><div class="actions"><button type="button" class="secondary" id="pf-back">Back</button><button type="button" class="primary" id="pf-next">Save & Continue</button></div>`;
  const sync=()=>{const out=[];let s=0,c=0;f.querySelectorAll('.pf-row').forEach(r=>{const p={name:r.querySelector('[data-p=name]').value,sales:r.querySelector('[data-p=sales]').value,cost:r.querySelector('[data-p=cost]').value};out.push(p);s+=num(p.sales);c+=num(p.cost);r.querySelector('[data-gp]').textContent=money(num(p.sales)-num(p.cost))});save(out);const g=s-c;f.querySelector('#pf-sales').textContent=money(s);f.querySelector('#pf-cost').textContent=money(c);f.querySelector('#pf-profit').textContent=money(g);f.querySelector('#pf-margin').textContent=(s?g/s*100:0).toFixed(1)+'%'};
  f.querySelectorAll('[data-p]').forEach(x=>x.addEventListener('input',sync));
  f.querySelector('#pf-add').onclick=()=>{sync();const x=read();x.push({name:'',sales:'',cost:''});save(x);render()};
  f.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{sync();const x=read();x.splice(Number(b.dataset.remove),1);save(x);render()});
  f.querySelector('#pf-back').onclick=()=>document.querySelector('.step[data-step="3"]')?.click();
  f.querySelector('#pf-next').onclick=async()=>{sync();try{if(typeof window.saveDraft==='function')await window.saveDraft();document.querySelector('.step[data-step="5"]')?.click()}catch(e){console.error(e);alert('Could not continue to Balance Sheet: '+(e.message||e))}};
  sync();
 }
 let active=false;setInterval(()=>{const now=isProducts();if(now&&!active)render();active=now},200);
})();