
export function maxDagEdges(numNodes) {
    return (numNodes - 1) * (numNodes / 2)
}

function sampleWithoutReplacement(choices) {
    let chosenIndex = parseInt(Math.random() * choices.length)
    let choice = choices.splice(chosenIndex, 1) // Reads "remove 1 element from array starting at X"
    return choice[0]
}

export function randInt(lowerInclusive, upperInclusive) {
    return parseInt(lowerInclusive + (Math.random() * (upperInclusive - lowerInclusive + 1)))
}

function bfsUndirected(edges, startingNodeID) {
    /*
    edges ~ {
        nodeID: [nodeID2, ...],
    }
     */
    let queue = [startingNodeID]
    let visited = [startingNodeID]

    while (queue.length > 0) {
        var nodeID = queue.shift() // left pop
        edges[nodeID].forEach(connectedID => {
            if (visited.indexOf(connectedID.toString()) < 0) {
                visited.push(connectedID.toString())
                queue.push(connectedID.toString())
            }
        })
    }

    return visited
}

export function dagToUndirected(edges) {
    let undirectedEdges = {...edges}

    let edgesUndirected = {}
    Object.keys(edges).forEach(nodeID => {
        edgesUndirected[nodeID] = []
    })

    Object.keys(edges).forEach(fromID => {
        edges[fromID].forEach(toID => {
            if (!(toID in edgesUndirected[fromID])) {
                edgesUndirected[fromID].push(toID)
            }

            if (!(fromID in edgesUndirected[toID])) {
                edgesUndirected[toID].push(parseInt(fromID))
            }
        })
    })

    return edgesUndirected
}

export function graphIslands(edges) {
    /*
    Given undirected graph, find all subgraphs that are disconnected from each other
    */

    let nodeIDs = new Set(Object.keys(edges))

    let islands = []
    let iteration = 0
    while (nodeIDs.size && (iteration < 10)) {
        iteration += 1
        console.log("ISLANDS", iteration, islands, nodeIDs)

        var someID = Array.from(nodeIDs.values())[0]
        var visited = bfsUndirected(edges, someID)
        console.log("bfs visited", visited)
        islands.push(visited)

        visited.forEach(x => {
            nodeIDs.delete(x)
        })
    }

    return islands
}

export function createRandomDAG(numNodes, numEdges) {

    // Setup unconnected graph
    let edges = {}
    for (var i=0; i<numNodes; i++) {
        edges[i] = []
    }

    // Create sampling array with lower triangular edge choices
    // Lower Triangular adjacency matrix is a dag
    let edgeChoices = []
    for (var i=0; i < (numNodes - 1); i++) {
        for (var j=i+1; j < numNodes; j++) {
            edgeChoices.push([i, j])
        }
    }

    // Make random connections
    // Sample without replacement
    for (var i=0; i < numEdges; i++) {
        console.log(i)
        let [fromID, toID] = sampleWithoutReplacement(edgeChoices)
        edges[fromID].push(toID)
    }

    return edges
}
