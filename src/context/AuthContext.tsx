import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  db
} from '../lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, Organization, OrganizationMember, UserRole } from '../types';
import { demoOrganization, demoMembers } from '../lib/demoData';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  currentOrg: Organization | null;
  userRole: UserRole;
  userOrganizations: Organization[];
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role?: UserRole) => void;
  logout: () => Promise<void>;
  createOrganization: (orgData: Partial<Organization>) => Promise<Organization>;
  switchOrganization: (orgId: string) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(demoOrganization);
  const [userRole, setUserRole] = useState<UserRole>('Owner');
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([demoOrganization]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Initialize demo user by default for instant live experience
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsDemoMode(false);
        try {
          // Sync user to Firestore
          const userRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userRef);

          let profile: UserProfile;
          if (userSnap.exists()) {
            profile = userSnap.data() as UserProfile;
          } else {
            profile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Asivaro Operator',
              photoURL: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, profile);
          }
          setCurrentUser(profile);

          // Fetch organizations the user belongs to
          const membersQuery = query(
            collection(db, 'organizationMembers'),
            where('userId', '==', fbUser.uid)
          );
          const membersSnap = await getDocs(membersQuery);

          if (!membersSnap.empty) {
            const orgIds = membersSnap.docs.map((d) => d.data().organizationId);
            const orgsList: Organization[] = [];

            for (const oId of orgIds) {
              const oSnap = await getDoc(doc(db, 'organizations', oId));
              if (oSnap.exists()) {
                orgsList.push(oSnap.data() as Organization);
              }
            }

            if (orgsList.length > 0) {
              setUserOrganizations(orgsList);
              const activeOrg = orgsList.find((o) => o.id === profile.currentOrgId) || orgsList[0];
              setCurrentOrg(activeOrg);

              const activeMember = membersSnap.docs.find((d) => d.data().organizationId === activeOrg.id);
              if (activeMember) {
                setUserRole(activeMember.data().role as UserRole);
              }
            } else {
              // Create default Nigerian SME organization for user
              await createInitialUserOrg(profile);
            }
          } else {
            // First time user, create default Nigerian workspace
            await createInitialUserOrg(profile);
          }
        } catch (err) {
          console.warn('Firestore user auth sync error, using fallback:', err);
          setupFallbackDemo();
        }
      } else {
        setupFallbackDemo();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupFallbackDemo = () => {
    setIsDemoMode(true);
    setCurrentUser({
      id: 'user_demo_owner',
      email: 'efeisiavwe@gmail.com',
      displayName: 'Efe Isiavwe',
      currentOrgId: demoOrganization.id,
      createdAt: '2025-01-15T08:00:00.000Z',
    });
    setCurrentOrg(demoOrganization);
    setUserRole('Owner');
    setUserOrganizations([demoOrganization]);
  };

  const createInitialUserOrg = async (profile: UserProfile): Promise<Organization> => {
    const orgId = `org_${Date.now()}`;
    const newOrg: Organization = {
      id: orgId,
      name: `${profile.displayName.split(' ')[0]}'s Business Operations`,
      tagline: 'African SME Commerce & Logistics Hub',
      currency: 'NGN',
      currencySymbol: '₦',
      country: 'Nigeria',
      industry: 'FMCG & Wholesale Distribution',
      taxId: `TIN-${Math.floor(10000000 + Math.random() * 90000000)}-0001`,
      address: 'Ikeja Commercial District, Lagos, Nigeria',
      ownerId: profile.id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'organizations', orgId), newOrg);
      const member: OrganizationMember = {
        id: `mem_${Date.now()}`,
        organizationId: orgId,
        userId: profile.id,
        email: profile.email,
        displayName: profile.displayName,
        role: 'Owner',
        joinedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'organizationMembers', member.id), member);

      // Update user currentOrgId
      await setDoc(doc(db, 'users', profile.id), { currentOrgId: orgId }, { merge: true });

      setUserOrganizations([newOrg]);
      setCurrentOrg(newOrg);
      setUserRole('Owner');
      return newOrg;
    } catch (e) {
      console.warn('Could not persist organization to Firestore, holding in local memory:', e);
      setUserOrganizations([newOrg]);
      setCurrentOrg(newOrg);
      setUserRole('Owner');
      return newOrg;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      alert('Google Sign-In failed: ' + (err.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = (role: UserRole = 'Owner') => {
    setIsDemoMode(true);
    const demoMember = demoMembers.find((m) => m.role === role) || demoMembers[0];
    setCurrentUser({
      id: demoMember.userId,
      email: demoMember.email,
      displayName: demoMember.displayName,
      currentOrgId: demoOrganization.id,
      createdAt: '2025-01-15T08:00:00.000Z',
    });
    setCurrentOrg(demoOrganization);
    setUserRole(role);
    setUserOrganizations([demoOrganization]);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (firebaseUser) {
        await fbSignOut(auth);
      }
      setupFallbackDemo();
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrganization = async (orgData: Partial<Organization>): Promise<Organization> => {
    const orgId = `org_${Date.now()}`;
    const newOrg: Organization = {
      id: orgId,
      name: orgData.name || 'New Enterprise',
      tagline: orgData.tagline || 'Modern Operating System',
      currency: orgData.currency || 'NGN',
      currencySymbol: orgData.currencySymbol || '₦',
      country: orgData.country || 'Nigeria',
      industry: orgData.industry || 'FMCG & Wholesale Distribution',
      taxId: orgData.taxId || `TIN-${Math.floor(10000000 + Math.random() * 90000000)}-0001`,
      address: orgData.address || 'Lagos, Nigeria',
      ownerId: currentUser?.id || 'demo_user',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'organizations', orgId), newOrg);
      if (currentUser) {
        const member: OrganizationMember = {
          id: `mem_${Date.now()}`,
          organizationId: orgId,
          userId: currentUser.id,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: 'Owner',
          joinedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'organizationMembers', member.id), member);
      }
    } catch (e) {
      console.warn('Creating org offline / fallback:', e);
    }

    setUserOrganizations((prev) => [...prev, newOrg]);
    setCurrentOrg(newOrg);
    setUserRole('Owner');
    return newOrg;
  };

  const switchOrganization = async (orgId: string) => {
    const target = userOrganizations.find((o) => o.id === orgId);
    if (target) {
      setCurrentOrg(target);
      if (currentUser && !isDemoMode) {
        try {
          await setDoc(doc(db, 'users', currentUser.id), { currentOrgId: orgId }, { merge: true });
        } catch (e) {
          console.warn('Failed to persist switch org:', e);
        }
      }
    }
  };

  const switchRole = (newRole: UserRole) => {
    setUserRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        currentOrg,
        userRole,
        userOrganizations,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        loginAsDemoUser,
        logout,
        createOrganization,
        switchOrganization,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
