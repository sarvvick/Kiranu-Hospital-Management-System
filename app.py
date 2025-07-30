from flask import Flask, request, jsonify
from models import db, Patient, Doctor  # Import your database and models here

app = Flask(__name__)

# ...existing code...

@app.route('/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
    # Update patient in your database here (example assumes a SQLAlchemy Patient model)
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    patient.name = data.get('name', patient.name)
    patient.age = data.get('age', patient.age)
    patient.gender = data.get('gender', patient.gender)
    patient.contact_info = data.get('contact_info', patient.contact_info)
    patient.medical_history = data.get('medical_history', patient.medical_history)
    db.session.commit()
    return jsonify({"success": True})

@app.route('/doctors/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    data = request.get_json()
    # Update doctor in your database here (example assumes a SQLAlchemy Doctor model)
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    doctor.name = data.get('name', doctor.name)
    doctor.specialization = data.get('specialization', doctor.specialization)
    doctor.qualifications = data.get('qualifications', doctor.qualifications)
    db.session.commit()
    return jsonify({"success": True})

# ...existing code...