const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(express.json());

app.use(express.static(__dirname));

app.use((req, res, next) => {
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    next();
});

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully!");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

// HOME PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// SCHEMA
const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    event: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    }
});

// MODEL
const Event = mongoose.model("Event", eventSchema);

// GET ALL EVENTS
app.get("/api/events", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// GET EVENT BY ID
app.get("/api/events/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(event);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// CREATE EVENT
app.post("/api/events", async (req, res) => {
    try {
        const booking = new Event(req.body);

        const savedBooking = await booking.save();

        res.status(201).json({
            message: "Booking submitted successfully",
            booking: savedBooking
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// UPDATE EVENT
app.put("/api/events/:id", async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(updatedEvent);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE EVENT
app.delete("/api/events/:id", async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(
            req.params.id
        );

        if (!deletedEvent) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            message: "Booking deleted successfully",
            deletedEvent
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// START SERVER AFTER DATABASE CONNECTION
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Atlas Connected Successfully!");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`GATHERING Events running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

startServer();