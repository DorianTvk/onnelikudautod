const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./docs/swagger.json");

const app = express();
const host = "localhost";
const port = 8080;

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

let happycarrepairs = [
    { id: 1, name: "Oil Change", price: 33.00, buttons: ["Edit", "Delete"] },
    { id: 2, name: "Car Maintenance", price: 150.00, buttons: ["Add to Queue"] },
    { id: 3, name: "Inspection", price: 40.00 },
    { id: 4, name: "Tire Change", price: 41.99 },
    { id: 5, name: "Car Electric Repair", price: 220.00 },
    { id: 6, name: "Clutch Replacement", price: 210.00 },
    { id: 7, name: "Timing Belt Replacement", price: 150.00 },
    { id: 8, name: "Engine Repair", price: 400.00 }
];

let Queue = [];

app.get("/", (req, res) => {
    res.send(`Server running. Docs at <a href='http://${host}:${port}/docs'>/docs</a>`);
});

// Get all happy cars
app.get("/Happy-Car-Repairs", (req, res) => {
    res.json(happycarrepairs.map(({ id, name, buttons }) => ({
        id, name, buttons: buttons || []
    })));
});

// Add a new happy car
app.post("/Happy-Car-Repairs", (req, res) => {
    const { name, price } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Missing required field 'name'" });
    }
    const newAuto = {
        id: createId(),
        name: name.trim(),
        price: price ? parseFloat(price) : null
    };
    happycarrepairs.push(newAuto);
    res.status(201).json(newAuto);
});

// Get car by ID
app.get("/Happy-Car-Repairs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const auto = happycarrepairs.find(a => a.id === id);
    if (!auto) return res.status(404).json({ error: "Car not found" });
    res.json(auto);
});

// Update car details
app.put("/Happy-Car-Repairs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const auto = happycarrepairs.find(a => a.id === id);
    if (!auto) return res.status(404).json({ error: "Car not found" });

    const { name, price } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Missing required field 'name'" });
    }
    auto.name = name.trim();
    auto.price = price ? parseFloat(price) : auto.price;

    res.json(auto);
});

// Delete car
app.delete("/Happy-Car-Repairs/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = happycarrepairs.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: "Car not found" });

    happycarrepairs.splice(index, 1);
    res.json({ message: "Car deleted" });
});

// Get cars in the queue
app.get("/Car-Repair-Queue", (req, res) => {
    res.json(Queue);
});

// Get car in the queue by ID
app.get("/Car-Repair-Queue/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const auto = Queue.find(a => a.id === id);
    if (!auto) return res.status(404).json({ error: "Car not in queue" });
    res.json(auto);
});

// Add car to queue
app.post("/Car-Repair-Queue/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const auto = happycarrepairs.find(a => a.id === id);
    if (!auto) return res.status(404).json({ error: "Car not found" });

    const name = req.body.name || auto.name;
    const status = req.body.status || "In Queue";

    if (Queue.some(a => a.id === id)) {
        return res.status(400).json({ error: "Car is already in queue" });
    }

    Queue.push({ id, name, status });
    res.json({ message: `Car ${name} added to the queue`, auto: { id, name, status } });
});

// Update car status in queue
app.put("/Car-Repair-Queue/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const autoInQueue = Queue.find(a => a.id === id);

    if (!autoInQueue) {
        return res.status(404).json({ error: "Car not in queue" });
    }

    const { name, status } = req.body;

    // Update only the fields provided in the request
    if (name) {
        autoInQueue.name = name;
    }
    if (status) {
        autoInQueue.status = status;
    }

    res.json({ message: `Car ${autoInQueue.name} status updated`, auto: autoInQueue });
});

// Remove car from queue
app.delete("/Car-Repair-Queue/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = Queue.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: "Car not in queue" });

    Queue.splice(index, 1);
    res.json({ message: "Car removed from queue" });
});

// Helper function to generate unique IDs
function createId() {
    return Math.max(...happycarrepairs.map(a => a.id)) + 1;
}

app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
});
