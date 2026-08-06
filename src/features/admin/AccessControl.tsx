import React from 'react';
import Icon from '../../components/ui/Icon';

/**
 * AccessControl Page
 * This is a static, read-only page showing the permissions associated with different user roles
 * (Chief Librarian, Senior Librarian, Librarian, Member).
 */
export default function AccessControl() {
  const roles = [
    { name: "Chief Librarian", c: "var(--danger)", p: ["Full system access", "Manage staff accounts", "Configure library rules", "View all reports", "Delete records"] },
    { name: "Senior Librarian", c: "var(--accent)", p: ["Issue & return books", "Manage members", "Send notifications", "View analytics", "Register members"] },
    { name: "Librarian", c: "var(--a2)", p: ["Issue & return books", "View member info", "Add new books", "Basic reports", "OPAC management"] },
    { name: "Member", c: "var(--a3)", p: ["Browse OPAC", "Reserve books", "View own history", "AI recommendations", "Write book reviews"] },
  ];

  return (
    <div>
      <div className="sh"><div><div className="st">Access Control</div><div className="ss">Role-based permissions</div></div></div>
      <div className="g g4">
        {roles.map(r => (
          <div key={r.name} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${r.c}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon n="shield" s={15} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.p.length} permissions</div>
              </div>
            </div>
            {r.p.map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: r.c }}><Icon n="check" s={12} /></span>{p}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

