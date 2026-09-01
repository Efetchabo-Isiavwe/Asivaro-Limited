import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Shield,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  Plus,
  Mail,
  Trash2,
  Globe,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusinessData } from '../../context/BusinessDataContext';
import { UserRole } from '../../types';
import { Modal } from '../common/Modal';

export const SettingsView: React.FC = () => {
  const { currentOrg, updateOrganization, userRole, isDemoMode } = useAuth();
  const { resetToDemoData } = useBusinessData();

  const [orgName, setOrgName] = useState(currentOrg?.name || 'Acme Distribution Nigeria');
  const [currency, setCurrency] = useState(currentOrg?.currency || 'NGN');
  const [currencySymbol, setCurrencySymbol] = useState(currentOrg?.currencySymbol || '₦');
  const [country, setCountry] = useState(currentOrg?.country || 'Nigeria');
  const [industry, setIndustry] = useState(currentOrg?.industry || 'FMCG Wholesale & Distribution');
  const [address, setAddress] = useState(currentOrg?.address || 'Plot 14 Commercial Way, Ikeja, Lagos');
  const [taxId, setTaxId] = useState(currentOrg?.taxId || 'TIN-29481048-0001');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Staff');

  const [members, setMembers] = useState([
    { id: '1', name: 'Dr. Adebayo Ogunlesi', email: 'owner@acme.ng', role: 'Owner', status: 'Active' },
    { id: '2', name: 'Chidinma Eze', email: 'c.eze@acme.ng', role: 'Admin', status: 'Active' },
    { id: '3', name: 'Ibrahim Bello', email: 'ibrahim@acme.ng', role: 'Manager', status: 'Active' },
    { id: '4', name: 'Folake Adeyemi', email: 'folake@acme.ng', role: 'Analyst', status: 'Active' },
    { id: '5', name: 'Emeka Nwosu', email: 'emeka@acme.ng', role: 'Staff', status: 'Active' },
  ]);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrganization({
      name: orgName,
      currency,
      currencySymbol,
      country,
      industry,
      address,
      taxId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDemo = () => {
    resetToDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setMembers([
      ...members,
      {
        id: `mem_${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'Invited',
      },
    ]);

    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const roleMatrix = [
    { role: 'Owner', desc: 'Full workspace ownership, billing, delete org, all AI endpoints', color: 'text-purple-700 bg-purple-50' },
    { role: 'Admin', desc: 'Manage users, adjust credit limits, approve invoices, run audits', color: 'text-blue-700 bg-blue-50' },
    { role: 'Manager', desc: 'Assign operational tasks, edit inventory, log expenses', color: 'text-emerald-700 bg-emerald-50' },
    { role: 'Analyst', desc: 'Query Ask Asivaro AI, generate executive reports, view analytics', color: 'text-amber-700 bg-amber-50' },
    { role: 'Staff', desc: 'Upload documents, update task status, view basic records', color: 'text-neutral-700 bg-neutral-100' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Organization Profile Settings */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-base text-neutral-900">Organization Profile</h3>
              <p className="text-xs text-neutral-500">Workspace business details, default currency & tax identifiers</p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Changes Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Company / Enterprise Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Industry Sector</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Operating Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-medium"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Rwanda">Rwanda</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  if (e.target.value === 'NGN') setCurrencySymbol('₦');
                  else if (e.target.value === 'GHS') setCurrencySymbol('GH₵');
                  else if (e.target.value === 'KES') setCurrencySymbol('KSh');
                  else if (e.target.value === 'USD') setCurrencySymbol('$');
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-semibold"
              >
                <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                <option value="GHS">GHS (Ghanaian Cedi - GH₵)</option>
                <option value="KES">KES (Kenyan Shilling - KSh)</option>
                <option value="USD">USD (US Dollar - $)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Tax Identification Number (TIN)</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-700 block mb-1">Operating Commercial Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
            >
              Save Organization Settings
            </button>
          </div>
        </form>
      </div>

      {/* Team Members & RBAC Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-base text-neutral-900">Team Members & Access Control (RBAC)</h3>
              <p className="text-xs text-neutral-500">Manage user roles, operational clearance & invites</p>
            </div>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Member Table */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {members.map((mem) => (
                <tr key={mem.id} className="hover:bg-neutral-50/60">
                  <td className="p-3 font-bold text-neutral-900">{mem.name}</td>
                  <td className="p-3 text-neutral-600">{mem.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {mem.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mem.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {mem.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {mem.role !== 'Owner' && (
                      <button
                        onClick={() => setMembers(members.filter((m) => m.id !== mem.id))}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Permissions Reference */}
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <h4 className="text-xs font-bold text-neutral-900 mb-2">Role Permissions Reference</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {roleMatrix.map((rm) => (
              <div key={rm.role} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${rm.color}`}>
                  {rm.role}
                </span>
                <p className="text-[11px] text-neutral-600 mt-1">{rm.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Data & System Maintenance */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 mb-4">
          <RotateCcw className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-extrabold text-base text-neutral-900">Demo & Sandbox Controls</h3>
            <p className="text-xs text-neutral-500">Restore default Nigerian SME dataset for demonstration testing</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <div>
            <h4 className="text-xs font-bold text-amber-900">Reset Ledger to Clean Nigerian SME Demo Dataset</h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Re-populates realistic Nigerian SME customers (Danladi Supermarkets, Lekki MegaMart), invoices, AGO diesel spikes, inventory catalog, and AI insights.
            </p>
          </div>

          <button
            id="btn-reset-demo-data"
            onClick={handleResetDemo}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shrink-0 shadow-xs"
          >
            {resetSuccess ? 'Ledger Reset Successfully!' : 'Reset Demo Data'}
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Workspace Member"
          subtitle="Add colleagues with defined role clearance"
          maxWidth="sm"
        >
          <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@acme.ng"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Role Clearance</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-bold"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Analyst">Analyst</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
