# Security Spec: فوج الطيب المحيري - تطاوين (Scout Troop Management)

## 1. Data Invariants
1. **Role Separation**: Parents can only access/register their own children (`parentId == request.auth.uid`).
2. **Section Isolation**: Section Leaders can only view, create technical notes, monthly programs, and activity outputs for their assigned section.
3. **Pedagogical Privacy**: Approved technical notes expose only general activity details (title, date, location, duration, supplies to bring) to parents; internal pedagogical goals and leader notes are hidden from parents.
4. **Troop Leader Authority**: Only Troop Leader (Admin, `codeopen540@gmail.com` or users with `role == 'troop_leader'`) can approve/reject/modify technical notes, approve scout registrations, or manage leaders.
5. **Approved Note Immutability**: Once a technical note is marked `approved`, it is sealed and cannot be modified by any section leader.
6. **Audit Trail**: Audit log entries are strictly append-only and immutable.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Parent Accessing Other Parent's Child**: Read request to `/members/child_99` by `user_parent_2` where `parentId == 'user_parent_1'`. -> Expected: PERMISSION_DENIED.
2. **Section Leader Modifying Other Section's Note**: Update request to `/technical_notes/note_1` (section 'ashbal') by leader assigned to 'zaharat'. -> Expected: PERMISSION_DENIED.
3. **Section Leader Self-Approving Technical Note**: Update request to `/technical_notes/note_1` setting `status: 'approved'` without troop leader authorization. -> Expected: PERMISSION_DENIED.
4. **Altering Sealed Approved Note**: Leader tries to edit a note that is already `status: 'approved'`. -> Expected: PERMISSION_DENIED.
5. **Parent Direct Access to Raw Internal Notes**: Parent querying full pedagogical internal fields of unapproved notes. -> Expected: PERMISSION_DENIED.
6. **Unauthorized Role Escalation in User Profile**: New user registration setting `role: 'troop_leader'`. -> Expected: PERMISSION_DENIED.
7. **Adversary Tampering with Audit Logs**: Update or delete request to `/audit_logs/log_123`. -> Expected: PERMISSION_DENIED.
8. **Malicious Giant String (Denial of Wallet)**: Creating member with `fullName` > 10,000 chars. -> Expected: PERMISSION_DENIED.
9. **Fake Payment Recording by Parent**: Parent attempting to write `isPaid: true` to `/subscriptions/sub_1`. -> Expected: PERMISSION_DENIED.
10. **Unauthenticated List Query**: Anonymous query without authentication token to `/members`. -> Expected: PERMISSION_DENIED.
11. **Impersonating Message Author**: User A sending message with `senderId: 'user_B'`. -> Expected: PERMISSION_DENIED.
12. **Tampering with Member Approval Status**: Parent updating their own child's status from `pending` to `approved`. -> Expected: PERMISSION_DENIED.
