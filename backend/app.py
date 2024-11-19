from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)

CORS(app) 

def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='warframedroppage',
        connection_timeout=600
    )
    return connection

@app.route('/search', methods=['GET'])
def search_items():
    query = request.args.get('query', default='', type=str)
    page = request.args.get('page',default=1,type=int)
    limit = request.args.get('limit',default=20,type=int)
    
    offset = (page - 1) * limit

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()

    all_results = []

    for table in tables:
        table_name = table['Tables_in_warframedroppage']

        cursor.execute(f"DESCRIBE {table_name}")
        columns = cursor.fetchall()

        for column in columns:
            column_name = column['Field']
            
            if 'item' in column_name.lower():
                sql_query = f"SELECT * FROM {table_name} WHERE {column_name} LIKE %s"
                params = [f'%{query}%']
                    
                sql_query+= " LIMIT %s OFFSET %s"
                params.extend([limit,offset])

                cursor.execute(sql_query, params)
                results = cursor.fetchall()

                if results:
                    all_results.append({
                        'table': table_name,
                        'column': column_name,
                        'results': results
                    })
    
    conn.close()

    return jsonify(all_results)

@app.route('/loadall', methods=['GET'])
def load_all_items():
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        all_results = []
        for table in tables:
            table_name = table['Tables_in_warframedroppage']
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 100")
            results = cursor.fetchall()
            if results:
                all_results.append({
                    'table': table_name,
                    'results': results
                })

        return jsonify(all_results)
    except mysql.connector.Error as err:
        print(f"Error during query: {err}")
        return jsonify({'error': 'Query execution failed'}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)