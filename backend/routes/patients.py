from flask import Blueprint, request, jsonify
from db import mysql
from flask_jwt_extended import jwt_required

patients_bp = Blueprint('patients', __name__)

# Add a new patient
@patients_bp.route('/add', methods=['POST'])
@jwt_required()
def add_patient():
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    contact = data.get('contact')
    medical_history = data.get('medical_history')

    cursor = mysql.connection.cursor()
    sql = "INSERT INTO patients (name, age, gender, contact, medical_history) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (name, age, gender, contact, medical_history))
    mysql.connection.commit()

    return jsonify({'msg': 'Patient added successfully'}), 201


# Get all patients
@patients_bp.route('/all', methods=['GET'])
@jwt_required()
def get_patients():
    cursor = mysql.connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM patients")
    patients = cursor.fetchall()
    return jsonify(patients), 200


# Update patient
@patients_bp.route('/update/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    contact = data.get('contact')
    medical_history = data.get('medical_history')

    cursor = mysql.connection.cursor()
    sql = """UPDATE patients SET name=%s, age=%s, gender=%s, contact=%s, medical_history=%s WHERE id=%s"""
    cursor.execute(sql, (name, age, gender, contact, medical_history, patient_id))
    mysql.connection.commit()

    return jsonify({'msg': 'Patient updated successfully'}), 200


# Delete patient
@patients_bp.route('/delete/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    cursor = mysql.connection.cursor()
    sql = "DELETE FROM patients WHERE id = %s"
    cursor.execute(sql, (patient_id,))
    mysql.connection.commit()

    return jsonify({'msg': 'Patient deleted successfully'}), 200
