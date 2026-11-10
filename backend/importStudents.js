const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }
});
const User = mongoose.model('User', userSchema);

const formatBirthdateToPassword = (dateString) => {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    let day = parts[0].padStart(2, '0');
    let monthText = parts[1].toLowerCase();
    let year = parts[2];

    const monthMap = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    let month = monthMap[monthText] || '01';
    return `${day}${month}${year}`;
};

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-events');
        console.log('MongoDB Connected.');

        await User.deleteMany({});
        console.log('Cleared old user data.');

        const rawCSV = fs.readFileSync('./clean_students.csv', 'utf-8');
        const rows = rawCSV.split('\n');
        const dataRows = rows.slice(1);

        const usersToInsert = []; // We will collect all users here first

        for (let row of dataRows) {
            const columns = row.split(',');

            if (columns.length >= 8) {
                const name = columns[1].trim();
                const rawBirthdate = columns[3].trim();

                // FORCE email to be lowercase and remove spaces
                let email = columns[7].trim().replace(/\s+/g, '').toLowerCase();

                if (name && email && rawBirthdate) {
                    const finalPassword = formatBirthdateToPassword(rawBirthdate);

                    // Re-add the encryption
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(finalPassword, salt);

                    usersToInsert.push({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        role: 'student'
                    });
                }
            }
        }

        // Insert all users directly to the database at once (Bypasses Mongoose bugs)
        await User.insertMany(usersToInsert);
        console.log(`All ${usersToInsert.length} students imported perfectly!`);

        process.exit();
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
};

importData();