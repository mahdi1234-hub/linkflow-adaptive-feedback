import flwr as fl
import numpy as np
import multiprocessing
import time
from fl_engine import FeedbackClient, start_fl_server

def run_client(client_id: int):
    print(f"Starting Client {client_id}...")
    # In a real scenario, this would use local data
    # For simulation, we just start the client
    try:
        fl.client.start_numpy_client(
            server_address="127.0.0.1:8080",
            client=FeedbackClient(),
        )
    except Exception as e:
        print(f"Client {client_id} error: {e}")

def simulate_federated_learning():
    # 1. Start Server in a process
    server_process = multiprocessing.Process(target=start_fl_server)
    server_process.start()
    
    # Give the server a moment to start
    time.sleep(3)
    
    # 2. Start 3 Clients in processes
    client_processes = []
    for i in range(3):
        p = multiprocessing.Process(target=run_client, args=(i+1,))
        p.start()
        client_processes.append(p)
        time.sleep(1) # Stagger client starts
    
    # 3. Wait for clients to finish (server is set to 3 rounds)
    for p in client_processes:
        p.join()
    
    print("All clients finished. Terminating server...")
    server_process.terminate()
    server_process.join()
    print("Federated Learning Simulation Complete.")

if __name__ == "__main__":
    simulate_federated_learning()
