import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import PrintModal from '../../components/ui/PrintModal';
import { Article } from '../../types';
import { ARTICLES_DATA, getNextAccN } from '../../data/mockData';

interface ArticlesProps {
  addToast: (type: string, msg: string) => void;
  isAdmin?: boolean;
}

export default function Articles({ addToast, isAdmin = false }: ArticlesProps) {
  const [articles, setArticles] = useState<Article[]>(ARTICLES_DATA);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [printItem, setPrintItem] = useState<any | null>(null);

  const [autoAccNo, setAutoAccNo] = useState("");

  const [form, setForm] = useState({
    title: "",
    author1: "",
    author2: "",
    author3: "",
    journalName: "",
    volumeNo: "",
    issueNo: "",
    pages: "",
    doi: "",
    publicationDate: new Date().toISOString().split("T")[0],
    subject: "Artificial Intelligence",
    shelf: "ART-Archive-1",
    classificationNo: "006.30",
    emoji: "📄"
  });

  const handleOpenAdd = () => {
    setAutoAccNo(`ART-${new Date().getFullYear()}-${String(articles.length + 1).padStart(3, '0')}`);
    setForm({
      title: "",
      author1: "",
      author2: "",
      author3: "",
      journalName: "",
      volumeNo: "",
      issueNo: "",
      pages: "",
      doi: "",
      publicationDate: new Date().toISOString().split("T")[0],
      subject: "Artificial Intelligence",
      shelf: "ART-Archive-1",
      classificationNo: "006.30",
      emoji: "📄"
    });
    setShowAdd(true);
  };

  const addArticle = () => {
    if (!form.title.trim()) {
      addToast("error", "Article title is required");
      return;
    }
    if (!form.author1.trim()) {
      addToast("error", "At least primary Author 1 is required");
      return;
    }

    const authorsArr: string[] = [form.author1.trim()];
    if (form.author2.trim()) authorsArr.push(form.author2.trim());
    if (form.author3.trim()) authorsArr.push(form.author3.trim());

    const nart: Article = {
      id: "art" + Date.now(),
      accessionNo: autoAccNo,
      title: form.title.trim(),
      author1: form.author1.trim(),
      author2: form.author2.trim() || undefined,
      author3: form.author3.trim() || undefined,
      authors: authorsArr,
      journalName: form.journalName.trim() || "International Journal of Science",
      volumeNo: form.volumeNo.trim(),
      issueNo: form.issueNo.trim(),
      pages: form.pages.trim(),
      doi: form.doi.trim() || `10.1000/${Date.now().toString().slice(-6)}`,
      publicationDate: form.publicationDate,
      subject: form.subject.trim() || "General Research",
      shelf: form.shelf.trim() || "ART-Archive-1",
      classificationNo: form.classificationNo.trim() || "000.00",
      emoji: form.emoji
    };

    setArticles([nart, ...articles]);
    setShowAdd(false);
    addToast("success", `Article "${nart.title}" added (${nart.accessionNo})`);
  };

  const del = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
    addToast("success", "Article record removed.");
  };

  const filtered = articles.filter(a => {
    const lq = q.toLowerCase();
    const authorsStr = a.authors.join(" ").toLowerCase();
    return !q || 
      a.title.toLowerCase().includes(lq) || 
      authorsStr.includes(lq) || 
      a.journalName.toLowerCase().includes(lq) ||
      a.accessionNo.toLowerCase().includes(lq) ||
      (a.doi && a.doi.toLowerCase().includes(lq)) ||
      (a.classificationNo && a.classificationNo.toLowerCase().includes(lq));
  });

  return (
    <div>
      <div className="sh">
        <div>
          <div className="st">Research Articles Column</div>
          <div className="ss">Academic papers, journal publications & multi-author technical reports</div>
        </div>
        <div style={{ display: "flex", gap: 8 }} className="no-print">
          <button className="btn bs bsm" onClick={() => window.print()}>
            <Icon n="printer" s={13} /> Print Repository
          </button>
          {isAdmin && (
            <button className="btn bp" onClick={handleOpenAdd}>
              <Icon n="plus" s={13} /> Add Article
            </button>
          )}
        </div>
      </div>

      <div className="sbar no-print" style={{ marginBottom: 18, maxWidth: 460 }}>
        <Icon n="search" s={14} />
        <input 
          placeholder="Search article title, author (1-3), journal, DOI, classification…" 
          value={q} 
          onChange={e => setQ(e.target.value)} 
        />
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Accession / Class No</th>
              <th>Article Title & Emoji</th>
              <th>Authors (Up to 3)</th>
              <th>Journal & Publication</th>
              <th>DOI / Pages</th>
              <th>Subject</th>
              <th className="no-print" style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="acc-no">{a.accessionNo}</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--a2)" }}>
                      Class: {a.classificationNo || "000.00"}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13.5, maxWidth: 300, lineHeight: 1.3 }}>
                    {a.emoji} {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Pub Date: {a.publicationDate}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)" }}>
                    {a.authors.join(" • ")}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {a.authors.length} Author(s)
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{a.journalName}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    {a.volumeNo ? `Vol ${a.volumeNo}` : ''} {a.issueNo ? `Issue ${a.issueNo}` : ''}
                  </div>
                </td>
                <td>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--a3)" }}>{a.doi || "N/A"}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>pp. {a.pages || "N/A"}</div>
                </td>
                <td>
                  <span className="badge by">{a.subject}</span>
                </td>
                <td className="no-print" style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                    <button 
                      className="btn bs bsm" 
                      onClick={() => setPrintItem({
                        title: a.title,
                        accessionNo: a.accessionNo,
                        classificationNo: a.classificationNo,
                        authors: a.authors,
                        publisher: a.journalName,
                        doi: a.doi,
                        shelf: a.shelf,
                        category: a.subject,
                        type: "ARTICLE SLIP"
                      })}
                      title="Print Accession Tag & Citation Slip"
                    >
                      <Icon n="printer" s={11} /> Print
                    </button>
                    {isAdmin && (
                      <button className="btn bd bsm" onClick={() => del(a.id)}>
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

      {/* Add Article Modal */}
      {showAdd && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="mbox" style={{ maxWidth: 540 }}>
            <div className="mh">
              <div className="mt" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon n="plus" s={18} /> Add Research Article
              </div>
              <button className="ibtn" onClick={() => setShowAdd(false)}><Icon n="x" /></button>
            </div>
            <div className="mb">
              <div style={{ background: "rgba(69,201,160,.1)", border: "1px solid rgba(69,201,160,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--a3)", fontWeight: 700 }}>Auto-Generated Accession No: {autoAccNo}</div>
              </div>

              <div className="grid-form-responsive">
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label className="fl">Article Title *</label>
                  <input className="fi fi-bare" placeholder="Title of the research paper" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Author 1 (Primary) *</label>
                  <input className="fi fi-bare" placeholder="Primary Author" value={form.author1} onChange={e => setForm({ ...form, author1: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Author 2 (Optional)</label>
                  <input className="fi fi-bare" placeholder="Co-Author 2" value={form.author2} onChange={e => setForm({ ...form, author2: e.target.value })} />
                </div>

                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label className="fl">Author 3 (Optional)</label>
                  <input className="fi fi-bare" placeholder="Co-Author 3" value={form.author3} onChange={e => setForm({ ...form, author3: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Journal Name</label>
                  <input className="fi fi-bare" placeholder="e.g. IEEE / Nature / ACM" value={form.journalName} onChange={e => setForm({ ...form, journalName: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Classification No. (Call No.)</label>
                  <input className="fi fi-bare" placeholder="e.g. 006.31" value={form.classificationNo} onChange={e => setForm({ ...form, classificationNo: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Volume & Issue</label>
                  <input className="fi fi-bare" placeholder="Vol 12, Issue 4" value={form.volumeNo} onChange={e => setForm({ ...form, volumeNo: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Page Numbers</label>
                  <input className="fi fi-bare" placeholder="101-115" value={form.pages} onChange={e => setForm({ ...form, pages: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">DOI Number</label>
                  <input className="fi fi-bare" placeholder="10.1000/xyz123" value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} />
                </div>

                <div className="fg">
                  <label className="fl">Subject / Topic</label>
                  <input className="fi fi-bare" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                <button className="btn bs" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn bp" onClick={addArticle}>Save Article</button>
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
