const API_URL = "http://localhost:5000";

export async function registerPatient(data) {
  return fetch(`${API_URL}/patients/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function registerDoctor(data) {
  return fetch(`${API_URL}/doctors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getDoctorAvailability(doctorId) {
  return fetch(`${API_URL}/doctors/${doctorId}/availability`);
}

export async function bookAppointment(data) {
  return fetch(`${API_URL}/appointments/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function listDoctors() {
  return fetch(`${API_URL}/doctors/list`);
}
