import networkx as nx
import matplotlib.pyplot as plt

def build_topology():
    G = nx.Graph()
    gateway = "Gateway"
    G.add_node(gateway, type="gw")

    # Define nodes
    consensus_nodes = [f"Consensus-{i+1}" for i in range(3)]
    sensor_nodes = [f"Sensor-{i+1}" for i in range(2)]

    # Add consensus nodes and connect to gateway
    for node in consensus_nodes:
        G.add_node(node, type="consensus")
        G.add_edge(node, gateway)

    # Add sensor nodes and connect to gateway
    for node in sensor_nodes:
        G.add_node(node, type="sensor")
        G.add_edge(node, gateway)

    # Connect consensus nodes to each other
    for i in range(len(consensus_nodes)):
        for j in range(i+1, len(consensus_nodes)):
            G.add_edge(consensus_nodes[i], consensus_nodes[j])

    return G

if __name__ == "__main__":
    G = build_topology()
    pos = nx.spring_layout(G)
    node_colors = [
        "orange" if G.nodes[n]["type"] == "gw" else
        "green" if G.nodes[n]["type"] == "consensus" else
        "skyblue" for n in G.nodes()
    ]
    nx.draw(G, pos, with_labels=True, node_color=node_colors, node_size=800)
    plt.title("IoT Network Topology — 3 Consensus, 2 Sensors, 1 Gateway")
    plt.show()