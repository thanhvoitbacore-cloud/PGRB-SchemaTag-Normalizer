# PGRB SchemaTags Normalizer — Web Tool Implementation Plan

## Tổng quan

Xây dựng một **web app client-side** (HTML + Vanilla JS) thay thế toàn bộ workflow VBA hiện tại.
User chỉ cần upload file một lần → hệ thống chạy cả 2 process → hiển thị bảng review → export Excel.

Không dùng server (zero-server, 100% client-side processing).

---

## Phân tích 2 Process Hiện Tại

### Process 1 — `schem_tag_v2.txt` (Wayfair Product Attributes Transpose)

**Input format:** File Excel có nhiều sheet (mỗi sheet là 1 product category).

### 3.1. Output Schema — Process 1 (14 cột, thứ tự cố định)
| Cột | Tên cột export | Kiểu |
|-----|---------------|------|
| 1 | Manufacturer Part Id | String |
| 2 | PrSKU (Wayfair Listing) | String |
| 3 | SKU Type | String |
| 4 | Manufacturer Part Number | String |
| 5 | Supplier Partnumber | String |
| 6 | Product Option | String |
| 7 | Stagid | String (normalized — sau `:` cuối) |
| 8 | Schema Tag Title | String |
| 9 | Current schema_tag_value | String |
| 10 | Schema tag priority | String |
| 11 | Does schema show on site? | String |
| 12 | Tag Definition | String |
| 13 | How should the tags be filled in on the tool? | String |
| 14 | Input Type | String |

Mỗi sheet sau khi clean có cấu trúc:
- Row 1: `stagid` (header của từng tag)
- Row 2: `schema tag priority`
- Row 3: `Tag Name`
- Row 4: `How to fill tag`
- Row 5+: Data rows (Wayfair Listing, MPN, SU Part Number, + giá trị từng tag)
- Cột 1-3: product identifiers (Wayfair Listing, MPN, SU Part)

**Clean step:** Bỏ sheet DropDownOptions, xóa row 2/5/7, xóa cột A/B/D/G, truncate từ cột `attributesWhy` trở đi.

**Transpose step:** Unpivot — mỗi cell (row i, col j) tạo ra 1 bản ghi với **14 cột output** (thứ tự cố định theo yêu cầu):

| # | Tên cột output | Nguồn dữ liệu |
|---|----------------|---------------|
| 1 | **Manufacturer Part Id** | Cột 2 của dòng data (sau clean) |
| 2 | **PrSKU (Wayfair Listing)** | Cột 1 của dòng data |
| 3 | **SKU Type** | Cột 4 của dòng data (cột mới — xem ghi chú) |
| 4 | **Manufacturer Part Number** | Cột 5 của dòng data |
| 5 | **Supplier Partnumber** | Cột 6 của dòng data |
| 6 | **Product Option** | Cột 7 của dòng data |
| 7 | **Stagid** | Row 1 của cột j (header) — normalized (sau `:` cuối) |
| 8 | **Schema Tag Title** | Row 3 của cột j (Tag Name) |
| 9 | **Current schema_tag_value** | Giá trị ô (i, j) — tag value |
| 10 | **Schema tag priority** | Row 2 của cột j |
| 11 | **Does schema show on site?** | Row ? của cột j (xem ghi chú ⚠️) |
| 12 | **Tag Definition** | Row 4 của cột j |
| 13 | **How should the tags be filled in on the tool?** | Row 4 của cột j (How to fill) |
| 14 | **Input Type** | Row 5 của cột j |

> ⚠️ **Cần xác nhận:** Các cột `SKU Type`, `Manufacturer Part Number`, `Supplier Partnumber`, `Product Option` — trong file Excel gốc, đây là các cột nào (số cột mấy sau khi clean)? Tương tự, `Does schema show on site?` lấy từ hàng mấy của header block?

**Normalize Stagid:** Lấy phần sau dấu `:` cuối cùng từ `TagName_Tag ID` (row 1).

**Output:** Bảng dọc tổng hợp với **14 cột** theo thứ tự trên.

---

### Process 2 — `schema_tags_droplist.txt` (Schema Tag Dropdown Reference)

**Input format:** Cùng file Excel — nhưng đọc các sheet như một **schema reference template**.
- Rows 1–6 là khối header tag definitions
- Bỏ qua DropDownOptions sheet

**Clean step (khác P1):** Xóa cột A–G, bỏ row 2, bỏ row 8 trở đi, truncate từ `attributesWhy`.

**Transpose step:** Với mỗi cột (= 1 tag), đọc 6 hàng header thành 1 bản ghi dọc:
1. Class ID (lấy từ tên sheet, phần trước " - ")
2. TagName_Tag ID (row 1)
3. Tag Type (row 2)
4. Tag Name (row 3)
5. Tag Definition (row 4)
6. Input Type (row 5)
7. Dropdown Value (row 6 — text hoặc validation list, join bằng "; ")

**Extract step:** Tách `extractedTagId` từ cột `TagName_Tag ID`, lấy phần sau `::` cuối cùng.

**Output:** Bảng dọc với 8 cột (Class ID, TagName_ID, Type, Name, Definition, InputType, Dropdown, ExtractedTagId).

---

## Kế hoạch Hợp Nhất

Vì cùng input file nhưng 2 output khác nhau, ta xử lý **song song** (Promise.all) rồi hiển thị 2 tab result:

| Tab | Tên | Nội dung |
|-----|-----|----------|
| Tab 1 | **Product Attributes** | Output của Process 1 (9 cột) |
| Tab 2 | **Schema Tags Reference** | Output của Process 2 (8 cột) |

---

## User Review Required

> [!IMPORTANT]
> **File name validation:** Input chỉ nhận file có tên chứa cụm từ **"Product Attributes"** (không phân biệt hoa thường). Điều này đúng với yêu cầu của bạn chưa?

> [!WARNING]
> **Dropdown từ Excel Validation:** Process 2 cần đọc DataValidation list trong file Excel. Thư viện `xlsx` (SheetJS) không đọc được `DataValidation` natively vì đây là feature ẩn. Cần xử lý fallback: nếu không có validation → đọc text trong cell row 6. Hầu hết trường hợp sẽ hoạt động đúng.

> [!IMPORTANT]
> **Cách đặt tên App:** Tôi dự kiến đặt tên là **"PGRB SchemaTags Normalizer"**. Bạn có muốn tên khác không?

---

## Proposed Changes

### Tech Stack

- **Framework:** Vanilla HTML + CSS + JavaScript (không cần backend/Node)
- **Library:** [SheetJS (xlsx)](https://sheetjs.com/) — parse và generate Excel file, load qua CDN
- **Export:** SheetJS write → Blob → download link
- **Deployment:** Static file, mở trực tiếp trên browser

---

### Project Structure

```
c:\Users\thanh.vo.10447\Desktop\PGRB_Tool Projects\Schema Transposer\web-tool\
├── index.html          # Main app shell
├── style.css           # Design system + animations
├── app.js              # Orchestrator (upload, routing, state)
├── process1.js         # Module P1: Product Attributes Transpose
├── process2.js         # Module P2: Schema Tags Dropdown Reference
├── tableViewer.js      # Reusable table component with filters
└── exporter.js         # Excel export helper (SheetJS wrapper)
```

---

### Các Modules Chính

#### [NEW] `index.html`
- Upload zone với drag & drop
- File name validation ("Product Attributes")
- Progress/status bar
- 2 tabs: "Product Attributes" + "Schema Tags Reference"
- Bảng kết quả với header filters
- Nút Export Excel (cho từng tab riêng, hoặc export cả 2 tab vào 1 file nhiều sheet)

#### [NEW] `style.css`
- Dark theme với glassmorphism
- Màu chủ đạo: tím/xanh gradient (premium feel)
- Micro-animations: upload drag effect, progress bar, tab switch
- Responsive table với sticky header

#### [NEW] `app.js`
- Quản lý state (IDLE → PROCESSING → SUCCESS/ERROR)
- Validate file name chứa "Product Attributes"
- Gọi P1 và P2 song song
- Render kết quả vào 2 tab

#### [NEW] `process1.js` — Product Attributes Transpose
Replicates VBA logic:
1. **Clean:** Skip "DropDownOptions" sheet; delete rows 2,5,7; delete cols A,B,D,G; truncate from "attributesWhy"
2. **Transpose/Unpivot:** Row 5+ × Col 4+ → flat records (8 cols)
3. **Normalize StagID:** Cắt sau `:` cuối → col 9

#### [NEW] `process2.js` — Schema Tags Reference
Replicates VBA logic:
1. **Clean:** Skip "DropDownOptions"; delete cols A-G; delete row 2; delete rows 8+; truncate from "attributesWhy"
2. **Transpose:** Cols 1..N, rows 1..6 → flat records (7 cols)
3. **Extract Tag ID:** Cắt sau `::` cuối → col 8

#### [NEW] `tableViewer.js`
- Render virtual/paginated table
- Bộ lọc dropdown đơn giản trên mỗi cột header
- Search/filter text
- Row count indicator

#### [NEW] `exporter.js`
- Dùng SheetJS để tạo multi-sheet Excel
- Sheet 1: "Product Attributes" (output P1)
- Sheet 2: "Schema Tags Reference" (output P2)
- Filename: `PGRB_Normalized_Result.xlsx`

---

## Verification Plan

### Automated
- Mở `index.html` trong browser
- Upload file `Product Attributes 2026-04-08 14-39-16.xlsx`
- Kiểm tra bảng kết quả Tab 1 khớp với output VBA P1
- Kiểm tra bảng kết quả Tab 2 khớp với output VBA P2
- Download Excel và verify nội dung

### Manual Checks
- Upload file không có tên "Product Attributes" → hệ thống phải reject
- Kiểm tra bộ lọc cột hoạt động đúng
- Kiểm tra Export Excel mở được trong Excel
