from flask import Blueprint, request, jsonify
from db import mysql
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# Dummy admin credentials (You can later store them in DB)
ADMIN_USERNAME = 'admin'
# Password is 'admin123' hashed using bcrypt
ADMIN_PASSWORD_HASH = bcrypt.generate_password_hash('admin123').decode('utf-8')


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username != ADMIN_USERNAME:
        return jsonify({'msg': 'Invalid username'}), 401

    if not bcrypt.check_password_hash(ADMIN_PASSWORD_HASH, password):
        return jsonify({'msg': 'Invalid password'}), 401

    access_token = create_access_token(identity=username)
    return jsonify({'access_token': access_token}), 200
