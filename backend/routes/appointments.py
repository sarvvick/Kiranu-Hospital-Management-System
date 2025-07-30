from flask import Blueprint, request, jsonify
from db import mysql
from flask_jwt_extended import jwt_required

appointments_bp = Blueprint('appointments', __name__)

# Add a new appointment
@appointments_bp.route('/add', methods=['POST'])
@jwt_required()
def add_appointment():
    data = request.get_json()
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')
    date = data.get('date')
    time = data.get('time')

    cursor = mysql.connection.cursor(dictionary=True)

    # Check if doctor exists
    cursor.execute("SELECT * FROM doctors WHERE id = %s", (doctor_id,))
    doctor = cursor.fetchone()
    if not doctor:
        return jsonify({'msg': 'Doctor not found'}), 404

    # Check if patient exists
    cursor.execute("SELECT * FROM patients WHERE id = %s", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        return jsonify({'msg': 'Patient not found'}), 404

    # Optional: You can implement availability logic here

    # Insert appointment
    sql = "INSERT INTO appointments (patient_id, doctor_id, date, time) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (patient_id, doctor_id, date, time))
    mysql.connection.commit()

    return jsonify({'msg': 'Appointment added successfully'}), 201


# Get all appointments with patient and doctor names
@appointments_bp.route('/all', methods=['GET'])
@jwt_required()
def get_appointments():
    cursor = mysql.connection.cursor(dictionary=True)
    sql = """
    SELECT a.id, p.name AS patient_name, d.name AS doctor_name, d.specialization, a.date, a.time
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    ORDER BY a.date, a.time
    """
    cursor.execute(sql)
    appointments = cursor.fetchall()
    return jsonify(appointments), 200


# Delete appointment
@appointments_bp.route('/delete/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    cursor = mysql.connection.cursor()
    sql = "DELETE FROM appointments WHERE id = %s"
    cursor.execute(sql, (appointment_id,))
    mysql.connection.commit()

    return jsonify({'msg': 'Appointment deleted successfully'}), 200
