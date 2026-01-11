import type { User, B2BRegistration } from "@/types";
import { MOCK_USERS, MOCK_REGISTRATIONS } from "./mockData";

const USERS_KEY = "crm_users";
const REGISTRATIONS_KEY = "crm_registrations";

// Initialize localStorage with mock data if empty
export function initializeData(): void {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(REGISTRATIONS_KEY)) {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(MOCK_REGISTRATIONS));
  }
}

// Users
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(id: string, updates: Partial<User>): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
}

export function deleteUser(id: string): void {
  const users = getUsers().filter((u) => u.id !== id);
  saveUsers(users);
}

// Registrations
export function getRegistrations(): B2BRegistration[] {
  const data = localStorage.getItem(REGISTRATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRegistrations(registrations: B2BRegistration[]): void {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
}

export function addRegistration(registration: B2BRegistration): void {
  const registrations = getRegistrations();
  registrations.unshift(registration);
  saveRegistrations(registrations);
}

export function updateRegistration(
  id: string,
  updates: Partial<B2BRegistration>
): void {
  const registrations = getRegistrations();
  const index = registrations.findIndex((r) => r.id === id);
  if (index !== -1) {
    registrations[index] = {
      ...registrations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveRegistrations(registrations);
  }
}

export function deleteRegistration(id: string): void {
  const registrations = getRegistrations().filter((r) => r.id !== id);
  saveRegistrations(registrations);
}

// Reset data to mock data
export function resetData(): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(MOCK_REGISTRATIONS));
}
