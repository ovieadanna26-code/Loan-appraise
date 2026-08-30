// Runtime compatibility fixes loaded before app.js.
(function(){
  const originalCreate=window.supabase?.createClient;
  if(originalCreate){
    window.supabase.createClient=function(){
      const c=originalCreate.apply(this,arguments);
      const originalFrom=c.from.bind(c);
      c.from=function(table){
        const q=originalFrom(table);
        if(table!=='loan_applications')return q;
        const originalInsert=q.insert.bind(q);
        q.insert=function(values,options){
          if(values && !Array.isArray(values) && values.reference==null){
            const stamp=new Date(); const pad=n=>String(n).padStart(2,'0');
            values={...values,reference:`LA-${stamp.getFullYear()}${pad(stamp.getMonth()+1)}${pad(stamp.getDate())}-${Math.random().toString(36).slice(2,8).toUpperCase()}`};
          }
          return originalInsert(values,options);
        };
        return q;
      };
      return c;
    };
  }
  // Products emergency navigation guard. Runs in capture phase so legacy handlers cannot freeze the step.
  document.addEventListener('click',function(e){
    const b=e.target.closest?.('#productsNext,#productsBack'); if(!b)return;
    const active=document.querySelector('.step.active');
    if(!active||active.dataset.step!=='4')return;
    e.preventDefault(); e.stopImmediatePropagation();
    const data=[...document.querySelectorAll('.product-row')].map(r=>({name:r.querySelector('[data-p="name"]')?.value||'',sales:Number((r.querySelector('[data-p="sales"]')?.value||'').replace(/,/g,''))||0,cost:Number((r.querySelector('[data-p="cost"]')?.value||'').replace(/,/g,''))||0})).filter(x=>x.name||x.sales||x.cost);
    try{const s=JSON.parse(localStorage.getItem('loanappraise_v2_draft')||'{}');s.products=data;localStorage.setItem('loanappraise_v2_draft',JSON.stringify(s));}catch{}
    const target=document.querySelector(`.step[data-step="${b.id==='productsBack'?3:5}"]`);
    if(target)target.click();
  },true);
})();
