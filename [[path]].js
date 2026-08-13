function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}
  });
}
async function body(req){try{return await req.json()}catch{return {}}}
function cookie(name,value,maxAge=14400){
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}
function getCookie(req,name){
  const s=req.headers.get("Cookie")||"";
  const m=s.match(new RegExp("(?:^|; )"+name.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\\\$&")+"=([^;]*)"));
  return m?decodeURIComponent(m[1]):null;
}
function rand(){return crypto.randomUUID()}
function safeSantri(s){if(!s)return null;const x={...s};delete x.password;return x}
async function authAdmin(req,env){
  const token=getCookie(req,"annur_admin");
  if(!token)return false;
  const r=await env.DB.prepare("SELECT 1 FROM admins WHERE username=? AND password=?").bind("admin",token).first();
  return !!r;
}
async function authSantri(req,env){
  const id=getCookie(req,"annur_santri");
  if(!id)return null;
  return await env.DB.prepare("SELECT * FROM santri WHERE id=?").bind(id).first();
}
async function loginAdmin(req,env){
  const b=await body(req),r=await env.DB.prepare("SELECT username,password FROM admins WHERE username='admin'").first();
  if(!r||String(b.password||"")!==String(r.password))return json({ok:false,message:"Sandi admin salah."},401);
  return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":cookie("annur_admin",r.password)}});
}
async function loginSantri(req,env){
  const b=await body(req);
  const s=await env.DB.prepare("SELECT id FROM santri WHERE id=? AND password=?").bind(String(b.id||"").trim(),String(b.password||"")).first();
  if(!s)return json({ok:false,message:"ID atau sandi salah."},401);
  return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":cookie("annur_santri",s.id)}});
}
async function adminApi(req,env,action){
  if(!await authAdmin(req,env))return json({ok:false,message:"Akses admin diperlukan."},403);
  if(action==="stats"){
    const [a,b,c,d,e]=await Promise.all([
      env.DB.prepare("SELECT COUNT(*) n FROM santri").first(),
      env.DB.prepare("SELECT COUNT(*) n FROM santri WHERE lower(status)='aktif'").first(),
      env.DB.prepare("SELECT COUNT(*) n FROM pelanggaran").first(),
      env.DB.prepare("SELECT COUNT(*) n FROM spp WHERE lower(status) LIKE '%belum%' OR lower(status) LIKE '%tunggak%'").first(),
      env.DB.prepare("SELECT COUNT(*) n FROM dekosan WHERE lower(status) LIKE '%belum%' OR lower(status) LIKE '%tunggak%'").first()
    ]);
    const events=await env.DB.prepare("SELECT * FROM events ORDER BY tanggal DESC").all();
    const contacts=await env.DB.prepare("SELECT * FROM contacts").all();
    return json({ok:true,total:a.n,aktif:b.n,pelanggaran:c.n,sppTunggak:d.n,dekosanTunggak:e.n,events:events.results,contacts:contacts.results});
  }
  if(action==="students"){
    const r=await env.DB.prepare("SELECT id,nama,nis,nisn,kelas,kamar,blok,foto_url,status FROM santri ORDER BY nama").all();
    return json({ok:true,data:r.results});
  }
  if(action==="change-password"){
    const b=await body(req); if(String(b.password||"").length<6)return json({ok:false,message:"Sandi minimal 6 karakter."},400);
    await env.DB.prepare("UPDATE admins SET password=? WHERE username='admin'").bind(String(b.password)).run();
    return new Response(JSON.stringify({ok:true,message:"Sandi admin berhasil diubah."}),{headers:{"content-type":"application/json","set-cookie":cookie("annur_admin",String(b.password))}});
  }
  return json({ok:false,message:"Endpoint admin tidak ditemukan."},404);
}
async function studentApi(req,env){
  const s=await authSantri(req,env); if(!s)return json({ok:false},401);
  const [p,sp,d,e,c]=await Promise.all([
    env.DB.prepare("SELECT * FROM pelanggaran WHERE id_santri=? ORDER BY tanggal DESC").bind(s.id).all(),
    env.DB.prepare("SELECT * FROM spp WHERE id_santri=? ORDER BY id DESC").bind(s.id).all(),
    env.DB.prepare("SELECT * FROM dekosan WHERE id_santri=? ORDER BY id DESC").bind(s.id).all(),
    env.DB.prepare("SELECT * FROM events ORDER BY tanggal DESC").all(),
    env.DB.prepare("SELECT * FROM contacts").all()
  ]);
  return json({ok:true,data:{santri:safeSantri(s),pelanggaran:p.results,spp:sp.results,dekosan:d.results,events:e.results,contacts:c.results}});
}
export async function onRequest(context){
  const {request,env}=context;
  const url=new URL(request.url), path=url.pathname;
  try{
    if(request.method==="POST"&&path==="/api/login/admin")return loginAdmin(request,env);
    if(request.method==="POST"&&path==="/api/login/santri")return loginSantri(request,env);
    if(request.method==="POST"&&path==="/api/logout"){
      return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":[cookie("annur_admin","",0),cookie("annur_santri","",0)].join(", ")}});
    }
    if(path==="/api/me/santri")return studentApi(request,env);
    if(path==="/api/admin/stats")return adminApi(request,env,"stats");
    if(path==="/api/admin/students")return adminApi(request,env,"students");
    if(request.method==="POST"&&path==="/api/admin/change-password")return adminApi(request,env,"change-password");
    return json({ok:false,message:"API tidak ditemukan."},404);
  }catch(e){return json({ok:false,message:"Server error: "+e.message},500)}
}