import React, { useState, useEffect } from 'react';
import '../styles/index.css';

// Firebase
import { auth, db, seedInitialDataIfEmpty } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';

// Data
import { BOOKS_DATA, MEMBERS_DATA, TXNS_DATA, RESERVATIONS_DATA, REVIEWS_INIT, NOTIFICATIONS_LOG } from '../data/mockData';
import { User, Book, Transaction, Member, Reservation, Review } from '../types';

// Pages
import AuthPage from '../features/auth/AuthPage';
import UserDash from '../features/dashboard/UserDash';
import AdminDash from '../features/admin/AdminDash';
import Books from '../features/books/Books';
import Members from '../features/members/Members';
import IssueReturn from '../features/issue/IssueReturn';
import QRIssuePage from '../features/issue/QRIssuePage';
import OPAC from '../features/library/OPAC';
import Reservations from '../features/library/Reservations';
import Fines from '../features/library/Fines';
import NotificationsPage from '../features/library/NotificationsPage';
import Reports from '../features/admin/Reports';
import AccessControl from '../features/admin/AccessControl';
import Settings from '../features/shared/Settings';
import AIRecommender from '../features/library/AIRecommender';
import ReadingHistory from '../features/library/ReadingHistory';

import Periodicals from '../features/periodicals/Periodicals';
import Articles from '../features/articles/Articles';

// UI
import Icon from '../components/ui/Icon';
import Toasts from '../components/ui/Toasts';
import QRScannerModal from '../components/ui/QRScannerModal';

/**
 * App component
 * This is the CORE wrapper of the application. It holds the main state and
 * controls which page/dashboard is visible based on authentication and role.
 */
export default function App() {
  // --- APPLICATION STATE ---
  // `user` holds who is currently logged in. If null, we show the Login page.
  const [user, setUser] = useState<User | null>(null);
  // UI State for dark mode toggle, active page navigation, and mobile menu open/close
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [toasts, setToasts] = useState<{id: string, type: string, msg: string}[]>([]);
  
  // --- MOCK DATABASE STATE ---
  const [books, setBooks] = useState<Book[]>(BOOKS_DATA);
  const [members, setMems] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem("library_members");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load members from localStorage", e);
    }
    return MEMBERS_DATA;
  });
  const [txns, setTxns] = useState<Transaction[]>(TXNS_DATA);
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS_DATA);
  const [reviews, setReviews] = useState<Record<string, Review[]>>(REVIEWS_INIT);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LOG);

  const updateMembersState = (newMems: Member[] | ((prev: Member[]) => Member[])) => {
    setMems(prev => {
      const next = typeof newMems === "function" ? newMems(prev) : newMems;
      try {
        localStorage.setItem("library_members", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to save members to localStorage", e);
      }
      return next;
    });
  };

  const handleRegisterMember = (newMember: Member) => {
    updateMembersState(prev => {
      const exists = prev.some(m => m.memberId === newMember.memberId || m.email === newMember.email);
      if (exists) return prev.map(m => (m.memberId === newMember.memberId || m.email === newMember.email) ? { ...m, ...newMember } : m);
      return [newMember, ...prev];
    });
  };

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.remove("lm");
    } else {
      document.documentElement.classList.add("lm");
    }
  }, [dark]);

  useEffect(() => {
    // Attempt auto-seeding mock data in Firestore if blank
    seedInitialDataIfEmpty();

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const email = fbUser.email || "";
        const name = fbUser.displayName || email.split("@")[0];

        let role: User["role"] = "user";
        const isEmailAdmin = email.toLowerCase() === "test1@gmail.com" || email.toLowerCase().includes("admin") || email.toLowerCase().includes("meena");
        try {
          const profileSnap = await getDoc(doc(db, "users", fbUser.uid));
          if (profileSnap.exists()) {
            const profileRole = profileSnap.data().role;
            role = (profileRole === "admin" || isEmailAdmin) ? "admin" : "user";
          } else {
            role = isEmailAdmin ? "admin" : "user";
          }
        } catch {
          role = isEmailAdmin ? "admin" : "user";
        }
        const avatar = name.split(" ").map(x => x[0]).join("").toUpperCase();
        
        const loggedUser: User = {
          id: fbUser.uid,
          name,
          email,
          role,
          avatar,
          memberId: role === "user" ? "LIB-" + fbUser.uid.substring(0, 5).toUpperCase() : undefined,
          adminId: role === "admin" ? "ADM-" + fbUser.uid.substring(0, 3).toUpperCase() : undefined,
        };
        setUser(loggedUser);
      } else {
        setUser(null);
      }
    });

    const unsubBooks = onSnapshot(collection(db, "books"), (snapshot) => {
      const list: Book[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Book));
      if (list.length > 0) setBooks(list);
    }, (err) => console.warn("Firestore books snapshot error:", err));

    const unsubMems = onSnapshot(collection(db, "members"), (snapshot) => {
      const list: Member[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Member));
      if (list.length > 0) {
        updateMembersState(prev => {
          const map = new Map<string, Member>();
          list.forEach(m => map.set(m.memberId || m.id, m));
          prev.forEach(m => {
            const key = m.memberId || m.id;
            if (!map.has(key)) map.set(key, m);
          });
          return Array.from(map.values());
        });
      }
    }, (err) => console.warn("Firestore members snapshot error:", err));

    const unsubTxns = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Transaction));
      if (list.length > 0) setTxns(list);
    }, (err) => console.warn("Firestore txns snapshot error:", err));

    const unsubReservations = onSnapshot(collection(db, "reservations"), (snapshot) => {
      const list: Reservation[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Reservation));
      if (list.length > 0) setReservations(list);
    }, (err) => console.warn("Firestore reservations snapshot error:", err));

    const unsubReviews = onSnapshot(collection(db, "reviews"), (snapshot) => {
      const flatRevs: any[] = [];
      snapshot.forEach(doc => flatRevs.push({ id: doc.id, ...doc.data() }));
      const grouped: Record<string, Review[]> = {};
      flatRevs.forEach(r => {
        if (!grouped[r.bookId]) grouped[r.bookId] = [];
        grouped[r.bookId].push({
          id: r.id,
          user: r.user,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        });
      });
      if (Object.keys(grouped).length > 0) setReviews(grouped);
    }, (err) => console.warn("Firestore reviews snapshot error:", err));

    return () => {
      unsubAuth();
      unsubBooks();
      unsubMems();
      unsubTxns();
      unsubReservations();
      unsubReviews();
    };
  }, []);

  /**
   * Helper function to show small notification popups (Toasts) at the bottom.
   */
  const addToast = (type: string, msg: string) => {
    const id = Date.now().toString();
    setToasts(t => [...t, {id, type: type as any, msg}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  // Authentication handlers
  const login = (u: User) => {
    setUser(u); setPage("dashboard"); addToast("success", `Welcome, ${u.name}!`);
  };
  const logout = () => { auth.signOut(); setUser(null); setPage("dashboard"); };

  // If no user is logged in, restrict access and only render the AuthPage (Login Screen)
  if(!user) return (
    <div className={dark ? "" : "lm"} style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <AuthPage onLogin={login} onRegisterMember={handleRegisterMember} />
      <Toasts list={toasts as any} />
    </div>
  );
  
  // Determine if the user is an Admin or Librarian based on their role
  const isAdmin = user.role !== "user";

  // Sidebar link structures. Different links depending on the user type.
  const adminNav = [
    {s: "Management", items: [
      {id:"dashboard", l:"Dashboard", ic:"home"}, 
      {id:"books", l:"Book Catalog", ic:"book"}, 
      {id:"periodicals", l:"Newspapers & Magazines", ic:"newspaper"}, 
      {id:"articles", l:"Articles Column", ic:"fileText"}, 
      {id:"members", l:"Members", ic:"users"}, 
      {id:"issue", l:"Issue & Return", ic:"refresh"},
      {id:"qrscan", l:"QR Scan Issue", ic:"scan"}
    ]},
    {s: "Services", items: [{id:"opac", l:"OPAC Catalog", ic:"opac"}, {id:"reservations", l:"Reservations", ic:"bookmark", b:reservations.filter(r=>r.status==="Active").length}, {id:"fines", l:"Fines & Payments", ic:"dollar"}, {id:"notif", l:"Notifications", ic:"sms", b:notifications.filter(n=>!n.read).length}]},
    {s: "Insights", items: [{id:"reports", l:"Reports & Analytics", ic:"pieChart"}]},
    {s: "System", items: [{id:"access", l:"Access Control", ic:"shield"}, {id:"settings", l:"Settings", ic:"settings"}]},
  ];
  const userNav = [
    {s: "My Library", items: [
      {id:"dashboard", l:"My Dashboard", ic:"home"},
      {id:"opac", l:"Browse Books", ic:"book"},
      {id:"periodicals", l:"Newspapers & Magazines", ic:"newspaper"},
      {id:"articles", l:"Articles Column", ic:"fileText"},
      {id:"history", l:"Reading History", ic:"history", b:wishlist.length>0 ? wishlist.length : 0},
      {id:"ai", l:"AI Recommender", ic:"ai"},
      {id:"notif", l:"Notifications", ic:"bell", b:notifications.filter(n=>!n.read).length},
      {id:"settings", l:"Profile & Settings", ic:"settings"},
    ]},
  ];
  
  const nav = isAdmin ? adminNav : userNav;
  // Get the title label for the Header based on whatever page is active
  const label = nav.flatMap(s => s.items).find(i => i.id === page)?.l || "LibraryOS";

  const handleNavClick = (id: string) => {
    setPage(id);
    setMobileOpen(false);
  };

  /**
   * Router substitute: Instead of using react-router-dom, this project uses a simple
   * function to return a specific component based on the `page` state's string layout.
   */
  const renderPage = () => {
    if (!isAdmin) {
      if (page === "dashboard") return <UserDash user={user} members={members} books={books} txns={txns} wishlist={wishlist as any} setPage={setPage} />;
      if (page === "opac") return <OPAC books={books} reservations={reservations} setReservations={setReservations} addToast={addToast} reviews={reviews} setReviews={setReviews} wishlist={wishlist} setWishlist={setWishlist} user={user} />;
      if (page === "periodicals") return <Periodicals addToast={addToast} isAdmin={false} />;
      if (page === "articles") return <Articles addToast={addToast} isAdmin={false} />;
      if (page === "history") return <ReadingHistory user={user} txns={txns} books={books} wishlist={wishlist} setWishlist={setWishlist} reviews={reviews} setReviews={setReviews} addToast={addToast} />;
      if (page === "ai") return <AIRecommender user={user} txns={txns} books={books} addToast={addToast} />;
      if (page === "notif") return <NotificationsPage members={members} txns={txns} reservations={reservations} addToast={addToast} logs={notifications} setLogs={setNotifications} />;
      if (page === "settings") return <Settings user={user} dark={dark} setDark={setDark} addToast={addToast} />;
      return <UserDash user={user} members={members} books={books} txns={txns} wishlist={wishlist as any} setPage={setPage} />;
    }
    
    // Admin Routes
    if (page === "dashboard") return <AdminDash books={books} members={members} txns={txns} setBooks={setBooks} setTxns={setTxns} addToast={addToast} />;
    if (page === "books") return <Books books={books} setBooks={setBooks} addToast={addToast} />;
    if (page === "periodicals") return <Periodicals addToast={addToast} isAdmin={true} />;
    if (page === "articles") return <Articles addToast={addToast} isAdmin={true} />;
    if (page === "members") return <Members members={members} setMembers={setMems} addToast={addToast} />;
    if (page === "issue") return <IssueReturn books={books} setBooks={setBooks} members={members} txns={txns} setTxns={setTxns} addToast={addToast} />;
    if (page === "qrscan") return <QRIssuePage books={books} setBooks={setBooks} members={members} txns={txns} setTxns={setTxns} addToast={addToast} />;
    if (page === "opac") return <OPAC books={books} reservations={reservations} setReservations={setReservations} addToast={addToast} reviews={reviews} setReviews={setReviews} wishlist={wishlist} setWishlist={setWishlist} user={user} />;
    if (page === "reservations") return <Reservations reservations={reservations} setReservations={setReservations} books={books} members={members} addToast={addToast} />;
    if (page === "fines") return <Fines txns={txns} addToast={addToast} />;
    if (page === "notif") return <NotificationsPage members={members} txns={txns} reservations={reservations} addToast={addToast} logs={notifications} setLogs={setNotifications} />;
    if (page === "reports") return <Reports books={books} members={members} txns={txns} addToast={addToast} />;
    if (page === "access") return <AccessControl />;
    if (page === "settings") return <Settings user={user} dark={dark} setDark={setDark} addToast={addToast} />;
    
    return <AdminDash books={books} members={members} txns={txns} />;
  };

  const avBg = isAdmin ? "linear-gradient(135deg,var(--danger),#b03030)" : "linear-gradient(135deg,var(--a2),var(--a3))";
  
  // Gets sum of the notification badges the navigation items have.
  const totalBadge = nav.flatMap(s => s.items).reduce((s, i) => s + (i.b || 0), 0);

  // The Primary layout returning the Sidebar, Header Topbar, and injected content `renderPage()`.
  return (
    <div className={dark ? "" : "lm"} style={{ background: "var(--bg)", color: "var(--text)", height: "100vh", overflow: "hidden" }}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div 
            className="mobile-backdrop no-print" 
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(3px)",
              zIndex: 99
            }}
          />
        )}

        <nav className={`sidebar no-print ${mobileOpen ? "mobile-open" : ""}`}>
          <div className="sbl">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,var(--accent),#9a7438)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
                <div><div className="sbn">LibraryOS</div><div className="sbs">Management</div></div>
              </div>
              <button className="ibtn mobile-close-btn" onClick={() => setMobileOpen(false)}>
                <Icon n="x" s={14} />
              </button>
            </div>
            <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: isAdmin ? "rgba(224,92,92,.12)" : "rgba(79,126,247,.12)", color: isAdmin ? "var(--danger)" : "var(--a2)", border: `1px solid ${isAdmin ? "rgba(224,92,92,.24)" : "rgba(79,126,247,.24)"}` }}>
              <Icon n={isAdmin ? "shield" : "user"} s={11} /> {isAdmin ? (user as any).designation || "Librarian" : "Member"}
            </div>
          </div>
          <div className="sbnav">
            {nav.map(sec => (
              <div key={sec.s}>
                <div className="nsl">{sec.s}</div>
                {sec.items.map(item => (
                  <div key={item.id} className={`ni ${page === item.id ? "act" : ""}`} onClick={() => handleNavClick(item.id)}>
                    <Icon n={item.ic} /> {item.l}
                    {(item.b ?? 0) > 0 && <span className="nb">{item.b}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sbf">
            <div className="uchip">
              <div className="av" style={{ background: avBg }}>{user.avatar}</div>
              <div style={{ flex: 1, overflow: "hidden" }}><div className="uname" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div><div className="urole" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div></div>
            </div>
            <button onClick={logout} className="btn bs bsm" style={{ width: "100%", marginTop: 9, color: "var(--danger)" }}>
              <Icon n="logout" s={13} /> Sign Out
            </button>
          </div>
        </nav>

        <main className="main-area">
          <header className="topbar no-print">
            <button className="ibtn mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ marginRight: 6 }}>
              <Icon n="menu" s={18} />
            </button>
            <div className="tbtitle">{label}</div>
            <div className="sbar desktop-sbar"><Icon n="search" s={14} /><input placeholder="Quick search…" /></div>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <button 
                className="btn bs bsm" 
                onClick={() => setShowQRScanner(true)} 
                title="Scan QR Code with Camera"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px" }}
              >
                <Icon n="qr" s={14} /> <span className="desktop-sbar">Scan QR</span>
              </button>
              <div className="ibtn" onClick={() => { setPage("notif"); setMobileOpen(false); }} style={{ position: "relative" }}><Icon n="bell" />{totalBadge > 0 && <div className="nd" />}</div>
              <div className="ibtn" onClick={() => setDark(!dark)}><Icon n={dark ? "sun" : "moon"} /></div>
              <div className="ibtn" onClick={() => { setPage("settings"); setMobileOpen(false); }}><Icon n="settings" /></div>
            </div>
          </header>
          <div className="content">{renderPage()}</div>
        </main>
      </div>
      <Toasts list={toasts as any} />
      {showQRScanner && (
        <QRScannerModal onClose={() => setShowQRScanner(false)} />
      )}
    </div>
  );

}
