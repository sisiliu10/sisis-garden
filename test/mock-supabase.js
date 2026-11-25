// Fake supabase-js for tests: one shared DB per browser via window.__store, presence relayed by the test.
(()=>{
const store=window.__store=window.__store||{};
window.__track=null; window.__remote={};
function q(table){let f={},lk=null,single=false;const api={
 select(){return api;}, eq(k,v){f[k]=v;return api;}, like(k,v){lk=new RegExp('^'+v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*')+'$');return api;}, limit(){return api;},
 maybeSingle(){single=true;return api;},
 upsert(row){ (window.__wpaths=window.__wpaths||[]).push(row.path); if(row.path==='app/owner'&&!window.__isSisi) return Promise.resolve({error:{message:'denied by rule'}});
   store[row.path]={path:row.path,data:JSON.parse(JSON.stringify(row.data))}; window.__writes=(window.__writes||0)+1; return Promise.resolve({error:null});},
 then(res,rej){let out;if(single){if(window.__failRead&&new RegExp(window.__failRead).test(f.path))return Promise.resolve({data:null,error:{message:'network down'}}).then(res,rej);const r=store[f.path];out={data:r?{data:r.data}:null,error:null};}
   else{out={data:Object.values(store).filter(r=>lk.test(r.path)),error:null};} return Promise.resolve(out).then(res,rej);}
};return api;}
function channel(name,opts){let pres=[],status=null;const key=opts&&opts.config&&opts.config.presence&&opts.config.presence.key;
 const bc=[];const c={on(kind,o,fn){if(kind==='presence')pres.push(fn);if(kind==='broadcast')bc.push(fn);return c;},send(m){(window.__sent=window.__sent||[]).push(m.payload);return Promise.resolve('ok');},_bc(p){bc.forEach(f=>f({payload:p}));},
  subscribe(cb){if(name==='garden-live'){window.__liveCh=c;window.__myKey=key;setTimeout(()=>cb('SUBSCRIBED'),50);}return c;},
  track(p){window.__track=p;return Promise.resolve('ok');},untrack(){window.__track=null;return Promise.resolve('ok');},
  presenceState(){const s={};if(window.__track)s[key]=[window.__track];for(const k in window.__remote)s[k]=[window.__remote[k]];return s;},
  _sync(){pres.forEach(f=>f());}};return c;}
window.supabase={createClient(){return{
 functions:{invoke:async(name,o)=>{(window.__ai=window.__ai||[]).push(o&&o.body);if(window.__aiReply)return{data:window.__aiReply(o.body),error:null};return{data:null,error:{message:'no function'}};}},auth:{getSession:async()=>({data:{session:window.__session||null}}),onAuthStateChange(cb){window.__authCb=cb;return{data:{subscription:{unsubscribe(){}}}};},
   signInWithOAuth:async(o)=>{window.__oauth=o;return{data:{url:'https://accounts.example/'+o.provider+'?to='+encodeURIComponent(o.options.redirectTo)},error:null};},
   refreshSession:async(o)=>{window.__refresh=o;const se={user:{id:'uid-oauth',email:'o@x'},refresh_token:'rt2'};window.__session=se;setTimeout(()=>window.__authCb&&window.__authCb('SIGNED_IN',se),0);return{data:{session:se},error:null};},
   stopAutoRefresh(){window.__stopped=true;},
   signInWithOtp:async(o)=>{window.__otp=o;const known=(window.__known||[]).includes(o.email);if(!known&&!(o.options&&o.options.shouldCreateUser))return{error:{message:'Signups not allowed for otp',code:'otp_disabled'}};return{error:null};},verifyOtp:async(o)=>{(window.__vo=window.__vo||[]).push(o);if(o.token===(window.__code||'12345678')&&o.type==='email'){const se={user:{id:'uid-code',email:o.email}};window.__session=se;return{data:{session:se},error:null};}return{data:{},error:{message:'Token has expired or is invalid'}};},signOut:async()=>{}},
 from:q, rpc:async(n,a)=>window.__rpc&&window.__rpc[n]?window.__rpc[n](a):n==="admin_users"?(window.__users?{data:window.__users,error:null}:{data:null,error:{message:"no fn"}}):({data:n==="garden_count"?(window.__gc??1240):null,error:null}), channel, removeChannel(){} };}};
})();
