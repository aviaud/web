from flask import Flask, request, jsonify, render_template
import sqlite3
import os

app = Flask(__name__)

# Ruta al archivo de base de datos
DATABASE = os.path.join(os.path.dirname(__file__), 'kardex.db')

def conectar_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/guardar_producto', methods=['POST'])
def guardar_producto():
    data = request.get_json()
    try:
        nombre = data.get('nombre')
        cantidad = int(data.get('cantidad'))
        precio = float(data.get('precio'))
        total = float(data.get('total'))

        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO productos (nombre, cantidad, precio, total) VALUES (?, ?, ?, ?)",
            (nombre, cantidad, precio, total)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Producto guardado correctamente.'})
    except Exception as e:
        return jsonify({'message': f'Error al guardar: {str(e)}'}), 500

@app.route('/productos')
def obtener_productos():
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM productos")
        productos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'productos': productos})
    except Exception as e:
        return jsonify({'message': f'Error al obtener productos: {str(e)}'}), 500

@app.route('/eliminar_producto/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM productos WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Producto eliminado correctamente.'})
    except Exception as e:
        return jsonify({'message': f'Error al eliminar: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
