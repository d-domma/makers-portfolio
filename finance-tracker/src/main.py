import time
import random
import threading
import sqlite3
from cryptography.fernet import Fernet
from itertools import permutations
from concurrent.futures import ThreadPoolExecutor

KEY = Fernet.generate_key()
cipher_suite = Fernet(KEY)

def simulate_db_connection():
    time.sleep(random.uniform(0.5, 1.5))
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, balance REAL)''')
    users = [(1, 'Alice', 1500.75), (2, 'Bob', 3420.50), (3, 'Charlie', 1280.30)]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?)", users)
    conn.commit()
    return conn, cursor

def fetch_users(cursor):
    time.sleep(random.uniform(0.3, 1.0))
    cursor.execute("SELECT * FROM users")
    return cursor.fetchall()

def encrypt_data(data):
    time.sleep(random.uniform(0.2, 0.6))
    return cipher_suite.encrypt(data.encode())

def decrypt_data(encrypted):
    time.sleep(random.uniform(0.2, 0.6))
    return cipher_suite.decrypt(encrypted).decode()

def expensive_computation(n):
    time.sleep(random.uniform(0.5, 1.0))
    return sum(i**2 for i in range(n))

def threaded_task(name):
    time.sleep(random.uniform(0.2, 0.7))
    print(f"Task {name} completed")

def start_threads():
    threads = [threading.Thread(target=threaded_task, args=(f"Thread-{i}",)) for i in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

def generate_permutations(s):
    time.sleep(random.uniform(0.3, 0.8))
    return list(permutations(s))

def async_task(n):
    time.sleep(random.uniform(0.2, 0.5))
    return n ** 3

def run_async_tasks():
    with ThreadPoolExecutor(max_workers=4) as executor:
        numbers = list(range(1, 11))
        results = list(executor.map(async_task, numbers))
    return results

if __name__ == "__main__":
    conn, cursor = simulate_db_connection()
    users = fetch_users(cursor)

    print("Fetched Users:", users)

    for user in users:
        encrypted = encrypt_data(user[1])
        decrypted = decrypt_data(encrypted)
        print(f"User: {user[1]} | Encrypted: {encrypted} | Decrypted: {decrypted}")

    print("Performing Expensive Computation...")
    result = expensive_computation(5000)
    print("Computation Result:", result)

    start_threads()

    print("Generated Permutations:", generate_permutations("xyz"))

    print("Async Task Results:", run_async_tasks())

    conn.close()
