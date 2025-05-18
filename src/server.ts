const express = require('express');
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const PORT: number = 3000;
const DB_FILE: string = path.join(__dirname, '../data', 'database.json');

app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['POST'], // Allow only POST requests
    allowedHeaders: ['Content-Type'], // Allow only specific headers
}));

// Ensure the database file exists and is an array
function initializeDB(): void {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, '[]', 'utf8');
    }
}

app.post('/leads', async (req: Request, res: Response) => {
    initializeDB();
    const newData: any = req.body;

    await sendEmail(
        "yaliangarcia14@gmail.com",
        "New Lead",
        `New lead data: ${JSON.stringify(newData, null, 2)}`
    )

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

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
    // Configure the transporter (use your SMTP credentials)
    const transporter = nodemailer.createTransport({
        host: 'email-smtp.us-east-1.amazonaws.com',
        port: 25000,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'yaliangarcia14@gmail.com',
            pass: 'your_email_password',
        },
    });

    // Send the email
    await transporter.sendMail({
        from: '"Your Name" <your_email@example.com>',
        to,
        subject,
        text,
    });
}