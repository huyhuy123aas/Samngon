/* ===== DỮ LIỆU CHUNG — sửa giá/tên ở đây, mọi trang tự cập nhật ===== */
const SCRIPT_URL="https://script.google.com/macros/s/AKfycbxeL1HwGlmrBTuWMKE00SJKqUFjFrAUBmgI9S8LopQ5C8tysKUaztuSVcarXryqDhco7w/exec";
const SDT_SHOP="0328274316",FACEBOOK="https://www.facebook.com/athuw24.1";
const SAN_PHAM=[
{id:"NS01",ten:"Nước Sâm 500ml",gia:10000,tag:"🔥 Bán chạy",mau:"red",
 img:"https://th.bing.com/th/id/R.2b3eccbc261e36c01a0ce06ade22d51a?rik=%2fqQAps9QESEGQQ&pid=ImgRaw&r=0",
 thanhPhan:"La hán quả, mía lau, rễ tranh, bông cúc.",
 congDung:"Thanh nhiệt cơ thể, giải khát và hỗ trợ làm mát trong thời tiết nóng.",
 cachDung:"Uống ngon hơn khi để lạnh."},
{id:"NS02",ten:"Nước Sâm 1 Lít",gia:18000,tag:"⭐ Được yêu thích",mau:"orange",
 img:"https://file.hstatic.net/200000029694/file/ong-sam-co-cu-wonkisam-korean-ginseng-drink-han-quoc-10-chai-x-120ml-4_1024x1024.jpg",
 thanhPhan:"Mía lau, la hán quả, lá dứa, rễ tranh.",
 congDung:"Thích hợp dùng cho gia đình và nhóm nhiều người.",
 cachDung:"Bảo quản lạnh sau khi mở nắp."},
{id:"NS03",ten:"Nước Sâm Không Đường",gia:12000,tag:"🌿 Không đường",mau:"green",
 img:"https://tse2.mm.bing.net/th/id/OIP.hG7L_4FyEtXXxidDzGPkAwHaHL?r=0&o=7&pid=ImgDetMain",
 thanhPhan:"Thảo mộc tự nhiên, không bổ sung đường.",
 congDung:"Phù hợp người ăn kiêng và hạn chế đường.",
 cachDung:"Dùng lạnh hoặc thêm đá."}
];
const ANH_LOI="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="250"><rect width="100%" height="100%" fill="#e6f4e6"/><text x="50%" y="50%" font-size="64" text-anchor="middle" dy=".35em">🥤</text></svg>');

/* ===== HÀM TIỆN ÍCH ===== */
const $=(s,r=document)=>r.querySelector(s);
const tien=n=>n.toLocaleString("vi-VN")+"đ";
const timSP=id=>SAN_PHAM.find(p=>p.id===id);
const bo=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d"); // bỏ dấu để tìm kiếm
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ghi=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const lay=(k,mac)=>{try{return JSON.parse(localStorage.getItem(k))??mac}catch(e){return mac}};

/* ===== GIỎ HÀNG (lưu trong trình duyệt, giữ nguyên khi chuyển trang) ===== */
const Gio={
 ds(){const d=lay("gio",[]);return(Array.isArray(d)?d:[]).filter(i=>timSP(i.id)&&i.sl>0)},
 luu(ds){ghi("gio",ds);capNhatBadge()},
 them(id,sl=1){const ds=this.ds(),x=ds.find(i=>i.id===id);x?x.sl=Math.min(99,x.sl+sl):ds.push({id,sl});this.luu(ds)},
 dat(id,sl){this.luu(this.ds().map(i=>i.id===id?{id,sl:Math.min(99,sl)}:i).filter(i=>i.sl>0))},
 xoa(){this.luu([])},
 tongSL(){return this.ds().reduce((t,i)=>t+i.sl,0)},
 tong(){return this.ds().reduce((t,i)=>t+i.sl*timSP(i.id).gia,0)}
};

/* ===== LỊCH SỬ ĐƠN HÀNG (lưu trên trình duyệt của khách, giữ tối đa 50 đơn gần nhất) ===== */
const LichSu={
 ds(){const d=lay("donhang",[]);return Array.isArray(d)?d:[]},
 them(don){ghi("donhang",[don,...this.ds()].slice(0,50))},
 xoa(){ghi("donhang",[])}
};

function capNhatBadge(){const b=$("#badge");if(b){const n=Gio.tongSL();if(b.textContent!==String(n)){b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump")}b.textContent=n;b.hidden=!n}}

function toast(m,err){
 let t=$("#toast");
 if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");document.body.append(t)}
 t.textContent=m;t.className="show"+(err?" err":"");
 clearTimeout(t.h);t.h=setTimeout(()=>t.className="",2500);
}

function theSP(p){return`<div class="product rv" data-id="${p.id}">
<img src="${esc(p.img)}" alt="${esc(p.ten)}" loading="lazy" onerror="this.onerror=null;this.src=ANH_LOI">
<div class="product-content"><p class="tag" style="color:${p.mau}">${p.tag}</p>
<h3>${p.ten}</h3><small>Mã: ${p.id}</small>
<div class="price">${tien(p.gia)}</div>
<button type="button" class="nut" data-them="${p.id}">🛒 Thêm vào giỏ</button></div></div>`}

/* ===== MENU + FOOTER + NÚT GỌI dùng chung cho mọi trang ===== */
function dungChung(){
 const trang=location.pathname.split("/").pop()||"index.html";
 const a=(h,t)=>`<a href="${h}"${trang===h?' class="on"':""}>${t}</a>`;
 $("#nav").innerHTML='<a class="logo" href="index.html">🌿 Nước Sâm Huy</a><button id="mb" type="button" aria-label="Mở menu">☰</button><div class="lk">'+a("index.html","Trang Chủ")+a("sanpham.html","Sản Phẩm")+a("dathang.html",'🛒 Đặt Hàng <span id="badge" hidden>0</span>')+a("lichsu.html","Đơn Của Tôi")+'</div>';
 $("#footer").innerHTML=`<div class="ft"><div><h3>🌿 NƯỚC SÂM HUY NGUYỄN</h3><p>Thanh nhiệt tự nhiên • Nấu mới mỗi ngày • Giao tận nơi</p></div><div><h4>Menu</h4>${a("index.html","Trang Chủ")}${a("sanpham.html","Sản Phẩm")}${a("dathang.html","Đặt Hàng")}${a("lichsu.html","Đơn Của Tôi")}</div><div><h4>Liên hệ</h4><a href="tel:${SDT_SHOP}">📞 ${SDT_SHOP}</a><a href="${FACEBOOK}" target="_blank" rel="noopener">📘 Facebook</a></div></div><p class="cp">© 2026 Nước Sâm Huy Nguyễn</p>`;
 document.body.insertAdjacentHTML("beforeend",`<a class="goi" href="tel:${SDT_SHOP}" title="Gọi ngay" aria-label="Gọi ngay">📞</a>`);
 capNhatBadge();
}

document.addEventListener("click",e=>{
 const b=e.target.closest("[data-them]");if(!b)return;
 Gio.them(b.dataset.them);toast("✅ Đã thêm "+timSP(b.dataset.them).ten+" vào giỏ");
});
addEventListener("storage",capNhatBadge);
addEventListener("pageshow",capNhatBadge);
/* ===== HIỆU ỨNG: thanh tiến độ, nút lên đầu, menu thu gọn, hiện dần khi cuộn, đếm số ===== */
function hieuUng(){
 const bar=document.createElement("div");bar.id="bar";document.body.prepend(bar);
 const len=document.createElement("button");len.id="len";len.type="button";len.title="Lên đầu trang";len.textContent="↑";
 len.onclick=()=>scrollTo({top:0,behavior:"smooth"});document.body.append(len);
 const cuon=()=>{const y=scrollY;bar.style.width=y/Math.max(1,document.documentElement.scrollHeight-innerHeight)*100+"%";
  $("#nav").classList.toggle("sc",y>30);len.classList.toggle("hien",y>500)};
 addEventListener("scroll",cuon,{passive:true});cuon();
 $("#mb").onclick=()=>$("#nav").classList.toggle("mo");
 const dem=el=>{const n=+el.dataset.n,s=el.dataset.s||"",t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/1500);el.textContent=Math.round(n*(1-Math.pow(1-k,3))).toLocaleString("vi-VN")+s;if(k<1)requestAnimationFrame(f)})(t0)};
 const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;const t=e.target;
  t.style.transitionDelay=Math.min([...t.parentNode.children].indexOf(t),5)*.1+"s";setTimeout(()=>t.style.transitionDelay="",1300);
  t.classList.add("in");if(t.dataset.n)dem(t);io.unobserve(t)}),{threshold:.15});
 const quet=()=>document.querySelectorAll(".rv:not(.in)").forEach(el=>io.observe(el));
 quet();new MutationObserver(quet).observe(document.body,{childList:true,subtree:true});
}
dungChung();
hieuUng();
