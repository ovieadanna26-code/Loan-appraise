(function(){
  function makeReference(){
    const d=new Date();
    const stamp=d.toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
    const random=Math.random().toString(36).slice(2,7).toUpperCase();
    return `LA-${stamp}-${random}`;
  }
  if(!window.supabase?.createClient) return;
  const originalCreateClient=window.supabase.createClient;
  window.supabase.createClient=function(){
    const client=originalCreateClient.apply(this,arguments);
    const originalFrom=client.from.bind(client);
    client.from=function(table){
      const query=originalFrom(table);
      if(table==='loan_applications' && query?.insert){
        const originalInsert=query.insert.bind(query);
        query.insert=function(values){
          if(Array.isArray(values)){
            values=values.map(v=>({...v,reference:v.reference||makeReference()}));
          }else if(values){
            values={...values,reference:values.reference||makeReference()};
          }
          return originalInsert(values);
        };
      }
      return query;
    };
    return client;
  };
})();
