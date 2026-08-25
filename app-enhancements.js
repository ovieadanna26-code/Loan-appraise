/* LoanAppraise v4 UI enhancements: profile grade + notifications */
(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  async function user(){return (await window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY).auth.getUser()).data.user}
  function addUI(){
    if($('profileBtn'))return;
    const aside=document.querySelector('aside');
    const b=document.createElement('button');b.id='profileBtn';b.textContent='My Profile';b.onclick=()=>showProfile();aside.insertBefore(b,$('logoutBtn'));
    const n=document.createElement('button');n.id='notificationBtn';n.innerHTML='🔔 Notifications <span id="notificationCount"></span>';n.onclick=()=>showNotifications();aside.insertBefore(n,$('logoutBtn'));
    const main=document.querySelector('main');
    main.insertAdjacentHTML('beforeend',`<section id="profile" class="page"><h1>My Staff Profile</h1><div class="card"><form id="profileForm"><div class="grid"><label>Full Name<input id="profileName" required></label><label>Staff Grade<input id="profileGrade" placeholder="e.g. Officer II, Senior Loan Officer"></label><label>Email<input id="profileEmail" readonly></label><label>Role<input id="profileRole" readonly></label></div><button class="primary">Save Profile</button></form></div></section><section id="notifications" class="page"><h1>Notifications</h1><div class="card"><div id="notificationList"></div></div></section>`);
    $('profileForm').onsubmit=saveProfile;
  }
  function page(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$(id).classList.add('active')}
  async function showProfile(){const u=await user();if(!u)return;const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {data}=await sb.from('profiles').select('*').eq('id',u.id).single();if(!data)return;$('profileName').value=data.full_name||'';$('profileGrade').value=data.staff_grade||'';$('profileEmail').value=u.email||'';$('profileRole').value=data.role||'';page('profile')}
  async function saveProfile(e){e.preventDefault();const u=await user();if(!u)return;const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {error}=await sb.from('profiles').update({full_name:$('profileName').value.trim(),staff_grade:$('profileGrade').value.trim()}).eq('id',u.id);if(error)return alert(error.message);alert('Profile updated.');location.reload()}
  async function loadNotifications(){const u=await user();if(!u)return;const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);const {data,error}=await sb.from('notifications').select('*').eq('user_id',u.id).order('created_at',{ascending:false}).limit(30);if(error)return;const unread=(data||[]).filter(x=>!x.is_read).length;$('notificationCount').textContent=unread?`(${unread})`:'';$('notificationList').innerHTML=(data||[]).map(x=>`<div class="notification-item ${x.is_read?'read':''}"><strong>${esc(x.title)}</strong><p>${esc(x.message)}</p><small>${new Date(x.created_at).toLocaleString()}</small>${!x.is_read?`<button onclick="window.markNotificationRead('${x.id}')">Mark as read</button>`:''}</div>`).join('')||'<p>No notifications.</p>'}
  async function showNotifications(){page('notifications');await loadNotifications()}
  window.markNotificationRead=async id=>{const u=await user();const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);await sb.from('notifications').update({is_read:true}).eq('id',id).eq('user_id',u.id);loadNotifications()};
  window.addEventListener('load',()=>{addUI();setTimeout(loadNotifications,1200);setInterval(loadNotifications,20000)});
})();
