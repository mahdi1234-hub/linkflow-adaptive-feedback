import flwr as fl
import numpy as np
from typing import List, Tuple, Dict, Optional
from flwr.common import Metrics

# Define Flower client
class FeedbackClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        return [np.array([1.0, 2.0, 3.0])] # Placeholder parameters

    def fit(self, parameters, config):
        # Update model parameters based on local feedback data
        new_params = [p + 0.1 for p in parameters]
        return new_params, 1, {}

    def evaluate(self, parameters, config):
        # Evaluate model on local data
        return 0.1, 1, {"accuracy": 0.95}

def weighted_average(metrics: List[Tuple[int, Metrics]]) -> Metrics:
    # Aggregation function for metrics
    accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
    examples = [num_examples for num_examples, _ in metrics]
    return {"accuracy": sum(accuracies) / sum(examples)}

def start_fl_server():
    # Define strategy
    strategy = fl.server.strategy.FedAvg(
        evaluate_metrics_aggregation_fn=weighted_average,
    )

    # Start Flower server
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=3),
        strategy=strategy,
    )

if __name__ == "__main__":
    start_fl_server()
