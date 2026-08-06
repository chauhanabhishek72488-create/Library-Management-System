import React from 'react';
import Icon from '../../components/ui/Icon';
import { Transaction } from '../../types';
import { calcFine, liveStatus } from '../../utils/helpers';

interface FinesProps {
  txns: Transaction[];
  addToast: (type: string, msg: string) => void;
}

/**
 * Fines Component (Admin Page)
 * Displays a table showing every library member who has currently kept a book past the due date.
 * Calculates their current live fine, and gives an action button to simulate collecting payment.
 */
export default function Fines({ txns, addToast }: FinesProps) {
  const overD = txns.filter(t => liveStatus(t as any) === "Overdue" && t.status !== "Returned");
  
  return (
    <div>
      <div className="sh"><div><div className="st">Fines & Payments</div><div className="ss">Manage pending dues and collections</div></div></div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead><tr><th>Member</th><th>Book</th><th>Due Date</th><th>Current Fine</th><th>Action</th></tr></thead>
          <tbody>
            {overD.map(t => {
              const fine = calcFine(t.dueDate);
              return (
                <tr key={t.id}>
                  <td><div style={{ fontWeight: 600 }}>{t.member}</div></td>
                  <td>{t.book}</td>
                  <td><span className="acc-no">{t.dueDate}</span></td>
                  <td><div className="fine-live fine-pulse" style={{ display: "inline-block" }}>₹{fine}</div></td>
                  <td><button className="btn bp bsm" onClick={() => addToast("success", `Payment link for ₹${fine} sent to ${t.member}.`)}><Icon n="dollar" s={13} /> Collect</button></td>
                </tr>
              )
            })}
            {overD.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)" }}>No outstanding active fines.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

