/* ===== DỮ LIỆU CHUNG — sửa giá/tên ở đây, mọi trang tự cập nhật ===== */
const SCRIPT_URL="https://script.google.com/macros/s/AKfycbzPER3bAGb0_Ux2eHRLY3X_Do2m3AmpJUsSO1jIW-ofesL74H8-SuAoHcx07KWDyaUgHQ/exec";
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

function capNhatBadge(){const b=$("#badge");if(b){const n=Gio.tongSL();b.textContent=n;b.hidden=!n}}

function toast(m,err){
 let t=$("#toast");
 if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");document.body.append(t)}
 t.textContent=m;t.className="show"+(err?" err":"");
 clearTimeout(t.h);t.h=setTimeout(()=>t.className="",2500);
}

function theSP(p){return`<div class="product" data-id="${p.id}">
<img src="${esc(p.img)}" alt="${esc(p.ten)}" loading="lazy" onerror="this.onerror=null;this.src=ANH_LOI">
<div class="product-content"><p class="tag" style="color:${p.mau}">${p.tag}</p>
<h3>${p.ten}</h3><small>Mã: ${p.id}</small>
<div class="price">${tien(p.gia)}</div>
<button type="button" class="nut" data-them="${p.id}">🛒 Thêm vào giỏ</button></div></div>`}

/* ===== MENU + FOOTER + NÚT GỌI dùng chung cho mọi trang ===== */
function dungChung(){
 const trang=location.pathname.split("/").pop()||"index.html";
 const a=(h,t)=>`<a href="${h}"${trang===h?' class="on"':""}>${t}</a>`;
 $("#nav").innerHTML=a("index.html","Trang Chủ")+a("sanpham.html","Sản Phẩm")+a("dathang.html",'🛒 Đặt Hàng <span id="badge" hidden>0</span>')+a("lichsu.html","Đơn Của Tôi");
 $("#footer").innerHTML=`<h3>NƯỚC SÂM HUY NGUYỄN</h3><p><a href="${FACEBOOK}" target="_blank" rel="noopener">Facebook</a> | <a href="tel:${SDT_SHOP}">Gọi ngay</a></p><p>© 2026 Nước Sâm Huy Nguyễn</p>`;
 document.body.insertAdjacentHTML("beforeend",`<a class="goi" href="tel:${SDT_SHOP}" title="Gọi ngay" aria-label="Gọi ngay">📞</a>`);
 capNhatBadge();
}

document.addEventListener("click",e=>{
 const b=e.target.closest("[data-them]");if(!b)return;
 Gio.them(b.dataset.them);toast("✅ Đã thêm "+timSP(b.dataset.them).ten+" vào giỏ");
});
addEventListener("storage",capNhatBadge);
addEventListener("pageshow",capNhatBadge);
dungChung();
