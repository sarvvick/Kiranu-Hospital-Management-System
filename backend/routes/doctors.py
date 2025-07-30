from flask import Blueprint, request, jsonify
from db import mysql
from flask_jwt_extended import jwt_required

doctors_bp = Blueprint('doctors', __name__)

# Add a new doctor
@doctors_bp.route('/add', methods=['POST'])
@jwt_required()
def add_doctor():
    data = request.get_json()
    name = data.get('name')
    specialization = data.get('specialization')
    qualifications = data.get('qualifications')
    experience = data.get('experience')
    availability = data.get('availability')

    cursor = mysql.connection.cursor()
    sql = "INSERT INTO doctors (name, specialization, qualifications, experience, availability) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (name, specialization, qualifications, experience, availability))
    mysql.connection.commit()

    return jsonify({'msg': 'Doctor added successfully'}), 201


# Get all doctors
@doctors_bp.route('/all', methods=['GET'])
@jwt_required()
def get_doctors():
    cursor = mysql.connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctors")
    doctors = cursor.fetchall()
    return jsonify(doctors), 200


# Update doctor
@doctors_bp.route('/update/<int:doctor_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doctor_id):
    data = request.get_json()
    name = data.get('name')
    specialization = data.get('specialization')
    qualifications = data.get('qualifications')
    experience = data.get('experience')
    availability = data.get('availability')

    cursor = mysql.connection.cursor()
    sql = """UPDATE doctors SET name=%s, specialization=%s, qualifications=%s, experience=%s, availability=%s WHERE id=%s"""
    cursor.execute(sql, (name, specialization, qualifications, experience, availability, doctor_id))
    mysql.connection.commit()

    return jsonify({'msg': 'Doctor updated successfully'}), 200


# Delete doctor
@doctors_bp.route('/delete/<int:doctor_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(doctor_id):
    cursor = mysql.connection.cursor()
    sql = "DELETE FROM doctors WHERE id = %s"
    cursor.execute(sql, (doctor_id,))
    mysql.connection.commit()

    return jsonify({'msg': 'Doctor deleted successfully'}), 200
