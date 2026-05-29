/**
 * AVL Tree Visualizer with Animation & Balance Factors
 * File: script.js
 */

class AVLNode {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = x;
        this.y = y;
    }
}

// Helper to get the height of a node safely
function height(node) {
    return node ? node.height : 0;
}

// Helper to recalculate a node's height based on its children
function updateHeight(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
}

// Computes the Balance Factor (Left Height - Right Height)
function getBalance(node) {
    return node ? height(node.left) - height(node.right) : 0;
}

// Single Right Rotation
function rightRotate(y) {
    log("↳ Sub-step: Single Right Rotate on " + y.value);
    let x = y.left;
    let T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    updateHeight(y);
    updateHeight(x);

    return x;
}

// Single Left Rotation
function leftRotate(x) {
    log("↳ Sub-step: Single Left Rotate on " + x.value);
    let y = x.right;
    let T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    updateHeight(x);
    updateHeight(y);

    return y;
}

// Core AVL Insertion Function
function insertNode(root, value) {
    // 1. Standard BST Insertion
    if (!root) {
        log("Inserting " + value);
        return new AVLNode(value);
    }

    if (value < root.value) {
        root.left = insertNode(root.left, value);
    } else if (value > root.value) {
        root.right = insertNode(root.right, value);
    } else {
        log("Duplicate value " + value + " not inserted.");
        return root;
    }

    // 2. Update height of the current ancestor node
    updateHeight(root);

    // 3. Check Balance Factor to find structural imbalances
    let balance = getBalance(root);

    // Case 1: Left Left (LL) Imbalance -> LL Rotation
    if (balance > 1 && value < root.left.value) {
        log(`<strong>[LL Rotation]</strong> Triggered at node ${root.value} to fix Left-Left imbalance.`);
        return rightRotate(root);
    }

    // Case 2: Right Right (RR) Imbalance -> RR Rotation
    if (balance < -1 && value > root.right.value) {
        log(`<strong>[RR Rotation]</strong> Triggered at node ${root.value} to fix Right-Right imbalance.`);
        return leftRotate(root);
    }

    // Case 3: Left Right (LR) Imbalance -> LR Rotation
    if (balance > 1 && value > root.left.value) {
        log(`<strong>[LR Rotation]</strong> Triggered at node ${root.value} to fix Left-Right imbalance (Double Rotation):`);
        root.left = leftRotate(root.left);
        return rightRotate(root);
    }

    // Case 4: Right Left (RL) Imbalance -> RL Rotation
    if (balance < -1 && value < root.right.value) {
        log(`<strong>[RL Rotation]</strong> Triggered at node ${root.value} to fix Right-Left imbalance (Double Rotation):`);
        root.right = rightRotate(root.right);
        return leftRotate(root);
    }

    return root;
}

// Appends actions and logs to the left side log panel
function log(message) {
    const box = document.getElementById('logBox');
    if (!box) return;
    box.innerHTML += message + "<br/>";
    box.scrollTop = box.scrollHeight; // Auto-scroll to the bottom
}

// UI State and Selectors
let rootNode = null;
const container = document.getElementById("tree-container");
const svg = document.getElementById("svg-lines");

// Button click interface entry-point
function insert() {
    const inputEl = document.getElementById("nodeValue");
    const val = parseInt(inputEl.value);
    
    if (isNaN(val)) return;
    
    rootNode = insertNode(rootNode, val);
    inputEl.value = ""; // Clear input text box
    renderTree();
}

// Redraws the complete canvas (Nodes and SVG lines)
function renderTree() {
    if (!container || !svg) return;
    
    // Clear previous DOM nodes and lines
    container.querySelectorAll(".node").forEach(n => n.remove());
    svg.innerHTML = "";
    
    // Auto-calculate structural coordinates recursively
    const width = container.clientWidth;
    assignCoordinates(rootNode, width / 2, 40, width / 4);
    
    // Render the graphics
    drawTree(rootNode);
}

// Recursively calculates positions for each node based on parent position
function assignCoordinates(node, x, y, offset) {
    if (!node) return;
    node.x = x;
    node.y = y;
    assignCoordinates(node.left, x - offset, y + 70, offset / 1.8);
    assignCoordinates(node.right, x + offset, y + 70, offset / 1.8);
}

// Generates the DOM elements and SVGs for display
function drawTree(node, parent = null) {
    if (!node) return;

    // Create container for the node circle
    const nodeEl = document.createElement("div");
    nodeEl.className = "node";
    nodeEl.innerText = node.value;
    nodeEl.style.left = (node.x - 20) + "px";
    nodeEl.style.top = (node.y - 20) + "px";

    // --- Dynamic Balance Factor Badge Generator ---
    const bf = getBalance(node);
    const bfEl = document.createElement("span");
    bfEl.className = "balance-factor";
    bfEl.innerText = bf;
    
    // If the node is currently breaking AVL constraints, make the badge red
    if (Math.abs(bf) > 1) {
        bfEl.style.backgroundColor = "#e74c3c"; // Critical Imbalance
    } else {
        bfEl.style.backgroundColor = "#34495e"; // Normal Stable Node
    }
    
    nodeEl.appendChild(bfEl);
    // ----------------------------------------------

    container.appendChild(nodeEl);

    // Draw connecting branch lines
    if (parent) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parent.x);
        line.setAttribute("y1", parent.y);
        line.setAttribute("x2", node.x);
        line.setAttribute("y2", node.y);
        line.setAttribute("stroke", "#333");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }

    // Recurse children
    drawTree(node.left, node);
    drawTree(node.right, node);
}