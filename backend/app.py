from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import threading
import time
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root@localhost:3306/test'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    contact_info = db.Column(db.String(100))
    medical_history = db.Column(db.String(500))


class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    specialization = db.Column(db.String(100))
    qualifications = db.Column(db.String(200))
    availability_schedule = db.Column(db.Text)  # Store as JSON list


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    appointment_datetime = db.Column(db.String(100))
    app_status = db.Column(db.String(20))  # 'Upcoming' or 'Past'


class UserCredentials(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20))  # 'patient' or 'doctor'
    password = db.Column(db.String(200))  # stores hashed password


with app.app_context():

    db.create_all()


@app.route('/patients/register', methods=['POST'])
def register_patient():
    data = request.get_json()
    patient = Patient(
        name=data['name'],
        age=data['age'],
        gender=data['gender'],
        contact_info=data['contact_info'],
        medical_history=data['medical_history']
    )
    db.session.add(patient)
    db.session.commit()
    # Register user credentials with generated id
    hashed_password = generate_password_hash(data['password'])
    user = UserCredentials(
        id=patient.id,
        role='patient',
        password=hashed_password
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Patient registered", "id": patient.id})


@app.route('/doctors/register', methods=['POST'])
def register_doctor():
    data = request.get_json()
    doctor = Doctor(
        name=data['name'],
        specialization=data['specialization'],
        qualifications=data['qualifications'],
        availability_schedule=json.dumps(data['availability_schedule'])
    )
    db.session.add(doctor)
    db.session.commit()
    # Register user credentials with generated id
    hashed_password = generate_password_hash(data['password'])
    user = UserCredentials(
        id=doctor.id,
        role='doctor',
        password=hashed_password
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Doctor registered", "id": doctor.id})


@app.route('/doctors/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    availability = json.loads(doctor.availability_schedule)
    return jsonify({"availability": availability})


@app.route('/appointments/book', methods=['POST'])
def book_appointment():
    from datetime import datetime
    data = request.get_json()
    # Defensive: check required fields
    if 'patient_id' not in data or 'doctor_id' not in data or 'appointment_datetime' not in data:
        return jsonify({"error": "Missing required fields: patient_id, doctor_id, appointment_datetime"}), 400
    appt_time = datetime.strptime(data['appointment_datetime'], "%Y-%m-%dT%H:%M")
    now = datetime.now()
    status = 'Upcoming' if appt_time > now else 'Past'
    appointment = Appointment(
        patient_id=data['patient_id'],
        doctor_id=data['doctor_id'],
        appointment_datetime=data['appointment_datetime'],
        app_status=status
    )
    db.session.add(appointment)
    doctor = Doctor.query.get(data['doctor_id'])
    availability = json.loads(doctor.availability_schedule)
    if data['appointment_datetime'] in availability:
        availability.remove(data['appointment_datetime'])
        doctor.availability_schedule = json.dumps(availability)
    db.session.commit()
    return jsonify({"message": "Appointment booked"})


@app.route('/user_credentials/register', methods=['POST'])
def register_user_credentials():
    data = request.get_json()
    from random import randint
    existing_user = UserCredentials.query.filter_by(id=data['id']).first()
    user_id = data['id']
    # If id exists, generate a random one not in use
    while existing_user:
        user_id = randint(100000, 999999)
        existing_user = UserCredentials.query.filter_by(id=user_id).first()
    hashed_password = generate_password_hash(data['password'])
    user = UserCredentials(
        id=user_id,
        role=data['role'],
        password=hashed_password
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User credentials registered', 'id': user_id})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = UserCredentials.query.filter_by(id=data['id'], role=data['role']).first()
    if user and check_password_hash(user.password, data['password']):
        # Fetch user info and appointments
        info = None
        appointments = []
        if data['role'] == 'patient':
            info = Patient.query.filter_by(id=data['id']).first()
            appointments = Appointment.query.filter_by(patient_id=data['id']).all()
        elif data['role'] == 'doctor':
            info = Doctor.query.filter_by(id=data['id']).first()
            appointments = Appointment.query.filter_by(doctor_id=data['id']).all()
        info_dict = info.__dict__.copy() if info else {}
        info_dict.pop('_sa_instance_state', None)
        appointments_list = [a.__dict__.copy() for a in appointments]
        for a in appointments_list:
            a.pop('_sa_instance_state', None)
        return jsonify({'info': info_dict, 'appointments': appointments_list})
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/doctors/<int:doctor_id>/availability', methods=['POST'])
def add_doctor_availability(doctor_id):
    data = request.get_json()
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    availability = json.loads(doctor.availability_schedule) if doctor.availability_schedule else []
    availability.append(data['slot'])
    doctor.availability_schedule = json.dumps(availability)
    db.session.commit()
    return jsonify({'message': 'Availability updated', 'availability': availability})


@app.route('/appointments/update_status', methods=['POST'])
def update_appointment_status():
    from datetime import datetime
    appointments = Appointment.query.all()
    now = datetime.now()
    updated = 0
    for appt in appointments:
        try:
            appt_time = datetime.strptime(appt.appointment_datetime, "%Y-%m-%dT%H:%M")
        except Exception:
            continue
        status = 'Upcoming' if appt_time > now else 'Past'
        if appt.app_status != status:
            appt.app_status = status
            updated += 1
    db.session.commit()
    return jsonify({'message': f'Updated {updated} appointments.'})


def update_appointment_status_periodically():
    while True:
        with app.app_context():
            from datetime import datetime
            appointments = Appointment.query.all()
            now = datetime.now()
            for appt in appointments:
                try:
                    appt_time = datetime.strptime(appt.appointment_datetime, "%Y-%m-%dT%H:%M")
                except Exception:
                    continue
                status = 'Upcoming' if appt_time > now else 'Past'
                if appt.app_status != status:
                    appt.app_status = status
            db.session.commit()
        time.sleep(60)


@app.route('/doctors/list', methods=['GET'])
def list_doctors():
    doctors = Doctor.query.all()
    doctor_list = [
        {
            'id': d.id,
            'name': d.name,
            'specialization': d.specialization
        } for d in doctors
    ]
    return jsonify({'doctors': doctor_list})


@app.route('/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
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
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    doctor.name = data.get('name', doctor.name)
    doctor.specialization = data.get('specialization', doctor.specialization)
    doctor.qualifications = data.get('qualifications', doctor.qualifications)
    db.session.commit()
    return jsonify({"success": True})


@app.route('/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    data = patient.__dict__.copy()
    data.pop('_sa_instance_state', None)
    return jsonify(data)


@app.route('/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    data = doctor.__dict__.copy()
    data.pop('_sa_instance_state', None)
    return jsonify(data)


@app.route('/appointments/patient/<int:patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()
    appointments_list = [a.__dict__.copy() for a in appointments]
    for a in appointments_list:
        a.pop('_sa_instance_state', None)
    return jsonify({'appointments': appointments_list})


@app.route('/appointments/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    appointments_list = [a.__dict__.copy() for a in appointments]
    for a in appointments_list:
        a.pop('_sa_instance_state', None)
    return jsonify({'appointments': appointments_list})


threading.Thread(target=update_appointment_status_periodically, daemon=True).start()


if __name__ == '__main__':
    app.run(debug=True)
