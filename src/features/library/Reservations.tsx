import React from 'react';
import Icon from '../../components/ui/Icon';
import { Book, Member, Reservation } from '../../types';

interface ReservationsProps {
  reservations: Reservation[];
  setReservations: (r: Reservation[]) => void;
  books: Book[];
  members: Member[];
  addToast: (type: string, msg: string) => void;
}

/**
 * Reservations Component
 * The admin hub for managing active holds. Allows staff to see what user requested what book, 
 * and simulate fulfillment or cancellation of that hold.
 */
export default function Reservations({ reservations, setReservations, books, members, addToast }: ReservationsProps) {
  const actRes = reservations.filter(r => r.status === "Active");
  
  /** Helper to change the status of a specific reservation to Fulfilled or Cancelled */
  const mngR = (id: string, st: "Fulfilled" | "Cancelled") => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: st } : r));
    addToast("success", `Reservation ${st.toLowerCase()}`);
  };

  return (
    <div>
      <div className="sh"><div><div className="st">Reservations Console</div><div className="ss">{actRes.length} active queue items</div></div></div>
      <div className="g g3">
        <div className="card sc"><div className="slbl">Active Holds</div><div className="sval" style={{ color: "var(--accent)", fontSize: 26 }}>{actRes.length}</div><div className="sico">🔖</div></div>
        <div className="card sc"><div className="slbl">Pending Fulfillment</div><div className="sval" style={{ color: "var(--a2)", fontSize: 26 }}>{actRes.length}</div><div className="sico">📦</div></div>
        <div className="card sc"><div className="slbl">Cancellation Rate</div><div className="sval" style={{ color: "var(--danger)", fontSize: 26 }}>12%</div><div className="sico">📉</div></div>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: "hidden", marginTop: 24 }}>
        <table className="tbl">
          <thead><tr><th>Member</th><th>Book Requested</th><th>Hold Placed</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td><div style={{ fontWeight: 600 }}>{r.memberName}</div></td>
                <td>{r.bookTitle}</td>
                <td>{r.date}</td>
                <td><span className={r.status === "Active" ? "acc-no" : ""}>{r.expiresDate}</span></td>
                <td><span className={`badge ${r.status === "Active" ? "by" : r.status === "Cancelled" ? "br" : "bg"}`}>{r.status}</span></td>
                <td>
                  {r.status === "Active" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn bg bsm" style={{ color: "var(--a3)" }} onClick={() => mngR(r.id, "Fulfilled")}><Icon n="check" s={12} /></button>
                      <button className="btn bd bsm" onClick={() => mngR(r.id, "Cancelled")}><Icon n="x" s={12} /></button>
                    </div>
                  )}
                  {r.status !== "Active" && <span style={{ fontSize: 11, color: "var(--muted)" }}>Processed</span>}
                </td>
              </tr>
            ))}
            {reservations.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)" }}>No reservation records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

