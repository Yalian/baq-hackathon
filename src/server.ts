const express = require('express');
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT: number = 3000;
const DB_FILE: string = path.join(__dirname, '../data', 'database.json');

app.use(express.json());

// Ensure the database file exists and is an array
function initializeDB(): void {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, '[]', 'utf8');
    }
}

app.post('/leads', (req: Request, res: Response) => {
    initializeDB();
    const newData: any = req.body;

    // Read existing data
    fs.readFile(DB_FILE, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read database file.' });
        }
        let jsonArray: any[];
        try {
            jsonArray = JSON.parse(data);
            if (!Array.isArray(jsonArray)) jsonArray = [];
        } catch {
            jsonArray = [];
        }

        // Append new data
        jsonArray.push(newData);

        // Write back to file
        fs.writeFile(DB_FILE, JSON.stringify(jsonArray, null, 2), 'utf8', (err: NodeJS.ErrnoException | null) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to write to database file.' });
            }
            res.status(201).json({ message: 'Data saved successfully.' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
