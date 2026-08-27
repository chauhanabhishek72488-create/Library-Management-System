import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { ID_TYPES, MEMBERS_DATA, MOCK_USERS } from '../../data/mockData';
import { User, Member } from '../../types';

// Firebase
import { auth, db } from '../../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthPageProps {
  onLogin: (u: User) => void;
  onRegisterMember?: (m: Member) => void;
}

/**
 * AuthPage Component
 * Handles the Sign In and Registration for both Users and Admins.
 * Also features an animated blob background!
 */
export default function AuthPage({ onLogin, onRegisterMember }: AuthPageProps) {
  // --- UI/AUTH STATE ---
  const [mode, setMode] = useState("signin"); // Tracks if user is signing in or signing up
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "", memberType: "Student", idType: "College ID", idNumber: "" });
  const [showPw, setShowPw] = useState(false); // Password visibility toggle
  const [loading, setLoading] = useState(false); // Controls the spinning/loading state on button clicks
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sm = (m: string) => { setMode(m); setError(""); setSuccess(""); };
  
  /** Helper to quickly update one specific field in the form state */
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setForm(f => ({ ...f, [k]: e.target.value }));

  /** Helper to check if an email is already registered */
  const getRegisteredUser = (email: string): { name: string; memberId?: string; id?: string; avatar?: string } | null => {
    const clean = email.toLowerCase().trim();
    if (clean === "test1@gmail.com" || clean === "teat1@gmail.com") {
      return { name: "System Admin", memberId: undefined, id: "a-test1", avatar: "SA" };
    }
    
    // Check localStorage registered users list
    try {
      const regRaw = localStorage.getItem("library_registered_users");
      if (regRaw) {
        const regUsers = JSON.parse(regRaw);
        const found = regUsers.find((u: any) => u.email && u.email.toLowerCase().trim() === clean);
        if (found) return found;
      }
    } catch (e) {}

    // Check localStorage members list
    try {
      const memRaw = localStorage.getItem("library_members");
      if (memRaw) {
        const mems = JSON.parse(memRaw);
        const found = mems.find((m: any) => m.email && m.email.toLowerCase().trim() === clean);
        if (found) return { name: found.name, memberId: found.memberId, id: found.id, avatar: found.avatar || found.initials };
      }
    } catch (e) {}

    // Check default MEMBERS_DATA
    const foundMem = MEMBERS_DATA.find(m => m.email.toLowerCase().trim() === clean);
    if (foundMem) {
      return { name: foundMem.name, memberId: foundMem.memberId, id: foundMem.id, avatar: foundMem.avatar || foundMem.initials };
    }

    // Check MOCK_USERS
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase().trim() === clean);
    if (foundUser) {
      return { name: foundUser.name, memberId: foundUser.memberId, id: foundUser.id, avatar: foundUser.avatar };
    }

    return null;
  };

  /** Helper to create member object and pass to parent handler */
  const createAndRegisterMember = (uid: string, memberId: string): Member => {
    const displayName = form.name || form.email.split("@")[0];
    const initials = displayName.split(" ").filter(Boolean).map(x => x[0]).join("").toUpperCase().slice(0, 2) || "U";
    const newMember: Member = {
      id: uid,
      name: displayName,
      email: form.email,
      phone: form.phone || "N/A",
      type: form.memberType,
      memberType: form.memberType,
      memberId,
      expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      booksIssued: 0,
      initials,
      avatar: initials,
      status: "Active",
      idType: form.idType || "College ID",
      idNumber: form.idNumber || "N/A",
      registrationDate: new Date().toISOString().split("T")[0]
    };
    if (onRegisterMember) {
      onRegisterMember(newMember);
    }
    try {
      const regRaw = localStorage.getItem("library_registered_users");
      const list = regRaw ? JSON.parse(regRaw) : [];
      if (!list.some((u: any) => u.email.toLowerCase() === form.email.toLowerCase().trim())) {
        list.push({ email: form.email.trim(), name: displayName, memberId, id: uid, avatar: initials });
        localStorage.setItem("library_registered_users", JSON.stringify(list));
      }
    } catch (e) {}
    return newMember;
  };

  /**
   * Main submit handler for forms. 
   * Integrates Firebase Authentication with automatic Demo fallback if Firebase API key is unconfigured.
   */
  const submit = () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Please fill all required fields."); return; }
    
    const emailClean = form.email.trim().toLowerCase();
    const isEmailAdmin = emailClean === "test1@gmail.com" || emailClean === "teat1@gmail.com";

    if (mode === "signup" && !isEmailAdmin && (!form.idType || !form.idNumber)) { setError("ID proof (Aadhaar/College ID) is mandatory."); return; }
    
    // If trying to access as admin with wrong password
    if (isEmailAdmin && form.password !== "123456") {
      setError("Invalid password for Admin. (Admin password: 123456)");
      return;
    }

    // If trying to sign in with an unregistered email, demand sign up first!
    if (mode === "signin" && !isEmailAdmin) {
      const registered = getRegisteredUser(emailClean);
      if (!registered) {
        setError("This email is not registered! Please Sign Up first.");
        return;
      }
    }

    setLoading(true);

    const performFallbackLogin = () => {
      if (isEmailAdmin && form.password !== "123456") {
        setLoading(false);
        setError("Invalid password for Admin. (Admin password: 123456)");
        return;
      }

      if (mode === "signin" && !isEmailAdmin) {
        const reg = getRegisteredUser(emailClean);
        if (!reg) {
          setLoading(false);
          setError("This email is not registered! Please Sign Up first.");
          return;
        }
      }

      const emailName = form.email.split("@")[0];
      const registeredInfo = !isEmailAdmin ? getRegisteredUser(emailClean) : null;
      const displayName = isEmailAdmin ? "System Admin" : (registeredInfo?.name || form.name || emailName.charAt(0).toUpperCase() + emailName.slice(1));
      const generatedMemberId = isEmailAdmin ? undefined : (registeredInfo?.memberId || "LIB-" + Date.now().toString().slice(-5));
      
      if (!isEmailAdmin && mode === "signup") {
        createAndRegisterMember("u-" + Date.now(), generatedMemberId!);
      }

      const fallbackUser: User = {
        id: isEmailAdmin ? "a-test1" : (registeredInfo?.id || "u-" + Date.now()),
        name: displayName,
        email: form.email,
        role: isEmailAdmin ? "admin" : "user",
        avatar: (registeredInfo?.avatar) || displayName.substring(0, 2).toUpperCase(),
        memberId: generatedMemberId,
        adminId: isEmailAdmin ? "ADM-001" : undefined,
      };
      setLoading(false);
      onLogin(fallbackUser);
    };

    if (mode === "signin") {
      signInWithEmailAndPassword(auth, form.email, form.password)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          const errStr = (err?.message || "").toLowerCase();
          if (errStr.includes("api-key") || errStr.includes("api_key") || errStr.includes("invalid") || errStr.includes("network") || errStr.includes("auth/")) {
            // Check if user is registered before fallback login
            if (!isEmailAdmin && !getRegisteredUser(emailClean)) {
              setLoading(false);
              setError("This email is not registered! Please Sign Up first.");
              return;
            }
            performFallbackLogin();
          } else {
            setLoading(false);
            setError(err.message || "Invalid email or password.");
          }
        });
    } else { 
      createUserWithEmailAndPassword(auth, form.email, form.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await updateProfile(user, { displayName: form.name });

          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: form.email,
            name: form.name,
            role: isEmailAdmin ? "admin" : "user",
            createdAt: new Date().toISOString()
          }, { merge: true });
          
          if (!isEmailAdmin) {
            const memberId = "LIB-" + user.uid.substring(0, 5).toUpperCase();
            const newMem = createAndRegisterMember(user.uid, memberId);
            
            try {
              await setDoc(doc(db, "members", memberId), newMem);
            } catch (err) {
              console.warn("Firestore member setDoc failed:", err);
            }
          }
          
          setLoading(false);
          setSuccess("Account created! Sign in to continue."); 
          sm("signin"); 
        })
        .catch((err) => {
          const errStr = (err?.message || "").toLowerCase();
          if (errStr.includes("api-key") || errStr.includes("api_key") || errStr.includes("invalid") || errStr.includes("network") || errStr.includes("auth/")) {
            // Fallback to local demo signup
            performFallbackLogin();
          } else {
            setLoading(false);
            setError(err.message || "Failed to create account.");
          }
        });
    }
  };

  const spines = [
    { h: 100, c: "#c9a96e" }, { h: 132, c: "#4f7ef7" }, { h: 112, c: "#45c9a0" }, 
    { h: 148, c: "#e09d4f" }, { h: 96, c: "#e05c5c" }, { h: 126, c: "#7c5cbf" }, 
    { h: 118, c: "#c9a96e" }, { h: 142, c: "#4f7ef7" }, { h: 108, c: "#45c9a0" }
  ];

  return (
    <div className="auth">
      <div className="auth-blobs">
        <div className="blob" style={{ width: 520, height: 520, background: "#c9a96e", top: "-18%", left: "18%", animationDuration: "15s" }} />
        <div className="blob" style={{ width: 420, height: 420, background: "#4f7ef7", bottom: "-14%", right: "8%", animationDuration: "19s", animationDelay: "2s" }} />
        <div className="blob" style={{ width: 320, height: 320, background: "#45c9a0", top: "42%", left: "-9%", animationDuration: "11s", animationDelay: "4s" }} />
      </div>
      <div className="auth-left">
        <div className="al-bg" /><div className="al-grid" />
        <div className="al-content">
          <div className="auth-brand"><div className="brand-icon">📚</div><div><div className="brand-name">LibraryOS</div><div className="brand-sub">Management System</div></div></div>
          <div className="hero-title">Your <em>knowledge</em><br />hub, reimagined.</div>
          <div className="hero-sub">A complete library management platform — discover, borrow, and manage books with ease.</div>
          <div className="auth-stats">{[{ v: "6,240+", l: "Books" }, { v: "1,800+", l: "Members" }, { v: "98%", l: "Satisfaction" }].map(s => (<div key={s.l}><div className="asv">{s.v}</div><div className="asl">{s.l}</div></div>))}</div>
          <div className="spines">{spines.map((s, i) => <div key={i} className="spine" style={{ height: s.h, width: 22, background: s.c, opacity: .72 }} />)}</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card acard-in">
          <div className="card-title" style={{ color: "var(--a2)" }}>{mode === "signin" ? "Sign In" : "Register Account"}</div>
          <div className="card-sub">{mode === "signin" ? "Welcome back! Enter your credentials to sign in." : "Fill in your details to register."}</div>
          
          {error && <div className="aerr">⚠️ {error}</div>}
          {success && <div className="aok">✅ {success}</div>}
          
          <div className="fg"><label className="fl">Email Address</label><div className="fiw"><span className="fii"><Icon n="mail" s={14} /></span><input className="fi" type="email" placeholder="your.email@example.com" value={form.email} onChange={upd("email")} /></div></div>
          <div className="fg"><label className="fl">Password</label><div className="fiw"><span className="fii"><Icon n="lock" s={14} /></span><input className="fi" type={showPw ? "text" : "password"} placeholder="Enter password" value={form.password} onChange={upd("password")} onKeyDown={e => e.key === "Enter" && submit()} /><button className="eye" onClick={() => setShowPw(!showPw)}><Icon n={showPw ? "eyeoff" : "eye"} s={14} /></button></div></div>
          
          {mode === "signup" && <>
            <div className="fg"><label className="fl">Full Name</label><input className="fi fi-bare" placeholder="Your full name" value={form.name} onChange={upd("name")} /></div>
            <div className="fg"><label className="fl">Phone</label><input className="fi fi-bare" placeholder="10-digit mobile number" value={form.phone} onChange={upd("phone")} /></div>
            <div className="id-req-note"><Icon n="idcard" s={14} /> Government/College ID is <strong>mandatory</strong> for registration</div>
            <div className="frr">
              <div className="fg"><label className="fl">ID Type <span style={{ color: "var(--danger)" }}>*</span></label><select className="fi fi-bare" value={form.idType} onChange={upd("idType")}>{ID_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="fg"><label className="fl">ID Number <span style={{ color: "var(--danger)" }}>*</span></label><input className="fi fi-bare" placeholder="e.g. 1234-5678-9012" value={form.idNumber} onChange={upd("idNumber")} /></div>
            </div>
            <div className="fg"><label className="fl">Member Type</label>
              <div style={{ display: "flex", gap: 7 }}>{["Student", "Staff", "Public"].map(t => <button key={t} className="btn bsm" onClick={() => setForm(f => ({ ...f, memberType: t }))} style={{ flex: 1, background: form.memberType === t ? "var(--a2)" : "var(--surface2)", color: form.memberType === t ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>{t}</button>)}</div>
            </div>
          </>}
          <div style={{ textAlign: "right", marginBottom: 18 }}><span style={{ fontSize: 12.5, color: "var(--accent)", cursor: "pointer" }}>Forgot password?</span></div>
          <button className="abtn abtn-u" onClick={submit} disabled={loading}>{loading ? "Signing in…" : <><Icon n="user" s={15} /> {mode === "signin" ? "Sign In" : "Register"}</>}</button>
          
          <div className="atog">{mode === "signin" ? <>Don't have an account? <span onClick={() => sm("signup")}>Sign Up</span></> : <>Already registered? <span onClick={() => sm("signin")}>Sign In</span></>}</div>
        </div>
      </div>
    </div>
  );
}

