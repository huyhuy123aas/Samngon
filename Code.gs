/* ===== QUẢN LÝ ĐƠN HÀNG – Nước Sâm Huy Nguyễn =====
 CÁCH CÀI:
 1) Mở Google Sheet của bạn → Tiện ích mở rộng (Extensions) → Apps Script.
 2) Xóa code cũ, dán TOÀN BỘ file này vào, ĐỔI MAT_KHAU bên dưới thành mật khẩu riêng (dài, khó đoán), bấm Lưu.
 3) Triển khai (Deploy) → Quản lý bản triển khai → biểu tượng bút chì → Phiên bản mới (New version) → Triển khai.
    Chọn bản triển khai cũ để GIỮ NGUYÊN link (đừng tạo "bản triển khai mới" vì link sẽ đổi). Nếu được hỏi quyền, bấm Cho phép.
 4) Mở quanly.html trên web và đăng nhập bằng MAT_KHAU.
 Đơn mới nằm ở tab "DonHang" (tự tạo). Đơn cũ ở tab cũ vẫn giữ nguyên.
 TUYỆT ĐỐI không ghi MAT_KHAU vào file nào của web (kể cả trên GitHub). */

const MAT_KHAU = "DOI-MAT-KHAU-NAY";   // <-- ĐỔI
const SHEET_ID = "";                    // để trống nếu Apps Script được mở từ trong Google Sheet
const TEN_TAB = "DonHang";
const CAC_COT = ["Mã đơn","Thời gian","Họ tên","SĐT","Địa chỉ","Sản phẩm","Số lượng","Tổng tiền","Ghi chú","Trạng thái"];
const TRANG_THAI = ["Mới","Đã xác nhận","Đang giao","Đã giao","Đã hủy"];

function tab_(){
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let t = ss.getSheetByName(TEN_TAB);
  if (!t){
    t = ss.insertSheet(TEN_TAB);
    t.appendRow(CAC_COT);
    t.setFrozenRows(1);
    t.getRange("B:B").setNumberFormat("@");  // giữ nguyên dạng chữ
    t.getRange("D:D").setNumberFormat("@");  // giữ số 0 đầu của SĐT
  }
  return t;
}

function json_(o){
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Khách bấm "Xác nhận đặt hàng" (từ dathang.html) → thêm 1 dòng vào Sheet */
function doPost(e){
  const d = JSON.parse(e.postData.contents);
  const luc = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
  const tong = Number(String(d.tongTien || "").replace(/\D/g, "")) || 0;
  const ghiChu = d.diaChi ? String(d.ghiChu || "").replace(/^Địa chỉ:[^|]*(\|\s*)?/, "") : (d.ghiChu || "");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    tab_().appendRow([d.maDon || ("HN" + Date.now()), luc, d.ten || "", d.sdt || "", d.diaChi || "", d.sanPham || "", Number(d.soLuong) || 0, tong, ghiChu, "Mới"]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/* Trang quản lý (quanly.html) lấy danh sách đơn / đổi trạng thái – bắt buộc đúng MAT_KHAU */
function doGet(e){
  const p = (e && e.parameter) || {};
  if (MAT_KHAU === "DOI-MAT-KHAU-NAY") return json_({ ok: false, loi: "Bạn chưa đổi MAT_KHAU trong Code.gs" });
  if (p.key !== MAT_KHAU) return json_({ ok: false, loi: "Sai mật khẩu" });
  const t = tab_();
  if (p.action === "status"){
    const row = Number(p.row);
    if (row >= 2 && row <= t.getLastRow() && String(t.getRange(row, 1).getValue()) === p.ma && TRANG_THAI.indexOf(p.tt) > -1){
      t.getRange(row, 10).setValue(p.tt);
      return json_({ ok: true });
    }
    return json_({ ok: false, loi: "Không tìm thấy đơn" });
  }
  const n = t.getLastRow() - 1;
  const v = n > 0 ? t.getRange(2, 1, n, 10).getValues() : [];
  return json_({ ok: true, don: v.map((r, i) => ({ row: i + 2, ma: r[0], luc: String(r[1]), ten: r[2], sdt: String(r[3]), diaChi: r[4], sp: r[5], sl: r[6], tong: r[7], ghiChu: r[8], tt: r[9] || "Mới" })) });
}
