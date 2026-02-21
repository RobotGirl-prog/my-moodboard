import { useState, useRef, useEffect, useCallback } from "react";

const ROOMS = ["All", "Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Outdoor", "Other"];
const STATUSES = ["Want", "Maybe", "Saving For", "Bought"];

const SAMPLE_ITEMS = [
  { id: 1, name: "Linen Sofa", brand: "Article", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", link: "https://example.com/sofa", room: "Living Room", price: "1299", status: "Want" },
  { id: 2, name: "Ceramic Table Lamp", brand: "West Elm", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&q=80", link: "https://example.com/lamp", room: "Bedroom", price: "89", status: "Want" },
  { id: 3, name: "Woven Throw", brand: "Coyuchi", image: "https://images.unsplash.com/photo-1580301762395-21ce6d555b43?w=600&q=80", link: "https://example.com/throw", room: "Living Room", price: "65", status: "Maybe" },
  { id: 4, name: "Marble Board", brand: "CB2", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&q=80", link: "https://example.com/board", room: "Kitchen", price: "45", status: "Want" },
  { id: 5, name: "Terracotta Planter", brand: "Rejuvenation", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80", link: "https://example.com/planter", room: "Outdoor", price: "32", status: "Saving For" },
  { id: 6, name: "Walnut Desk", brand: "Floyd", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80", link: "https://example.com/desk", room: "Office", price: "749", status: "Want" },
  { id: 7, name: "Rattan Mirror", brand: "Anthropologie", image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80", link: "https://example.com/mirror", room: "Bathroom", price: "198", status: "Maybe" },
  { id: 8, name: "Boucle Accent Chair", brand: "Sixpenny", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80", link: "https://example.com/chair", room: "Living Room", price: "1450", status: "Saving For" },
];

const CARD_HEIGHTS = [280, 340, 300, 240, 360, 260, 320, 290];
const getH = (id) => CARD_HEIGHTS[id % CARD_HEIGHTS.length];

export default function Moodboard() {
  const [items, setItems] = useState(() => {
    try {
      const saved = window.__moodboardData;
      return saved || SAMPLE_ITEMS;
    } catch { return SAMPLE_ITEMS; }
  });
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [quickLink, setQuickLink] = useState("");
  const [form, setForm] = useState({ name: "", brand: "", image: "", link: "", room: "Living Room", price: "", status: "Want" });
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const nextId = useRef(SAMPLE_ITEMS.length + 1);
  const dropRef = useRef(null);

  const filtered = filter === "All" ? items : items.filter((i) => i.room === filter);
 const totalValue = filtered.filter((i) => i.status === "Want").reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const openAdd = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name, brand: item.brand || "", image: item.image, link: item.link, room: item.room, price: item.price, status: item.status || "Want" });
    } else {
      setEditingItem(null);
      setForm({ name: "", brand: "", image: "", link: "", room: "Living Room", price: "", status: "Want" });
    }
    setShowAdd(true);
  };

  const save = () => {
    if (!form.name || !form.image) return;
    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? { ...i, ...form } : i)));
      showToast("Item updated ✓");
    } else {
      setItems((prev) => [...prev, { ...form, id: nextId.current++ }]);
      showToast("Added to moodboard ✓");
    }
    setShowAdd(false);
    setEditingItem(null);
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteId(null);
    showToast("Item removed");
  };

  // Handle link paste in quick-add bar
  const handleQuickPaste = (e) => {
    const text = e.target.value;
    setQuickLink(text);
    if (text.match(/^https?:\/\//)) {
      setForm({ ...form, link: text, name: "", brand: "", image: "", room: "Living Room", price: "", status: "Want" });
      setEditingItem(null);
      setShowAdd(true);
      setQuickLink("");
    }
  };

  // Handle drag and drop of links
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain") || "";
    if (url.match(/^https?:\/\//)) {
      setForm({ name: "", brand: "", image: "", link: url, room: "Living Room", price: "", status: "Want" });
      setEditingItem(null);
      setShowAdd(true);
      showToast("Link captured — fill in the details!");
    }
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div
      ref={dropRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ ...s.wrap, ...(dragOver ? s.wrapDragOver : {}) }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Karla:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1816; }
        ::selection { background: #c4a882; color: #1a1816; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #c4a882 !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .card:hover .card-img { transform: scale(1.03); }
        .card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .chip:hover { background: rgba(196,168,130,0.15) !important; }
        .quick-input::placeholder { color: #5a534b; }
      `}</style>

      {/* Drag overlay */}
      {dragOver && (
        <div style={s.dragOverlay}>
          <div style={s.dragContent}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4a882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#c4a882", marginTop: 12 }}>Drop link here</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}

      {/* Header */}
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>Digital Wishlist</p>
          <h1 style={s.title}>Moodboard</h1>
        </div>
        <div style={s.headerRight}>
          <div style={s.stat}>
            <span style={s.statNum}>{items.length}</span>
            <span style={s.statLabel}>items</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={s.statNum}>${totalValue.toLocaleString()}</span>
            <span style={s.statLabel}>total</span>
          </div>
        </div>
      </header>

      {/* Quick Add Bar */}
      <div style={s.quickBar}>
        <div style={s.quickInputWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a534b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <input
            className="quick-input"
            style={s.quickInput}
            placeholder="Paste a product link to quick-add..."
            value={quickLink}
            onChange={handleQuickPaste}
          />
        </div>
        <button style={s.addBtn} onClick={() => openAdd()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span style={{ marginLeft: 6 }}>Add Item</span>
        </button>
      </div>

      {/* Filters */}
      <div style={s.filterRow}>
        {ROOMS.map((r) => (
          <button
            key={r}
            className="chip"
            onClick={() => setFilter(r)}
            style={{ ...s.chip, ...(filter === r ? s.chipActive : {}) }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div style={s.masonry}>
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="card"
            style={{ ...s.card, animation: `fadeUp 0.45s ease ${idx * 0.05}s both` }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => { setHoveredId(null); setDeleteId(null); }}
          >
            {/* Clickable Image */}
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
              <div style={{ ...s.imgWrap, height: getH(item.id) }}>
                <img className="card-img" src={item.image} alt={item.name} style={s.img} />

                {/* Hover Overlay — name, brand, price */}
                <div style={{ ...s.hoverOverlay, opacity: hoveredId === item.id ? 1 : 0 }}>
                  <div style={s.overlayContent}>
                    <p style={s.overlayBrand}>{item.brand || "—"}</p>
                    <p style={s.overlayName}>{item.name}</p>
                    {item.price && <p style={s.overlayPrice}>${parseFloat(item.price).toLocaleString()}</p>}
                  </div>
                  <div style={s.overlayLink}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    <span style={{ marginLeft: 5 }}>Shop</span>
                  </div>
                </div>
              </div>
            </a>

            {/* Status badge */}
            <div style={{ ...s.statusBadge, background: item.status === "Bought" ? "#4a7c59" : item.status === "Saving For" ? "#8b6914" : "rgba(255,255,255,0.08)" }}>
              {item.status}
            </div>

            {/* Action buttons on hover */}
            {hoveredId === item.id && (
              <div style={s.actions}>
                <button style={s.actBtn} onClick={(e) => { e.stopPropagation(); openAdd(item); }} title="Edit">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d4c8b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                {deleteId === item.id ? (
                  <button style={{ ...s.actBtn, background: "rgba(192,57,43,0.3)" }} onClick={(e) => { e.stopPropagation(); remove(item.id); }} title="Confirm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                ) : (
                  <button style={s.actBtn} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d4c8b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={s.empty}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#5a534b" }}>This space is waiting</p>
          <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 13, color: "#3d3835", marginTop: 8 }}>Paste a link or add your first item</p>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div style={s.overlay} onClick={() => setShowAdd(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editingItem ? "Edit Item" : "Add to Moodboard"}</h2>
              <button style={s.closeBtn} onClick={() => setShowAdd(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a7e70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {form.image && (
              <div style={s.preview}>
                <img src={form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            <div style={s.formGrid}>
              <div style={s.fieldFull}>
                <label style={s.label}>Image URL *</label>
                <input style={s.input} placeholder="Right-click product image → Copy image address" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>

              <div style={s.fieldFull}>
                <label style={s.label}>Product Link</label>
                <input style={s.input} placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>

              <div style={s.fieldHalf}>
                <label style={s.label}>Item Name *</label>
                <input style={s.input} placeholder="e.g. Linen Sofa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div style={s.fieldHalf}>
                <label style={s.label}>Brand / Store</label>
                <input style={s.input} placeholder="e.g. West Elm" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>

              <div style={s.fieldThird}>
                <label style={s.label}>Room</label>
                <select style={s.input} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
                  {ROOMS.filter((r) => r !== "All").map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div style={s.fieldThird}>
                <label style={s.label}>Price</label>
                <input style={s.input} placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>

              <div style={s.fieldThird}>
                <label style={s.label}>Status</label>
                <select style={s.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((st) => <option key={st}>{st}</option>)}
                </select>
              </div>
            </div>

            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button
                style={{ ...s.saveBtn, opacity: form.name && form.image ? 1 : 0.45, cursor: form.name && form.image ? "pointer" : "default" }}
                onClick={save}
                disabled={!form.name || !form.image}
              >
                {editingItem ? "Save Changes" : "Add to Board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    minHeight: "100vh",
    background: "#1a1816",
    padding: "36px 28px 80px",
    fontFamily: "'Karla', sans-serif",
    maxWidth: 1260,
    margin: "0 auto",
    position: "relative",
    transition: "all 0.3s",
  },
  wrapDragOver: {
    background: "#1e1c19",
  },
  dragOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26,24,22,0.85)",
    backdropFilter: "blur(8px)",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dragContent: {
    textAlign: "center",
    border: "2px dashed #c4a882",
    borderRadius: 20,
    padding: "60px 80px",
  },
  toast: {
    position: "fixed",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#2d2822",
    color: "#c4a882",
    fontFamily: "'Karla', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: "10px 24px",
    borderRadius: 8,
    border: "1px solid rgba(196,168,130,0.2)",
    zIndex: 1001,
    animation: "toastIn 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    paddingBottom: 24,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  eyebrow: {
    fontFamily: "'Karla', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "#c4a882",
    marginBottom: 6,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 42,
    fontWeight: 300,
    color: "#e8e0d4",
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  statNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 400,
    color: "#d4c8b6",
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#5a534b",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    background: "rgba(255,255,255,0.06)",
  },
  quickBar: {
    display: "flex",
    gap: 10,
    marginBottom: 22,
  },
  quickInputWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "0 14px",
  },
  quickInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    fontFamily: "'Karla', sans-serif",
    fontSize: 13,
    color: "#d4c8b6",
    padding: "12px 0",
    outline: "none",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    fontFamily: "'Karla', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    background: "#c4a882",
    color: "#1a1816",
    border: "none",
    padding: "0 20px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.2s",
    whiteSpace: "nowrap",
  },
  filterRow: {
    display: "flex",
    gap: 6,
    marginBottom: 26,
    flexWrap: "wrap",
  },
  chip: {
    fontFamily: "'Karla', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    background: "transparent",
    color: "#6b6158",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "6px 16px",
    borderRadius: 20,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  chipActive: {
    background: "#c4a882",
    color: "#1a1816",
    borderColor: "#c4a882",
    fontWeight: 500,
  },
  masonry: {
    columns: "3 300px",
    columnGap: 16,
  },
  card: {
    breakInside: "avoid",
    marginBottom: 16,
    background: "#232019",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    transition: "box-shadow 0.3s, transform 0.3s",
  },
  imgWrap: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.5s ease",
  },
  hoverOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.3) 40%, transparent 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "20px 18px",
    transition: "opacity 0.3s ease",
  },
  overlayContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  overlayBrand: {
    fontFamily: "'Karla', sans-serif",
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#c4a882",
    marginBottom: 4,
  },
  overlayName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 400,
    color: "#fff",
    lineHeight: 1.2,
    marginBottom: 4,
  },
  overlayPrice: {
    fontFamily: "'Karla', sans-serif",
    fontSize: 14,
    fontWeight: 300,
    color: "rgba(255,255,255,0.7)",
  },
  overlayLink: {
    display: "flex",
    alignItems: "center",
    color: "#c4a882",
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginTop: 12,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    fontFamily: "'Karla', sans-serif",
    fontSize: 10,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#e8e0d4",
    padding: "4px 10px",
    borderRadius: 6,
    backdropFilter: "blur(8px)",
  },
  actions: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "flex",
    gap: 4,
    animation: "fadeUp 0.2s ease",
  },
  actBtn: {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(26,24,22,0.7)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: "100px 20px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,8,6,0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeUp 0.15s ease",
  },
  modal: {
    background: "#232019",
    borderRadius: 16,
    padding: 0,
    width: "92%",
    maxWidth: 520,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.06)",
    animation: "slideIn 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px 0",
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 400,
    color: "#e8e0d4",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  preview: {
    margin: "18px 28px 0",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  formGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0 14px",
    padding: "8px 28px 0",
  },
  fieldFull: { width: "100%", marginTop: 14 },
  fieldHalf: { width: "calc(50% - 7px)", marginTop: 14 },
  fieldThird: { width: "calc(33.333% - 10px)", marginTop: 14 },
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 500,
    color: "#8a7e70",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  input: {
    width: "100%",
    fontFamily: "'Karla', sans-serif",
    fontSize: 13,
    padding: "9px 12px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    color: "#d4c8b6",
    transition: "border-color 0.2s",
  },
  modalActions: {
    display: "flex",
    gap: 10,
    padding: "22px 28px 26px",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    fontFamily: "'Karla', sans-serif",
    fontSize: 13,
    background: "transparent",
    color: "#6b6158",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "9px 20px",
    borderRadius: 8,
    cursor: "pointer",
  },
  saveBtn: {
    fontFamily: "'Karla', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    background: "#c4a882",
    color: "#1a1816",
    border: "none",
    padding: "9px 24px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
};
