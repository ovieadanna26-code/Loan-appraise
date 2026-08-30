// Runtime compatibility fixes loaded before app.js.
(function(){
  const originalCreate=window.supabase?.createClient;
  if(!originalCreate)return;
  window.supabase.createClient=function(){
    const c=originalCreate.apply(this,arguments);
    const originalFrom=c.from.bind(c);
    c.from=function(table){
      const q=originalFrom(table);
      if(table!=='loan_applications')return q;
      const originalInsert=q.insert.bind(q);
      q.insert=function(values,options){
        if(values && !Array.isArray(values) && values.reference==null){
          const stamp=new Date();
          const pad=n=>String(n).padStart(2,'0');
          values={...values,reference:`LA-${stamp.getFullYear()}${pad(stamp.getMonth()+1)}${pad(stamp.getDate())}-${Math.random().toString(36).slice(2,8).toUpperCase()}`};
        }
        return originalInsert(values,options);
      };
      return q;
    };
    return c;
  };
})();
