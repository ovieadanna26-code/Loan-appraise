/* FINAL Products navigation: deliberately isolated from old Products handlers. */
(function(){'use strict';
const n=v=>Number(String(v??'').replace(/,/g,''))||0;
function read(){return [...document.querySelectorAll('#productsRows .product-row')].map(r=>({name:r.querySelector('[data-p="name"]')?.value||'',sales:n(r.querySelector('[data-p="sales"]')?.value),cost:n(r.querySelector('[data-p="cost"]')?.value)})).filter(x=>x.name||x.sales||x.cost)}
function persist(){try{const s=JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}');s.products=read();localStorage.setItem('loanappraise_v2_draft',JSON.stringify(s))}catch(e){console.error(e)}}
document.addEventListener('click',e=>{const next=e.target.closest('#productsNext');if(next){e.preventDefault();e.stopImmediatePropagation();persist();const b=document.querySelector('.step[data-step="5"]');if(b)b.click();return}const back=e.target.closest('#productsBack');if(back){e.preventDefault();e.stopImmediatePropagation();persist();const b=document.querySelector('.step[data-step="3"]');if(b)b.click()}},true);
})();
