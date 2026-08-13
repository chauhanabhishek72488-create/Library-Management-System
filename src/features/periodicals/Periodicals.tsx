import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import QRCode from '../../components/ui/QRCode';
import PrintModal from '../../components/ui/PrintModal';
import { Newspaper, Magazine } from '../../types';
import { NEWSPAPERS_DATA, MAGAZINES_DATA, getNextAccN } from '../../data/mockData';

interface PeriodicalsProps {
  addToast: (type: string, msg: string) => void;
  isAdmin?: boolean;
}

export default function Periodicals({ addToast, isAdmin = false }: PeriodicalsProps) {
  const [tab, setTab] = useState<'newspapers' | 'magazines'>('newspapers');
  const [newspapers, setNewspapers] = useState<Newspaper[]>(NEWSPAPERS_DATA);
  const [magazines, setMagazines] = useState<Magazine[]>(MAGAZINES_DATA);
  const [q, setQ] = useState("");

  const [showAddNp, setShowAddNp] = useState(false);
  const [showAddMag, setShowAddMag] = useState(false);
  const [printItem, setPrintItem] = useState<any | null>(null);

  // Newspaper form
  const [npForm, setNpForm] = useState({
    name: "",
    publisher: "",
    language: "English",
    edition: "Morning" as const,
    frequency: "Daily" as const,
    date: new Date().toISOString().split("T")[0],
    shelf: "NP-Rack-1",
    copies: 3,
    classificationNo: "070.172",
    sectionCount: 20,
    emoji: "📰"
  });

  // Magazine form
  const [magForm, setMagForm] = useState({
    title: "",
    publisher: "",
    issueNo: "Vol. 1 Issue #1",
    volumeNo: "1",
    monthYear: "August 2026",
    category: "Science & Tech",
    issn: "0000-0000",
    shelf: "MAG-Shelf-A",
    copies: 3,
    classificationNo: "050.00",
    emoji: "🗞️"
  });

  const [autoAccNp, setAutoAccNp] = useState("");
  const [autoAccMag, setAutoAccMag] = useState("");

  const handleOpenAddNp = () => {
    setAutoAccNp(`NP-${new Date().getFullYear()}-${String(newspapers.length + 1).padStart(3, '0')}`);
    setShowAddNp(true);
  };

  const handleOpenAddMag = () => {
    setAutoAccMag(`MAG-${new Date().getFullYear()}-${String(magazines.length + 1).padStart(3, '0')}`);
    setShowAddMag(true);
  };

  const addNp = () => {
    if (!npForm.name.trim()) {
      addToast("error", "Newspaper name is required");
      return;
    }
    const nnp: Newspaper = {
      id: "np" + Date.now(),
      accessionNo: autoAccNp,
      name: npForm.name.trim(),
      publisher: npForm.publisher.trim() || "Publishing Group",
      language: npForm.language,
      edition: npForm.edition,
      frequency: npForm.frequency,
      date: npForm.date,
      shelf: npForm.shelf.trim() || "NP-Rack-1",
      copies: +npForm.copies || 1,
      available: +npForm.copies || 1,
      classificationNo: npForm.classificationNo.trim() || "070.00",
      sectionCount: +npForm.sectionCount || 16,
      emoji: npForm.emoji
    };
    setNewspapers([nnp, ...newspapers]);
    setShowAddNp(false);
    addToast("success", `Newspaper "${nnp.name}" added successfully (${nnp.accessionNo})`);
  };

  const addMag = () => {
    if (!magForm.title.trim()) {
      addToast("error", "Magazine title is required");
      return;
    }
    const nmag: Magazine = {
      id: "mag" + Date.now(),
      accessionNo: autoAccMag,
      title: magForm.title.trim(),
      publisher: magForm.publisher.trim() || "Media House",
      issueNo: magForm.issueNo.trim() || "Vol. 1",
      volumeNo: magForm.volumeNo.trim(),
      monthYear: magForm.monthYear.trim(),
      category: magForm.category,
      issn: magForm.issn.trim(),
      shelf: magForm.shelf.trim() || "MAG-Shelf-A",
      copies: +magForm.copies || 1,
      available: +magForm.copies || 1,
      classificationNo: magForm.classificationNo.trim() || "050.00",
      emoji: magForm.emoji
    };
    setMagazines([nmag, ...magazines]);
    setShowAddMag(false);
    addToast("success", `Magazine "${nmag.title}" added successfully (${nmag.accessionNo})`);
  };

  const delNp = (id: string) => {
    setNewspapers(newspapers.filter(n => n.id !== id));
    addToast("success", "Newspaper record deleted.");
  };

  const delMag = (id: string) => {
    setMagazines(magazines.filter(m => m.id !== id));
    addToast("success", "Magazine record deleted.");
  };

  const filteredNp = newspapers.filter(n => {
    const lq = q.toLowerCase();
    return !q || n.name.toLowerCase().includes(lq) || n.publisher.toLowerCase().includes(lq) || n.accessionNo.toLowerCase().includes(lq) || n.language.toLowerCase().includes(lq);
  });

  const filteredMag = magazines.filter(m => {
    const lq = q.toLowerCase();
    return !q || m.title.toLowerCase().includes(lq) || m.publisher.toLowerCase().includes(lq) || m.accessionNo.toLowerCase().includes(lq) || (m.issn && m.issn.includes(lq));
  });

  return (
    <div>
      {/* Header */}
      <div className="sh">
        <div>
          <div className="st">Periodicals Repository</div>
          <div className="ss">Browse daily newspapers, magazines, and subscription issues</div>
        </div>
        <div style={{ display: "flex", gap: 8 }} className="no-print">
          <button className="btn bs bsm" onClick={() => window.print()}>
            <Icon n="printer" s={13} /> Print List
          </button>
          {isAdmin && (
            tab === 'newspapers' ? (
              <button className="btn bp" onClick={handleOpenAddNp}>
                <Icon n="plus" s={13} /> Add Newspaper
              </button>
            ) : (
              <button className="btn bp" onClick={handleOpenAddMag}>
                <Icon n="plus" s={13} /> Add Magazine
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs no-print">
        <div className={`tab ${tab === 'newspapers' ? 'tact' : ''}`} onClick={() => setTab('newspapers')}>
          📰 Newspapers ({newspapers.length})
        </div>
        <div className={`tab ${tab === 'magazines' ? 'tact' : ''}`} onClick={() => setTab('magazines')}>
          🗞️ Magazines ({magazines.length})
        </div>
      </div>

      {/* Search Bar */}
      <div className="sbar no-print" style={{ marginBottom: 18, maxWidth: 420 }}>
        <Icon n="search" s={14} />
        <input 
          placeholder={tab === 'newspapers' ? "Search newspaper name, publisher, accession, language…" : "Search magazine title, ISSN, publisher, issue…"} 
          value={q} 
          onChange={e => setQ(e.target.value)} 
        />
      </div>

      {/* NEWSPAPERS CONTENT */}
      {tab === 'newspapers' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Accession / Class No</th>
                <th>Newspaper Name</th>
                <th>Publisher & Language</th>
                <th>Edition & Frequency</th>
                <th>Date</th>
                <th>Shelf Rack</th>
                <th>Status</th>
                <th className="no-print" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNp.map(n => (
                <tr key={n.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span className="acc-no">{n.accessionNo}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--a2)" }}>{n.classificationNo}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.emoji} {n.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{n.sectionCount} Sections</div>
                  </td>
                  <td>
                    <div>{n.publisher}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Lang: {n.language}</div>
                  </td>
                  <td>
                    <span className="badge bb">{n.edition}</span>
                    <span className="badge by" style={{ marginLeft: 4 }}>{n.frequency}</span>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{n.date}</td>
                  <td>{n.shelf}</td>
                  <td>
                    <span className={`badge ${n.available > 0 ? "bg" : "br"}`}>
                      {n.available} / {n.copies} Copies
                    </span>
                  </td>
                  <td className="no-print" style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                      <button className="btn bs bsm" onClick={() => setPrintItem({ title: n.name, accessionNo: n.accessionNo, classificationNo: n.classificationNo, publisher: n.publisher, date: n.date, shelf: n.shelf, type: "NEWSPAPER SLIP" })}>
                        <Icon n="printer" s={11} /> Print
                      </button>
                      {isAdmin && (
                        <button className="btn bd bsm" onClick={() => delNp(n.id)}>
                          <Icon n="trash" s={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MAGAZINES CONTENT */}
      {tab === 'magazines' && (
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Accession / Class No</th>
                <th>Magazine Title</th>
                <th>Publisher & ISSN</th>
                <th>Issue / Volume</th>
                <th>Category</th>
                <th>Shelf</th>
                <th>Copies</th>
                <th className="no-print" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMag.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span className="acc-no">{m.accessionNo}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--a2)" }}>{m.classificationNo}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.emoji} {m.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.monthYear}</div>
                  </td>
                  <td>
                    <div>{m.publisher}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)" }}>ISSN: {m.issn || "N/A"}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{m.issueNo}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Vol: {m.volumeNo || "1"}</div>
                  </td>
                  <td><span className="badge by">{m.category}</span></td>
                  <td>{m.shelf}</td>
                  <td>
                    <span className={`badge ${m.available > 0 ? "bg" : "br"}`}>
                      {m.available} / {m.copies} avail.
                    </span>
                  </td>
                  <td className="no-print" style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                      <button className="btn bs bsm" onClick={() => setPrintItem({ title: m.title, accessionNo: m.accessionNo, classificationNo: m.classificationNo, publisher: m.publisher, issueNo: m.issueNo, issn: m.issn, shelf: m.shelf, category: m.category, type: "MAGAZINE SLIP" })}>
                        <Icon n="printer" s={11} /> Print
                      </button>
                      {isAdmin && (
                        <button className="btn bd bsm" onClick={() => delMag(m.id)}>
                          <Icon n="trash" s={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Newspaper Modal */}
      {showAddNp && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowAddNp(false)}>
          <div className="mbox" style={{ maxWidth: 500 }}>
            <div className="mh">
              <div className="mt">Add New Newspaper Issue</div>
              <button className="ibtn" onClick={() => setShowAddNp(false)}><Icon n="x" /></button>
            </div>
            <div className="mb">
              <div style={{ background: "rgba(69,201,160,.1)", border: "1px solid rgba(69,201,160,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--a3)", fontWeight: 700 }}>Auto Accession No: {autoAccNp}</div>
              </div>
              <div className="grid-form-responsive">
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label className="fl">Newspaper Name *</label>
                  <input className="fi fi-bare" placeholder="e.g. The Financial Express" value={npForm.name} onChange={e => setNpForm({ ...npForm, name: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Publisher</label>
                  <input className="fi fi-bare" placeholder="Publisher Name" value={npForm.publisher} onChange={e => setNpForm({ ...npForm, publisher: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Language</label>
                  <input className="fi fi-bare" placeholder="Language" value={npForm.language} onChange={e => setNpForm({ ...npForm, language: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Edition</label>
                  <select className="fi fi-bare" value={npForm.edition} onChange={e => setNpForm({ ...npForm, edition: e.target.value as any })}>
                    <option value="Morning">Morning Edition</option>
                    <option value="Evening">Evening Edition</option>
                    <option value="Special">Special Edition</option>
                    <option value="Weekly">Weekly Edition</option>
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Frequency</label>
                  <select className="fi fi-bare" value={npForm.frequency} onChange={e => setNpForm({ ...npForm, frequency: e.target.value as any })}>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Classification No.</label>
                  <input className="fi fi-bare" value={npForm.classificationNo} onChange={e => setNpForm({ ...npForm, classificationNo: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Shelf Rack</label>
                  <input className="fi fi-bare" value={npForm.shelf} onChange={e => setNpForm({ ...npForm, shelf: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                <button className="btn bs" onClick={() => setShowAddNp(false)}>Cancel</button>
                <button className="btn bp" onClick={addNp}>Save Newspaper</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Magazine Modal */}
      {showAddMag && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowAddMag(false)}>
          <div className="mbox" style={{ maxWidth: 500 }}>
            <div className="mh">
              <div className="mt">Add New Magazine Issue</div>
              <button className="ibtn" onClick={() => setShowAddMag(false)}><Icon n="x" /></button>
            </div>
            <div className="mb">
              <div style={{ background: "rgba(69,201,160,.1)", border: "1px solid rgba(69,201,160,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--a3)", fontWeight: 700 }}>Auto Accession No: {autoAccMag}</div>
              </div>
              <div className="grid-form-responsive">
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label className="fl">Magazine Title *</label>
                  <input className="fi fi-bare" placeholder="e.g. Harvard Business Review" value={magForm.title} onChange={e => setMagForm({ ...magForm, title: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Publisher</label>
                  <input className="fi fi-bare" placeholder="Publisher" value={magForm.publisher} onChange={e => setMagForm({ ...magForm, publisher: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Issue No / Vol</label>
                  <input className="fi fi-bare" placeholder="Vol. 102 Issue #4" value={magForm.issueNo} onChange={e => setMagForm({ ...magForm, issueNo: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">ISSN</label>
                  <input className="fi fi-bare" placeholder="0017-8012" value={magForm.issn} onChange={e => setMagForm({ ...magForm, issn: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Category</label>
                  <input className="fi fi-bare" value={magForm.category} onChange={e => setMagForm({ ...magForm, category: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Classification No.</label>
                  <input className="fi fi-bare" value={magForm.classificationNo} onChange={e => setMagForm({ ...magForm, classificationNo: e.target.value })} />
                </div>
                <div className="fg">
                  <label className="fl">Shelf Location</label>
                  <input className="fi fi-bare" value={magForm.shelf} onChange={e => setMagForm({ ...magForm, shelf: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                <button className="btn bs" onClick={() => setShowAddMag(false)}>Cancel</button>
                <button className="btn bp" onClick={addMag}>Save Magazine</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      {printItem && (
        <PrintModal item={printItem} onClose={() => setPrintItem(null)} />
      )}
    </div>
  );
}
