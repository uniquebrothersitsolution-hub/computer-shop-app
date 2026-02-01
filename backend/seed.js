const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

const seedUsers = async () => {
    try {
        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create owner account
        const owner = await User.create({
            username: 'admin1',
            email: 'admin@uniquebrothers.com',
            password: 'unique123',
            role: 'owner',
            contactNumber: '1234567890'
        });
        console.log('✅ Created owner account');

        // Create employee account
        const employee = await User.create({
            username: 'staff1',
            email: 'staff@uniquebrothers.com',
            password: 'unique123',
            role: 'employee',
            contactNumber: '0987654321'
        });
        console.log('✅ Created employee account');

        // Create secondary owner account
        await User.create({
            username: 'shahir',
            email: 'shahir@uniquebrothers.com',
            password: 'sha@123',
            role: 'owner',
            contactNumber: '1111111111'
        });
        console.log('✅ Created secondary owner (shahir)');

        // Create secondary employee account
        await User.create({
            username: 'emp',
            email: 'emp@uniquebrothers.com',
            password: 'sha@123',
            role: 'employee',
            contactNumber: '2222222222'
        });
        console.log('✅ Created secondary employee (emp)');

        console.log('\n📋 New Credentials:');
        console.log('Owner    - Username: admin1,   Password: unique123');
        console.log('Employee - Username: staff1,   Password: unique123');
        console.log('Owner 2  - Username: shahir,   Password: sha@123');
        console.log('Staff 2  - Username: emp,      Password: sha@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedUsers();
